'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/language-context';
import { HTSM_STORAGE_KEY } from './constants';

import styles from './styles.module.css';

const FLOATING_KEYWORDS = [
    'Creative',
    'Funny',
    'Kind',
    'Energetic',
    'Thoughtful',
    'Organized',
    'Adventurous',
    'Loyal',
];

const FLOATING_POSITIONS = [
    { left: '10%', top: '10%' },
    { left: '35%', top: '10%' },
    { left: '60%', top: '10%' },
    { left: '85%', top: '10%' },
    { left: '10%', top: '60%' },
    { left: '35%', top: '60%' },
    { left: '60%', top: '60%' },
    { left: '85%', top: '60%' },
];

export default function LandingPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [myShareId, setMyShareId] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(HTSM_STORAGE_KEY.SHARE_ID);
            if (stored) setMyShareId(stored);
        }
    }, []);

    const handleStart = () => {
        router.push('/htsm/start');
    };

    const handleContinue = () => {
        if (myShareId) {
            router.push(`/htsm/result/${myShareId}`);
        }
    };

    return (
        <div className={styles.pageContainer}>
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        {t('hero.title', { highlight: '' })}
                        <span className={styles.heroGradientText}>{t('hero.highlight')}</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        {t('hero.subtitle')}
                    </p>

                    <div className={styles.heroCta}>
                        <button
                            className={`${styles.btnPrimary} ${styles.btnPrimaryLg}`}
                            onClick={handleStart}
                        >
                            {t('hero.startButton')}
                        </button>

                        {myShareId && (
                            <button
                                className={`${styles.btnSecondary} ${styles.btnPrimaryLg}`}
                                style={{ marginTop: '0.75rem', width: '100%' }}
                                onClick={handleContinue}
                            >
                                {t('hero.continueButton')}
                            </button>
                        )}
                    </div>

                    <p className={styles.heroHint}>
                        <span aria-hidden="true">✨</span>
                        {t('hero.hint')}
                    </p>

                    {/* Floating Keywords (Desktop) */}
                    <div className={styles.floatingContainer}>
                        {FLOATING_KEYWORDS.map((keyword, index) => (
                            <div
                                key={keyword}
                                className={styles.floatingChip}
                                style={{
                                    left: FLOATING_POSITIONS[index].left,
                                    top: FLOATING_POSITIONS[index].top,
                                    animation: `float ${2 + index * 0.3}s ease-in-out infinite`,
                                    animationDelay: `${0.5 + index * 0.1}s`,
                                }}
                            >
                                <span className={styles.keywordChipFloating}>{keyword}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className={styles.sectionBg} aria-labelledby="how-it-works-title">
                <h2 id="how-it-works-title" className={styles.sectionTitle}>
                    {t('howItWorks.title')}
                </h2>
                <p className={styles.sectionSubtitle}>
                    {t('howItWorks.subtitle')}
                </p>

                <div className={styles.stepsGrid}>
                    <div className={`${styles.card} ${styles.cardGradient} ${styles.cardHover} ${styles.stepCard}`}>
                        <div className={`${styles.stepIconBox} ${styles.stepIconBoxPurple}`}>
                            <svg className={styles.stepIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </div>
                        <h3 className={styles.stepTitle}>{t('howItWorks.step1.title')}</h3>
                        <p className={styles.stepDescription}>
                            {t('howItWorks.step1.desc')}
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
                        <h3 className={styles.stepTitle}>{t('howItWorks.step2.title')}</h3>
                        <p className={styles.stepDescription}>
                            {t('howItWorks.step2.desc')}
                        </p>
                    </div>

                    <div className={`${styles.card} ${styles.cardGradient} ${styles.cardHover} ${styles.stepCard}`}>
                        <div className={`${styles.stepIconBox} ${styles.stepIconBoxCyan}`}>
                            <svg className={styles.stepIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        </div>
                        <h3 className={styles.stepTitle}>{t('howItWorks.step3.title')}</h3>
                        <p className={styles.stepDescription}>
                            {t('howItWorks.step3.desc')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Social Proof Section */}
            <section className={styles.socialProofSection} aria-label="Statistics">
                <div className={styles.socialProofGrid}>
                    <div className={styles.card}>
                        <div className={styles.socialProofNumber}>10,000+</div>
                        <p className={styles.socialProofLabel}>{t('social.resultsCreated')}</p>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.socialProofNumberAlt}>5</div>
                        <p className={styles.socialProofLabel}>{t('social.avgFriends')}</p>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className={styles.ctaSection} aria-label="Call to action">
                <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
                    <h2 className={styles.ctaTitle}>
                        {t('cta.title')}
                    </h2>
                    <button
                        className={`${styles.btnPrimary} ${styles.btnPrimaryLg}`}
                        onClick={handleStart}
                    >
                        {t('cta.button')}
                    </button>

                    {myShareId && (
                        <button
                            className={`${styles.btnSecondary} ${styles.btnPrimaryLg}`}
                            style={{ marginTop: '0.75rem', width: '100%' }}
                            onClick={handleContinue}
                        >
                            {t('hero.continueButton')}
                        </button>
                    )}
                </div>
            </section>
        </div>
    );
}
