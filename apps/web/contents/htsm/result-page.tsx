'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { HTSM_CONFIG, HTSM_STORAGE_KEY } from './constants';
import styles from './styles.module.css';

interface ResultPageProps {
    shareId: string;
}

interface JohariData {
    title: string;
    description: string;
    percentage: number;
    keywords: string[];
    gradientClass: string;
}

export default function ResultPage({ shareId }: ResultPageProps) {
    const router = useRouter();
    const [friendsAnswered, setFriendsAnswered] = useState<number>(0);
    const totalFriends = HTSM_CONFIG.MIN_FRIENDS_FOR_RESULT;

    useEffect(() => {
        const answers = JSON.parse(
            localStorage.getItem(HTSM_STORAGE_KEY.FRIEND_ANSWERS) || '[]'
        );
        setFriendsAnswered(Math.min(answers.length, totalFriends));
    }, [totalFriends]);

    const handleShare = () => {
        const url = `${window.location.origin}/htsm/answer/${shareId}`;
        if (navigator.share) {
            navigator.share({ title: 'How do you see me?', text: 'Pick 3 words!', url });
        } else {
            navigator.clipboard.writeText(url);
        }
    };

    const handleDownload = () => {
        alert('Result card downloaded! (Demo)');
    };

    const percent = Math.round((friendsAnswered / totalFriends) * 100);

    const johariCards: JohariData[] = [
        { title: 'Open Self', description: 'What you & others see', percentage: 35, keywords: ['Creative', 'Friendly', 'Optimistic'], gradientClass: styles.gradientGreen },
        { title: 'Blind Self', description: 'What others see in you', percentage: 25, keywords: ['Supportive', 'Loyal', 'Caring'], gradientClass: styles.gradientBlue },
        { title: 'Hidden Self', description: 'What only you know', percentage: 20, keywords: ['Ambitious', 'Analytical', 'Curious'], gradientClass: styles.gradientPurple },
        { title: 'Unknown Self', description: 'Undiscovered potential', percentage: 20, keywords: ['Adventurous', 'Bold', 'Resilient'], gradientClass: styles.gradientCyan },
    ];

    return (
        <div className={styles.pageContainer}>
            <div className={styles.wideContainer}>
                <div className={styles.resultPage}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h1 className={styles.resultTitle}>My Johari Result</h1>
                        <p className={styles.resultSubtitle}>
                            How you see yourself vs. how others see you
                        </p>
                    </div>

                    {/* Participation Progress */}
                    <div className={`${styles.glassCard} ${styles.participationCard}`}>
                        <div className={styles.participationHeader}>
                            <div className={styles.participationInfo}>
                                <svg className={styles.participationIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                <span className={styles.participationText}>
                                    {friendsAnswered} / {totalFriends} friends answered
                                </span>
                            </div>
                            <span className={styles.participationPercent}>{percent}%</span>
                        </div>
                        <div className={styles.participationBar}>
                            <div className={styles.participationBarFill} style={{ width: `${percent}%` }} />
                        </div>
                        {friendsAnswered < totalFriends && (
                            <p className={styles.participationHint}>
                                {totalFriends - friendsAnswered} more friend
                                {totalFriends - friendsAnswered > 1 ? 's' : ''} unlock
                                {totalFriends - friendsAnswered > 1 ? '' : 's'} full result
                            </p>
                        )}
                    </div>

                    {/* Johari Grid */}
                    <div className={styles.johariGrid}>
                        {johariCards.map((card) => (
                            <div key={card.title} className={styles.resultCard}>
                                <div className={styles.resultCardHeader}>
                                    <div>
                                        <h3 className={styles.resultCardTitle}>{card.title}</h3>
                                        <p className={styles.resultCardDescription}>{card.description}</p>
                                    </div>
                                    <div className={`${styles.resultCardPercent} ${card.gradientClass}`} style={{ backgroundImage: 'inherit' }}>
                                        {card.percentage}%
                                    </div>
                                </div>
                                <div className={styles.resultCardKeywords}>
                                    {card.keywords.map((kw) => (
                                        <div key={kw} className={`${styles.resultCardKeyword} ${card.gradientClass}`}>
                                            {kw}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.actionButtons}>
                        <button className={styles.btnPrimary} onClick={handleShare} style={{ flex: 1 }}>
                            <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                            Share with More Friends
                        </button>
                        <button className={styles.btnSecondary} onClick={handleDownload} style={{ flex: 1 }}>
                            <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            Download Result Card
                        </button>
                    </div>

                    {/* Johari Info */}
                    <div className={styles.infoCard}>
                        <h3 className={styles.johariInfoTitle}>What is the Johari Window?</h3>
                        <p className={styles.johariInfoText}>
                            The Johari Window is a psychological tool created in 1955 by Joseph Luft and Harrington Ingham. It helps people understand their relationship with themselves and others by mapping awareness into four areas: what both you and others know (Open), what only others see (Blind), what only you know (Hidden), and what neither knows yet (Unknown).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
