'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import styles from './styles.module.css';

const BackgroundSparkles = dynamic(() => import('./background-sparkles'), { ssr: false });

export default function LoadingPage() {
    const router = useRouter();
    const [adClicked, setAdClicked] = useState(false);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (adClicked) {
            const checkAdDone = () => {
                if (document.visibilityState === 'visible') {
                    // 광고 보고 돌아오면 -> 테스트(키워드 선택) 페이지로 이동
                    router.push('/htsm/start');
                }
            };

            window.addEventListener('focus', checkAdDone);
            window.addEventListener('visibilitychange', checkAdDone);

            intervalId = setInterval(() => {
                if (document.visibilityState === 'visible') {
                    checkAdDone();
                }
            }, 1000);

            return () => {
                window.removeEventListener('focus', checkAdDone);
                window.removeEventListener('visibilitychange', checkAdDone);
                clearInterval(intervalId);
            };
        }
    }, [adClicked, router]);

    const handleWatchAd = () => {
        const adWindow = window.open('https://www.google.com', '_blank');
        setAdClicked(true);
    };

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
                        onClick={handleWatchAd}
                        style={{ width: '100%' }}
                    >
                        광고 보고 테스트 시작하기
                    </button>
                    {/* 유저 요청: "광고 보고 결과 보기 버튼 클릭" -> 문맥상 테스트 시작이 맞음. */}
                </div>

            </div>
        </div>
    );
}
