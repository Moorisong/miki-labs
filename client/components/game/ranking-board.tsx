'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import type { RankingEntry } from '@/lib/api/types';
import styles from './ranking-board.module.css';

interface RankingBoardProps {
    rankings: RankingEntry[];
    currentScore: number;
    onRestart: () => void;
    onSubmit: () => Promise<{ success: boolean; error?: string }>;
    isSubmitting?: boolean;
}

export default function RankingBoard({
    rankings,
    currentScore,
    onRestart,
    onSubmit,
    isSubmitting = false,
}: RankingBoardProps) {
    const { data: session, status } = useSession();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isLoggedIn = status === 'authenticated' && session?.user;
    const hasNickname = isLoggedIn && session.user.nickname;

    // 로그인하고 닉네임이 있으면 자동으로 제출
    useEffect(() => {
        if (hasNickname && !hasSubmitted && currentScore > 0) {
            handleAutoSubmit();
        }
    }, [hasNickname, hasSubmitted, currentScore]);

    const handleAutoSubmit = async () => {
        if (hasSubmitted) return;

        setError(null);
        try {
            const result = await onSubmit();
            if (result.success) {
                setHasSubmitted(true);
            } else {
                setError(result.error || '저장에 실패했습니다.');
            }
        } catch (err) {
            setError('저장에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const handleManualSubmit = async () => {
        await handleAutoSubmit();
    };

    return (
        <div className={styles.rankingBoard}>
            <h2 className={styles.title}>Hall of Fame</h2>

            <div className={styles.list}>
                {rankings.length > 0 ? (
                    rankings.map((entry, index) => (
                        <div
                            key={`${entry.oderId || index}-${index}`}
                            className={`${styles.item} ${hasNickname && entry.score === currentScore && hasSubmitted && entry.nickname === session?.user?.nickname ? styles.highlight : ''}`}
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
                <p className={styles.message}>
                    Your Score: <span className={styles.currentScore}>{currentScore.toLocaleString()}</span>
                </p>

                {error && <p className={styles.error}>{error}</p>}

                {!isLoggedIn ? (
                    // 비로그인 상태
                    <div className={styles.loginPrompt}>
                        <p className={styles.promptText}>로그인하면 랭킹에 기록할 수 있어요!</p>
                        <div className={styles.buttonGroup}>
                            <Link href="/login" className={styles.loginButton}>
                                로그인하기
                            </Link>
                            <button className={styles.cancelButton} onClick={onRestart}>
                                그냥 다시하기
                            </button>
                        </div>
                    </div>
                ) : !hasNickname ? (
                    // 로그인했지만 닉네임 없음
                    <div className={styles.loginPrompt}>
                        <p className={styles.promptText}>닉네임을 설정하면 랭킹에 기록됩니다.</p>
                        <button className={styles.button} onClick={onRestart}>
                            다시 하기
                        </button>
                    </div>
                ) : hasSubmitted ? (
                    // 제출 완료
                    <div className={styles.submittedMessage}>
                        <p className={styles.successText}>{session.user.nickname}님의 점수가 저장되었습니다!</p>
                        <button className={styles.button} onClick={onRestart}>
                            다시 하기
                        </button>
                    </div>
                ) : (
                    // 로그인 + 닉네임 있음 + 아직 제출 안됨 (수동 제출 버튼)
                    <div className={styles.buttonGroup}>
                        <button
                            className={styles.button}
                            onClick={handleManualSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '저장 중...' : '랭킹 등록'}
                        </button>
                        <button
                            className={styles.cancelButton}
                            onClick={onRestart}
                            disabled={isSubmitting}
                        >
                            취소
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
