'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/language-context';

import { HTSM_CONFIG } from './constants';
import { fetchResult, HtsmResult } from './api';
import styles from './styles.module.css';

interface ResultPageProps {
    shareId: string;
}

export default function ResultPage({ shareId }: ResultPageProps) {
    const { t } = useLanguage();
    const [result, setResult] = useState<HtsmResult | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const [showToast, setShowToast] = useState<boolean>(false);

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

        // 무조건 클립보드에 복사
        navigator.clipboard.writeText(url).then(() => {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (!isMobile) {
                // PC: 토스트 메시지 표시
                setShowToast(true);
                setTimeout(() => setShowToast(false), 2500);
            }
        }).catch((err) => {
            console.error('Failed to copy text: ', err);
            // 복사 실패 시 fallback으로 web share api 시도 (모바일 등)
            if (navigator.share) {
                navigator.share({ title: t('share.cardTitle'), text: t('share.cardDesc'), url });
            }
        });
    };

    const handleSharePage = () => {
        const url = window.location.href;

        // 무조건 클립보드에 복사
        navigator.clipboard.writeText(url).then(() => {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (!isMobile) {
                // PC: 토스트 메시지 표시
                setShowToast(true);
                setTimeout(() => setShowToast(false), 2500);
            }
        }).catch((err) => {
            console.error('Failed to copy text: ', err);
            // 복사 실패 시 fallback으로 web share api 시도 (모바일 등)
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
        { title: t('result.area.open'), description: t('result.desc.open'), data: johari.open, gradientClass: styles.gradientGreen },
        { title: t('result.area.blind'), description: t('result.desc.blind'), data: johari.blind, gradientClass: styles.gradientBlue },
        { title: t('result.area.hidden'), description: t('result.desc.hidden'), data: johari.hidden, gradientClass: styles.gradientPurple },
        { title: t('result.area.unknown'), description: t('result.desc.unknown'), data: johari.unknown, gradientClass: styles.gradientCyan },
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
                            <div key={card.title} className={styles.resultCard}>
                                <div className={styles.resultCardHeader}>
                                    <div>
                                        <h3 className={styles.resultCardTitle}>{card.title}</h3>
                                        <p className={styles.resultCardDescription}>{card.description}</p>
                                    </div>
                                </div>
                                <div className={styles.resultCardKeywords}>
                                    {card.data.keywords.length > 0 ? (
                                        card.data.keywords.map((kw) => (
                                            <div key={kw} className={`${styles.resultCardKeyword} ${card.gradientClass}`}>
                                                {t(`keywords.${kw}`)}
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{t('result.noKeywords')}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.actionButtons} style={{ position: 'relative' }}>
                        {showToast && (
                            <div className={styles.toast}>
                                {t('share.copied')}
                            </div>
                        )}
                        <button className={styles.btnPrimary} onClick={handleShare} style={{ flex: 1 }}>
                            <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            {t('result.shareMore')}
                        </button>
                        <button className={styles.btnSecondary} onClick={handleSharePage} style={{ flex: 1 }}>
                            <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                            {t('result.sharePage')}
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
