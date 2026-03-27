"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CHICORUN_STORAGE_KEY, CHICORUN_ROUTES } from "@/constants/chicorun";
import styles from "./page.module.css";

const IconBook = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

export default function ChicorunLandingPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (status === "loading") return;

        const userToken = localStorage.getItem(CHICORUN_STORAGE_KEY.TOKEN);

        // 로그인 상태면 학습 페이지로 이동
        if (userToken) {
            router.replace(CHICORUN_ROUTES.LEARN);
            return;
        }

        setIsChecking(false);
    }, [router, session, status]);

    const IconZap = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
    );

    if (isChecking || status === "loading") {
        return null;
    }

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
                            시작하기
                        </button>
                    </div>
                </div>

                {/* 이용 안내 */}
                <div className={styles.manualSection}>
                    <h2 className={styles.manualTitle}>시작하는 방법 💡</h2>
                    <div className={styles.manualGrid}>
                        <div className={styles.manualItem}>
                            <div className={styles.stepNum}>1</div>
                            <h3>닉네임 설정</h3>
                            <p>사용할 닉네임과 비밀번호를 입력하고 입장하세요.</p>
                        </div>
                        <div className={styles.manualItem}>
                            <div className={styles.stepNum}>2</div>
                            <h3>레벨 테스트</h3>
                            <p>나의 실력에 맞는 레벨을 선택해 보세요.</p>
                        </div>
                        <div className={styles.manualItem}>
                            <div className={styles.stepNum}>3</div>
                            <h3>학습과 랭킹</h3>
                            <p>문제를 풀고 포인트를 쌓아 랭킹에 도전하세요!</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
