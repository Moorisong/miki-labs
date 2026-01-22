'use client';

import type { ReactNode } from 'react';

import { MESSAGES } from '@/constants';
import type { GamePhase } from '@/game/types/game.types';

import styles from './game-overlay.module.css';

interface GameOverlayProps {
  score: number;
  attempts: number;
  phase: GamePhase;
  onMoveStart: (direction: 'left' | 'right' | 'forward' | 'backward') => void;
  onMoveEnd: (direction: 'left' | 'right' | 'forward' | 'backward') => void;
  onDrop: () => void;
  onStart: () => void;
  canPlay?: boolean;
  showRanking?: boolean;
  children?: ReactNode;
}

export default function GameOverlay({
  score,
  attempts,
  phase,
  onMoveStart,
  onMoveEnd,
  onDrop,
  onStart,
  canPlay = true,
  showRanking = false,
  children,
}: GameOverlayProps) {
  const getStartButtonText = () => {
    if (!canPlay) return MESSAGES.GAME.COOLDOWN;
    if (phase === 'result') return MESSAGES.GAME.RESTART;
    return MESSAGES.GAME.START;
  };

  return (
    <div className={styles.overlay}>
      {/* Score Panel - 기존 HUD는 GameHUD로 대체됨, 여기서는 제거 또는 간소화 */}

      {children}

      {/* Start Button */}
      {(phase === 'idle' || phase === 'result') && !showRanking && (
        <div className={styles.startOverlay}>
          <button
            className={`${styles.startButton} ${!canPlay ? styles.disabled : ''}`}
            onClick={onStart}
            disabled={!canPlay}
          >
            {getStartButtonText()}
          </button>
        </div>
      )}

      {/* Mobile Controls */}
      {phase === 'moving' && (
        <div className={styles.mobileControls}>
          {/* Direction Pad */}
          <div className={styles.dPad}>
            <button
              className={`${styles.dPadButton} ${styles.up}`}
              onTouchStart={() => onMoveStart('forward')}
              onMouseDown={() => onMoveStart('forward')}
              onTouchEnd={() => onMoveEnd('forward')}
              onMouseUp={() => onMoveEnd('forward')}
              onMouseLeave={() => onMoveEnd('forward')}
              aria-label="앞으로"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-8 8h6v8h4v-8h6z" />
              </svg>
            </button>
            <button
              className={`${styles.dPadButton} ${styles.left}`}
              onTouchStart={() => onMoveStart('left')}
              onMouseDown={() => onMoveStart('left')}
              onTouchEnd={() => onMoveEnd('left')}
              onMouseUp={() => onMoveEnd('left')}
              onMouseLeave={() => onMoveEnd('left')}
              aria-label="왼쪽"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 12l8-8v6h8v4h-8v6z" />
              </svg>
            </button>
            <button
              className={`${styles.dPadButton} ${styles.right}`}
              onTouchStart={() => onMoveStart('right')}
              onMouseDown={() => onMoveStart('right')}
              onTouchEnd={() => onMoveEnd('right')}
              onMouseUp={() => onMoveEnd('right')}
              onMouseLeave={() => onMoveEnd('right')}
              aria-label="오른쪽"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 12l-8 8v-6h-8v-4h8v-6z" />
              </svg>
            </button>
            <button
              className={`${styles.dPadButton} ${styles.down}`}
              onTouchStart={() => onMoveStart('backward')}
              onMouseDown={() => onMoveStart('backward')}
              onTouchEnd={() => onMoveEnd('backward')}
              onMouseUp={() => onMoveEnd('backward')}
              onMouseLeave={() => onMoveEnd('backward')}
              aria-label="뒤로"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 20l8-8h-6v-8h-4v8h-6z" />
              </svg>
            </button>
            <div className={styles.dPadCenter} />
          </div>

          {/* Drop Button */}
          <button
            className={styles.dropButton}
            onTouchStart={onDrop}
            onMouseDown={onDrop}
            aria-label="하강"
          >
            <span className={styles.dropIcon}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L8 6h3v6h2V6h3L12 2zm-8 14v6h16v-6H4zm2 4v-2h12v2H6z" />
              </svg>
            </span>
            <span className={styles.dropText}>DROP</span>
          </button>
        </div>
      )}

      {/* Game Status Messages */}
      {phase === 'result' && attempts === 0 && (
        <div className={styles.gameOver}>
          <h2 className={styles.gameOverTitle}>{MESSAGES.GAME.GAME_OVER}</h2>
          <p className={styles.gameOverScore}>{MESSAGES.GAME.FINAL_SCORE}: {score.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

