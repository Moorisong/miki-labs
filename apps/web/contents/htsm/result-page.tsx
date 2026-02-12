'use client';

import { useEffect, useState } from 'react';

import { HTSM_CONFIG } from './constants';
import { fetchResult, HtsmResult } from './api';
import styles from './styles.module.css';

interface ResultPageProps {
    shareId: string;
}

export default function ResultPage({ shareId }: ResultPageProps) {
    const [result, setResult] = useState<HtsmResult | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const loadResult = async () => {
            try {
                const data = await fetchResult(shareId);
                setResult(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : '결과를 불러올 수 없습니다.');
            } finally {
                setLoading(false);
            }
        };
        loadResult();
    }, [shareId]);

    const handleShare = () => {
        const url = `${window.location.origin}/htsm/answer/${shareId}`;
        if (navigator.share) {
            navigator.share({ title: 'How do you see me?', text: 'Pick 3 words!', url });
        } else {
            navigator.clipboard.writeText(url);
        }
    };

    if (loading) {
        return (
            <div className={styles.pageContainer}>
                <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>Loading result...</p>
                </div>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className={styles.pageContainer}>
                <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: '#ef4444', fontSize: '1.125rem' }}>{error || '결과를 불러올 수 없습니다.'}</p>
                </div>
            </div>
        );
    }

    const { answerCount, johari } = result;
    const totalFriends = HTSM_CONFIG.MIN_FRIENDS_FOR_RESULT;
    const percent = Math.min(Math.round((answerCount / totalFriends) * 100), 100);

    const johariCards = [
        { title: 'Open Self', description: 'What you & others see', data: johari.open, gradientClass: styles.gradientGreen },
        { title: 'Blind Self', description: 'What others see in you', data: johari.blind, gradientClass: styles.gradientBlue },
        { title: 'Hidden Self', description: 'What only you know', data: johari.hidden, gradientClass: styles.gradientPurple },
        { title: 'Unknown Self', description: 'Undiscovered potential', data: johari.unknown, gradientClass: styles.gradientCyan },
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
                                    {answerCount} friend{answerCount !== 1 ? 's' : ''} answered
                                </span>
                            </div>
                            <span className={styles.participationPercent}>{percent}%</span>
                        </div>
                        <div className={styles.participationBar}>
                            <div className={styles.participationBarFill} style={{ width: `${percent}%` }} />
                        </div>
                        {answerCount < totalFriends && (
                            <p className={styles.participationHint}>
                                {totalFriends - answerCount} more friend{totalFriends - answerCount > 1 ? 's' : ''} unlock{totalFriends - answerCount > 1 ? '' : 's'} full result
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
                                    <div className={styles.resultCardPercent} style={{ background: 'none' }}>
                                        <span className={card.gradientClass} style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                            {card.data.percent}%
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.resultCardKeywords}>
                                    {card.data.keywords.length > 0 ? (
                                        card.data.keywords.map((kw) => (
                                            <div key={kw} className={`${styles.resultCardKeyword} ${card.gradientClass}`}>
                                                {kw}
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No keywords yet</p>
                                    )}
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
