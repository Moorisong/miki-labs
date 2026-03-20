"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";

const IconHash = () => (
    <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="9" x2="20" y2="9"></line>
        <line x1="4" y1="15" x2="20" y2="15"></line>
        <line x1="10" y1="3" x2="8" y2="21"></line>
        <line x1="16" y1="3" x2="14" y2="21"></line>
    </svg>
);

const IconUser = () => (
    <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const IconLock = () => (
    <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

const IconLogIn = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
        <polyline points="10 17 15 12 10 7"></polyline>
        <line x1="15" y1="12" x2="3" y2="12"></line>
    </svg>
);

const IconBook = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

export default function StudentEnterPage() {
    const router = useRouter();
    const [classCode, setClassCode] = useState("");
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (classCode && nickname && password) {
            // 나중에 학습 페이지로 이동 (예: /chicorun/learn)
            router.push("/chicorun/learn");
        }
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
                <div className={styles.card}>
                    <div className={styles.titleArea}>
                        <h2 className={styles.title}>입장하기</h2>
                        <p className={styles.subtitle}>정보를 입력하고 바로 시작하세요!</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {/* 클래스 코드 */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>클래스 코드</label>
                            <div className={styles.inputWrapper}>
                                <IconHash />
                                <input
                                    type="text"
                                    value={classCode}
                                    onChange={(e) => setClassCode(e.target.value)}
                                    placeholder="예: ABC123"
                                    className={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        {/* 닉네임 */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>닉네임</label>
                            <div className={styles.inputWrapper}>
                                <IconUser />
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    placeholder="게임에서 사용할 이름"
                                    className={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        {/* 비밀번호 */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>비밀번호</label>
                            <div className={styles.inputWrapper}>
                                <IconLock />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="4자리 이상"
                                    className={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        {/* 입장 버튼 */}
                        <button type="submit" className={styles.btnSubmit}>
                            <IconLogIn />
                            입장하기
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
