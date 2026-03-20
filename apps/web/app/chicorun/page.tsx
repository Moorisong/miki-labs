"use client";

import { useRouter, usePathname } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";

const IconBook = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

export default function ChicorunLandingPage() {
    const router = useRouter();
    const pathname = usePathname();

    const IconZap = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
    );

    const IconGraduationCap = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
        </svg>
    );

    return (
        <div className={styles.container}>

            <main className={styles.main}>
                <div className={styles.contentBox}>

                    {/* 타이틀 */}
                    <div className={styles.titleWrapper}>
                        <h1 className={styles.title}>Chicorun</h1>
                    </div>

                    <p className={styles.subtitle}>
                        영어를 게임처럼 배우자 ⚡
                    </p>

                    {/* 버튼 부 */}
                    <div className={styles.buttonGroup}>
                        <button
                            className={styles.btnStudent}
                            onClick={() => router.push("/chicorun/join")}
                        >
                            <IconZap />
                            학생 시작
                        </button>

                        <button
                            className={styles.btnTeacher}
                            onClick={() => router.push("/chicorun/teacher/dashboard")}
                        >
                            <IconGraduationCap />
                            교사 로그인
                        </button>
                    </div>

                    {/* 하단 장식 */}
                    <div className={styles.features}>
                        <div className={styles.featureItem}>
                            <div className={styles.dotBlue}></div>
                            <span>빠른 시작</span>
                        </div>
                        <div className={styles.featureItem}>
                            <div className={styles.dotCyan}></div>
                            <span>게임 같은 학습</span>
                        </div>
                        <div className={styles.featureItem}>
                            <div className={styles.dotTeal}></div>
                            <span>몰입 경험</span>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
