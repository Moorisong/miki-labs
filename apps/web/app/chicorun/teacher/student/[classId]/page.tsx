"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";

const IconArrowLeft = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const IconEdit3 = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>
);

const IconKeyRound = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"></path>
        <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
    </svg>
);

const IconShieldAlert = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
);

const IconBook = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

const getBadgeStyle = (level: number) => {
    if (level > 70) return { borderColor: '#fca5a5', color: '#dc2626', background: '#fee2e2' };
    if (level > 30) return { borderColor: '#fde047', color: '#ca8a04', background: '#fef9c3' };
    return { borderColor: '#86efac', color: '#16a34a', background: '#dcfce7' };
};

export default function TeacherStudentManagePage() {
    const router = useRouter();

    const [students, setStudents] = useState([
        { id: "S1", nickname: "라이언", level: 12, style: { color: "#ff5733", bold: true }, badgeId: "gold_01" },
        { id: "S2", nickname: "어피치", level: 45, style: { color: "#e83e8c", bold: false }, badgeId: "silver_02" },
        { id: "S3", nickname: "튜브", level: 88, style: { color: "#20c997", bold: true }, badgeId: "bronze_03" },
    ]);

    const [editTarget, setEditTarget] = useState<string | null>(null);
    const [newNickname, setNewNickname] = useState("");

    const resetPassword = (id: string, name: string) => {
        if (confirm(`'${name}' 학생의 비밀번호를 '0000'으로 초기화하시겠습니까?`)) {
            alert(`초기화 완료되었습니다.`);
        }
    };

    const startEditNickname = (student: any) => {
        setEditTarget(student.id);
        setNewNickname(student.nickname);
    };

    const saveNickname = () => {
        if (!newNickname.trim()) return;
        setStudents((prev) =>
            prev.map(s => s.id === editTarget ? { ...s, nickname: newNickname } : s)
        );
        setEditTarget(null);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerLogo}>
                    <div className={styles.iconBox}>
                        <IconBook />
                    </div>
                    <span>하루상자</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'normal' }}>Haroo Box</span>
                </div>
                <nav style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/chicorun" style={{ color: '#64748b', fontSize: '0.9rem', textDecoration: 'none' }}>랜딩으로 가기</Link>
                </nav>
            </header>

            <main className={styles.main}>
                <button className={styles.btnBack} onClick={() => router.push("/chicorun/teacher/dashboard")}>
                    <IconArrowLeft /> 클래스 목록으로 돌아가기
                </button>

                <div className={styles.cardPanel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h1 className={styles.panelTitle}>오전 기초반 학생 관리</h1>
                            <p className={styles.panelSubtitle}>총 {students.length}명의 학생이 이 클래스에 등록되어 있습니다.</p>
                        </div>
                        <div className={styles.codeBadge}>
                            코드: 7F2K9
                        </div>
                    </div>

                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>학생 ID</th>
                                <th>닉네임 / 레벨</th>
                                <th style={{ textAlign: 'right' }}>관리 액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, idx) => (
                                <tr key={student.id}>
                                    <td className={styles.idCol}>{student.id}</td>
                                    <td>
                                        <div className={styles.profileWrap}>
                                            <div className={styles.dummyBadge}>
                                                {student.badgeId.split("_")[0]}
                                            </div>

                                            <div>
                                                {editTarget === student.id ? (
                                                    <div className={styles.editForm}>
                                                        <input
                                                            type="text"
                                                            value={newNickname}
                                                            onChange={e => setNewNickname(e.target.value)}
                                                            className={styles.editInput}
                                                            autoFocus
                                                        />
                                                        <button onClick={saveNickname} className={styles.btnSave}>저장</button>
                                                        <button onClick={() => setEditTarget(null)} className={styles.btnCancel}>취소</button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={styles.nicknameText}
                                                        style={{
                                                            color: student.style.color,
                                                            fontWeight: student.style.bold ? 800 : 400
                                                        }}
                                                    >
                                                        {student.nickname}
                                                    </div>
                                                )}
                                                <div
                                                    className={styles.levelTag}
                                                    style={getBadgeStyle(student.level)}
                                                >
                                                    Lv.{student.level}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.actionCell}>
                                        <button
                                            onClick={() => startEditNickname(student)}
                                            className={`${styles.actionBtn} ${styles.edit}`}
                                            title="닉네임 변경"
                                        >
                                            <IconEdit3 />
                                        </button>
                                        <button
                                            onClick={() => resetPassword(student.id, student.nickname)}
                                            className={`${styles.actionBtn} ${styles.reset}`}
                                            title="비밀번호 초기화"
                                        >
                                            <IconKeyRound />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {students.length === 0 && (
                        <div className={styles.emptyState}>
                            <IconShieldAlert />
                            <div>아직 가입한 학생이 없습니다.</div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
