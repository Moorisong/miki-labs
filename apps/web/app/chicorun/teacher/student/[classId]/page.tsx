'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './page.module.css';
import Link from 'next/link';
import { useToast } from '@/lib/hooks/use-toast';
import Toast from '@/components/ui/toast';
import {
    CHICORUN_API,
    CHICORUN_ROUTES,
} from '@/constants/chicorun';
import { useSession } from 'next-auth/react';

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

const IconTrash2 = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

const IconSort = ({ active, order }: { active: boolean; order: 'asc' | 'desc' }) => (
    <span style={{
        display: 'inline-flex',
        flexDirection: 'column',
        marginLeft: '4px',
        fontSize: '10px',
        color: active ? '#2563eb' : '#94a3b8',
        verticalAlign: 'middle',
        lineHeight: '0.8'
    }}>
        <span style={{ opacity: active && order === 'asc' ? 1 : 0.3 }}>▲</span>
        <span style={{ opacity: active && order === 'desc' ? 1 : 0.3 }}>▼</span>
    </span>
);

function getLevelBadgeStyle(level: number): React.CSSProperties {
    if (level > 70) return { borderColor: '#fca5a5', color: '#000000', background: '#fee2e2' };
    if (level > 30) return { borderColor: '#fde047', color: '#000000', background: '#fef9c3' };
    return { borderColor: '#86efac', color: '#000000', background: '#dcfce7' };
}

function getTeacherTokenFromLocal(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('chicorun_teacher_token');
}

