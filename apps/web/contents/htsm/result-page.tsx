'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/language-context';

import { HTSM_CONFIG } from './constants';
import { fetchResult, HtsmResult } from './api';
import JohariCard from './johari-card';
import styles from './styles.module.css';

interface ResultPageProps {
    shareId: string;
}

export default function ResultPage({ shareId }: ResultPageProps) {
    const { t } = useLanguage();
    const [result, setResult] = useState<HtsmResult | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const [copiedShare, setCopiedShare] = useState<boolean>(false);
    const [copiedPage, setCopiedPage] = useState<boolean>(false);

    useEffect(() => {
        const loadResult = async () => {
            try {
                const data = await fetchResult(shareId);
                setResult(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : t('result.error'));
            } finally {
                setLoading(false);
            }
        };
        loadResult();
    }, [shareId, t]);

    const handleShare = () => {
        const url = `${window.location.origin}/htsm/answer/${shareId}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopiedShare(true);
            setTimeout(() => setCopiedShare(false), 2000);
        }).catch((err) => {
            console.error('Failed to copy text: ', err);
            if (navigator.share) {
                navigator.share({ title: t('share.cardTitle'), text: t('share.cardDesc'), url });
            }
        });
    };

    const handleSharePage = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            setCopiedPage(true);
            setTimeout(() => setCopiedPage(false), 2000);
        }).catch((err) => {
            console.error('Failed to copy text: ', err);
            if (navigator.share) {
                navigator.share({ title: t('result.title'), text: t('result.subtitle'), url });
            }
        });
    };

    if (loading) {
        return (
            <div className={styles.pageContainer}>
                <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>{t('result.loading')}</p>
                </div>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className={styles.pageContainer}>
                <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: '#ef4444', fontSize: '1.125rem' }}>{error || t('result.error')}</p>
                </div>
            </div>
        );
    }

    const { answerCount, johari } = result;
    const totalFriends = HTSM_CONFIG.MIN_FRIENDS_FOR_RESULT;
    const percent = Math.min(Math.round((answerCount / totalFriends) * 100), 100);

    const johariCards = [
        { title: t('result.area.open'), area: 'open' as const, data: johari.open, colorClass: styles.colorGreen },
        { title: t('result.area.blind'), area: 'blind' as const, data: johari.blind, colorClass: styles.colorBlue },
        { title: t('result.area.hidden'), area: 'hidden' as const, data: johari.hidden, colorClass: styles.colorPurple },
        { title: t('result.area.unknown'), area: 'unknown' as const, data: answerCount === 0 ? { keywords: [] } : johari.unknown, colorClass: styles.colorCyan },
    ];

    return (
        <div className={styles.pageContainer}>
            <div className={styles.wideContainer}>
                <div className={styles.resultPage}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h1 className={styles.resultTitle}>{t('result.title')}</h1>
                        <p className={styles.resultSubtitle}>
                            {t('result.subtitle')}
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
                                    {t('result.answeredCount', {
                                        count: answerCount,
                                        s: answerCount !== 1 ? 's' : ''
                                    })}
                                </span>
                            </div>
                            <span className={styles.participationPercent}>{percent}%</span>
                        </div>
                        <div className={styles.participationBar}>
                            <div className={styles.participationBarFill} style={{ width: `${percent}%` }} />
                        </div>
                        {answerCount < totalFriends && (
                            <p className={styles.participationHint}>
                                {t('result.unlock', {
                                    count: totalFriends - answerCount,
                                    s: totalFriends - answerCount > 1 ? 's' : '',
                                    s2: totalFriends - answerCount > 1 ? '' : 's'
                                })}
                            </p>
                        )}
                    </div>

                    {/* Johari Grid */}
                    <div className={styles.johariGrid}>
                        {johariCards.map((card) => (
                            <JohariCard
                                key={card.title}
                                title={card.title}
                                area={card.area}
                                keywords={card.data.keywords}
                                colorClass={card.colorClass}
                            />
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.actionButtons}>
                        <button className={styles.btnPrimary} onClick={handleShare} style={{ flex: 1 }}>
                            {copiedShare ? (
                                <>
                                    <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    {t('share.copied')}
                                </>
                            ) : (
                                <>
                                    <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                    {t('result.shareMore')}
                                </>
                            )}
                        </button>
                        <button className={styles.btnSecondary} onClick={handleSharePage} style={{ flex: 1 }}>
                            {copiedPage ? (
                                <>
                                    <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    {t('share.copied')}
                                </>
                            ) : (
                                <>
                                    <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                    {t('result.sharePage')}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Johari Info */}
                    <div className={styles.infoCard}>
                        <h3 className={styles.johariInfoTitle}>{t('result.infoTitle')}</h3>
                        <p className={styles.johariInfoText}>
                            {t('result.infoDesc')}
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
}
