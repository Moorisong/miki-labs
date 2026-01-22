'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

import { useGameStore } from '@/game/core/game-manager';
import { rankingApi } from '@/lib/api/ranking';
import { STORAGE_KEY, CONFIG } from '@/constants';
import type { RankingEntry } from '@/lib/api/types';

interface UseGameLogicProps {
    score: number;
    remainingAttempts: number;
    canPlay: boolean;
    useAttempt: () => void;
    addAttempt: () => void;
}

export function useGameLogic({
    score,
    remainingAttempts,
    canPlay,
    useAttempt,
    addAttempt,
}: UseGameLogicProps) {
    const { data: session } = useSession();
    const setCallbacks = useGameStore((state) => state.setCallbacks);
    const setSoundCallbacks = useGameStore((state) => state.setSoundCallbacks);
    const resetGame = useGameStore((state) => state.resetGame);
    const startGame = useGameStore((state) => state.startGame);
    const phase = useGameStore((state) => state.phase);

    const [rankings, setRankings] = useState<RankingEntry[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showRanking, setShowRanking] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastEarnedScore, setLastEarnedScore] = useState(0);
    const [scoreModalData, setScoreModalData] = useState<{
        score: number;
        totalScore: number;
        totalCaught: number;
    } | null>(null);
    const [successCount, setSuccessCount] = useState(0);
    const prevScoreRef = useRef(score);

    // Sync persistent attempts state to game store
    useEffect(() => {
        useGameStore.setState({ attempts: remainingAttempts });
    }, [remainingAttempts]);

    // Load initial rankings & Restore score from login
    useEffect(() => {
        rankingApi.getTopRanking(CONFIG.GAME.RANKING_TOP_LIMIT).then(setRankings);

        const savedScore = sessionStorage.getItem(STORAGE_KEY.PENDING_RANKING_SCORE);
        if (savedScore) {
            const scoreNum = parseInt(savedScore, 10);
            if (!isNaN(scoreNum)) {
                useGameStore.setState({ score: scoreNum });
                setShowRanking(true);
            }
        }
    }, []);

    // Detect score changes for success effect
    useEffect(() => {
        if (score > prevScoreRef.current) {
            const earned = score - prevScoreRef.current;
            setLastEarnedScore(earned);
            setShowSuccess(true);
        }
        prevScoreRef.current = score;
    }, [score]);

    // Set game callbacks
    useEffect(() => {
        setCallbacks({
            onGameEnd: async () => {
                if (!session?.user) {
                    const freshRankings = await rankingApi.getTopRanking(CONFIG.GAME.RANKING_TOP_LIMIT);
                    setRankings(freshRankings);
                    setShowRanking(true);
                }
            },
            onAttemptUsed: () => {
                useAttempt();
            },
        });

        setSoundCallbacks({
            onSuccess: async () => {
                addAttempt();
                setSuccessCount((prev) => prev + 1);

                if (session?.user) {
                    try {
                        const currentScore = useGameStore.getState().score;
                        const earnedScore = lastEarnedScore > 0 ? lastEarnedScore : currentScore;

                        const result = await rankingApi.submitScore({
                            score: earnedScore,
                            attempts: 1,
                            dollsCaught: 1,
                        });

                        if (result.success && result.data) {
                            setScoreModalData({
                                score: earnedScore,
                                totalScore: result.data.totalScore,
                                totalCaught: result.data.totalDollsCaught,
                            });
                        }
                    } catch (e) {
                        console.error('[GamePage] Auto submit failed:', e);
                    }
                }
            },
        });
    }, [
        setCallbacks,
        setSoundCallbacks,
        addAttempt,
        useAttempt,
        session,
        lastEarnedScore,
    ]);

    // Game cleanup on unmount
    useEffect(() => {
        return () => {
            const hasPendingScore = sessionStorage.getItem(STORAGE_KEY.PENDING_RANKING_SCORE);
            if (!hasPendingScore) {
                resetGame();
            }
        };
    }, [resetGame]);

    const handleRankingSubmit = async () => {
        setIsSubmitting(true);
        try {
            const result = await rankingApi.submitScore({
                score,
                attempts: 1,
                dollsCaught: successCount > 0 ? successCount : score > 0 ? 1 : 0,
            });

            if (!result.success) return { success: false, error: result.error };

            const newRankings = await rankingApi.getTopRanking(CONFIG.GAME.RANKING_TOP_LIMIT);
            setRankings(newRankings);
            sessionStorage.removeItem(STORAGE_KEY.PENDING_RANKING_SCORE);
            return { success: true };
        } catch (e) {
            console.error('Failed to submit score:', e);
            return { success: false, error: '점수 저장에 실패했습니다.' };
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRestart = () => {
        sessionStorage.removeItem(STORAGE_KEY.PENDING_RANKING_SCORE);
        setShowRanking(false);
        setScoreModalData(null);
        setSuccessCount(0);
        resetGame();
    };

    const handleStartGame = useCallback(() => {
        if (!canPlay) return;

        // [FIX] 집게 완전 복귀 확인 (UI/키보드 공통)
        const checkClaw = useGameStore.getState().claw;
        const CLAW_READY_Y = 3.9;

        if (checkClaw.position.y < CLAW_READY_Y) {
            return; // 아직 올라가는 중이면 무시
        }

        if (phase === 'result') resetGame();
        startGame();
    }, [canPlay, startGame, phase, resetGame]);

    return {
        rankings,
        isSubmitting,
        showRanking,
        showSuccess,
        lastEarnedScore,
        scoreModalData,
        setShowSuccess,
        handleRankingSubmit,
        handleRestart,
        handleStartGame,
    };
}
