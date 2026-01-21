'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
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
    const { data: session, status, update } = useSession();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nicknameInput, setNicknameInput] = useState('');
    const [isNicknameSubmitting, setIsNicknameSubmitting] = useState(false);

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

    const handleLogin = () => {
        // 로그인하러 가기 전에 점수 저장
        sessionStorage.setItem('pendingRankingScore', currentScore.toString());
        signIn('kakao', { callbackUrl: '/game' });
    };

    const handleNicknameSubmit = async () => {
        if (!nicknameInput.trim()) return;

        setIsNicknameSubmitting(true);
        setError(null);
        try {
            const response = await fetch('/api/user/nickname', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname: nicknameInput }),
            });

            if (response.ok) {
                // 세션 업데이트 (JWT 토큰의 닉네임 정보 갱신)
                await update();

                // 세션이 업데이트되면 useEffect의 hasNickname 조건이 true가 되어
                // 자동으로 handleAutoSubmit이 호출됨
                // 하지만 state 업데이트 타이밍 이슈를 방지하기 위해 직접 호출도 해둠
                const submitResult = await onSubmit();
                if (submitResult.success) {
                    setHasSubmitted(true);
                } else {
                    setError(submitResult.error || '랭킹 저장에 실패했습니다.');
                }
            } else {
                const data = await response.json();
                setError(data.error || '닉네임 설정에 실패했습니다.');
            }
        } catch (err) {
            setError('닉네임 설정 중 오류가 발생했습니다.');
        } finally {
            setIsNicknameSubmitting(false);
        }
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
                            <button onClick={handleLogin} className={styles.loginButton}>
                                로그인하고 랭킹 점수 넣기
                            </button>
                            <button className={styles.cancelButton} onClick={onRestart}>
                                그냥 다시하기
                            </button>
                        </div>
                    </div>
                ) : !hasNickname ? (
                    // 로그인했지만 닉네임 없음
                    <div className={styles.loginPrompt}>
                        <p className={styles.promptText}>닉네임을 설정하고 랭킹에 도전하세요!</p>
                        <div className={styles.inputGroup} style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '10px' }}>
                            <input
                                type="text"
                                className={styles.input}
                                value={nicknameInput}
                                onChange={(e) => setNicknameInput(e.target.value)}
                                placeholder="닉네임 입력 (2~10자)"
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    background: 'rgba(255,255,255,0.9)',
                                    color: '#333'
                                }}
                            />
                            <button
                                className={styles.button}
                                onClick={handleNicknameSubmit}
                                disabled={isNicknameSubmitting}
                            >
                                {isNicknameSubmitting ? '저장 중...' : '확인'}
                            </button>
                        </div>
                        <button className={styles.cancelButton} onClick={onRestart}>
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
