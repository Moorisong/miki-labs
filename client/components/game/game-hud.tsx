'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import styles from './game-hud.module.css';

interface GameHUDProps {
    score: number;
    remainingAttempts: number;
    isOnCooldown: boolean;
    cooldownRemaining: string;
    canPlay: boolean;
    phase: 'idle' | 'moving' | 'dropping' | 'grabbing' | 'rising' | 'returning' | 'releasing' | 'result';
}

export default function GameHUD({
    score,
    remainingAttempts,
    isOnCooldown,
    cooldownRemaining,
    canPlay,
    phase,
}: GameHUDProps) {
    const { data: session, status } = useSession();
    const isLoggedIn = status === 'authenticated';
    const isLastAttempt = remainingAttempts === 1 && !isOnCooldown;

    return (
        <div className={styles.hud}>
            {/* 상단 바 (시도 횟수 - 점수) */}
            <div className={styles.topBar}>
                {/* 시도 횟수 / 쿨타임 표시 */}
                <div className={styles.attemptsSection}>
                    {isOnCooldown ? (
                        <div className={styles.cooldownContainer}>
                            <div className={styles.cooldownBadge}>
                                <span className={styles.cooldownIcon}>⏳</span>
                                <span className={styles.cooldownLabel}>소진</span>
                            </div>
                            <div className={styles.cooldownTimer}>
                                <span className={styles.timerValue}>{cooldownRemaining}</span>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.attemptsContainer}>
                            <div className={styles.attemptsDisplay}>
                                <span className={styles.label}>남은 시도</span>
                                <span className={`${styles.attemptsValue} ${isLastAttempt ? styles.warning : ''}`}>
                                    {remainingAttempts} / 3
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 점수 표시 */}
                <div className={styles.scoreSection}>
                    <div className={styles.scoreItem}>
                        <span className={styles.label}>점수</span>
                        <span className={styles.value}>{score.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* 경고 메시지 (상단 바 아래 중앙) */}
            {!isOnCooldown && isLastAttempt && (
                <div className={styles.warningMessage}>
                    <span className={styles.warningIcon}>⚠️</span>
                    <span>마지막 기회예요! 성공하면 +1회!</span>
                </div>
            )}

            {/* 비로그인 안내 문구 (게임 시작 전만 노출) */}
            {!isLoggedIn && phase === 'idle' && (
                <div className={styles.loginPrompt}>
                    <p className={styles.promptText}>
                        <span className={styles.infoIcon}>ℹ️</span>
                        로그인 없이도 플레이할 수 있어요
                    </p>
                    <p className={styles.promptSubtext}>
                        로그인하면 기록을 랭킹에 저장할 수 있어요
                    </p>
                    <Link href="/login" className={styles.loginLink}>
                        지금 로그인하고 랭킹에 도전하세요! →
                    </Link>
                </div>
            )}
        </div>
    );
}
