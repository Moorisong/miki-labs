'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { Hud } from './components/Hud';
import { CombatScene } from './components/CombatScene';
import { TypingArea } from './components/TypingArea';
import { ResultModal } from './components/ResultModal';
import { useWordRushGame, Problem } from './hooks/useWordRushGame';
import { CHICORUN_API, CHICORUN_STORAGE_KEY, CHICORUN_ROUTES } from '@/constants/chicorun';

function DemoTypingAnimation() {
    return (
        <div className={styles.demoArea}>
            <div className={styles.demoField}>
                <div className={`${styles.pet} ${styles.userPet}`}>
                    <img src="/chicorun/user_player.png" alt="user character" className={styles.demoUserImg} />
                </div>
                <div className={styles.demoWord}>&quot;사과&quot;</div>
                <div className={`${styles.pet} ${styles.legendPet}`}>
                    <img src="/chicorun/legend_boss.png" alt="legend boss" className={styles.demoBossImg} />
                </div>
            </div>
            <div className={styles.demoTypingBox}>
                <span className={styles.demoTypedText}></span>
            </div>
            <p className={styles.demoText}>
                의미를 이해하고 바르게 타이핑하여 <br />
                <span className={styles.demoHighlight}>레전드</span>에 도전하세요!
            </p>
        </div>
    );
}

export default function WordRushGamePage() {
    const router = useRouter();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(false);
    const [attackTrigger, setAttackTrigger] = useState(false);
    const [resultData, setResultData] = useState<{
        rankPoint: number;
        coin: number;
        isNewLegend: boolean;
    } | null>(null);

    // 로컬 상태 (HUD 표시용 mock 데이터)
    const [userStats, setUserStats] = useState({ rankPoint: 12450, coin: 3200 });
    const [countdown, setCountdown] = useState<number | null>(10);

    const getToken = () => typeof window !== 'undefined' ? localStorage.getItem(CHICORUN_STORAGE_KEY.TOKEN) : null;

    const fetchProblems = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(CHICORUN_API.WORD_RUSH_START, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
            });
            const data = await res.json();

            if (data?.success && data.data?.problems?.length > 0) {
                setProblems(data.data.problems);
                return;
            }

            // 데이터가 없거나 실패한 경우 경고만 출력하고 Mock 데이터로 진행
            console.warn('API returned success but no problems found. Falling back to mock data.', data);
        } catch (err) {
            console.warn('Failed to fetch problems from API. Falling back to mock data.', err);
        } finally {
            // 예외 발생 혹은 데이터 없음 시 mock 데이터로 진행 
            setProblems((prev) => prev.length > 0 ? prev : [
                { wid: 1, mid: 1, hintId: '000000000000000000000001', hint: 'An animal that barks', answers: ['dog'] },
                { wid: 1, mid: 2, hintId: '000000000000000000000002', hint: 'A fruit that is red and crunchy', answers: ['apple'] }
            ]);
            setLoading(false);
        }
    };

    const onGameEnd = async (stats: any) => {
        try {
            const token = getToken();
            const res = await fetch(CHICORUN_API.WORD_RUSH_END, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: JSON.stringify(stats)
            });
            const data = await res.json();
            if (data?.success) {
                const { earnedRankPoint, earnedCoin, isNewLegend, totalRankPoint, totalCoin } = data.data;
                setResultData({
                    rankPoint: earnedRankPoint,
                    coin: earnedCoin,
                    isNewLegend,
                });
                setUserStats({ rankPoint: totalRankPoint, coin: totalCoin });
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            console.error(err);
            // Mock Fallback
            setResultData({ rankPoint: stats.correctCount * 10, coin: stats.correctCount * 3, isNewLegend: false });
        }
    };

    const game = useWordRushGame({
        problems,
        onGameEnd,
        timeLimit: 180,
    });

    const handleStart = async () => {
        setCountdown(null);
        await fetchProblems();
        game.startGame();
    };

    useEffect(() => {
        if (game.gameState !== 'READY') {
            setCountdown(10);
            return;
        }

        if (countdown === null) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev === null) return null;
                if (prev <= 1) {
                    clearInterval(timer);
                    setTimeout(() => handleStart(), 0);
                    return null;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [game.gameState, countdown]);

    const handleSubmit = (input: string) => {
        const isCorrect = game.submitAnswer(input);
        if (isCorrect) {
            setAttackTrigger(prev => !prev); // 공격 이펙트 토글
        }
    };

    useEffect(() => {
        if (game.gameState === 'PLAYING') {
            // 여러 차례 걸쳐 최상단 스크롤 강제 (포커스 등으로 인한 밀림 방지)
            window.scrollTo(0, 0);
            const timer = setTimeout(() => {
                window.scrollTo(0, 0);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [game.gameState]);

    return (
        <div className={`${styles.container} ${game.gameState === 'PLAYING' ? styles.containerPlaying : ''}`}>
            {game.gameState !== 'READY' && (
                <Hud
                    rankPoint={userStats.rankPoint}
                    coin={userStats.coin}
                    timeLeft={game.timeLeft}
                />
            )}

            {game.gameState === 'READY' && (
                <div className={styles.idleScreen}>
                    <button
                        className={styles.btnCloseModal}
                        onClick={() => router.push(CHICORUN_ROUTES.GAME)}
                        aria-label="닫기"
                    >
                        ✕
                    </button>
                    <div className={styles.titleGroup}>
                        <h1 className={styles.title}>Word Rush</h1>
                        <p className={styles.subtitle}>빠르게 타이핑하여 <br />레전드에 도전하세요!</p>
                    </div>

                    <DemoTypingAnimation />

                    <button
                        className={styles.btnStart}
                        onClick={handleStart}
                        disabled={countdown === null || loading}
                    >
                        {loading || countdown === null
                            ? '게임 시작 중... 🚀'
                            : `게임이 ${countdown}초 후 시작됩니다 🚀`}
                    </button>
                    <button
                        className={styles.btnBack}
                        onClick={() => router.push(CHICORUN_ROUTES.GAME)}
                    >
                        게임 센터로 돌아가기
                    </button>
                </div>
            )}

            {game.gameState === 'PLAYING' && (
                <>
                    <CombatScene combo={game.combo} triggerAttack={attackTrigger} />

                    {game.currentProblem && (
                        <TypingArea
                            hint={game.currentProblem.hint}
                            onSubmit={handleSubmit}
                        />
                    )}
                </>
            )}

            {game.gameState === 'RESULT' && resultData && (
                <ResultModal
                    rankPoint={resultData.rankPoint}
                    coin={resultData.coin}
                    correctCount={game.correctCount}
                    maxCombo={game.combo} // MaxCombo
                    isNewLegend={resultData.isNewLegend}
                    onClose={() => router.push('/chicorun/learn')}
                />
            )}
        </div>
    );
}
