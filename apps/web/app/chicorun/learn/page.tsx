'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Link from 'next/link';
import {
    CHICORUN_API,
    CHICORUN_STORAGE_KEY,
    CHICORUN_ROUTES,
    CHICORUN_CONFIG,
} from '@/constants/chicorun';

// ─── 타입 ──────────────────────────────────────────────────────────────────────
interface QuestionData {
    questionId: string;
    seed: string;
    question: string;
    options: string[];
    level: number;
    questionNumber: number;
    progressIndex: number;
    point: number;
}

interface AnswerResult {
    isCorrect: boolean;
    explanation: string;
    correctIndex?: number;
    newProgressIndex: number;
    newPoint: number;
    isLevelComplete: boolean;
    isFinalComplete: boolean;
    level: number;
}

type FeedbackType = 'correct' | 'wrong' | null;

// 콤보 연출 타입
type ComboType = 'combo3' | 'combo5' | 'combo10' | null;

// 레벨 선택 옵션 타입
interface LevelOption {
    id: string;
    label: string;
    description: string;
    startLevel: number;
    range: [number, number];
}

const START_LEVEL_OPTIONS: LevelOption[] = [
    { id: 'beginner1', label: '완전 초보예요', description: '기본 단어부터 차근차근!', startLevel: 8, range: [1, 15] },
    { id: 'beginner2', label: '기초는 좀 알아요', description: '간단한 문장은 만들 수 있어요.', startLevel: 23, range: [11, 35] },
    { id: 'intermediate', label: '중급 정도예요', description: '일상 표현이 가능해요.', startLevel: 45, range: [31, 60] },
    { id: 'advanced1', label: '꽤 자신 있어요', description: '다양한 문장을 구사해요.', startLevel: 70, range: [56, 85] },
    { id: 'advanced2', label: '고급 수준이에요', description: '심화 문법도 익숙해요.', startLevel: 90, range: [81, 100] },
];

// ─── 아이콘 ──────────────────────────────────────────────────────────────────────
const IconBook = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

const IconStar = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#eab308" stroke="#ca8a04"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

const IconZap = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#f97316" stroke="#ea580c"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
);

const IconClass = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
);

// ─── 유틸 함수 ─────────────────────────────────────────────────────────────────
function getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem(CHICORUN_STORAGE_KEY.TOKEN);
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── 콤보 오버레이 컴포넌트 ────────────────────────────────────────────────────
function ComboOverlay({ combo, onDone }: { combo: ComboType; onDone: () => void }) {
    useEffect(() => {
        if (!combo) return;
        const timer = setTimeout(onDone, 1800);
        return () => clearTimeout(timer);
    }, [combo, onDone]);

    if (!combo) return null;

    const comboMessages = {
        combo3: { emoji: '🔥', text: '3연속 정답!', color: '#f97316', sub: 'HOT STREAK' },
        combo5: { emoji: '⚡', text: '5연속 정답!', color: '#eab308', sub: 'POWER SURGE' },
        combo10: {
            emoji: '💎', text: '10연속 완벽!', color: '#a855f7',
            sub: `PERFECT +${CHICORUN_CONFIG.COMBO_BONUS_POINT}P`,
        },
    };

    const { emoji, text, color, sub } = comboMessages[combo];

    return (
        <div className={styles.comboOverlay}>
            <div className={styles.comboCard} style={{ borderColor: color }}>
                <div className={styles.comboEmoji}>{emoji}</div>
                <div className={styles.comboText} style={{ color }}>{text}</div>
                <div className={styles.comboSub}>{sub}</div>
            </div>
        </div>
    );
}

