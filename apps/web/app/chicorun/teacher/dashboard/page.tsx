'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';
import Link from 'next/link';
import { CHICORUN_API, CHICORUN_ROUTES } from '@/constants/chicorun';
import { useToast } from '@/lib/hooks/use-toast';
import Toast from '@/components/ui/toast';

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

const IconEdit = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
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

const IconTrash = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
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

    const [editingClassCode, setEditingClassCode] = useState<string | null>(null);
    const [editTitleInput, setEditTitleInput] = useState<string>('');
    const [isSavingTitle, setIsSavingTitle] = useState(false);
    const [deletingClass, setDeletingClass] = useState<ClassItem | null>(null);

    const { toast, showToast, hideToast } = useToast();
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
                        showToast('치코런 교사 권한을 가져오는데 실패했습니다.', 'error');
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
        if (!newClassName.trim() || isCreating) return;

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
                showToast(`"${newClassName.trim()}" 클래스가 생성되었습니다.`, 'success');
            } else {
                showToast(data.error || '클래스 생성에 실패했습니다.', 'error');
            }
        } catch (err) {
            console.error('Failed to create class:', err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateTitle = async (classCode: string) => {
        if (!editTitleInput.trim() || isSavingTitle) return;
        const token = getTeacherTokenFromLocal();
        if (!token) return;

        setIsSavingTitle(true);
        try {
            const res = await fetch(CHICORUN_API.CLASS_UPDATE_TITLE(classCode), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title: editTitleInput.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                setClasses(classes.map(c => c.classCode === classCode ? { ...c, title: editTitleInput.trim() } : c));
                setEditingClassCode(null);
                showToast('클래스 이름이 변경되었습니다.', 'success');
            } else {
                showToast(data.error || '클래스 이름 변경에 실패했습니다.', 'error');
            }
        } catch (err) {
            console.error('Failed to update class title:', err);
        } finally {
            setIsSavingTitle(false);
        }
    };

    const handleDeleteClass = async () => {
        if (!deletingClass) return;
        const token = getTeacherTokenFromLocal();
        if (!token) return;

        try {
            const res = await fetch(CHICORUN_API.CLASS_DELETE(deletingClass.classCode), {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                showToast(`"${deletingClass.title}" 클래스가 성공적으로 삭제되었습니다.`, 'success');
                await fetchClasses(token);
                setDeletingClass(null);
            } else {
                showToast(data.error || '클래스 삭제에 실패했습니다.', 'error');
            }
        } catch (err) {
            console.error('Failed to delete class:', err);
            showToast('클래스 삭제 중 서버 오류가 발생했습니다.', 'error');
        }
    };

    const copyToClipboard = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            showToast('참여 링크가 복사되었습니다.', 'success');
            setTimeout(() => setCopiedCode(null), 2000);
        } catch {
            showToast('복사에 실패했습니다.', 'error');
        }
    };

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <div className={styles.chicorunBrand}>Chicorun</div>
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
                                    {editingClassCode === cls.classCode ? (
                                        <div className={styles.editTitleRow}>
                                            <input
                                                className={styles.editTitleInput}
                                                value={editTitleInput}
                                                onChange={e => setEditTitleInput(e.target.value)}
                                                autoFocus
                                            />
                                            <button className={styles.btnSave} onClick={() => handleUpdateTitle(cls.classCode)} disabled={isSavingTitle}>
                                                {isSavingTitle ? '...' : '저장'}
                                            </button>
                                            <button className={styles.btnCancelEdit} onClick={() => setEditingClassCode(null)}>취소</button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                            <h2 className={styles.cardTitle} style={{ margin: 0, flex: 1, wordBreak: 'break-all' }}>{cls.title}</h2>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button
                                                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                                                    onClick={() => { setEditingClassCode(cls.classCode); setEditTitleInput(cls.title); }}
                                                    title="클래스 이름 변경"
                                                >
                                                    <IconEdit />
                                                </button>
                                                <button
                                                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                                                    onClick={() => setDeletingClass(cls)}
                                                    title="클래스 삭제"
                                                >
                                                    <IconTrash />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className={styles.codeBox}>
                                        <div className={styles.codeRow}>
                                            <span className={styles.codeLabel}>클래스 코드</span>
                                            <span className={styles.codeValue}>{cls.classCode}</span>
                                        </div>
                                        <button
                                            className={`${styles.btnCopyLink} ${copiedCode?.includes(cls.classCode) ? styles.copied : ''}`}
                                            onClick={() => {
                                                const link = `${window.location.origin}${CHICORUN_ROUTES.JOIN}?classCode=${cls.classCode}`;
                                                copyToClipboard(link);
                                            }}
                                        >
                                            {copiedCode?.includes(cls.classCode) ? '✅ 참여 링크 복사됨' : '🔗 참여 링크 복사'}
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.cardFooter}>
                                    <div className={styles.studentCount}>
                                        <IconUsers />
                                        <span>학생 <strong>{cls.studentCount}</strong>명</span>
                                    </div>
                                    <div className={styles.cardActions}>
                                        <button
                                            className={styles.btnRanking}
                                            onClick={() => router.push(`${CHICORUN_ROUTES.RANKING}?classCode=${cls.classCode}`)}
                                        >
                                            🏆 랭킹
                                        </button>
                                        <button
                                            className={styles.btnManage}
                                            onClick={() => router.push(CHICORUN_ROUTES.TEACHER_STUDENT(cls.id))}
                                        >
                                            학생 관리
                                            <IconChevronRight />
                                        </button>
                                    </div>
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

            {/* 클래스 삭제 확인 모달 */}
            {deletingClass && (
                <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && setDeletingClass(null)}>
                    <div className={styles.modal}>
                        <h3>클래스 삭제</h3>
                        <p>
                            <strong>"{deletingClass.title}"</strong> 클래스를 삭제하시겠습니까?<br />
                            삭제 시 <strong>모든 학생 정보와 학습 기록</strong>이 영구적으로 삭제되며 복구할 수 없습니다.
                        </p>
                        <div className={styles.modalActions}>
                            <button className={styles.btnCancel} onClick={() => setDeletingClass(null)}>
                                취소
                            </button>
                            <button
                                className={styles.btnModalDanger}
                                onClick={handleDeleteClass}
                            >
                                삭제하기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Toast toast={toast} onHide={hideToast} />
        </div>
    );
}
