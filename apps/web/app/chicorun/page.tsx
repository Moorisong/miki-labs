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

        const studentToken = localStorage.getItem(CHICORUN_STORAGE_KEY.TOKEN);
        const teacherToken = localStorage.getItem(CHICORUN_STORAGE_KEY.TEACHER_TOKEN);

        // 학생 로그인 상태면 학습 페이지로 이동
        if (studentToken) {
            router.replace(CHICORUN_ROUTES.LEARN);
            return;
        }

        // 교사 로그인 상태면 대시보드로 이동
        if (teacherToken || session) {
            router.replace(CHICORUN_ROUTES.TEACHER_DASHBOARD);
            return;
        }

        setIsChecking(false);
    }, [router, session, status]);

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

                </div>

                {/* 이용 안내 매뉴얼 */}
                <div className={styles.manualSection}>
                    <h2 className={styles.manualTitle}>시작하는 방법 💡</h2>
                    <div className={styles.manualGrid}>
                        <div className={styles.manualItem}>
                            <div className={styles.stepNum}>1</div>
                            <h3>클래스 생성</h3>
                            <p>선생님이 먼저 <strong>교사 로그인</strong> 후 학습 클래스를 생성합니다.</p>
                        </div>
                        <div className={styles.manualItem}>
                            <div className={styles.stepNum}>2</div>
                            <h3>주소 공유</h3>
                            <p>클래스 관리의 <strong>'참여 링크 복사'</strong> 버튼을 눌러 학생에게 전달하세요.</p>
                        </div>
                        <div className={styles.manualItem}>
                            <div className={styles.stepNum}>3</div>
                            <h3>학생 등록</h3>
                            <p>학생이 <strong>받은 주소로 접속</strong>하면 해당 클래스에 바로 가입할 수 있어요.</p>
                        </div>
                    </div>
                    <div className={styles.manualNote}>
                        💡 이미 가입한 학생은 언제든지 <strong>치코런 메인</strong>에서 로그인하여 접속할 수 있습니다.
                    </div>
                </div>
            </main>
        </div>
    );
}
