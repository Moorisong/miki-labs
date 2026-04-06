'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CHICORUN_API, CHICORUN_ROUTES, CHICORUN_STORAGE_KEY } from '@/constants/chicorun';
import styles from './page.module.css';

// ─── 타입 정의 ──────────────────────────────────────────────────────────────────

interface WordRainProblem {
    wid: number;
    mid: number;
    ko: string;
    answers: string[];
    correctIndex: number;
}

interface FallingWord {
    id: string;
    problem: WordRainProblem;
    x: number;
    y: number;
    speed: number;
    isAnswered: boolean;
    isCorrect: boolean | null;
}

interface GameConfig {
    problemsPerGame: number;
    freezeDurationMs: number;
    maxFreezePerGame: number;
    freezeGrantScoreThreshold: number;
    baseTimeLimitSeconds: number;
}

type GameState = 'idle' | 'playing' | 'paused' | 'success' | 'failed';

// ─── 상수 ────────────────────────────────────────────────────────────────────────

const GAME_WIDTH = 100;
const GAME_HEIGHT = 100;
const BOTTOM_THRESHOLD = 88;
const BASE_FALL_SPEED = 0.07;
const SPAWN_INTERVAL_BASE = 2000;
const SPAWN_INTERVAL_MIN = 800;
const ANIMATION_FPS = 60;
const ANIMATION_INTERVAL = 1000 / ANIMATION_FPS;

// ─── 컴포넌트 ────────────────────────────────────────────────────────────────────

function DemoSquareItem({
    sq,
    onRemove
}: {
    sq: { id: number; left: number; speed: number; delay: number };
    onRemove: (id: number) => void;
}) {
    const [status, setStatus] = useState<'falling' | 'fingerAppear' | 'fingerClick' | 'popped'>('falling');

    useEffect(() => {
        // 떨어지기 시작한 직후 손가락 등장
        const appearDelay = sq.speed * 1000 * 0.2;
        const clickDelay = appearDelay + 500; // fingerAppear 애니메이션(400ms) 완료 + 100ms 대기 후 터치
        const popDelay = clickDelay + 150;    // 터치 후 0.15초 뒤 터짐
        const removeDelay = popDelay + 400;   // 터진 후 잔상 제거

        const appearTimer = setTimeout(() => setStatus('fingerAppear'), appearDelay);
        const clickTimer = setTimeout(() => setStatus('fingerClick'), clickDelay);
        const popTimer = setTimeout(() => setStatus('popped'), popDelay);
        const removeTimer = setTimeout(() => onRemove(sq.id), removeDelay);

        return () => {
            clearTimeout(appearTimer);
            clearTimeout(clickTimer);
            clearTimeout(popTimer);
            clearTimeout(removeTimer);
        };
    }, [sq, onRemove]);

    return (
        <div
            className={`${styles.demoSquare} ${status === 'popped' ? styles.demoSquareClicked : ''}`}
            style={{
                left: `${sq.left}%`,
                animationDuration: `${sq.speed}s`,
                animationDelay: `${sq.delay}s`
            }}
        >
            단어
            {(status === 'fingerAppear' || status === 'fingerClick') && (
                <div className={`${styles.demoFinger} ${status === 'fingerClick' ? styles.demoFingerClick : ''}`}>
                    👆
                </div>
            )}
        </div>
    );
}

function DemoAnimation() {
    const [squares, setSquares] = useState<{ id: number; left: number; speed: number; delay: number }[]>([]);

    useEffect(() => {
        let idCounter = 0;
        const spawnSquare = () => {
            setSquares(prev => [...prev.slice(-3), {
                id: ++idCounter,
                left: Math.random() * 50 + 25,
                speed: Math.random() * 0.8 + 2.2,
                delay: 0
            }]);
        };

        const intervalId = setInterval(spawnSquare, 1400);
        spawnSquare();

        return () => clearInterval(intervalId);
    }, []);

    const handleRemove = useCallback((id: number) => {
        setSquares(prev => prev.filter(sq => sq.id !== id));
    }, []);

    return (
        <div className={styles.demoArea}>
            <div className={styles.demoField}>
                {squares.map(sq => (
                    <DemoSquareItem key={sq.id} sq={sq} onRemove={handleRemove} />
                ))}
                <div className={styles.demoLine} />
            </div>
            <p className={styles.demoText}>
                단어가 바닥에 닿기 전 <span className={styles.demoHighlight}>터치</span>해서 맞추는 게임입니다!
            </p>
        </div>
    );
}

