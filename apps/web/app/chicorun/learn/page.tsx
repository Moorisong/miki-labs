'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
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
    passage: string;
    question: string;
    options: string[];
    level: number;
    questionType: string;
    wordCount: number;
    explanation: string;
    questionNumber: number;
    progressIndex: number;
    point: number;
    questionPoint: number;
    totalProblemsInLevel: number;
    currentQuestionAttempts: number;
    achievedMaxLevel: number;
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
    earnedPoints: number;
    achievedMaxLevel?: number;
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
    const token = typeof window !== 'undefined' ? localStorage.getItem(CHICORUN_STORAGE_KEY.TOKEN) : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── 콤보 오버레이 컴포넌트 ────────────────────────────────────────────────────
function ComboOverlay({ combo, onDone }: { combo: ComboType; onDone: () => void }) {
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        if (!combo) {
            setIsFadingOut(false);
            return;
        }
        setIsFadingOut(false);
        const fadeTimer = setTimeout(() => setIsFadingOut(true), 800);
        const doneTimer = setTimeout(onDone, 1100);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(doneTimer);
        };
    }, [combo, onDone]);

    if (!combo) return null;

    const comboMessages: Record<string, { emoji: string; text: string; color: string; sub: string }> = {
        combo3: { emoji: '🔥', text: '3연속 정답!', color: '#f97316', sub: 'HOT STREAK' },
        combo5: { emoji: '⚡', text: '5연속 정답!', color: '#eab308', sub: 'POWER SURGE' },
        combo10: {
            emoji: '💎', text: '10연속 완벽!', color: '#a855f7',
            sub: `PERFECT +${CHICORUN_CONFIG.COMBO_BONUS_POINT}P`,
        },
    };

    const { emoji, text, color, sub } = comboMessages[combo as string];

    return (
        <div className={`${styles.comboOverlay} ${isFadingOut ? styles.comboFadeOut : ''}`}>
            <div className={`${styles.comboCard} ${isFadingOut ? styles.comboCardFadeOut : ''}`} style={{ borderColor: color }}>
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
    const handleConfirm = () => {
        const option = START_LEVEL_OPTIONS.find(o => o.id === selectedId);
        if (option) {
            onSelect(option.startLevel, !currentSelected);
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
                <h2 className={styles.levelSelectTitle}>레벨을 선택해주세요</h2>
                <p className={styles.levelSelectDesc}>
                    현재 영어 실력에 맞는 레벨에서 시작하면<br />더 재미있게 공부할 수 있어요!
                </p>

                <div className={styles.levelOptionsGrid}>
                    {START_LEVEL_OPTIONS.map((opt) => (
                        <div
                            key={opt.id}
                            className={`${styles.levelOptionCard} ${selectedId === opt.id ? styles.selected : ''}`}
                            onClick={() => { setSelectedId(opt.id); }}
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
                    <div className={styles.modalSecondaryActions}>
                        {onSkip && (
                            <button className={styles.btnSkipLevel} onClick={onSkip}>
                                나중에 선택할게요 (1레벨 시작)
                            </button>
                        )}
                    </div>
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
    return (
        <div className={styles.comboOverlay} style={{ background: 'rgba(0,0,0,0.85)' }}>
            <div className={styles.levelClearCard}>
                {isFinal ? (
                    <>
                        <div className={styles.comboEmoji}>🏆</div>
                        <div className={styles.levelClearTitle}>100레벨 달성!</div>
                        <div className={styles.levelClearQuote}>모든 레벨을 완주했습니다! 정말 대단해요! 🎉</div>
                        <button className={styles.btnLevelNext} onClick={onRestart}>🔄 다시 도전하기</button>
                    </>
                ) : (
                    <>
                        <div className={styles.comboEmoji}>🎉</div>
                        <div className={styles.levelClearTitle}>레벨 {level - 1} 클리어!</div>
                        <button className={styles.btnLevelNext} onClick={onNext}>다음 레벨로 이동 →</button>
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
    const [wrongIndices, setWrongIndices] = useState<number[]>([]);
    const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // 레벨 시스템 상태
    const [currentLevel, setCurrentLevel] = useState<number>(1);
    const [achievedMaxLevel, setAchievedMaxLevel] = useState<number>(1);
    const [startLevel, setStartLevel] = useState<number | null>(null);
    const [showLevelModal, setShowLevelModal] = useState(false);
    const [adjustMessage, setAdjustMessage] = useState<string | null>(null);
    const [activeCombo, setActiveCombo] = useState<ComboType>(null);
    const [showLevelClear, setShowLevelClear] = useState(false);
    const [correctCombo, setCorrectCombo] = useState<number>(0);

    const answerLockRef = useRef(false);

    useEffect(() => {
        const userInfoStr = localStorage.getItem(CHICORUN_STORAGE_KEY.USER_INFO);
        if (userInfoStr) {
            try {
                const info = JSON.parse(userInfoStr);
                setCurrentLevel(info.currentLevel || 1);
                setAchievedMaxLevel(info.achievedMaxLevel || 1);
                setStartLevel(info.startLevel || null);

                // progressIndex가 0인 신규 학생(최초 레벨 선택 전)만 모달 표시
                if (info.progressIndex === 0 && !info.startLevel) {
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
            const res = await fetch(`${CHICORUN_API.QUESTION}?_t=${Date.now()}`, {
                headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
            });
            const data = await res.json();

            if (!data.success) throw new Error(data.error);

            setQuestion(data.data as QuestionData);
            setFeedback(null);
            setSelectedIndex(null);
            setWrongIndices([]);
            setAnswerResult(null);
            if (data.data.level) setCurrentLevel(data.data.level);
            if (data.data.achievedMaxLevel) setAchievedMaxLevel(data.data.achievedMaxLevel);
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

                let comboType: ComboType = null;
                if (newCombo > 0 && newCombo % 10 === 0) comboType = 'combo10';
                else if (newCombo === 5) comboType = 'combo5';
                else if (newCombo === 3) comboType = 'combo3';

                if (comboType) setActiveCombo(comboType);

                updateLocalStudentInfo({
                    progressIndex: result.newProgressIndex,
                    currentLevel: result.level,
                    achievedMaxLevel: result.achievedMaxLevel,
                });
                if (result.achievedMaxLevel) setAchievedMaxLevel(result.achievedMaxLevel);

                if (result.isLevelComplete || result.isFinalComplete) {
                    setTimeout(() => setShowLevelClear(true), comboType ? 1000 : 800);
                } else if (!comboType) {
                    setTimeout(fetchQuestion, 1000); // 콤보 없을 때 다음문제 부드럽게
                }
            } else {
                setFeedback('wrong');
                setCorrectCombo(0);
                if (!wrongIndices.includes(index)) {
                    setWrongIndices(prev => [...prev, index]);
                }
                answerLockRef.current = false;
            }
        } catch (err) {
            console.error('Failed to submit answer:', err);
            answerLockRef.current = false;
        }
    };

    const updateLocalStudentInfo = (updates: any) => {
        const infoStr = localStorage.getItem(CHICORUN_STORAGE_KEY.USER_INFO);
        if (infoStr) {
            const info = JSON.parse(infoStr);
            const newInfo = { ...info, ...updates };
            localStorage.setItem(CHICORUN_STORAGE_KEY.USER_INFO, JSON.stringify(newInfo));
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
                if (isInitial) setStartLevel(level);
                updateLocalStudentInfo({ currentLevel: level, ...(isInitial && { startLevel: level }) });
                setShowLevelModal(false);
                fetchQuestion();
            }
        } catch (err) {
            console.error('Failed to select level:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestart = async () => {
        await fetch(CHICORUN_API.RESET_PROGRESS, {
            method: 'POST',
            headers: { ...getAuthHeader() },
        });
        updateLocalStudentInfo({ progressIndex: 0, currentLevel: 1, achievedMaxLevel: 1 });
        setShowLevelClear(false);
        setCurrentLevel(1);
        setAchievedMaxLevel(1);
        fetchQuestion();
    };

    // 최고 레벨 초기화 기능은 제거됨

    const handleComboAnimationDone = useCallback(() => {
        setActiveCombo(null);
        if (feedback === 'correct' && answerResult && !answerResult.isLevelComplete) {
            fetchQuestion();
        }
    }, [feedback, answerResult, fetchQuestion]);

    const getEstimatedTime = (wordCount: number) => `약 ${Math.ceil(wordCount / 2)}초`;


    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <div className={styles.topInfoPanel}>
                    <div className={styles.levelHeader}>
                        <div className={styles.mainLevelInfo}>
                            <div className={styles.medalWrapper}><IconStar /></div>
                            <div className={styles.levelTexts}>
                                <span className={styles.levelLabel}>현재 레벨</span>
                                <span className={styles.levelValue}>Lv.{currentLevel}</span>
                            </div>
                            <button className={styles.btnLevelModify} onClick={() => setShowLevelModal(true)} title="레벨 변경">
                                변경
                            </button>
                        </div>
                        <div className={styles.pointDisplay}>
                            <IconZap /> <span>{answerResult?.newPoint ?? question?.point ?? 0}</span><small>P</small>
                        </div>
                    </div>

                    <div className={styles.progressStatusArea}>
                        <div className={styles.progressInfo}>
                            <span className={styles.currentStatusText}>
                                현재 <strong>레벨 {currentLevel}</strong> 학습 중!
                            </span>
                            <span className={styles.questionStep}>
                                {question?.questionNumber ?? 1} / {question?.totalProblemsInLevel ?? 12}
                            </span>
                        </div>
                        <div className={styles.progressBarTrack}>
                            <div className={styles.progressBarFill} style={{ width: `${((question?.questionNumber ?? 1) / (question?.totalProblemsInLevel ?? 12)) * 100}%` }} />
                        </div>
                    </div>
                </div>


                {!question ? (
                    <div className={styles.questionCard} style={{ textAlign: 'center' }}>
                        <p>문제를 불러오는 중...</p>
                    </div>
                ) : (
                    <div key={question.questionId} className={`${styles.questionCard} ${isLoading ? styles.loadingNextCard : ''}`}>
                        <div className={styles.questionHeader}>
                            <div className={styles.questionCounter}>
                                문제 {question.questionNumber} / {question.totalProblemsInLevel}
                                {question.questionPoint && ` (획득 가능: ${(() => {
                                    const attempts = (question.currentQuestionAttempts || 1) + wrongIndices.length;
                                    const baseReward = question.questionPoint ?? 5; // 난이도 페널티가 이미 적용된 1회차 보상

                                    if (attempts === 1) return baseReward;
                                    if (attempts === 2) return Math.max(1, Math.floor(baseReward * (3 / 5)));
                                    return 1;
                                })()}P)`}
                            </div>
                            <h2 className={styles.questionText}>{question.question}</h2>
                        </div>

                        {question.passage && (
                            <div className={styles.passageContainer}>
                                <div className={styles.passageHeader}>
                                    <div className={styles.passageMeta}>
                                        <span>📝 {question.wordCount} 단어</span>
                                        <span>⏱️ {getEstimatedTime(question.wordCount)}</span>
                                    </div>
                                </div>
                                <div className={styles.passageBody}>{question.passage}</div>
                            </div>
                        )}

                        {feedback && (
                            <div className={`${styles.feedbackBox} ${feedback === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong}`}>
                                <div className={styles.feedbackTitle}>{feedback === 'correct' ? '🎉 정답!' : '😅 오답!'}</div>
                                {feedback === 'wrong' && <div className={styles.feedbackDesc}>{question.explanation}</div>}
                            </div>
                        )}

                        <div className={styles.optionsGrid}>
                            {question.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    className={`${styles.btnOption} ${(feedback === 'correct' && selectedIndex === idx) ? styles.correct :
                                        wrongIndices.includes(idx) ? styles.wrong : ''
                                        }`}
                                    onClick={() => handleAnswer(idx)}
                                    disabled={feedback === 'correct' || wrongIndices.includes(idx)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </main >



            <ComboOverlay combo={activeCombo} onDone={handleComboAnimationDone} />
            {
                showLevelClear && (
                    <LevelClearOverlay
                        level={currentLevel}
                        isFinal={currentLevel === 100}
                        onNext={() => { setShowLevelClear(false); fetchQuestion(); }}
                        onRestart={handleRestart}
                    />
                )
            }
            {
                showLevelModal && (
                    <LevelSelectModal
                        onSelect={handleSelectLevel}
                        onSkip={startLevel === null ? (() => handleSelectLevel(1, true)) : undefined}
                        onClose={() => setShowLevelModal(false)}
                        currentSelected={startLevel || undefined}
                    />
                )
            }
        </div >
    );
}
