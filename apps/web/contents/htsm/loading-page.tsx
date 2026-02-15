'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import styles from './styles.module.css';

const BackgroundSparkles = dynamic(() => import('./background-sparkles'), { ssr: false });

export default function LoadingPage() {
    // 광고 창이 떠서 문서가 숨겨졌었는지 체크 (ref로 불필요한 리렌더링 방지)
    const hasLeftRef = useRef(false);

    useEffect(() => {
        // 기존 스크립트가 있다면 제거 (중복 방지)
        const existing = document.querySelector('script[data-zone="10587835"]');
        if (existing) existing.remove();

        const script = document.createElement('script');
        script.dataset.zone = '10587835';
        script.src = 'https://al5sm.com/tag.min.js';

        // body에 추가
        document.body.appendChild(script);

        const checkAndMove = () => {
            if (hasLeftRef.current) {
                // 중요: SPA 라우팅(router.push) 대신 강제 새로고침 이동을 사용하여
                // window 객체에 남은 광고 스크립트 리스너를 확실히 제거함
                window.location.href = '/htsm/start';
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                hasLeftRef.current = true;
            } else {
                checkAndMove();
            }
        };

        const handleBlur = () => {
            hasLeftRef.current = true;
        };

        const handleFocus = () => {
            checkAndMove();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);

            // 언마운트 시 스크립트 태그 제거 (어차피 새로고침되지만 안전장치)
            const remnants = document.querySelectorAll('script[data-zone="10587835"]');
            remnants.forEach(el => el.remove());
        };
    }, []);

    return (
        <div className={styles.pageContainer}>
            <BackgroundSparkles />
            <div className={styles.innerContainer} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>

                <h1 className={styles.heroTitle} style={{ fontSize: '2rem', marginBottom: '2rem' }}>
                    테스트 준비 중...
                </h1>

                <div className={styles.card} style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', borderRadius: '1rem' }}>
                    <p style={{ marginBottom: '2rem', fontSize: '1.2rem', lineHeight: '1.6' }}>
                        자아 탐험을 시작할 준비가 되었습니다.<br />
                        광고를 시청하면 테스트를 시작할 수 있습니다.
                    </p>

                    <button
                        className={`${styles.btnPrimary} ${styles.btnPrimaryLg}`}
                        style={{ width: '100%' }}
                    >
                        광고 보고 테스트 시작하기
                    </button>
                </div>

            </div>
        </div>
    );
}
