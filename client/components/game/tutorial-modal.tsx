import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
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


                </div>

                <button className={styles.confirmButton} onClick={onClose}>
                    확인했습니다
                </button>
            </div>
        </div>,
        document.body
    );
}
