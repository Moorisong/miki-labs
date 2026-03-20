"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";

const IconBook = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

const IconStar = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#eab308" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

const IconZap = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#f97316" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
);

const questions = [
    {
        id: 1,
        question: "She ___ to school every day.",
        options: ["go", "goes", "going", "went"],
        correct: 1,
        explanation: "she면 s 붙이는 거 국룰 👍"
    },
    {
        id: 2,
        question: "I ___ a book right now.",
        options: ["read", "reading", "am reading", "reads"],
        correct: 2,
        explanation: "right now는 현재진행형 신호! 🎯"
    },
    {
        id: 3,
        question: "They ___ pizza yesterday.",
        options: ["eat", "ate", "eaten", "eating"],
        correct: 1,
        explanation: "yesterday = 과거형 필수 ⏰"
    },
];

type FeedbackType = "correct" | "wrong" | null;

export default function StudentLearnPage() {
    const router = useRouter();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [level, setLevel] = useState(1);
    const [progress, setProgress] = useState(23);
    const [points, setPoints] = useState(120);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<FeedbackType>(null);
    const [showExplanation, setShowExplanation] = useState("");

    const question = questions[currentQuestion % questions.length];

    const handleAnswer = (index: number) => {
        if (feedback !== null) return;

        setSelectedAnswer(index);

        if (index === question.correct) {
            setFeedback("correct");
            setPoints(prev => prev + 10);
            setProgress(prev => prev + 1);
        } else {
            setFeedback("wrong");
            setShowExplanation(question.explanation);
        }

        setTimeout(() => {
            if (currentQuestion + 1 >= 3) {
                // 실제 운영에서는 레벨 클리어 연출 화면으로 넘어갑니다.
                alert("레벨 클리어!");
                router.push("/chicorun");
            } else {
                setCurrentQuestion(prev => prev + 1);
                setSelectedAnswer(null);
                setFeedback(null);
                setShowExplanation("");
            }
        }, 1500);
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
                    <Link href="/chicorun" style={{ color: '#64748b', fontSize: '0.9rem', textDecoration: 'none' }}>나가기</Link>
                </nav>
            </header>

            <main className={styles.main}>
                {/* 상단 정보 패널 */}
                <div className={styles.topInfoPanel}>
                    <div className={styles.infoRow}>
                        <div className={styles.levelBadge}>
                            <IconStar />
                            <span>Lv.{level}</span>
                        </div>
                        <div className={styles.pointBadge}>
                            <IconZap />
                            <span>{points}P</span>
                        </div>
                    </div>

                    <div className={styles.progressContainer}>
                        <div className={styles.progressLabels}>
                            <span>진행도</span>
                            <span>{progress} / 100</span>
                        </div>
                        <div className={styles.progressBarTrack}>
                            <div
                                className={styles.progressBarFill}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* 메인 퀴즈 카드 */}
                <div key={currentQuestion} className={styles.questionCard}>
                    <div className={styles.questionHeader}>
                        <div className={styles.questionCounter}>
                            문제 {currentQuestion + 1} / {questions.length}
                        </div>
                        <h2 className={styles.questionText}>
                            {question.question}
                        </h2>
                    </div>

                    {/* 피드백 박스 */}
                    {feedback && (
                        <div className={`${styles.feedbackBox} ${feedback === "correct" ? styles.feedbackCorrect : styles.feedbackWrong}`}>
                            <div className={styles.feedbackTitle}>
                                {feedback === "correct" ? "🎉 정답!" : "😅 오답!"}
                            </div>
                            {showExplanation && (
                                <div className={styles.feedbackDesc}>{showExplanation}</div>
                            )}
                        </div>
                    )}

                    {/* 객관식 옵션 */}
                    <div className={styles.optionsGrid}>
                        {question.options.map((option, index) => {
                            let btnClass = styles.btnOption;

                            if (selectedAnswer === index) {
                                if (feedback === "correct") btnClass += ` ${styles.correct}`;
                                else if (feedback === "wrong") btnClass += ` ${styles.wrong}`;
                            } else if (index === question.correct && feedback === "wrong") {
                                // 오답을 고른 경우 정답 항목 하이라이트
                                btnClass += ` ${styles.highlightCorrect}`;
                            }

                            return (
                                <button
                                    key={index}
                                    className={btnClass}
                                    onClick={() => handleAnswer(index)}
                                    disabled={feedback !== null}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className={styles.hintText}>
                    💡 선택하면 채점 후 바로 다음 문제로 넘어갑니다
                </div>
            </main>
        </div>
    );
}
