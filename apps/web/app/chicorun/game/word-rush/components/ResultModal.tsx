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
                <h2>게임 종료</h2>

                {isNewLegend && (
                    <div className={styles.newLegendBadge}>🏆 새로운 레전드 달성! 🏆</div>
                )}

                <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                        <span>정답 개수</span>
                        <strong>{correctCount}</strong>
                    </div>
                    <div className={styles.statItem}>
                        <span>최대 콤보</span>
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
