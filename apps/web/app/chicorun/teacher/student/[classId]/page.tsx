'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './page.module.css';
import Link from 'next/link';
import {
    CHICORUN_API,
    CHICORUN_ROUTES,
} from '@/constants/chicorun';

// ─── 타입 ──────────────────────────────────────────────────────────────────────
interface StudentItem {
    id: string;
    nickname: string;
    level: number;
    point: number;
    badge: string;
    nicknameStyle: {
        color: string;
        bold: boolean;
        italic: boolean;
        underline: boolean;
    };
    cardStyle: string;
}

// ─── 아이콘 ──────────────────────────────────────────────────────────────────────
const IconArrowLeft = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const IconEdit3 = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>
);

const IconKeyRound = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"></path>
        <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
    </svg>
);

const IconBook = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

function getLevelBadgeStyle(level: number): React.CSSProperties {
    if (level > 70) return { borderColor: '#fca5a5', color: '#dc2626', background: '#fee2e2' };
    if (level > 30) return { borderColor: '#fde047', color: '#ca8a04', background: '#fef9c3' };
    return { borderColor: '#86efac', color: '#16a34a', background: '#dcfce7' };
}

function getTeacherToken(): string | null {
    return localStorage.getItem('chicorun_teacher_token');
}

export default function TeacherStudentManagePage() {
    const router = useRouter();
    const params = useParams();
    const classId = String(params.classId ?? '');

    const [students, setStudents] = useState<StudentItem[]>([]);
    const [classInfo, setClassInfo] = useState<{ title: string; classCode: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [editTarget, setEditTarget] = useState<string | null>(null);
    const [newNickname, setNewNickname] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [confirmReset, setConfirmReset] = useState<StudentItem | null>(null);
    const [confirmNickname, setConfirmNickname] = useState<{ student: StudentItem; name: string } | null>(null);

    const fetchStudents = useCallback(async () => {
        const token = getTeacherToken();

        if (!token) {
            alert('하루상자 선생님 로그인이 필요합니다.');
            router.push('/login');
            return;
        }

        try {
            const classListRes = await fetch(CHICORUN_API.CLASS, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const classListData = await classListRes.json();

            if (!classListData.success) throw new Error('클래스 목록 조회 실패');

            const targetClass = classListData.data.find((c: { id: string; classCode: string; title: string }) => c.id === classId);
            if (!targetClass) {
                setStudents([]);
                setClassInfo(null);
                setIsLoading(false);
                return;
            }

            setClassInfo({ title: targetClass.title, classCode: targetClass.classCode });

            const studentsRes = await fetch(CHICORUN_API.CLASS_STUDENTS(targetClass.classCode), {
                headers: { Authorization: `Bearer ${token}` },
            });
            const studentsData = await studentsRes.json();

            if (studentsData.success) {
                setStudents(studentsData.data);
            }
        } catch {
            setStudents([]);
        } finally {
            setIsLoading(false);
        }
    }, [classId, router]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const handleResetPassword = async (student: StudentItem) => {
        const token = getTeacherToken();
        if (!classInfo || !token) return;

        try {
            const res = await fetch(CHICORUN_API.CLASS_RESET_PASSWORD(classInfo.classCode), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ studentId: student.id }),
            });
            const data = await res.json();
            if (data.success) {
                alert(data.data.message ?? '비밀번호가 초기화되었습니다.');
            } else {
                alert(data.error || '비밀번호 초기화에 실패했습니다.');
            }
        } catch (err) {
            console.error('Failed to reset password:', err);
        } finally {
            setConfirmReset(null);
        }
    };

    const handleSaveNickname = async () => {
        if (!newNickname.trim() || !editTarget || !classInfo) return;
        setConfirmNickname(null);

        const token = getTeacherToken();
        if (!token) return;

        setIsSaving(true);
        try {
            const res = await fetch(CHICORUN_API.CLASS_UPDATE_NICKNAME(classInfo.classCode, editTarget), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ nickname: newNickname.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                setStudents(prev => prev.map(s =>
                    s.id === editTarget ? { ...s, nickname: data.data.nickname } : s
                ));
                setEditTarget(null);
            } else {
                alert(data.error?.includes('DUPLICATE') ? '이미 사용 중인 닉네임입니다.' : '닉네임 변경에 실패했습니다.');
            }
        } catch (err) {
            console.error('Failed to update nickname:', err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerLogo}>
                    <div className={styles.iconBox}><IconBook /></div>
                    <span>하루상자</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'normal' }}>Chicorun</span>
                </div>
                <nav style={{ display: 'flex', gap: '1rem' }}>
                    <Link href={CHICORUN_ROUTES.LANDING}
                        style={{ color: '#64748b', fontSize: '0.9rem', textDecoration: 'none' }}>
                        랜딩으로 가기
                    </Link>
                </nav>
            </header>

            <main className={styles.main}>
                <button className={styles.btnBack}
                    onClick={() => router.push(CHICORUN_ROUTES.TEACHER_DASHBOARD)}>
                    <IconArrowLeft /> 클래스 목록으로 돌아가기
                </button>

                <div className={styles.cardPanel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h1 className={styles.panelTitle}>
                                {classInfo?.title ?? '클래스'} 학생 관리
                            </h1>
                            <p className={styles.panelSubtitle}>
                                총 {students.length}명의 학생이 이 클래스에 등록되어 있습니다.
                            </p>
                        </div>
                        <div className={styles.codeBadge}>
                            코드: {classInfo?.classCode ?? '...'}
                        </div>
                    </div>

                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                            학생 목록 불러오는 중...
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>뱃지</th>
                                    <th>닉네임 / 레벨</th>
                                    <th>포인트</th>
                                    <th style={{ textAlign: 'right' }}>관리 액션</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.id}>
                                        <td>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '0.5rem',
                                                background: student.cardStyle, display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.5rem',
                                            }}>
                                                {student.badge}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.profileWrap}>
                                                <div>
                                                    {editTarget === student.id ? (
                                                        <div className={styles.editForm}>
                                                            <input
                                                                type="text"
                                                                value={newNickname}
                                                                onChange={e => setNewNickname(e.target.value)}
                                                                className={styles.editInput}
                                                                autoFocus
                                                                maxLength={10}
                                                            />
                                                            <button
                                                                onClick={() => setConfirmNickname({ student, name: newNickname })}
                                                                className={styles.btnSave}
                                                                disabled={!newNickname.trim() || isSaving}
                                                            >
                                                                저장
                                                            </button>
                                                            <button onClick={() => setEditTarget(null)} className={styles.btnCancel}>
                                                                취소
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className={styles.nicknameText} style={{
                                                            color: student.nicknameStyle.color === '#ffffff' ? '#1e293b' : student.nicknameStyle.color,
                                                            fontWeight: student.nicknameStyle.bold ? 800 : 500,
                                                        }}>
                                                            {student.nickname}
                                                        </div>
                                                    )}
                                                    <div className={styles.levelTag} style={getLevelBadgeStyle(student.level)}>
                                                        Lv.{student.level}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 700, color: '#ea580c' }}>
                                            {student.point.toLocaleString()}P
                                        </td>
                                        <td className={styles.actionCell}>
                                            <button
                                                onClick={() => {
                                                    setEditTarget(student.id);
                                                    setNewNickname(student.nickname);
                                                }}
                                                className={`${styles.actionBtn} ${styles.edit}`}
                                                title="닉네임 변경"
                                            >
                                                <IconEdit3 />
                                            </button>
                                            <button
                                                onClick={() => setConfirmReset(student)}
                                                className={`${styles.actionBtn} ${styles.reset}`}
                                                title="비밀번호 초기화(0000)"
                                            >
                                                <IconKeyRound />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {!isLoading && students.length === 0 && (
                        <div className={styles.emptyState}>
                            <div style={{ fontSize: '3rem' }}>👥</div>
                            <div>아직 가입한 학생이 없습니다.</div>
                        </div>
                    )}
                </div>
            </main>

            {/* 비밀번호 초기화 확인 모달 */}
            {confirmReset && (
                <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && setConfirmReset(null)}>
                    <div className={styles.modal}>
                        <h3>⚠️ 비밀번호 초기화</h3>
                        <p>
                            <strong>{confirmReset.nickname}</strong> 학생의 비밀번호를{' '}
                            <strong>&quot;0000&quot;</strong>으로 초기화하시겠습니까?
                        </p>
                        <div className={styles.modalActions}>
                            <button className={styles.btnModalCancel} onClick={() => setConfirmReset(null)}>취소</button>
                            <button className={styles.btnModalDanger} onClick={() => handleResetPassword(confirmReset)}>
                                초기화
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 닉네임 변경 확인 모달 */}
            {confirmNickname && (
                <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && setConfirmNickname(null)}>
                    <div className={styles.modal}>
                        <h3>닉네임 변경</h3>
                        <p>
                            <strong>{confirmNickname.student.nickname}</strong> →{' '}
                            <strong>{confirmNickname.name}</strong>으로 변경하시겠습니까?
                        </p>
                        <div className={styles.modalActions}>
                            <button className={styles.btnModalCancel} onClick={() => setConfirmNickname(null)}>취소</button>
                            <button className={styles.btnModalConfirm} onClick={handleSaveNickname} disabled={isSaving}>
                                {isSaving ? '저장 중...' : '변경'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