export default function WordRainGamePage() {
    const router = useRouter();

    // 게임 상태
    const [gameState, setGameState] = useState<GameState>('idle');
    const [countdown, setCountdown] = useState<number | null>(10);
    const [problems, setProblems] = useState<WordRainProblem[]>([]);
    const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
    const [selectedWord, setSelectedWord] = useState<FallingWord | null>(null);

    // 점수 & 콤보
    const [score, setScore] = useState<number>(0);
    const [combo, setCombo] = useState<number>(0);
    const [maxCombo, setMaxCombo] = useState<number>(0);
    const [correctCount, setCorrectCount] = useState<number>(0);
    const [totalSpawned, setTotalSpawned] = useState<number>(0);

    // 아이템 (시간 정지)
    const [freezeCount, setFreezeCount] = useState<number>(0);
    const [isFrozen, setIsFrozen] = useState<boolean>(false);
    const MAX_ITEM_COUNT = 2;
    const FREEZE_DURATION = 5000;

    // 타이머
    const [elapsedTime, setElapsedTime] = useState<number>(0);

    // 게임 설정
    const [config, setConfig] = useState<GameConfig | null>(null);

    // 결과
    const [result, setResult] = useState<{
        totalPoint: number;
        baseReward: number;
        timeBonus: number;
        comboBonus: number;
        perfectBonus: number;
    } | null>(null);

    // 피드백 표시
    const [feedback, setFeedback] = useState<{
        text: string;
        type: 'correct' | 'wrong';
        key: number;
    } | null>(null);

    // Refs
    const problemIndexRef = useRef<number>(0);
    const gameLoopRef = useRef<number | null>(null);
    const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);
    const timeTimerRef = useRef<NodeJS.Timeout | null>(null);
    const checkClearRef = useRef<NodeJS.Timeout | null>(null);
    const frozenRef = useRef<boolean>(false);
    const fallingWordsRef = useRef<FallingWord[]>([]);
    const scoreRef = useRef<number>(0);
    const elapsedTimeRef = useRef<number>(0);
    const allSpawnedRef = useRef<boolean>(false);
    const gameEndedRef = useRef<boolean>(false);

    // Section-based Speed System
    const speedMultiplierRef = useRef<number>(1.0);
    const lastCheckpointTimeRef = useRef<number>(0);
    const lastSectionCountRef = useRef<number>(0);

    // fallingWordsRef 동기화
    useEffect(() => {
        fallingWordsRef.current = fallingWords;
    }, [fallingWords]);

    useEffect(() => {
        scoreRef.current = score;
    }, [score]);

    useEffect(() => {
        elapsedTimeRef.current = elapsedTime;
    }, [elapsedTime]);

    useEffect(() => {
        frozenRef.current = isFrozen;
    }, [isFrozen]);

    // ─── API 호출 ───────────────────────────────────────────────────────────────

    const getToken = useCallback((): string | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(CHICORUN_STORAGE_KEY.TOKEN);
    }, []);

    const startGame = useCallback(async () => {
        const token = getToken();
        if (!token) {
            router.push(CHICORUN_ROUTES.JOIN);
            return;
        }

        try {
            const res = await fetch(CHICORUN_API.WORD_RAIN_START, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || '게임 시작 실패');
            }

            setProblems(data.data.problems);
            setConfig(data.data.config);
            problemIndexRef.current = 0;
            setScore(0);
            setCombo(0);
            setMaxCombo(0);
            setCorrectCount(0);
            setTotalSpawned(0);
            setFallingWords([]);
            setSelectedWord(null);
            setElapsedTime(0);
            setFreezeCount(0);
            setIsFrozen(false);
            setResult(null);
            setFeedback(null);

            speedMultiplierRef.current = 1.0;
            lastCheckpointTimeRef.current = 0;
            lastSectionCountRef.current = 0;

            setGameState('playing');
        } catch (error) {
            console.error('게임 시작 오류:', error);
            const message = error instanceof Error ? error.message : '알 수 없는 오류';
            alert(`게임을 시작할 수 없습니다: ${message}`);
            setCountdown(null);
        }
    }, [getToken, router]);

    // ─── 자동 시작 타이머 ───────────────────────────────────────────────────────
    useEffect(() => {
        if (gameState !== 'idle') {
            setCountdown(10);
            return;
        }

        if (countdown === null) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev === null) return null;
                if (prev <= 1) {
                    clearInterval(timer);
                    setTimeout(() => startGame(), 0);
                    return null;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, countdown, startGame]);

    const endGame = useCallback(async (isSuccess: boolean) => {
        setGameState(isSuccess ? 'success' : 'failed');

        // 모든 타이머 정리
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
        if (timeTimerRef.current) clearInterval(timeTimerRef.current);

        const token = getToken();
        if (!token) return;

        try {
            const res = await fetch(CHICORUN_API.WORD_RAIN_END, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    isSuccess,
                    clearTimeSeconds: elapsedTime,
                    maxCombo,
                    totalProblems: problems.length,
                    correctCount,
                    score: scoreRef.current,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setResult(data.data);
            }
        } catch (error) {
            console.error('게임 종료 API 오류:', error);
        }
    }, [getToken, elapsedTime, maxCombo, problems.length, correctCount]);

    // ─── 단어 스폰 ──────────────────────────────────────────────────────────────

    const spawnWord = useCallback(() => {
        if (problemIndexRef.current >= problems.length) return;

        const problem = problems[problemIndexRef.current];
        problemIndexRef.current += 1;

        const newWord: FallingWord = {
            id: `${problem.wid}-${problem.mid}-${Date.now()}`,
            problem,
            x: 10 + Math.random() * (GAME_WIDTH - 30),
            y: -8,
            speed: BASE_FALL_SPEED * speedMultiplierRef.current,
            isAnswered: false,
            isCorrect: null,
        };

        setFallingWords(prev => [...prev, newWord]);
        setTotalSpawned(prev => prev + 1);

        // 마지막 문제 스폰 시 플래그 설정
        if (problemIndexRef.current >= problems.length) {
            allSpawnedRef.current = true;
        }
    }, [problems]);

    // ─── 게임 루프 ──────────────────────────────────────────────────────────────

    useEffect(() => {
        if (gameState !== 'playing') return;

        let lastTime = performance.now();

        const gameLoop = (currentTime: number) => {
            const deltaTime = currentTime - lastTime;

            if (deltaTime >= ANIMATION_INTERVAL) {
                lastTime = currentTime;

                if (!frozenRef.current) {
                    const currentMultiplier = speedMultiplierRef.current;
                    const currentSpeed = BASE_FALL_SPEED * currentMultiplier;

                    setFallingWords(prev => {
                        const updated = prev
                            .map(word => {
                                if (word.isAnswered) return word;
                                return {
                                    ...word,
                                    speed: currentSpeed,
                                    y: word.y + currentSpeed * (deltaTime / 16),
                                };
                            })
                            .filter(word => {
                                if (word.isAnswered && word.y > GAME_HEIGHT + 10) return false;
                                return true;
                            });

                        // 바닥 도달 체크 (미답변 단어가 바닥에 닿으면)
                        const hitBottom = updated.some(
                            word => !word.isAnswered && word.y >= BOTTOM_THRESHOLD
                        );

                        if (hitBottom && !gameEndedRef.current) {
                            gameEndedRef.current = true;
                            setTimeout(() => endGame(false), 0);
                        }

                        // 클리어 체크: 모든 문제 출제 완료 + 미답변 단어 없음
                        if (allSpawnedRef.current && !gameEndedRef.current) {
                            const remaining = updated.filter(w => !w.isAnswered);
                            if (remaining.length === 0) {
                                gameEndedRef.current = true;
                                setTimeout(() => endGame(true), 0);
                            }
                        }

                        return updated;
                    });
                }
            }

            gameLoopRef.current = requestAnimationFrame(gameLoop);
        };

        gameLoopRef.current = requestAnimationFrame(gameLoop);

        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
    }, [gameState, endGame]);

    // ─── 스폰 타이머 ────────────────────────────────────────────────────────────

    useEffect(() => {
        if (gameState !== 'playing') return;

        allSpawnedRef.current = false;
        gameEndedRef.current = false;

        // 첫 스폰
        spawnWord();

        const scheduleNextSpawn = () => {
            const currentMultiplier = speedMultiplierRef.current;
            const interval = Math.max(
                SPAWN_INTERVAL_MIN,
                SPAWN_INTERVAL_BASE / currentMultiplier
            );

            spawnTimerRef.current = setTimeout(() => {
                if (problemIndexRef.current < problems.length) {
                    spawnWord();
                    scheduleNextSpawn();
                }
                // 클리어 체크는 게임 루프에서 처리
            }, interval);
        };

        scheduleNextSpawn();

        return () => {
            if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
        };
    }, [gameState, spawnWord, problems.length]);

    // ─── 속도 시스템 (Section-based) ─────────────────────────────────────────────

    useEffect(() => {
        // 3문제마다 속도 체크 (더 빈번하게)
        if (gameState !== 'playing' || correctCount === 0 || correctCount % 3 !== 0) return;
        if (lastSectionCountRef.current === correctCount) return;

        lastSectionCountRef.current = correctCount;

        const currentTime = elapsedTimeRef.current;
        const sectionTime = currentTime - lastCheckpointTimeRef.current; // 3문제를 푸는 데 걸린 시간

        let newMultiplier = speedMultiplierRef.current;

        // 3문제를 아주 빨리 풀었을 때 (가속도 강화)
        if (sectionTime < 4) newMultiplier += 0.6;
        else if (sectionTime < 6) newMultiplier += 0.35;
        else if (sectionTime < 9) newMultiplier += 0.15;
        else newMultiplier -= 0.15; // 너무 느리면 조금 감속

        // 최대 배수 상향 조정 2.5 -> 4.0
        speedMultiplierRef.current = Math.max(0.8, Math.min(4.0, newMultiplier));
        lastCheckpointTimeRef.current = currentTime;
    }, [correctCount, gameState]);

    // ─── 경과 시간 ──────────────────────────────────────────────────────────────

    useEffect(() => {
        if (gameState !== 'playing') return;

        timeTimerRef.current = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);

        return () => {
            if (timeTimerRef.current) clearInterval(timeTimerRef.current);
        };
    }, [gameState]);

    // ─── 프리즈 아이템 ──────────────────────────────────────────────────────────
    // (기존 스코어 기반 지급 로직 제거됨 - 콤보 기반으로 변경)

    const activateFreeze = useCallback(() => {
        if (freezeCount <= 0 || isFrozen) return;

        setFreezeCount(prev => prev - 1);
        setIsFrozen(true);
        frozenRef.current = true; // 프레임 스킵을 위해 ref 즉시 업데이트

        setTimeout(() => {
            setIsFrozen(false);
            frozenRef.current = false;
        }, FREEZE_DURATION);
    }, [freezeCount, isFrozen]);

    // ─── 단어 클릭 → 선택 ──────────────────────────────────────────────────────

    const handleWordClick = useCallback((word: FallingWord) => {
        if (word.isAnswered || gameState !== 'playing') return;
        setSelectedWord(word);
    }, [gameState]);

    // ─── 정답 선택 ──────────────────────────────────────────────────────────────

    const handleAnswerSelect = useCallback((answerIndex: number) => {
        if (!selectedWord || gameState !== 'playing') return;

        const isCorrect = answerIndex === selectedWord.problem.correctIndex;

        // 피드백 표시
        setFeedback({
            text: isCorrect ? '정답! 🎉' : '오답! 💥',
            type: isCorrect ? 'correct' : 'wrong',
            key: Date.now(),
        });

        if (isCorrect) {
            const newCombo = combo + 1;
            const comboMultiplier = getComboMultiplier(newCombo);
            const earnedScore = Math.floor(10 * comboMultiplier);

            setCombo(newCombo);
            setMaxCombo(prev => Math.max(prev, newCombo));
            setScore(prev => prev + earnedScore);
            setCorrectCount(prev => prev + 1);

            // 단어 제거
            setFallingWords(prev =>
                prev.map(w =>
                    w.id === selectedWord.id
                        ? { ...w, isAnswered: true, isCorrect: true }
                        : w
                )
            );

            // 아이템 지급 (3 콤보 달성 시)
            if (newCombo === 3) {
                setFreezeCount(prev => Math.min(MAX_ITEM_COUNT, prev + 1));
            }
        } else {
            setCombo(0);

            // 단어 강조 (오답 표시 후 유지)
            setFallingWords(prev =>
                prev.map(w =>
                    w.id === selectedWord.id ? { ...w, isCorrect: false } : w
                )
            );
        }

        setSelectedWord(null);
    }, [selectedWord, gameState, combo]);

    // ─── 피드백 자동 해제 ───────────────────────────────────────────────────────

    useEffect(() => {
        if (!feedback) return;
        const timer = setTimeout(() => setFeedback(null), 800);
        return () => clearTimeout(timer);
    }, [feedback]);

    // ─── 콤보 배수 헬퍼 ─────────────────────────────────────────────────────────

    function getComboMultiplier(c: number): number {
        if (c >= 5) return 2;
        const map: Record<number, number> = { 1: 1, 2: 1.2, 3: 1.5, 4: 1.5 };
        return map[c] ?? 1;
    }

    // ─── 시간 포맷 ──────────────────────────────────────────────────────────────

    function formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // ─── 렌더링 ─────────────────────────────────────────────────────────────────

    // 게임 대기 화면
    if (gameState === 'idle') {
        return (
            <div className={styles.container}>
                <div className={styles.idleScreen}>
                    <button
                        className={styles.btnCloseModal}
                        onClick={() => router.push(CHICORUN_ROUTES.GAME)}
                        aria-label="닫기"
                    >
                        ✕
                    </button>
                    <div className={styles.titleGroup}>
                        <h1 className={styles.title}>Word Rain</h1>
                        <p className={styles.subtitle}>떨어지는 한글 뜻에 맞는 영어를 선택하세요!</p>
                    </div>

                    <DemoAnimation />

                    <button className={styles.btnStart} onClick={startGame} disabled={countdown === null}>
                        {countdown !== null ? `게임이 ${countdown}초 후 시작됩니다 🚀` : '게임 시작 중... 🚀'}
                    </button>
                    <button
                        className={styles.btnBack}
                        onClick={() => router.push(CHICORUN_ROUTES.GAME)}
                    >
                        게임 센터로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    // 결과 화면
    if (gameState === 'success' || gameState === 'failed') {
        return (
            <div className={styles.container}>
                <div className={styles.resultScreen}>
                    <h1 className={gameState === 'success' ? styles.resultTitleSuccess : styles.resultTitleFailed}>
                        {gameState === 'success' ? '🎉 클리어!' : '게임 오버'}
                    </h1>

                    <div className={styles.resultStats}>
                        <div className={styles.statRow}>
                            <span>게임 점수</span>
                            <span className={styles.statValue}>{score}</span>
                        </div>
                        <div className={styles.statRow}>
                            <span>정답률</span>
                            <span className={styles.statValue}>
                                {totalSpawned > 0
                                    ? Math.round((correctCount / totalSpawned) * 100)
                                    : 0}%
                            </span>
                        </div>
                        <div className={styles.statRow}>
                            <span>최대 콤보</span>
                            <span className={styles.statValue}>x{maxCombo}</span>
                        </div>
                        <div className={styles.statRow}>
                            <span>플레이 시간</span>
                            <span className={styles.statValue}>{formatTime(elapsedTime)}</span>
                        </div>
                    </div>

                    {result && (
                        <div className={styles.rewardCard}>
                            <h3 className={styles.rewardTitle}>획득 포인트</h3>
                            <div className={styles.rewardBreakdown}>
                                {result.baseReward > 0 && (
                                    <div className={styles.rewardRow}>
                                        <span>기본 보상</span>
                                        <span>+{result.baseReward}</span>
                                    </div>
                                )}
                                {result.timeBonus > 0 && (
                                    <div className={styles.rewardRow}>
                                        <span>속도 보너스</span>
                                        <span>+{result.timeBonus}</span>
                                    </div>
                                )}
                                {result.comboBonus > 0 && (
                                    <div className={styles.rewardRow}>
                                        <span>콤보 보너스</span>
                                        <span>+{result.comboBonus}</span>
                                    </div>
                                )}
                                {result.perfectBonus > 0 && (
                                    <div className={styles.rewardRow}>
                                        <span>완벽 보너스</span>
                                        <span>+{result.perfectBonus}</span>
                                    </div>
                                )}
                                <div className={styles.rewardTotal}>
                                    <span>합계</span>
                                    <span>+{result.totalPoint}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={styles.resultActions}>
                        <button className={styles.btnStart} onClick={startGame}>
                            다시 하기
                        </button>
                        <button
                            className={styles.btnBack}
                            onClick={() => router.push(CHICORUN_ROUTES.GAME)}
                        >
                            게임 센터로
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 게임 플레이 화면
    return (
        <div className={styles.container}>
            {/* HUD */}
            <div className={styles.hud}>
                <div className={styles.hudLeft}>
                    <span className={styles.hudScore}>⭐ {score}</span>
                    {combo > 1 && (
                        <span className={styles.hudCombo}>
                            🔥 x{combo}
                            <span className={styles.comboMultiplier}>
                                ({getComboMultiplier(combo)}배)
                            </span>
                        </span>
                    )}
                </div>
                <div className={styles.hudCenter}>
                    <span className={styles.hudTime}>{formatTime(elapsedTime)}</span>
                </div>
                <div className={styles.hudRight}>
                    <span className={styles.hudProgress}>
                        {correctCount}/{problems.length}
                    </span>
                    {freezeCount > 0 && (
                        <button
                            className={`${styles.btnFreeze} ${isFrozen ? styles.btnFreezeActive : ''}`}
                            onClick={activateFreeze}
                            disabled={isFrozen}
                        >
                            ⏸️ {freezeCount}
                        </button>
                    )}
                </div>
            </div>

            {/* 피드백 */}
            {feedback && (
                <div
                    key={feedback.key}
                    className={`${styles.feedback} ${feedback.type === 'correct'
                        ? styles.feedbackCorrect
                        : styles.feedbackWrong
                        }`}
                >
                    {feedback.text}
                </div>
            )}

            {/* 프리즈 오버레이 */}
            {isFrozen && <div className={styles.frozenOverlay}>⏸️ 시간 정지!</div>}

            {/* 게임 필드 */}
            <div className={styles.gameField}>
                {fallingWords.map(word => (
                    <div
                        key={word.id}
                        className={`${styles.fallingWord} ${word.isAnswered ? styles.fallingWordAnswered : ''
                            } ${word.isCorrect === false ? styles.fallingWordWrong : ''} ${selectedWord?.id === word.id ? styles.fallingWordSelected : ''
                            }`}
                        style={{
                            left: `${word.x}%`,
                            top: `${word.y}%`,
                        }}
                        onClick={() => handleWordClick(word)}
                    >
                        <span className={styles.wordKo}>{word.problem.ko}</span>
                    </div>
                ))}

                {/* 바닥 라인 */}
                <div className={styles.bottomLine} />
            </div>

            {/* 선택지 패널 */}
            {selectedWord && (
                <div className={styles.answerPanel}>
                    <p className={styles.answerQuestion}>
                        &quot;{selectedWord.problem.ko}&quot;의 영어는?
                    </p>
                    <div className={styles.answerGrid}>
                        {selectedWord.problem.answers.map((answer, idx) => (
                            <button
                                key={idx}
                                className={styles.answerBtn}
                                onClick={() => handleAnswerSelect(idx)}
                            >
                                {answer}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
