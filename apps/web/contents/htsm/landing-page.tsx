'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { HTSM_STORAGE_KEY } from './constants';
import { fetchStats, HtsmStats, fetchMyTest } from './api';
import { generateFingerprint } from './utils/fingerprint';

import MyorokBanner from '@/components/common/banners/myorok-banner';
import HtsmLoginView from './components/htsm-login-view';

import styles from './styles.module.css';

const KeywordCloud3D = dynamic(() => import('./keyword-cloud-3d'), { ssr: false });
const BackgroundSparkles = dynamic(() => import('./background-sparkles'), { ssr: false });

export default function LandingPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [myShareId, setMyShareId] = useState<string | null>(null);
    const [stats, setStats] = useState<HtsmStats | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginModalConfig, setLoginModalConfig] = useState({ title: '', description: '' });

    // 통계 데이터 독립적으로 가져오기
    useEffect(() => {
        fetchStats().then(setStats).catch(console.error);
    }, []);

    useEffect(() => {
        const initialize = async () => {
            // 1. 로그인 세션 확인
            if (status === 'authenticated' && session?.user?.kakaoId) {
                try {
                    const dbShareId = await fetchMyTest(session.user.kakaoId);
                    if (dbShareId) {
                        setMyShareId(dbShareId);
                    }
                } catch (err) {
                    console.error('Failed to fetch my test:', err);
                }
            }
        };

        initialize();
    }, [session, status]);

    const handleStart = () => {
        if (status === 'unauthenticated') {
            setLoginModalConfig({
                title: '자아탐험 시작하기',
                description: '테스트를 생성하려면 로그인이 필요합니다.\n카카오 로그인으로 간편하게 시작하세요.'
            });
            setShowLoginModal(true);
            return;
        }
        // 테스트 시작 전 로딩(광고) 페이지로 이동
        router.push('/htsm/loading');
    };

    const handleContinue = () => {
        if (status === 'unauthenticated') {
            setLoginModalConfig({
                title: '내 결과 이어보기',
                description: '이전에 생성한 결과를 확인하려면 로그인이 필요합니다.\n카카오 로그인으로 간편하게 시작하세요.'
            });
            setShowLoginModal(true);
            return;
        }
        if (myShareId) {
            router.push(`/htsm/result/${myShareId}`);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <BackgroundSparkles />
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <Image
                            src="/htsm-logo-v6.png"
                            alt="자아탐험 로고"
                            width={120}
                            height={120}
                            priority
                            style={{ objectFit: 'contain' }}
                            unoptimized
                        />
                    </div>
                    <h1 className={styles.heroTitle}>자아탐험</h1>
                    <p className={styles.heroSubtitle}>
                        친구들이 보는 나는 어떤 모습일까?<br />
                        나도 몰랐던 &apos;진짜 나&apos;를 발견해보세요
                    </p>

                    <div className={styles.heroCta}>
                        <button
                            className={`${styles.btnPrimary} ${styles.btnPrimaryLg}`}
                            onClick={handleStart}
                        >
                            테스트 시작하기
                        </button>

                        {(status === 'unauthenticated' || myShareId) && (
                            <button
                                className={`${styles.btnSecondary} ${styles.btnPrimaryLg}`}
                                onClick={handleContinue}
                            >
                                내 결과 이어보기
                            </button>
                        )}
                    </div>

                </div>


            </section>

            {/* Keyword Cloud Section */}
            <div className={styles.floatingContainer}>
                <KeywordCloud3D />
            </div>

            {/* How It Works Section */}
            <section className={styles.sectionBg} aria-labelledby="how-it-works-title">
                <h2 id="how-it-works-title" className={styles.sectionTitle}>
                    이용 방법
                </h2>
                <p className={styles.sectionSubtitle}>
                    나를 발견하는 간단한 3단계
                </p>

                <div className={styles.stepsGrid}>
                    <div className={`${styles.card} ${styles.cardGradient} ${styles.cardHover} ${styles.stepCard}`}>
                        <div className={`${styles.stepIconBox} ${styles.stepIconBoxPurple}`}>
                            <svg className={styles.stepIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </div>
                        <h3 className={styles.stepTitle}>1. 키워드 3~5개 선택</h3>
                        <p className={styles.stepDescription}>
                            나를 가장 잘 나타내는 단어를 고르세요
                        </p>
                    </div>

                    <div className={`${styles.card} ${styles.cardGradient} ${styles.cardHover} ${styles.stepCard}`}>
                        <div className={`${styles.stepIconBox} ${styles.stepIconBoxBlue}`}>
                            <svg className={styles.stepIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <h3 className={styles.stepTitle}>2. 친구에게 공유</h3>
                        <p className={styles.stepDescription}>
                            친구들에게 내가 어떻게 보이는지 물어보세요
                        </p>
                    </div>

                    <div className={`${styles.card} ${styles.cardGradient} ${styles.cardHover} ${styles.stepCard}`}>
                        <div className={`${styles.stepIconBox} ${styles.stepIconBoxCyan}`}>
                            <svg className={styles.stepIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        </div>
                        <h3 className={styles.stepTitle}>3. 결과 확인</h3>
                        <p className={styles.stepDescription}>
                            나만의 조하리의 창을 확인하세요
                        </p>
                    </div>
                </div>
            </section>

            {/* Social Proof Section */}
            <section className={styles.socialProofSection} aria-label="Statistics">
                <div className={styles.socialProofGrid}>
                    <div className={styles.card}>
                        <div className={styles.socialProofNumber}>
                            {stats ? stats.totalCreated.toLocaleString() : '...'}
                        </div>
                        <p className={styles.socialProofLabel}>개의 결과 생성됨</p>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.socialProofNumberAlt}>
                            {stats ? stats.avgFriends : '...'}
                        </div>
                        <p className={styles.socialProofLabel}>평균 참여 친구 수</p>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className={styles.ctaSection} aria-label="Call to action">
                <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
                    <h2 className={styles.ctaTitle}>
                        친구들의 눈에 비친 내 모습이 궁금한가요?
                    </h2>
                    <div className={styles.heroCta} style={{ marginTop: '2rem' }}>
                        <button
                            className={`${styles.btnPrimary} ${styles.btnPrimaryLg}`}
                            onClick={handleStart}
                        >
                            테스트 시작하기
                        </button>

                        {(status === 'unauthenticated' || myShareId) && (
                            <button
                                className={`${styles.btnSecondary} ${styles.btnPrimaryLg}`}
                                onClick={handleContinue}
                            >
                                내 결과 이어보기
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <section style={{ maxWidth: '640px', width: '100%', margin: '0 auto', paddingBottom: '3rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
                <MyorokBanner />
            </section>

            {/* Login Modal */}
            {showLoginModal && (
                <HtsmLoginView
                    onClose={() => setShowLoginModal(false)}
                    title={loginModalConfig.title}
                    description={loginModalConfig.description}
                />
            )}
        </div>
    );
}

