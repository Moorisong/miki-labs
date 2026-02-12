'use client';

import { useState } from 'react';

import { HTSM_MESSAGES } from './constants';
import styles from './styles.module.css';

interface SharePageProps {
    shareId: string;
}

export default function SharePage({ shareId }: SharePageProps) {
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
                title: HTSM_MESSAGES.SHARE_TITLE,
                text: HTSM_MESSAGES.SHARE_TEXT,
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
                        <h1 className={styles.shareTitle}>Your test is ready</h1>
                        <p className={styles.shareSubtitle}>
                            Share it with friends to see how they see you
                        </p>
                    </div>

                    {/* Share Card */}
                    <div className={styles.glassCard} style={{ marginBottom: '2rem' }}>
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
                            <h2 className={styles.shareCardTitle}>How do you see me?</h2>
                            <p className={styles.shareCardDescription}>
                                Help me discover how you see me! Pick 3 words that describe me.
                            </p>
                            <div className={styles.shareUrlBox}>{shareUrl}</div>
                        </div>
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
                            Share on KakaoTalk
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
                                    Link Copied!
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
                                    Copy Link
                                </>
                            )}
                        </button>
                    </div>

                    {/* Helper Text */}
                    <div className={styles.infoCard}>
                        <p className={styles.shareHelperText}>
                            <strong>Friends choose 3 words about you anonymously.</strong>
                            <br />
                            The more friends participate, the better your result!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
