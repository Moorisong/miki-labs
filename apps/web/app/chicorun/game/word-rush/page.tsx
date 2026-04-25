'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { Hud } from './components/Hud';
import { CombatScene } from './components/CombatScene';
import { TypingArea } from './components/TypingArea';
import { ResultModal } from './components/ResultModal';
import { useWordRushGame, Problem } from './hooks/useWordRushGame';
import { CHICORUN_API, CHICORUN_STORAGE_KEY } from '@/constants/chicorun';

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
            if (data?.success) {
                setProblems(data.data.problems);
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            console.error(err);
            // 예외 발생 시 mock 데이터로 진행 테스트 가능
            setProblems([
                { wid: 1, mid: 1, hintId: '1', hint: 'An animal that barks', answers: ['dog'] },
                { wid: 1, mid: 2, hintId: '2', hint: 'A fruit that is red and crunchy', answers: ['apple'] }
            ]);
        } finally {
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
        timeLimit: 60,
    });

    const handleStart = async () => {
        await fetchProblems();
        game.startGame();
    };

    const handleSubmit = (input: string) => {
        const isCorrect = game.submitAnswer(input);
        if (isCorrect) {
            setAttackTrigger(prev => !prev); // 공격 이펙트 토글
        }
    };

    return (
        <div className={styles.container}>
            <Hud
                rankPoint={userStats.rankPoint}
                coin={userStats.coin}
                timeLeft={game.timeLeft}
            />

            {game.gameState === 'READY' && (
                <div style={{ margin: 'auto', textAlign: 'center' }}>
                    <h1>Word Rush</h1>
                    <p>의미를 이해하고 바르게 타이핑하여 레전드에 도전하세요!</p>
                    <button
                        className={styles.submitBtn}
                        onClick={handleStart}
                        disabled={loading}
                        style={{ marginTop: 20 }}
                    >
                        {loading ? '로딩중...' : '게임 시작'}
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
