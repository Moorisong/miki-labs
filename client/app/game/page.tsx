'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useGameStore } from '@/game/core/game-manager';
import useGameControls from '@/game/hooks/use-game-controls';
import { useGameLoop } from '@/game/hooks/use-game-loop';
import GameOverlay from '@/components/game/game-overlay';
import RankingBoard from '@/components/game/ranking-board';
import SuccessEffect from '@/components/game/success-effect';
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

  useGameLoop(); // Start the game loop
  const { setInputState } = useGameControls({ enabled: true });
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastEarnedScore, setLastEarnedScore] = useState(0);
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
        if (remaining === 0) {
          // Wait for result phase
        }
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
  }, [setCallbacks, setSoundCallbacks, resetGame]);

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

  const handleRankingSubmit = async (name: string) => {
    setIsSubmitting(true);
    try {
      const success = await rankingApi.submitScore({
        score,
        attempts: config.maxAttempts,
        dollsCaught: Math.floor(score / 100), // 점수 기반으로 계산
        tempUserId: `user-${Date.now()}`,
        nickname: name
      });

      if (!success) {
        throw new Error('Failed to submit score');
      }

      // Refresh rankings
      const newRankings = await rankingApi.getTopRanking(10);
      setRankings(newRankings);
    } catch (e) {
      console.error('Failed to submit score:', e);
      throw e; // 에러를 다시 던져서 ranking-board에서 처리
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setShowRanking(false);
    resetGame();
  };

  return (
    <div className={styles.container}>
      <div className={styles.gameCanvas}>
        <ClawMachine dollCount={12} />
      </div>

      <GameOverlay
        score={score}
        attempts={attempts}
        phase={phase}
        onStart={startGame}
        onMoveStart={handleMoveStart}
        onMoveEnd={handleMoveEnd}
        onDrop={dropClaw}
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
      />
    </div>
  );
}
