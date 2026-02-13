'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/language-context';

import { HTSM_MESSAGES } from './constants';
import styles from './styles.module.css';

interface SharePageProps {
    shareId: string;
}

export default function SharePage({ shareId }: SharePageProps) {
    const { t } = useLanguage();
    const [copied, setCopied] = useState<boolean>(false);
    const shareUrl =
        typeof window !== 'undefined'
            ? `${window.location.origin}/htsm/answer/${shareId}`
            : '';

    const handleCopyLink = () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleShare = () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({
                title: t('share.title'),
                text: t('share.subtitle'),
                url: shareUrl,
            });
        } else {
            handleCopyLink();
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.narrowContainer}>
                <div className={styles.sharePage}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <div className={styles.shareEmoji}>🎉</div>
                        <h1 className={styles.shareTitle}>{t('share.title')}</h1>
                        <p className={styles.shareSubtitle}>
                            {t('share.subtitle')}
                        </p>
                    </div>

                    {/* Share Card */}
                    <div className={styles.glassCard} style={{ marginBottom: '3rem' }}>
                        <div className={styles.shareCardContent}>
                            <div className={styles.shareIconBox}>
                                <svg
                                    className={styles.shareIconBoxIcon}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="18" cy="5" r="3" />
                                    <circle cx="6" cy="12" r="3" />
                                    <circle cx="18" cy="19" r="3" />
                                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                                </svg>
                            </div>
                            <h2 className={styles.shareCardTitle}>{t('share.cardTitle')}</h2>
                            <p className={styles.shareCardDescription}>
                                {t('share.cardDesc')}
                            </p>
                            <div className={styles.shareUrlBox}>{shareUrl}</div>
                        </div>
                    </div>

                    {/* View Result Button (Now emphasized at the bottom) */}
                    <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                        <button
                            className={styles.btnViewResult}
                            onClick={() => window.location.href = `/htsm/result/${shareId}`}
                        >
                            <svg
                                className={styles.btnIcon}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                                <path d="M22 12A10 10 0 0 0 12 2v10z" />
                            </svg>
                            {t('share.viewResult')}
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.shareButtonGroup} style={{ marginBottom: '2rem' }}>
                        <button
                            className={`${styles.btnPrimary} ${styles.btnFull}`}
                            onClick={handleShare}
                        >
                            <svg
                                className={styles.btnIcon}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="18" cy="5" r="3" />
                                <circle cx="6" cy="12" r="3" />
                                <circle cx="18" cy="19" r="3" />
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                            {t('share.kakaoButton')}
                        </button>

                        <button
                            className={`${styles.btnSecondary} ${styles.btnFull}`}
                            onClick={handleCopyLink}
                        >
                            {copied ? (
                                <>
                                    <svg
                                        className={styles.btnIcon}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    {t('share.copied')}
                                </>
                            ) : (
                                <>
                                    <svg
                                        className={styles.btnIcon}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                    {t('share.copyButton')}
                                </>
                            )}
                        </button>
                    </div>


                    {/* Helper Text */}
                    <div className={styles.infoCard}>
                        <p className={styles.shareHelperText}>
                            <strong>{t('share.helperTitle')}</strong>
                            <br />
                            {t('share.helperDesc')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
