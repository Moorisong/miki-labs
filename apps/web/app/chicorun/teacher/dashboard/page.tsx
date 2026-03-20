'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';
import Link from 'next/link';
import { CHICORUN_API, CHICORUN_ROUTES } from '@/constants/chicorun';

// ─── 타입 ──────────────────────────────────────────────────────────────────────
interface ClassItem {
    id: string;
    classCode: string;
    title: string;
    studentCount: number;
    createdAt: string;
}

// ─── 아이콘 ──────────────────────────────────────────────────────────────────────
const IconPlus = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const IconCopy = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);

const IconUsers = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);

const IconBook = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

const IconChevronRight = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);

const IconGraduationCap = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
        <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
    </svg>
);

function getTeacherTokenFromLocal(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('chicorun_teacher_token');
}

export default function TeacherClassManagePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const isExchanging = useRef(false);

    const fetchClasses = useCallback(async (token: string) => {
        try {
            const res = await fetch(CHICORUN_API.CLASS, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setClasses(data.data);
            } else if (res.status === 401) {
                localStorage.removeItem('chicorun_teacher_token');
                // 토큰 만료 시 재인증 로직을 타게 함
                window.location.reload();
            } else {
                setClasses([]);
            }
        } catch {
            setClasses([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === 'loading') return;

        if (status === 'unauthenticated') {
            router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        const token = getTeacherTokenFromLocal();
        if (token) {
            fetchClasses(token);
        } else if (!isExchanging.current && session?.user) {
            isExchanging.current = true;
            // ─── 토큰 브릿지: NextAuth 세션을 ChicoRun 교사 토큰으로 교환 ────────────────
            const exchangeToken = async () => {
                try {
                    const res = await fetch(CHICORUN_API.TEACHER_LOGIN, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            teacherId: session.user.kakaoId,
                            name: session.user.nickname || session.user.name,
                            signature: process.env.NEXT_PUBLIC_SIGNATURE_SECRET
                        })
                    });
                    const data = await res.json();
                    if (data.success && data.data.token) {
                        localStorage.setItem('chicorun_teacher_token', data.data.token);
                        fetchClasses(data.data.token);
                    } else {
                        alert('치코런 교사 권한을 가져오는데 실패했습니다.');
                        router.push(CHICORUN_ROUTES.LANDING);
                    }
                } catch (err) {
                    console.error('Exchange failed:', err);
                    router.push(CHICORUN_ROUTES.LANDING);
                } finally {
                    isExchanging.current = false;
                }
            };
            exchangeToken();
        }
    }, [status, session, fetchClasses, router]);

    const handleCreateClass = async () => {
        if (!newClassName.trim()) return;

        const token = getTeacherTokenFromLocal();
        if (!token) return;

        setIsCreating(true);
        try {
            const res = await fetch(CHICORUN_API.CLASS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title: newClassName.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                await fetchClasses(token);
                setIsModalOpen(false);
                setNewClassName('');
            } else {
                alert(data.error || '클래스 생성에 실패했습니다.');
            }
        } catch (err) {
            console.error('Failed to create class:', err);
        } finally {
            setIsCreating(false);
        }
    };

    const copyToClipboard = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch {
            alert('복사에 실패했습니다: ' + code);
        }
    };

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <div className={styles.titleArea}>
                    <div>
                        <h1 className={styles.title}>
                            <IconGraduationCap />
                            클래스 관리
                        </h1>
                        <p className={styles.subtitle}>운영 중인 클래스를 관리하고 학생들을 확인하세요.</p>
                    </div>
                    <button className={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
                        <IconPlus />
                        새 클래스 생성
                    </button>
                </div>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                        클래스 불러오는 중...
                    </div>
                ) : classes.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '4rem', color: '#64748b',
                        background: 'white', borderRadius: '1rem',
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
                        <p>아직 클래스가 없습니다. 첫 클래스를 만들어보세요!</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {classes.map((cls, i) => (
                            <div key={cls.id} className={styles.card} style={{ animationDelay: `${i * 0.1}s` }}>
                                <div>
                                    <h2 className={styles.cardTitle}>{cls.title}</h2>
                                    <div className={styles.codeBox}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span className={styles.codeLabel}>클래스 코드</span>
                                                <span className={styles.codeValue}>{cls.classCode}</span>
                                                <button
                                                    className={styles.btnCopy}
                                                    onClick={() => copyToClipboard(cls.classCode)}
                                                    title="코드 복사"
                                                >
                                                    {copiedCode === cls.classCode ? '✅' : <IconCopy />}
                                                </button>
                                            </div>
                                            <button
                                                className={styles.btnCopyLink}
                                                style={{
                                                    fontSize: '0.75rem', padding: '0.4rem 0.6rem',
                                                    background: '#ebf2ff', color: '#2563eb',
                                                    border: 'none', borderRadius: '0.4rem',
                                                    cursor: 'pointer', fontWeight: 600,
                                                    display: 'flex', alignItems: 'center', gap: '4px',
                                                    width: 'fit-content'
                                                }}
                                                onClick={() => {
                                                    const link = `${window.location.origin}${CHICORUN_ROUTES.JOIN}?classCode=${cls.classCode}`;
                                                    copyToClipboard(link);
                                                }}
                                            >
                                                {copiedCode?.startsWith('http') ? '링크 복사됨 ✅' : '🔗 참여 링크 복사'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.cardFooter}>
                                    <div className={styles.studentCount}>
                                        <IconUsers />
                                        <span>학생 <strong>{cls.studentCount}</strong>명</span>
                                    </div>
                                    <button
                                        className={styles.btnManage}
                                        onClick={() => router.push(CHICORUN_ROUTES.TEACHER_STUDENT(cls.id))}
                                    >
                                        학생 관리
                                        <IconChevronRight />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* 새 클래스 생성 모달 */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
                    <div className={styles.modal}>
                        <h3>새 클래스 생성</h3>
                        <p>새로운 영어 학습 클래스를 생성합니다. 클래스 이름을 입력하세요.</p>
                        <input
                            type="text"
                            value={newClassName}
                            onChange={e => setNewClassName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCreateClass()}
                            placeholder="예: 오전 기초반"
                            className={styles.modalInput}
                            autoFocus
                        />
                        <div className={styles.modalActions}>
                            <button className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>
                                취소
                            </button>
                            <button
                                className={styles.btnConfirm}
                                onClick={handleCreateClass}
                                disabled={isCreating || !newClassName.trim()}
                            >
                                {isCreating ? '생성 중...' : '생성하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
