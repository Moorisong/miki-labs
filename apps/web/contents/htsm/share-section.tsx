'use client';

import styles from './styles.module.css';

interface HtsmShareSectionProps {
    title: string;
    kakaoLabel: string;
    copyLabel: string;
    onKakaoClick: () => void;
    onCopyClick: () => void;
    isCopied: boolean;
}

export default function HtsmShareSection({
    title,
    kakaoLabel,
    copyLabel,
    onKakaoClick,
    onCopyClick,
    isCopied
}: HtsmShareSectionProps) {
    return (
        <div className={styles.shareSection}>
            <h2 className={styles.shareSectionTitle}>{title}</h2>
            <div className={styles.shareButtonGroup}>
                <button
                    className={`${styles.btnPrimary} ${styles.btnFull}`}
                    onClick={onKakaoClick}
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
                    {kakaoLabel}
                </button>

                <button
                    className={`${styles.btnSecondary} ${styles.btnFull}`}
                    onClick={onCopyClick}
                >
                    {isCopied ? (
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
                            복사 완료!
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
                            {copyLabel}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
