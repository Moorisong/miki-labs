'use client';

import { useSession, signIn } from 'next-auth/react';
import { CONFIG, ROUTES } from '@/constants';
import styles from './tutorial-modal.module.css';

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
    const { status } = useSession();
    const isLoggedIn = status === 'authenticated';

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2 className={styles.title}>
                    <span className={styles.icon}>🎮</span>
                    게임 방법
                </h2>

                <div className={styles.content}>
                    <section className={styles.section}>
                        <h3 className={styles.subtitle}>조작 가이드</h3>
                        <ul className={styles.list}>
                            <li>
                                <span className={styles.badge}>이동/DROP</span> 방향키, 스페이스바 / 버튼 터치
                            </li>
                            <li>
                                <span className={styles.badge}>확대/축소</span> 마우스 휠 / 두 손가락 줌
                            </li>
                            <li>
                                <span className={styles.badge}>시점 회전</span> 드래그 (꾹 누르고 이동)
                            </li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h3 className={styles.subtitle}>게임 규칙</h3>
                        <ul className={styles.list}>
                            <li>기본 <span className={styles.highlight}>{CONFIG.GAME.MAX_ATTEMPTS}회</span> 시도 (성공 시 <span className={styles.highlight}>+1</span>)</li>
                            <li>인형의 <span className={styles.highlight}>크기와 무게</span>에 따라 점수가 달라져요</li>
                            <li>횟수 소진 시 <span className={styles.highlight}>{CONFIG.TIMEOUT.COOLDOWN_HOURS}시간</span> 후 자동 충전</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <div className={styles.loginInfo}>
                            <p className={styles.infoText}>
                                <span className={styles.infoIcon}>ℹ️</span>
                                로그인 없이도 플레이할 수 있어요
                            </p>
                            <p className={styles.infoText}>로그인하면 기록을 랭킹에 저장할 수 있어요</p>
                            {!isLoggedIn && (
                                <button
                                    className={styles.loginCTA}
                                    onClick={() => signIn('kakao', { callbackUrl: ROUTES.GAME })}
                                >
                                    지금 로그인하고 랭킹에 도전하세요! →
                                </button>
                            )}
                        </div>
                    </section>
                </div>

                <button className={styles.confirmButton} onClick={onClose}>
                    확인했습니다
                </button>
            </div>
        </div>
    );
}
