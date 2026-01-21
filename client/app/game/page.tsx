'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useGameStore } from '@/game/core/game-manager';
import useGameControls from '@/game/hooks/use-game-controls';
import { useGameLoop } from '@/game/hooks/use-game-loop';
import GameOverlay from '@/components/game/game-overlay';
import GameHUD from '@/components/game/game-hud';
import RankingBoard from '@/components/game/ranking-board';
import SuccessEffect from '@/components/game/success-effect';
import { useGameAttempts } from '@/lib/hooks/use-game-attempts';
import { rankingApi } from '@/lib/api/ranking';
import type { RankingEntry } from '@/lib/api/types';
import styles from './page.module.css';

const ClawMachine = dynamic(
  () => import('@/game/components/claw-machine'),
  {
    ssr: false,
  }
);

export default function GamePage() {
  const score = useGameStore((state) => state.score);
  const attempts = useGameStore((state) => state.attempts);
  const phase = useGameStore((state) => state.phase);
  const config = useGameStore((state) => state.config);
  const setCallbacks = useGameStore((state) => state.setCallbacks);
  const setSoundCallbacks = useGameStore((state) => state.setSoundCallbacks);
  const resetGame = useGameStore((state) => state.resetGame);
  const dropClaw = useGameStore((state) => state.dropClaw);
  const startGame = useGameStore((state) => state.startGame);

  // 시도 횟수/쿨타임 시스템
  const {
    remainingAttempts,
    isOnCooldown,
    cooldownRemaining,
    canPlay,
    useAttempt,
    addAttempt,
  } = useGameAttempts();

  useGameLoop(); // Start the game loop
  const { setInputState } = useGameControls({ enabled: true });
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastEarnedScore, setLastEarnedScore] = useState(0);
  const [wasSuccessThisAttempt, setWasSuccessThisAttempt] = useState(false);
  const prevScoreRef = useRef(score);

  // Load initial rankings
  useEffect(() => {
    rankingApi.getTopRanking(10).then(setRankings);
  }, []);

  // 점수 변화 감지하여 성공 효과 표시
  useEffect(() => {
    if (score > prevScoreRef.current) {
      const earned = score - prevScoreRef.current;
      setLastEarnedScore(earned);
      setShowSuccess(true);
      setWasSuccessThisAttempt(true);
    }
    prevScoreRef.current = score;
  }, [score]);

  useEffect(() => {
    setCallbacks({
      onPhaseChange: (newPhase) => {
        // console.log('Phase changed:', newPhase);
      },
      onScoreChange: (newScore) => {
        // console.log('Score changed:', newScore);
      },
      onGameEnd: async (finalScore) => {
        // Game ended, show ranking board
        const freshRankings = await rankingApi.getTopRanking(10);
        setRankings(freshRankings);
        setShowRanking(true);
      },
      onAttemptUsed: (remaining) => {
        // 시도 횟수 변경 시 (결과 단계에서)
        // 성공 시 +1, 실패 시 -1
        if (wasSuccessThisAttempt) {
          addAttempt();
        } else {
          useAttempt();
        }
        setWasSuccessThisAttempt(false);
      }
    });

    setSoundCallbacks({
      onSuccess: () => {
        // 성공 효과는 score 변화로 감지하므로 여기서는 추가 처리 필요 없음
      },
    });

    return () => {
      resetGame();
    };
  }, [setCallbacks, setSoundCallbacks, resetGame, wasSuccessThisAttempt, addAttempt, useAttempt]);

  const handleMoveStart = useCallback((direction: 'left' | 'right' | 'forward' | 'backward') => {
    if (phase !== 'moving') return;

    switch (direction) {
      case 'forward': setInputState('up', true); break;
      case 'backward': setInputState('down', true); break;
      case 'left': setInputState('left', true); break;
      case 'right': setInputState('right', true); break;
    }
  }, [phase, setInputState]);

  const handleMoveEnd = useCallback((direction: 'left' | 'right' | 'forward' | 'backward') => {
    switch (direction) {
      case 'forward': setInputState('up', false); break;
      case 'backward': setInputState('down', false); break;
      case 'left': setInputState('left', false); break;
      case 'right': setInputState('right', false); break;
    }
  }, [setInputState]);

  const handleRankingSubmit = async (): Promise<{ success: boolean; error?: string }> => {
    setIsSubmitting(true);
    try {
      const result = await rankingApi.submitScore({
        score,
        attempts: config.maxAttempts,
        dollsCaught: Math.floor(score / 100), // 점수 기반으로 계산
      });

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Refresh rankings
      const newRankings = await rankingApi.getTopRanking(10);
      setRankings(newRankings);
      return { success: true };
    } catch (e) {
      console.error('Failed to submit score:', e);
      return { success: false, error: '점수 저장에 실패했습니다.' };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setShowRanking(false);
    resetGame();
  };

  // 게임 시작 핸들러 (쿨타임 체크)
  const handleStartGame = useCallback(() => {
    if (!canPlay) return;
    startGame();
  }, [canPlay, startGame]);

  return (
    <div className={styles.container}>
      {/* 게임 HUD (시도 횟수, 쿨타임, 비로그인 안내) */}
      <GameHUD
        score={score}
        remainingAttempts={remainingAttempts}
        isOnCooldown={isOnCooldown}
        cooldownRemaining={cooldownRemaining}
        canPlay={canPlay}
        phase={phase}
      />

      <div className={styles.gameCanvas}>
        <ClawMachine dollCount={25} />
      </div>

      <GameOverlay
        score={score}
        attempts={attempts}
        phase={phase}
        onStart={handleStartGame}
        onMoveStart={handleMoveStart}
        onMoveEnd={handleMoveEnd}
        onDrop={dropClaw}
        canPlay={canPlay}
      >
        {showRanking && (
          <div className={styles.rankingOverlay}>
            <RankingBoard
              rankings={rankings}
              currentScore={score}
              onRestart={handleRestart}
              onSubmit={handleRankingSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </GameOverlay>

      <SuccessEffect
        show={showSuccess}
        score={lastEarnedScore}
        onComplete={() => setShowSuccess(false)}
        showLoginPrompt={true}
      />
    </div>
  );
}
