'use client';

import { useState } from 'react';
import type { RankingEntry } from '@/lib/api/types';
import styles from './ranking-board.module.css';

interface RankingBoardProps {
    rankings: RankingEntry[];
    currentScore: number;
    onRestart: () => void;
    onSubmit: (name: string) => Promise<void>;
    isSubmitting?: boolean;
}

export default function RankingBoard({
    rankings,
    currentScore,
    onRestart,
    onSubmit,
    isSubmitting = false,
}: RankingBoardProps) {
    const [name, setName] = useState('');
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [showInput, setShowInput] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setError(null);
        try {
            await onSubmit(name);
            setHasSubmitted(true);
        } catch (err) {
            setError('저장에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const handleSkip = () => {
        setShowInput(false);
    };

    return (
        <div className={styles.rankingBoard}>
            <h2 className={styles.title}>Hall of Fame</h2>

            <div className={styles.list}>
                {rankings.length > 0 ? (
                    rankings.map((entry, index) => (
                        <div
                            key={`${entry.userId}-${index}`}
                            className={`${styles.item} ${entry.score === currentScore && hasSubmitted && entry.nickname === name ? styles.highlight : ''}`}
                        >
                            <span className={`${styles.rank} ${index < 3 ? styles.topRank : ''}`}>
                                #{index + 1}
                            </span>
                            <span className={styles.name}>{entry.nickname || 'Unknown'}</span>
                            <span className={styles.score}>{entry.score.toLocaleString()}</span>
                        </div>
                    ))
                ) : (
                    <p className={styles.emptyMessage}>아직 기록이 없습니다</p>
                )}
            </div>

            <div className={styles.footer}>
                {!hasSubmitted && showInput ? (
                    <>
                        <p className={styles.message}>
                            Your Score: <span className={styles.currentScore}>{currentScore.toLocaleString()}</span>
                        </p>
                        {error && <p className={styles.error}>{error}</p>}
                        <form className={styles.inputGroup} onSubmit={handleSubmit}>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="닉네임 입력"
                                className={styles.input}
                                maxLength={10}
                                disabled={isSubmitting}
                            />
                            <div className={styles.buttonGroup}>
                                <button
                                    type="submit"
                                    className={styles.button}
                                    disabled={isSubmitting || !name.trim()}
                                >
                                    {isSubmitting ? '...' : '저장'}
                                </button>
                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={handleSkip}
                                    disabled={isSubmitting}
                                >
                                    취소
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <button className={styles.button} onClick={onRestart}>
                        다시 하기
                    </button>
                )}
            </div>
        </div>
    );
}
