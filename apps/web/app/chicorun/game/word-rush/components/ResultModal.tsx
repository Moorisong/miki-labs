import React from 'react';
import styles from '../page.module.css';

interface ResultModalProps {
    rankPoint: number;
    coin: number;
    correctCount: number;
    maxCombo: number;
    isNewLegend: boolean;
    onClose: () => void;
}

export function ResultModal({ rankPoint, coin, correctCount, maxCombo, isNewLegend, onClose }: ResultModalProps) {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Game Over</h2>

                {isNewLegend && (
                    <div className={styles.newLegendBadge}>🏆 NEW LEGEND 🏆</div>
                )}

                <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                        <span>Correct</span>
                        <strong>{correctCount}</strong>
                    </div>
                    <div className={styles.statItem}>
                        <span>Max Combo</span>
                        <strong>{maxCombo}</strong>
                    </div>
                </div>

                <div className={styles.rewardBox}>
                    <div className={styles.rewardPoint}>
                        🏆 +{rankPoint.toLocaleString()}
                    </div>
                    <div className={styles.rewardCoin}>
                        💰 +{coin.toLocaleString()}
                    </div>
                </div>

                <button onClick={onClose} className={styles.closeBtn}>
                    돌아가기
                </button>
            </div>
        </div>
    );
}
