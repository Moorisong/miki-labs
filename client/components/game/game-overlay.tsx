'use client';

import styles from './game-overlay.module.css';

interface GameOverlayProps {
  score: number;
  attempts: number;
  isPlaying: boolean;
  onMoveStart: (direction: 'left' | 'right' | 'forward' | 'backward') => void;
  onMoveEnd: (direction: 'left' | 'right' | 'forward' | 'backward') => void;
  onDrop: () => void;
  children?: React.ReactNode;
}

export default function GameOverlay({
  score,
  attempts,
  phase,
  onMoveStart,
  onMoveEnd,
  onDrop,
  onStart,
  children
}: {
  score: number;
  attempts: number;
  phase: 'idle' | 'moving' | 'dropping' | 'grabbing' | 'rising' | 'returning' | 'result';
  onMoveStart: (direction: 'left' | 'right' | 'forward' | 'backward') => void;
  onMoveEnd: (direction: 'left' | 'right' | 'forward' | 'backward') => void;
  onDrop: () => void;
  onStart: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.overlay}>
      {/* Score Panel */}
      <div className={styles.scorePanel}>
        <div className={styles.scoreItem}>
          <span className={styles.scoreLabel}>점수</span>
          <span className={styles.scoreValue}>{score.toLocaleString()}</span>
        </div>
        <div className={styles.scoreItem}>
          <span className={styles.scoreLabel}>남은 시도</span>
          <span className={`${styles.scoreValue} ${attempts <= 1 ? styles.warning : ''}`}>
            {attempts}
          </span>
        </div>
      </div>

      {children}

      {/* Start Button */}
      {phase === 'idle' && (
        <div className={styles.startOverlay}>
          <button className={styles.startButton} onClick={onStart}>
            Game Start
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
          <h2 className={styles.gameOverTitle}>게임 종료!</h2>
          <p className={styles.gameOverScore}>최종 점수: {score.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
