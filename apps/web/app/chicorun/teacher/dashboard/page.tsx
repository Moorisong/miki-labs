"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";

const IconPlus = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const IconCopy = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);

const IconUsers = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);

const IconBook = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

const IconChevronRight = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);

const IconGraduationCap = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
        <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
    </svg>
);

export default function TeacherClassManagePage() {
    const router = useRouter();
    const [classes, setClasses] = useState([
        { id: 1, name: "오전 기초반", code: "7F2K9", studentCount: 15 },
        { id: 2, name: "오후 심화반", code: "3A9M1", studentCount: 22 },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newClassName, setNewClassName] = useState("");

    const handleCreateClass = () => {
        if (!newClassName.trim()) return;
        const newCode = Math.random().toString(36).substring(2, 7).toUpperCase();
        setClasses([...classes, { id: Date.now(), name: newClassName, code: newCode, studentCount: 0 }]);
        setIsModalOpen(false);
        setNewClassName("");
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("클래스 코드가 복사되었습니다: " + text);
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

                <div className={styles.grid}>
                    {classes.map((cls, i) => (
                        <div key={cls.id} className={styles.card} style={{ animationDelay: `${i * 0.1}s` }}>
                            <div>
                                <h2 className={styles.cardTitle}>{cls.name}</h2>
                                <div className={styles.codeBox}>
                                    <span className={styles.codeLabel}>클래스 코드</span>
                                    <span className={styles.codeValue}>{cls.code}</span>
                                    <button
                                        className={styles.btnCopy}
                                        onClick={() => copyToClipboard(cls.code)}
                                        title="코드 복사"
                                    >
                                        <IconCopy />
                                    </button>
                                </div>
                            </div>

                            <div className={styles.cardFooter}>
                                <div className={styles.studentCount}>
                                    <IconUsers />
                                    <span>학생 <strong>{cls.studentCount}</strong>명</span>
                                </div>
                                <button
                                    className={styles.btnManage}
                                    onClick={() => router.push(`/chicorun/teacher/student/${cls.id}`)}
                                >
                                    학생 관리
                                    <IconChevronRight />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* 모달 (Confirm) */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>새 클래스 생성</h3>
                        <p>새로운 영어 학습 클래스를 생성합니다. 클래스 이름(예: 기초반)을 입력하세요.</p>
                        <input
                            type="text"
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            placeholder="클래스 이름 입력"
                            className={styles.modalInput}
                            autoFocus
                        />
                        <div className={styles.modalActions}>
                            <button
                                className={styles.btnCancel}
                                onClick={() => setIsModalOpen(false)}
                            >
                                취소
                            </button>
                            <button
                                className={styles.btnConfirm}
                                onClick={handleCreateClass}
                            >
                                생성하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
