'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './styles.module.css';

const TOBY_URL = 'https://toby-teacher.vercel.app';

export default function TobyLoadingPage() {
    // 광고 창이 떠서 문서가 숨겨졌었는지 체크 (ref로 불필요한 리렌더링 방지)
    const hasLeftRef = useRef(false);
    const [viewMode, setViewMode] = useState<'loading' | 'help'>('loading');

    useEffect(() => {
        // 자아탐험과 동일한 PC 광고 플로우
        console.log('TOBY: Loading PC Ad Flow');
        const script = document.createElement('script');
        script.dataset.zone = '10587835';
        script.src = 'https://al5sm.com/tag.min.js';
        document.body.appendChild(script);

        const handleVisibilityChange = () => {
            if (document.hidden) {
                hasLeftRef.current = true;
            } else if (hasLeftRef.current) {
                // 자아탐험과 동일: 돌아오면 즉시 TOBY로 이동
                window.location.href = TOBY_URL;
            }
        };

        const handleBlur = () => {
            hasLeftRef.current = true;
        };

        const handleFocus = () => {
            if (hasLeftRef.current) {
                // 자아탐험과 동일: 돌아오면 즉시 TOBY로 이동
                window.location.href = TOBY_URL;
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            script.remove();
            // 전역 스크립트 잔재 제거
            const remnants = document.querySelectorAll('script[data-zone="10587835"]');
            remnants.forEach(el => el.remove());
        };
    }, []);

    return (
        <div className={styles.pageContainer}>
            {/* Background decorations */}
            <div className={`${styles.bgDecoration} ${styles.bgBlue}`} />
            <div className={`${styles.bgDecoration} ${styles.bgCyan}`} />

            <div className={styles.innerContainer} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>

                <div className={styles.logoWrapper}>
                    <Image
                        src="/sample/toby-logo.png"
                        alt="TOBY 로고"
                        width={120}
                        height={120}
                        priority
                        style={{ objectFit: 'contain' }}
                    />
                </div>

                <h1 className={styles.heroTitle}>
                    <span className={styles.gradientText}>TOBY</span> 준비 중...
                </h1>

                <div className={styles.card} style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.3)', maxWidth: '420px', width: '100%' }}>
                    {viewMode === 'loading' ? (
                        <>
                            <p style={{ marginBottom: '2rem', fontSize: '1rem', lineHeight: '1.6', color: '#111827' }}>
                                TOBY에 입장할 준비가 되었습니다.<br />
                                광고를 클릭하면 TOBY를 시작할 수 있습니다.
                            </p>

                            <button
                                className={`${styles.btnPrimary} ${styles.btnPrimaryLg}`}
                                style={{ width: '100%' }}
                            >
                                광고 보고 TOBY 시작하기
                            </button>

                            <button
                                onClick={() => setViewMode('help')}
                                style={{
                                    marginTop: '1rem',
                                    background: 'none',
                                    border: 'none',
                                    color: '#6b7280',
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                }}
                            >
                                광고가 열리지 않아요
                            </button>
                        </>
                    ) : (
                        <>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 'bold', color: '#1f2937' }}>광고가 열리지 않나요?</h2>
                            <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6', color: '#4b5563' }}>
                                팝업 차단 기능이 켜져있거나<br />
                                특정 환경에서는 광고가 뜨지 않을 수 있습니다.<br />
                                아래 버튼을 눌러 바로 시작해 주세요!
                            </p>
                            <button
                                className={`${styles.btnPrimary} ${styles.btnPrimaryLg}`}
                                style={{ width: '100%' }}
                                onClick={() => window.location.href = TOBY_URL}
                            >
                                TOBY 바로 가기
                            </button>
                            <button
                                onClick={() => setViewMode('loading')}
                                style={{
                                    marginTop: '1rem',
                                    background: 'none',
                                    border: 'none',
                                    color: '#9ca3af',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer'
                                }}
                            >
                                뒤로가기
                            </button>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}
