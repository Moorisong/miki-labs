'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import styles from './styles.module.css';

const BackgroundSparkles = dynamic(() => import('./background-sparkles'), { ssr: false });

export default function LoadingPage() {
    // 광고 창이 떠서 문서가 숨겨졌었는지 체크 (ref로 불필요한 리렌더링 방지)
    const hasLeftRef = useRef(false);

    useEffect(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        /** [PC용 광고 로직] */
        const setupPcAdFlow = () => {
            console.log('HTSM: Loading PC Ad Flow');
            const script = document.createElement('script');
            script.dataset.zone = '10587835';
            script.src = 'https://al5sm.com/tag.min.js';
            document.body.appendChild(script);

            const handlePcVisibilityChange = () => {
                if (document.hidden) {
                    hasLeftRef.current = true;
                } else if (hasLeftRef.current) {
                    window.location.href = '/htsm/start';
                }
            };

            const handlePcBlur = () => {
                hasLeftRef.current = true;
            };

            const handlePcFocus = () => {
                if (hasLeftRef.current) {
                    window.location.href = '/htsm/start';
                }
            };

            document.addEventListener('visibilitychange', handlePcVisibilityChange);
            window.addEventListener('blur', handlePcBlur);
            window.addEventListener('focus', handlePcFocus);

            return () => {
                document.removeEventListener('visibilitychange', handlePcVisibilityChange);
                window.removeEventListener('blur', handlePcBlur);
                window.removeEventListener('focus', handlePcFocus);
                script.remove();
            };
        };

        /** [모바일용 광고 로직] */
        const setupMobileAdFlow = () => {
            console.log('HTSM: Loading Mobile Ad Flow');
            // 모바일은 팝업 차단이 강력하므로 별도의 처리나 스크립트 설정이 필요할 수 있음
            const script = document.createElement('script');
            script.dataset.zone = '10587835'; // 현재 동일한 존 사용
            script.src = 'https://al5sm.com/tag.min.js';
            document.body.appendChild(script);

            // 모바일은 visibilitychange가 더 신뢰도 높음
            const handleMobileVisibility = () => {
                if (document.hidden) {
                    hasLeftRef.current = true;
                    // 모바일의 경우 페이지가 완전히 비활성화되었다가 돌아오는 시점을 체크
                    console.log('HTSM Mobile: User left page (ad opened)');
                } else {
                    if (hasLeftRef.current) {
                        console.log('HTSM Mobile: User returned, navigating...');
                        window.location.href = '/htsm/start';
                    }
                }
            };

            // 모바일은 blur보다는 visibilitychange와 pagehide를 주로 사용
            document.addEventListener('visibilitychange', handleMobileVisibility);
            window.addEventListener('pagehide', () => { hasLeftRef.current = true; });

            return () => {
                document.removeEventListener('visibilitychange', handleMobileVisibility);
                script.remove();
            };
        };

        // 기존 스크립트 제거 (중복 방지)
        const existing = document.querySelector('script[data-zone="10587835"]');
        if (existing) existing.remove();

        const cleanup = isMobile ? setupMobileAdFlow() : setupPcAdFlow();

        return () => {
            cleanup();
            // 전역 스크립트 잔재 제거
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
