'use client';

import { useCallback } from 'react';
import dynamic from 'next/dynamic';

import { useGameStore } from '@contents/claw/game/core/game-manager';
import useGameControls from '@contents/claw/game/hooks/use-game-controls';
import { useGameLoop } from '@contents/claw/game/hooks/use-game-loop';
import { useGameAttempts } from '@/lib/hooks/use-game-attempts';
import { CONFIG } from '@/constants';

import GameOverlay from '@contents/claw/ui/game-overlay';
import GameHUD from '@contents/claw/ui/game-hud';
import RankingBoard from '@contents/claw/ui/ranking-board';
import SuccessEffect from '@contents/claw/ui/success-effect';
import ScoreAddedModal from '@contents/claw/ui/score-added-modal';
import TutorialModal from '@contents/claw/ui/tutorial-modal';
import AdBanner from '@/components/ads/ad-banner';
import Toast from '@/components/ui/toast';

import { useGameLogic } from '@contents/claw/game/hooks/use-game-logic';
import { useTutorial } from '@/lib/hooks/use-tutorial';
import styles from './claw-game.module.css';

const ClawMachine = dynamic(() => import('@contents/claw/game/components/claw-machine'), {
    ssr: false,
});

export default function ClawGame() {
    const score = useGameStore((state) => state.score);
    const attempts = useGameStore((state) => state.attempts);
    const phase = useGameStore((state) => state.phase);
    const dropClaw = useGameStore((state) => state.dropClaw);
    const hasUserRotated = useGameStore((state) => state.hasUserRotated);
    const setHasUserRotated = useGameStore((state) => state.setHasUserRotated);

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
    const { setInputState } = useGameControls({
        enabled: canPlay,
        onInput: () => {
            if (phase === 'moving' && !hasUserRotated) {
                setHasUserRotated(true);
            }
        }
    });

    const handleMoveStart = useCallback(
        (direction: 'left' | 'right' | 'forward' | 'backward') => {
            if (phase !== 'moving') return;
            if (!hasUserRotated) setHasUserRotated(true);
            const keyMap = { forward: 'up', backward: 'down', left: 'left', right: 'right' } as const;
            setInputState(keyMap[direction], true);
        },
        [phase, setInputState, hasUserRotated, setHasUserRotated]
    );

    const handleMoveEnd = useCallback(
        (direction: 'left' | 'right' | 'forward' | 'backward') => {
            const keyMap = { forward: 'up', backward: 'down', left: 'left', right: 'right' } as const;
            setInputState(keyMap[direction], false);
        },
        [setInputState]
    );

    const handleDrop = useCallback(() => {
        if (phase === 'moving' && !hasUserRotated) {
            setHasUserRotated(true);
        }
        dropClaw();
    }, [phase, hasUserRotated, setHasUserRotated, dropClaw]);

    const showOverlayUI = showRanking || !!scoreModalData;

    return (
        <div className={styles.container}>
            {!showOverlayUI && (
                <GameHUD
                    score={score}
                    remainingAttempts={remainingAttempts}
                    isOnCooldown={isOnCooldown}
                    cooldownRemaining={cooldownRemaining}
                    canPlay={canPlay}
                    phase={phase}
                    onHelpClick={showTutorial ? closeTutorial : openTutorial}
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
                onDrop={handleDrop}
                canPlay={canPlay}
                showRanking={showOverlayUI}
                hasUserRotated={hasUserRotated}
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

            {/* Game Internal Ad Banner if needed, or keeping structure consistent */}
            <div className={styles.adSection}>
                <AdBanner />
            </div>
        </div>
    );
}
