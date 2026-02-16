'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import styles from '../styles.module.css';

interface HtsmLoginViewProps {
    onClose?: () => void;
    callbackUrl?: string;
    title?: string;
    description?: string;
}

export default function HtsmLoginView({
    onClose,
    callbackUrl = '/htsm',
    title = '자아탐험 시작하기',
    description = '테스트를 생성하려면 로그인이 필요합니다.\n카카오 로그인으로 간편하게 시작하세요.'
}: HtsmLoginViewProps) {
    const handleLogin = () => {
        signIn('kakao', { callbackUrl });
    };

    return (
        <div className={styles.loginOverlay}>
            <div className={styles.loginCard}>
                {onClose && (
                    <button className={styles.closeButton} onClick={onClose} aria-label="닫기">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                )}

                <div className={styles.loginHeader}>
                    <div className={styles.loginLogoWrapper}>
                        <Image
                            src="/htsm-logo-v6.png"
                            alt="자아탐험 로고"
                            width={80}
                            height={80}
                            style={{ objectFit: 'contain' }}
                            unoptimized
                        />
                    </div>
                    <h2 className={styles.loginTitle}>{title}</h2>
                    <div className={styles.loginDescription}>
                        {description.split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                                {line}
                                <br />
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <button onClick={handleLogin} className={styles.kakaoLoginButton}>
                    <svg className={styles.kakaoIcon} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3C6.48 3 2 6.58 2 11c0 2.85 1.89 5.35 4.72 6.77-.15.53-.96 3.39-1 3.56 0 .05-.01.1-.01.15 0 .16.08.3.22.37.08.04.16.05.24.05.13 0 .26-.05.37-.13.52-.37 4.03-2.73 4.67-3.16.59.08 1.19.12 1.79.12 5.52 0 10-3.58 10-8s-4.48-8-10-8" />
                    </svg>
                    카카오로 시작하기
                </button>

                <p className={styles.loginFooter}>
                    로그인 시 서비스 이용약관에 동의하게 됩니다.
                </p>
            </div>
        </div>
    );
}
