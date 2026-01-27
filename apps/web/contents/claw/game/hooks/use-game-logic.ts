'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

import { useGameStore } from '../core/game-manager';
import { rankingApi } from '@/lib/api/ranking';
import { STORAGE_KEY, CONFIG } from '@/constants';
import { getFailMessage } from '@/constants/toast-messages';
import { useToast } from '@/lib/hooks/use-toast';
import type { RankingEntry } from '@/lib/api/types';

// 게임 세션 준비 중인지 상태
let isPreparingSession = false;

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
    const { toast, showToast, hideToast } = useToast();

    // Sync persistent attempts state to game store
    useEffect(() => {
        useGameStore.setState({ attempts: remainingAttempts });
    }, [remainingAttempts]);

    // Load initial rankings & Restore score from login
    useEffect(() => {
        rankingApi.restoreSession();
        rankingApi.getTopRanking(CONFIG.GAME.RANKING_TOP_LIMIT).then(setRankings);

        const savedScore = localStorage.getItem(STORAGE_KEY.PENDING_RANKING_SCORE);
        if (savedScore) {
            const scoreNum = parseInt(savedScore, 10);
            if (!isNaN(scoreNum)) {
                console.log('[useGameLogic] Restoring score from localStorage:', scoreNum);
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

                        // 세션이 없으면 새로 발급 (안전장치)
                        if (!rankingApi.hasValidSession() && !isPreparingSession) {
                            isPreparingSession = true;
                            await rankingApi.startGameSession();
                            isPreparingSession = false;
                        }

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

                            // 다음 성공을 위해 새 세션 미리 발급 (비동기)
                            rankingApi.startGameSession().catch(console.error);
                        } else if (result.error) {
                            console.error('[GamePage] Submit failed:', result.error);
                            showToast(result.error, 'error');
                        }
                    } catch (e) {
                        console.error('[GamePage] Auto submit failed:', e);
                    }
                }
            },
            onFail: (reason) => {
                const message = getFailMessage(reason);
                showToast(message, 'error');
            },
        });
    }, [
        setCallbacks,
        setSoundCallbacks,
        addAttempt,
        useAttempt,
        session,
        lastEarnedScore,
        showToast,
    ]);

    // Game cleanup on unmount
    useEffect(() => {
        return () => {
            const hasPendingScore = localStorage.getItem(STORAGE_KEY.PENDING_RANKING_SCORE);
            if (!hasPendingScore) {
                resetGame();
            }
        };
    }, [resetGame]);

    const handleRankingSubmit = async () => {
        setIsSubmitting(true);
        try {
            console.log('[useGameLogic] Submitting ranking with score:', score);
            const result = await rankingApi.submitScore({
                score,
                attempts: 1,
                dollsCaught: successCount > 0 ? successCount : score > 0 ? 1 : 0,
            });

            if (!result.success) return { success: false, error: result.error };

            const newRankings = await rankingApi.getTopRanking(CONFIG.GAME.RANKING_TOP_LIMIT);
            setRankings(newRankings);
            localStorage.removeItem(STORAGE_KEY.PENDING_RANKING_SCORE);
            console.log('[useGameLogic] Ranking submitted and score cleared from localStorage');
            return { success: true };
        } catch (e) {
            console.error('Failed to submit score:', e);
            return { success: false, error: '점수 저장에 실패했습니다.' };
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleContinueGame = () => {
        setScoreModalData(null);
        // 점수나 게임 상태를 리셋하지 않고 모달만 닫음 (계속하기)
    };

    const handleRestart = () => {
        localStorage.removeItem(STORAGE_KEY.PENDING_RANKING_SCORE);
        setShowRanking(false);
        setScoreModalData(null);
        setSuccessCount(0);
        resetGame();
    };

    const handleStartGame = useCallback(async () => {
        if (!canPlay) return;

        // [FIX] 집게 완전 복귀 확인 (UI/키보드 공통)
        const checkClaw = useGameStore.getState().claw;
        const CLAW_READY_Y = 3.9;

        if (checkClaw.position.y < CLAW_READY_Y) {
            return; // 아직 올라가는 중이면 무시
        }

        // 게임 세션 토큰 발급 (로그인/비로그인 모두)
        if (!rankingApi.hasValidSession() && !isPreparingSession) {
            isPreparingSession = true;
            const sessionResult = await rankingApi.startGameSession();
            isPreparingSession = false;

            if (!sessionResult.success) {
                console.error('[GamePage] Failed to start game session:', sessionResult.error);
                // 세션 발급 실패해도 게임은 진행 (점수 저장만 안됨)
            }
        }

        if (phase === 'result') resetGame();
        startGame();
    }, [canPlay, startGame, phase, resetGame, session]);

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
        handleContinueGame,
        handleStartGame,
        toast,
        hideToast,
    };
}
