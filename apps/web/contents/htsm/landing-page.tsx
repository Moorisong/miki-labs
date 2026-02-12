'use client';

import { useRouter } from 'next/navigation';

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

    const handleStart = () => {
        router.push('/htsm/start');
    };

    return (
        <div className={styles.pageContainer}>
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        See how they{' '}
                        <span className={styles.heroGradientText}>see you</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Friends help reveal the real you.
                    </p>

                    <div className={styles.heroCta}>
                        <button
                            className={`${styles.btnPrimary} ${styles.btnPrimaryLg}`}
                            onClick={handleStart}
                        >
                            Start My Test
                        </button>
                    </div>

                    <p className={styles.heroHint}>
                        <span aria-hidden="true">✨</span>
                        Takes 10 seconds
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
                    How It Works
                </h2>
                <p className={styles.sectionSubtitle}>
                    Three simple steps to discover yourself
                </p>

                <div className={styles.stepsGrid}>
                    <div className={`${styles.card} ${styles.cardGradient} ${styles.cardHover} ${styles.stepCard}`}>
                        <div className={`${styles.stepIconBox} ${styles.stepIconBoxPurple}`}>
                            <svg className={styles.stepIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </div>
                        <h3 className={styles.stepTitle}>1. Choose 3 words</h3>
                        <p className={styles.stepDescription}>
                            Select 3 words that describe you
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
                        <h3 className={styles.stepTitle}>2. Friends choose</h3>
                        <p className={styles.stepDescription}>
                            Share with friends to get their perspective
                        </p>
                    </div>

                    <div className={`${styles.card} ${styles.cardGradient} ${styles.cardHover} ${styles.stepCard}`}>
                        <div className={`${styles.stepIconBox} ${styles.stepIconBoxCyan}`}>
                            <svg className={styles.stepIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        </div>
                        <h3 className={styles.stepTitle}>3. See your result</h3>
                        <p className={styles.stepDescription}>
                            Discover your Johari Window
                        </p>
                    </div>
                </div>
            </section>

            {/* Social Proof Section */}
            <section className={styles.socialProofSection} aria-label="Statistics">
                <div className={styles.socialProofGrid}>
                    <div className={styles.card}>
                        <div className={styles.socialProofNumber}>10,000+</div>
                        <p className={styles.socialProofLabel}>Results created</p>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.socialProofNumberAlt}>5</div>
                        <p className={styles.socialProofLabel}>Average friends participate</p>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className={styles.ctaSection} aria-label="Call to action">
                <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
                    <h2 className={styles.ctaTitle}>
                        Ready to see yourself through their eyes?
                    </h2>
                    <button
                        className={`${styles.btnPrimary} ${styles.btnPrimaryLg}`}
                        onClick={handleStart}
                    >
                        Start My Test
                    </button>
                </div>
            </section>
        </div>
    );
}