export default function TeacherStudentManagePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const classId = String(params.classId ?? '');
    const { toast, showToast, hideToast } = useToast();

    const [students, setStudents] = useState<StudentItem[]>([]);
    const [classInfo, setClassInfo] = useState<{ title: string; classCode: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [editTarget, setEditTarget] = useState<string | null>(null);
    const [newNickname, setNewNickname] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [confirmReset, setConfirmReset] = useState<StudentItem | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<StudentItem | null>(null);
    const [confirmNickname, setConfirmNickname] = useState<{ student: StudentItem; name: string } | null>(null);

    const [sortField, setSortField] = useState<'nickname' | 'level' | 'point'>('nickname');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const isExchanging = useRef(false);

    const fetchStudents = useCallback(async (token: string) => {
        try {
            const classListRes = await fetch(CHICORUN_API.CLASS, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const classListData = await classListRes.json();

            if (!classListData.success) {
                if (classListRes.status === 401) {
                    localStorage.removeItem('chicorun_teacher_token');
                    window.location.reload();
                }
                throw new Error('클래스 목록 조회 실패');
            }

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
                const list = studentsData.data || [];

                setStudents(list);
            }
        } catch {
            setStudents([]);
        } finally {
            setIsLoading(false);
        }
    }, [classId]);

    useEffect(() => {
        if (status === 'loading') return;

        if (status === 'unauthenticated') {
            router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        const token = getTeacherTokenFromLocal();
        if (token) {
            fetchStudents(token);
        } else if (!isExchanging.current && session?.user) {
            isExchanging.current = true;
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
                        fetchStudents(data.data.token);
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
    }, [status, session, fetchStudents, router]);

    const handleResetPassword = async (student: StudentItem) => {
        const token = getTeacherTokenFromLocal();
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
                showToast(data.data.message ?? '비밀번호가 초기화되었습니다.', 'success');
            } else {
                showToast(data.error || '비밀번호 초기화에 실패했습니다.', 'error');
            }
        } catch (err) {
            console.error('Failed to reset password:', err);
        } finally {
            setConfirmReset(null);
        }
    };

    const handleDeleteStudent = async (student: StudentItem) => {
        const token = getTeacherTokenFromLocal();
        if (!classInfo || !token) return;

        setIsSaving(true);
        try {
            const res = await fetch(CHICORUN_API.CLASS_DELETE_STUDENT(classInfo.classCode, student.id), {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data.success) {
                showToast(`${student.nickname} 학생의 정보와 기록이 삭제되었습니다.`, 'success');
                await fetchStudents(token);
            } else {
                showToast(data.error || '학생 삭제에 실패했습니다.', 'error');
            }
        } catch (err) {
            console.error('Failed to delete student:', err);
        } finally {
            setIsSaving(false);
            setConfirmDelete(null);
        }
    };

    const handleSaveNickname = async () => {
        if (!newNickname.trim() || !editTarget || !classInfo) return;
        setConfirmNickname(null);

        const token = getTeacherTokenFromLocal();
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
                await fetchStudents(token);
                setEditTarget(null);
                showToast('닉네임이 성공적으로 변경되었습니다.', 'success');
            } else {
                showToast(data.error?.includes('DUPLICATE') ? '이미 사용 중인 닉네임입니다.' : '닉네임 변경에 실패했습니다.', 'error');
            }
        } catch (err) {
            console.error('Failed to update nickname:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSort = (field: 'nickname' | 'level' | 'point') => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            // 닉네임은 가나다순(asc), 레벨과 포인트는 높은순(desc)이 기본값
            setSortOrder(field === 'nickname' ? 'asc' : 'desc');
        }
    };

    const sortedStudents = [...students].sort((a, b) => {
        if (sortField === 'nickname') {
            const result = a.nickname.localeCompare(b.nickname);
            return sortOrder === 'asc' ? result : -result;
        } else if (sortField === 'level') {
            return sortOrder === 'asc' ? a.level - b.level : b.level - a.level;
        } else if (sortField === 'point') {
            return sortOrder === 'asc' ? a.point - b.point : b.point - a.point;
        }
        return 0;
    });

    return (
        <div className={styles.container}>

            <main className={styles.main}>
                <div className={styles.cardPanel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h1 className={styles.panelTitle}>
                                {classInfo?.title ?? '클래스'} 학생 관리
                            </h1>
                            <p className={styles.panelSubtitle}>전체 {students.length}명의 학생</p>
                        </div>
                        <div className={styles.codeBadge}>
                            코드: {classInfo?.classCode ?? '...'}
                        </div>
                    </div>

                    <div className={styles.mobileSortArea}>
                        <select
                            className={styles.sortSelect}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'nickname') handleSort('nickname');
                                else if (val === 'level') handleSort('level');
                                else if (val === 'point') handleSort('point');
                            }}
                            value={sortField}
                        >
                            <option value="nickname">가나다순 (닉네임)</option>
                            <option value="level">랭킹 순 (레벨 높은 순)</option>
                            <option value="point">포인트 순 (많은 순)</option>
                        </select>
                    </div>

                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                            학생 목록 불러오는 중...
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.colBadge}>뱃지</th>
                                    <th
                                        onClick={() => handleSort('level')}
                                        className={`${styles.sortableHeader} ${styles.colLevel}`}
                                    >
                                        레벨
                                        <IconSort active={sortField === 'level'} order={sortOrder} />
                                    </th>
                                    <th
                                        onClick={() => handleSort('nickname')}
                                        className={`${styles.sortableHeader} ${styles.colNickname}`}
                                    >
                                        닉네임
                                        <IconSort active={sortField === 'nickname'} order={sortOrder} />
                                    </th>
                                    <th
                                        onClick={() => handleSort('point')}
                                        className={`${styles.sortableHeader} ${styles.colPoint}`}
                                    >
                                        포인트
                                        <IconSort active={sortField === 'point'} order={sortOrder} />
                                    </th>
                                    <th className={styles.colAction}>관리 액션</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedStudents.map(student => (
                                    <tr key={student.id}>
                                        <td>
                                            <div className={styles.badgeBox} style={typeof window !== 'undefined' && window.innerWidth < 640 ? { width: '32px', height: '32px' } : {}}>
                                                {student.badge?.startsWith('/') ? (
                                                    <img
                                                        src={student.badge}
                                                        alt="badge"
                                                        style={{
                                                            width: '85%',
                                                            height: '85%',
                                                            objectFit: 'contain',
                                                            border: 'none'
                                                        }}
                                                    />
                                                ) : (
                                                    student.badge
                                                )}
                                            </div>
                                        </td>
                                        <td className={styles.colLevel}>
                                            <div className={styles.levelTag} style={getLevelBadgeStyle(student.level)}>
                                                Lv.{student.level}
                                            </div>
                                        </td>
                                        <td className={styles.colNickname}>
                                            <div className={styles.profileWrap}>
                                                <div className={styles.nameLine}>
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
                                                        <div className={styles.nicknameText}>
                                                            {student.nickname}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className={styles.colPoint} style={{ fontWeight: 700, color: '#2563eb' }}>
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
                                            <button
                                                onClick={() => setConfirmDelete(student)}
                                                className={`${styles.actionBtn} ${styles.reset}`}
                                                style={{ color: '#ef4444' }}
                                                title="학생 삭제"
                                            >
                                                <IconTrash2 />
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

            {/* 학생 삭제 확인 모달 */}
            {confirmDelete && (
                <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
                    <div className={styles.modal}>
                        <h3 style={{ color: '#ef4444' }}>⚠️ 학생 정보 삭제</h3>
                        <p>
                            <strong>{confirmDelete.nickname}</strong> 학생의 모든 정보와 학습 기록을 삭제하시겠습니까?
                            <br /><br />
                            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>삭제 시 복구 및 데이터 조회가 불가능합니다.</span>
                        </p>
                        <div className={styles.modalActions}>
                            <button className={styles.btnModalCancel} onClick={() => setConfirmDelete(null)}>취소</button>
                            <button className={styles.btnModalDanger} onClick={() => handleDeleteStudent(confirmDelete)} disabled={isSaving}>
                                {isSaving ? '삭제 중...' : '영구 삭제'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Toast toast={toast} onHide={hideToast} />
        </div>
    );
}
