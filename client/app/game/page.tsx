'use client';

import { useCallback } from 'react';
import dynamic from 'next/dynamic';

import { useGameStore } from '@/game/core/game-manager';
import useGameControls from '@/game/hooks/use-game-controls';
import { useGameLoop } from '@/game/hooks/use-game-loop';
import { useGameAttempts } from '@/lib/hooks/use-game-attempts';
import { CONFIG } from '@/constants';

import GameOverlay from '@/components/game/game-overlay';
import GameHUD from '@/components/game/game-hud';
import RankingBoard from '@/components/game/ranking-board';
import SuccessEffect from '@/components/game/success-effect';
import ScoreAddedModal from '@/components/game/score-added-modal';
import TutorialModal from '@/components/game/tutorial-modal';
import AdBanner from '@/components/ads/ad-banner';
import Toast from '@/components/ui/toast';

import { useGameLogic } from './hooks/use-game-logic';
import { useTutorial } from '@/lib/hooks/use-tutorial';
import styles from './page.module.css';

const ClawMachine = dynamic(() => import('@/game/components/claw-machine'), {
  ssr: false,
});

export default function GamePage() {
  const score = useGameStore((state) => state.score);
  const attempts = useGameStore((state) => state.attempts);
  const phase = useGameStore((state) => state.phase);
  const dropClaw = useGameStore((state) => state.dropClaw);

  const {
    remainingAttempts,
    isOnCooldown,
    cooldownRemaining,
    canPlay,
    useAttempt,
    addAttempt,
  } = useGameAttempts();

  const {
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
  } = useGameLogic({
    score,
    remainingAttempts,
    canPlay,
    useAttempt,
    addAttempt,
  });

  const { showTutorial, closeTutorial, openTutorial } = useTutorial();

  useGameLoop();
  const { setInputState } = useGameControls({ enabled: canPlay });

  const handleMoveStart = useCallback(
    (direction: 'left' | 'right' | 'forward' | 'backward') => {
      if (phase !== 'moving') return;
      const keyMap = { forward: 'up', backward: 'down', left: 'left', right: 'right' } as const;
      setInputState(keyMap[direction], true);
    },
    [phase, setInputState]
  );

  const handleMoveEnd = useCallback(
    (direction: 'left' | 'right' | 'forward' | 'backward') => {
      const keyMap = { forward: 'up', backward: 'down', left: 'left', right: 'right' } as const;
      setInputState(keyMap[direction], false);
    },
    [setInputState]
  );

  const showOverlayUI = showRanking || !!scoreModalData;

  return (
    <>
      <div className={styles.container}>
        {!showOverlayUI && (
          <GameHUD
            score={score}
            remainingAttempts={remainingAttempts}
            isOnCooldown={isOnCooldown}
            cooldownRemaining={cooldownRemaining}
            canPlay={canPlay}
            phase={phase}
            onHelpClick={openTutorial}
          />
        )}

        <div className={styles.gameCanvas}>
          <ClawMachine dollCount={CONFIG.GAME.DEFAULT_DOLL_COUNT} />
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
          showRanking={showOverlayUI}
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
          {scoreModalData && (
            <div className={styles.rankingOverlay}>
              <ScoreAddedModal
                score={scoreModalData.score}
                totalScore={scoreModalData.totalScore}
                totalCaught={scoreModalData.totalCaught}
                onRestart={handleContinueGame}
              />
            </div>
          )}
        </GameOverlay>

        <SuccessEffect
          show={showSuccess && !showOverlayUI}
          score={lastEarnedScore}
          totalScore={score}
          onComplete={() => setShowSuccess(false)}
          showLoginPrompt={true}
        />

        <TutorialModal isOpen={showTutorial} onClose={closeTutorial} />
        <Toast toast={toast} onHide={hideToast} />
      </div>

      {/* Ad Section - Now completely separate from the game container */}
      <div className={styles.adSection}>
        <AdBanner />
      </div>
    </>
  );
}
