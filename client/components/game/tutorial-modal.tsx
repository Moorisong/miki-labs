'use client';

import { CONFIG, MESSAGES } from '@/constants';
import styles from './tutorial-modal.module.css';

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
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
                        <h3 className={styles.subtitle}>🕹️ 조작법</h3>
                        <ul className={styles.list}>
                            <li>
                                <span className={styles.badge}>PC</span> 방향키(이동) + 스페이스바(DROP)
                            </li>
                            <li>
                                <span className={styles.badge}>Mobile</span> 화면 버튼 터치
                            </li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h3 className={styles.subtitle}>🎯 게임 규칙</h3>
                        <ul className={styles.list}>
                            <li>한 판당 기본 <span className={styles.highlight}>{CONFIG.GAME.MAX_ATTEMPTS}회</span> 시도</li>
                            <li>성공 시 남은 횟수 <span className={styles.highlight}>+1</span></li>
                            <li>시도 횟수 0 → {CONFIG.TIMEOUT.COOLDOWN_HOURS}시간 후 <span className={styles.highlight}>{CONFIG.GAME.MAX_ATTEMPTS}회</span> 충전</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h3 className={styles.subtitle}>🕒 쿨타임 규칙</h3>
                        <p className={styles.text}>
                            횟수가 <strong>0이 될 때만</strong> 쿨타임이 시작됩니다.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h3 className={styles.subtitle}>👤 로그인 안내</h3>
                        <ul className={styles.list}>
                            <li>로그인 없이도 플레이 가능</li>
                            <li className={styles.accent}>로그인하면 기록을 랭킹에 저장할 수 있어요!</li>
                        </ul>
                    </section>
                </div>

                <button className={styles.confirmButton} onClick={onClose}>
                    확인했습니다
                </button>
            </div>
        </div>
    );
}
