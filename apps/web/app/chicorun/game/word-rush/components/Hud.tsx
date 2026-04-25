import React from 'react';
import styles from '../page.module.css';

interface HudProps {
    rankPoint: number;
    coin: number;
    timeLeft: number;
}

export function Hud({ rankPoint, coin, timeLeft }: HudProps) {
    // 시간을 MM:SS 형식으로 변환
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className={styles.hudContainer}>
            <div className={styles.pointsWrapper}>
                <div className={styles.rankPoint}>
                    🏆 {rankPoint.toLocaleString()}
                </div>
                <div className={styles.coin}>
                    💰 {coin.toLocaleString()}
                </div>
            </div>
            <div className={`${styles.timer} ${timeLeft <= 10 ? styles.timerWarning : ''}`}>
                ⏱ {formatTime(timeLeft)}
            </div>
        </div>
    );
}
