import React from 'react';
import styles from './score-added-modal.module.css';

interface ScoreAddedModalProps {
    score: number;
    totalScore: number;
    totalCaught: number;
    onRestart: () => void;
}

export default function ScoreAddedModal({
    score,
    totalScore,
    totalCaught,
    onRestart
}: ScoreAddedModalProps) {
    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2 className={styles.title}>점수 획득!</h2>
                <div className={styles.content}>
                    <div className={styles.row}>
                        <span>이번 점수</span>
                        <span className={styles.highlight}>+{score.toLocaleString()}</span>
                    </div>
                    <div className={styles.divider} />
                    {totalScore > 0 && (
                        <div className={styles.row}>
                            <span>총 누적 점수</span>
                            <span>{totalScore.toLocaleString()}</span>
                        </div>
                    )}
                    {totalCaught >= 0 && (
                        <div className={styles.row}>
                            <span>총 성공 횟수</span>
                            <span>{totalCaught.toLocaleString()}회</span>
                        </div>
                    )}
                </div>
                <button className={styles.button} onClick={onRestart}>
                    확인
                </button>
            </div>
        </div>
    );
}