// ─── 레벨 선택 모달 ───────────────────────────────────────────────────────────
function LevelSelectModal({
    onSelect, onSkip, onClose, currentSelected,
}: {
    onSelect: (level: number, isInitial: boolean) => void;
    onSkip?: () => void;
    onClose?: () => void;
    currentSelected?: number;
}) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const handleConfirm = () => {
        const option = START_LEVEL_OPTIONS.find(o => o.id === selectedId);
        if (option) {
            onSelect(option.startLevel, !currentSelected);
        }
    };

    const handleSkip = () => {
        if (onSkip) {
            onSkip();
        }
    };

    return (
        <div className={styles.comboOverlay}>
            <div className={styles.levelSelectCard}>
                {onClose && (
                    <button className={styles.btnCloseModal} onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                )}
                <h2 className={styles.levelSelectTitle}>시작 레벨을 선택해주세요</h2>
                <p className={styles.levelSelectDesc}>
                    현재 영어 실력에 맞는 레벨에서 시작하면<br />더 재미있게 공부할 수 있어요!
                </p>

                <div className={styles.levelOptionsGrid}>
                    {START_LEVEL_OPTIONS.map((opt) => (
                        <div
                            key={opt.id}
                            className={`${styles.levelOptionCard} ${selectedId === opt.id ? styles.selected : ''}`}
                            onClick={() => setSelectedId(opt.id)}
                        >
                            <div className={styles.levelOptionInfo}>
                                <div className={styles.levelOptionLabel}>{opt.label}</div>
                                <div className={styles.levelOptionLevel}>추천 레벨: {opt.range[0]} ~ {opt.range[1]}</div>
                            </div>
                            <div className={styles.levelOptionRadio}>
                                <div className={styles.levelOptionRadioInner} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.levelSelectActions}>
                    <button
                        className={styles.btnStartLearning}
                        disabled={!selectedId}
                        onClick={handleConfirm}
                    >
                        학습 시작하기
                    </button>
                    {onSkip && (
                        <div className={styles.skipActionsContainer}>
                            <button className={styles.btnSkipLevel} onClick={handleSkip}>
                                나중에 선택할게요 (1레벨 시작)
                            </button>
                            <label className={styles.checkDontShowLabel}>
                                <input
                                    type="checkbox"
                                    checked={dontShowAgain}
                                    onChange={(e) => setDontShowAgain(e.target.checked)}
                                />
                                다시 보지 않기
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── 자동 레벨 조정 토스트 ────────────────────────────────────────────────────
function LevelAdjustToast({ message, onDone }: { message: string; onDone: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onDone, 2500);
        return () => clearTimeout(timer);
    }, [onDone]);

    return (
        <div className={styles.levelAdjustToast}>
            <span>⚙️</span> {message}
        </div>
    );
}

// ─── 레벨 클리어 오버레이 ──────────────────────────────────────────────────────
function LevelClearOverlay({
    level, isFinal, onNext, onRestart,
}: {
    level: number;
    isFinal: boolean;
    onNext: () => void;
    onRestart: () => void;
}) {
    const quotes = [
        '"천 리 길도 한 걸음부터." - 노자',
        '"불가능이란 단어는 바보들의 사전에나 있다." - 나폴레옹',
        '"성공의 비결은 단 한 가지, 잘할 수 있는 일에 광적으로 집중하는 것이다." - 빌 게이츠',
        '"실패는 성공의 어머니다." - 토마스 에디슨',
        '"배움에는 끝이 없다." - 퇴계 이황',
    ];
    const quote = quotes[(level - 1) % quotes.length];

    return (
        <div className={styles.comboOverlay} style={{ background: 'rgba(0,0,0,0.85)' }}>
            <div className={styles.levelClearCard}>
                {isFinal ? (
                    <>
                        <div className={styles.comboEmoji}>🏆</div>
                        <div className={styles.levelClearTitle}>100레벨 달성!</div>
                        <div className={styles.levelClearQuote}>
                            모든 레벨을 완주했습니다! 정말 대단해요! 🎉
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button className={styles.btnLevelNext} onClick={onRestart}
                                style={{ background: 'linear-gradient(90deg, #a855f7, #ec4899)' }}>
                                🔄 처음부터 다시
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.comboEmoji}>🎉</div>
                        <div className={styles.levelClearTitle}>레벨 {level - 1} 클리어!</div>
                        <div className={styles.levelClearQuote}>{quote}</div>
                        <button className={styles.btnLevelNext} onClick={onNext}>
                            다음 레벨 도전 →
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── 메인 학습 페이지 ──────────────────────────────────────────────────────────
export default function StudentLearnPage() {
    const router = useRouter();
    const [question, setQuestion] = useState<QuestionData | null>(null);
    const [feedback, setFeedback] = useState<FeedbackType>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [failCount, setFailCount] = useState(0);
    const [showZeroPointMsg, setShowZeroPointMsg] = useState(false);
    const [className, setClassName] = useState<string>('');

    // 레벨 시스템 상태
    const [currentLevel, setCurrentLevel] = useState<number>(1);
    const [startLevel, setStartLevel] = useState<number | null>(null);
    const [adjustmentCount, setAdjustmentCount] = useState<number>(0);
    const [correctCombo, setCorrectCombo] = useState<number>(0);
    const [incorrectTotal, setIncorrectTotal] = useState<number>(0);
    const [showLevelModal, setShowLevelModal] = useState(false);
    const [adjustMessage, setAdjustMessage] = useState<string | null>(null);
    const [activeCombo, setActiveCombo] = useState<ComboType>(null);
    const [showLevelClear, setShowLevelClear] = useState(false);

    const answerLockRef = useRef(false);

    useEffect(() => {
        const studentInfoStr = localStorage.getItem(CHICORUN_STORAGE_KEY.STUDENT_INFO);
        if (studentInfoStr) {
            try {
                const info = JSON.parse(studentInfoStr);
                setClassName(info.className || info.classCode || '');
                const hasStarted = (info.startLevel && info.startLevel !== 0) || (info.progressIndex && info.progressIndex > 0);

                if (hasStarted) {
                    const fallbackLevel = Math.floor((info.progressIndex || 0) / 100) + 1;
                    setCurrentLevel(info.currentLevel || fallbackLevel);
                    setStartLevel(info.startLevel || 0);
                    setAdjustmentCount(info.adjustmentCount || 0);
                } else {
                    // 선택 이력이 없고, 1번 문제도 풀지 않은 완전 초기 상태인 경우에만 표시
                    setShowLevelModal(true);
                }
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const fetchQuestion = useCallback(async () => {
        const token = localStorage.getItem(CHICORUN_STORAGE_KEY.TOKEN);
        if (!token) {
            router.replace(CHICORUN_ROUTES.JOIN);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(CHICORUN_API.QUESTION, {
                headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
            });
            const data = await res.json();

            if (!data.success) {
                if (data.error?.includes('ERROR_UNAUTHORIZED') ||
                    data.error?.includes('ERROR_STUDENT_NOT_FOUND') ||
                    res.status === 401 || res.status === 404) {
                    localStorage.removeItem(CHICORUN_STORAGE_KEY.TOKEN);
                    localStorage.removeItem(CHICORUN_STORAGE_KEY.STUDENT_INFO);
                    router.replace(CHICORUN_ROUTES.JOIN);
                    return;
                }
                throw new Error(data.error);
            }

            setQuestion(data.data as QuestionData);
            setFeedback(null);
            setSelectedIndex(null);
            setAnswerResult(null);
            setFailCount(0);
            setShowZeroPointMsg(false);
            if (data.data.level) {
                setCurrentLevel(data.data.level);
            }
            answerLockRef.current = false;
        } catch (err) {
            console.error('Failed to fetch question:', err);
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchQuestion();
    }, [fetchQuestion]);

    const handleAnswer = async (index: number) => {
        if (answerLockRef.current || feedback === 'correct' || !question) return;

        answerLockRef.current = true;
        setSelectedIndex(index);

        try {
            const res = await fetch(CHICORUN_API.ANSWER, {
                method: 'POST',
                headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionId: question.questionId,
                    seed: question.seed,
                    selectedIndex: index,
                }),
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            const result = data.data as AnswerResult;
            setAnswerResult(result);

            if (result.isCorrect) {
                setFeedback('correct');
                const newCombo = correctCombo + 1;
                setCorrectCombo(newCombo);
                setIncorrectTotal(0); // 연속 정답시 오답 카운트 초기화 (연속 정답 규칙)

                // 콤보 연출
                if (newCombo > 0 && newCombo % 10 === 0) {
                    setActiveCombo('combo10');
                } else if (newCombo === 5) {
                    setActiveCombo('combo5');
                } else if (newCombo === 3) {
                    setActiveCombo('combo3');
                }

                // 자동 레벨 조정 (첫 10문제)
                if (adjustmentCount < 10 && startLevel !== null && startLevel !== 0) {
                    let levelOffset = 0;
                    if (newCombo >= 8) levelOffset = 3;
                    else if (newCombo >= 5) levelOffset = 2;
                    else if (newCombo >= 3) levelOffset = 1;

                    if (levelOffset > 0) {
                        const nextLevel = Math.min(startLevel + 5, Math.min(100, Math.max(1, startLevel + levelOffset)));
                        if (nextLevel > currentLevel) {
                            await handleAutoAdjust(nextLevel);
                        }
                    }
                }

                if (question.point === 0 && result.newPoint === 0) {
                    setShowZeroPointMsg(true);
                }

                // 로컬 스토리지 진도 업데이트
                updateLocalStudentInfo({
                    progressIndex: result.newProgressIndex,
                    currentLevel: result.level,
                });

                if (result.isLevelComplete || result.isFinalComplete) {
                    setTimeout(() => {
                        setShowLevelClear(true);
                    }, activeCombo ? 2000 : 800);
                } else {
                    if (!activeCombo) {
                        setTimeout(fetchQuestion, 1200);
                    }
                }
            } else {
                setFeedback('wrong');
                setCorrectCombo(0);
                const newIncorrectTotal = incorrectTotal + 1;
                setIncorrectTotal(newIncorrectTotal);
                setFailCount(prev => prev + 1);

                // 자동 레벨 조정 (오답 규칙)
                if (adjustmentCount < 10 && startLevel !== null && startLevel !== 0) {
                    let levelOffset = 0;
                    if (newIncorrectTotal >= 4) levelOffset = -2;
                    else if (newIncorrectTotal >= 2) levelOffset = -1;

                    if (levelOffset < 0) {
                        const nextLevel = Math.max(startLevel - 5, Math.max(1, startLevel + levelOffset));
                        if (nextLevel < currentLevel) {
                            await handleAutoAdjust(nextLevel);
                        }
                    }
                }
                answerLockRef.current = false;
            }

            // 조정 카운트 증가
            if (adjustmentCount < 10) {
                setAdjustmentCount(prev => prev + 1);
            }
        } catch (err) {
            console.error('Failed to submit answer:', err);
            answerLockRef.current = false;
        }
    };

    const handleAutoAdjust = async (nextLevel: number) => {
        try {
            const res = await fetch(CHICORUN_API.LEVEL, {
                method: 'POST',
                headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    level: nextLevel,
                    adjustmentCount: adjustmentCount + 1
                }),
            });
            const data = await res.json();
            if (data.success) {
                setCurrentLevel(nextLevel);
                setAdjustMessage(`실력에 맞춰 레벨이 ${nextLevel}로 조정되었습니다!`);
                updateLocalStudentInfo({ currentLevel: nextLevel, adjustmentCount: adjustmentCount + 1 });
            }
        } catch (e) {
            console.error(e);
        }
    };

    const updateLocalStudentInfo = (updates: any) => {
        const infoStr = localStorage.getItem(CHICORUN_STORAGE_KEY.STUDENT_INFO);
        if (infoStr) {
            const info = JSON.parse(infoStr);
            const newInfo = { ...info, ...updates };
            localStorage.setItem(CHICORUN_STORAGE_KEY.STUDENT_INFO, JSON.stringify(newInfo));
        }
    };

    const handleSelectLevel = async (level: number, isInitial: boolean) => {
        setIsLoading(true);
        try {
            const res = await fetch(CHICORUN_API.LEVEL, {
                method: 'POST',
                headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ level, isInitial }),
            });
            const data = await res.json();
            if (data.success) {
                setCurrentLevel(level);
                if (isInitial) {
                    setStartLevel(level);
                    setAdjustmentCount(0);
                    updateLocalStudentInfo({ currentLevel: level, startLevel: level, adjustmentCount: 0 });
                } else {
                    updateLocalStudentInfo({ currentLevel: level });
                }
                setShowLevelModal(false);
                fetchQuestion();
            } else {
                alert(data.error || '레벨 변경에 실패했습니다.');
            }
        } catch (err) {
            console.error('Failed to select level:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetProgress = async () => {
        try {
            await fetch(CHICORUN_API.RESET_PROGRESS, {
                method: 'POST',
                headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
            });
            setShowLevelClear(false);
            fetchQuestion();
        } catch (err) {
            console.error('Failed to reset progress:', err);
        }
    };

    const handleNextLevel = () => {
        setShowLevelClear(false);
        fetchQuestion();
    };

    const handleComboAnimationDone = useCallback(() => {
        setActiveCombo(null);
        // 콤보 애니메이션 후 다음 문제로
        if (feedback === 'correct' && answerResult) {
            if (!answerResult.isLevelComplete && !answerResult.isFinalComplete) {
                fetchQuestion();
            } else {
                setShowLevelClear(true);
            }
        }
    }, [feedback, answerResult, fetchQuestion]);

    const handleLogout = () => {
        localStorage.removeItem(CHICORUN_STORAGE_KEY.TOKEN);
        localStorage.removeItem(CHICORUN_STORAGE_KEY.STUDENT_INFO);
        router.replace(CHICORUN_ROUTES.JOIN);
    };

    const currentPoint = answerResult?.newPoint ?? question?.point ?? 0;
    const progressIndex = answerResult?.newProgressIndex ?? question?.progressIndex ?? 0;
    const progressInLevel = progressIndex % CHICORUN_CONFIG.QUESTIONS_PER_LEVEL;
    const progressPercent = (progressIndex / (CHICORUN_CONFIG.MAX_LEVEL * CHICORUN_CONFIG.QUESTIONS_PER_LEVEL)) * 100;

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                {className && (
                    <div className={styles.classInfoContainer}>
                        <div className={styles.classInfoBadge}>
                            <IconClass />
                            {className}
                        </div>
                    </div>
                )}
                {/* 상단 정보 패널 */}
                <div className={styles.topInfoPanel}>
                    <div className={styles.infoRow}>
                        <div className={styles.levelBadgeContainer}>
                            <div className={styles.levelBadge}>
                                <IconStar />
                                <span>Lv.{currentLevel}</span>
                            </div>
                            <button
                                className={styles.btnLevelChange}
                                onClick={() => setShowLevelModal(true)}
                            >
                                레벨 변경
                            </button>
                        </div>
                        {correctCombo >= 3 && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.25rem',
                                color: '#f97316', fontWeight: 800, fontSize: '0.95rem',
                                animation: 'pulse 1s ease-in-out infinite',
                            }}>
                                🔥 {correctCombo}연속
                            </div>
                        )}
                        <div className={styles.pointBadge}>
                            <IconZap />
                            <span>{currentPoint}P</span>
                        </div>
                    </div>

                    <div className={styles.progressContainer}>
                        <div className={styles.progressLabels}>
                            <span>레벨 {currentLevel} 진행 ({progressInLevel}/{CHICORUN_CONFIG.QUESTIONS_PER_LEVEL})</span>
                            <span>전체 {Math.round(progressPercent)}%</span>
                        </div>
                        <div className={styles.progressBarTrack}>
                            <div
                                className={styles.progressBarFill}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </div>


                {/* 문제 카드 */}
                {isLoading ? (
                    <div className={styles.questionCard} style={{ textAlign: 'center', padding: '4rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                        <p style={{ color: '#64748b', fontWeight: 600 }}>문제 불러오는 중...</p>
                    </div>
                ) : question ? (
                    <div key={question.questionId} className={styles.questionCard}>
                        <div className={styles.questionHeader}>
                            <div className={styles.questionCounter}>
                                레벨 {question.level} · 문제 {question.questionNumber} / {CHICORUN_CONFIG.QUESTIONS_PER_LEVEL}
                            </div>
                            <h2 className={styles.questionText}>{question.question}</h2>
                        </div>

                        {/* 피드백 박스 */}
                        {feedback && (
                            <div className={`${styles.feedbackBox} ${feedback === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong}`}>
                                <div className={styles.feedbackTitle}>
                                    {feedback === 'correct' ? '🎉 정답!' : '😅 오답!'}
                                </div>
                                {feedback === 'wrong' && answerResult?.explanation && (
                                    <div className={styles.feedbackDesc}>{answerResult.explanation}</div>
                                )}
                                {showZeroPointMsg && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#92400e' }}>
                                        😢 3번 시도해서 포인트가 0점이에요. 괜찮아! 다음엔 잘 할 수 있어!
                                    </div>
                                )}
                                {failCount >= 3 && feedback === 'wrong' && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#92400e' }}>
                                        💪 {failCount}번째 도전 중! 포기하지 마세요!
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 선택지 */}
                        <div className={styles.optionsGrid}>
                            {question.options.map((option, idx) => {
                                let btnClass = styles.btnOption;
                                if (selectedIndex === idx) {
                                    if (feedback === 'correct') btnClass += ` ${styles.correct}`;
                                    else if (feedback === 'wrong') btnClass += ` ${styles.wrong}`;
                                }

                                return (
                                    <button
                                        key={idx}
                                        className={btnClass}
                                        onClick={() => handleAnswer(idx)}
                                        disabled={feedback === 'correct'}
                                    >
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : null}

                <div className={styles.hintText}>
                    💡 정답을 선택하면 자동으로 다음 문제로 넘어갑니다
                </div>
            </main>

            {/* 콤보 오버레이 */}
            <ComboOverlay combo={activeCombo} onDone={handleComboAnimationDone} />

            {/* 레벨 클리어 오버레이 */}
            {showLevelClear && answerResult && (
                <LevelClearOverlay
                    level={answerResult.level}
                    isFinal={answerResult.isFinalComplete}
                    onNext={handleNextLevel}
                    onRestart={handleResetProgress}
                />
            )}

            {/* 레벨 선택 모달 */}
            {showLevelModal && (
                <LevelSelectModal
                    onSelect={handleSelectLevel}
                    onSkip={startLevel === null ? () => handleSelectLevel(1, true) : undefined}
                    onClose={() => setShowLevelModal(false)}
                    currentSelected={currentLevel}
                />
            )}

            {/* 자동 레벨 조정 토스트 */}
            {adjustMessage && (
                <LevelAdjustToast
                    message={adjustMessage}
                    onDone={() => setAdjustMessage(null)}
                />
            )}
        </div>
    );
}
