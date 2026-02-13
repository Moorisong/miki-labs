'use client';

import { useState, useEffect } from 'react';
import { HTSM_MESSAGES } from './constants';
import styles from './styles.module.css';

interface SharePageProps {
    shareId: string;
}

export default function SharePage({ shareId }: SharePageProps) {
    const [copied, setCopied] = useState<boolean>(false);
    const [isKakaoInitialized, setIsKakaoInitialized] = useState<boolean>(false);

    // 클라이언트 사이드에서만 URL 생성
    const [shareUrl, setShareUrl] = useState<string>('');

    useEffect(() => {
        setShareUrl(`${window.location.origin}/htsm/answer/${shareId}`);

        if (typeof window !== 'undefined' && window.Kakao) {
            if (!window.Kakao.isInitialized()) {
                window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_API_KEY);
            }
            setIsKakaoInitialized(true);
        }
    }, [shareId]);

    const handleCopyLink = () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard && shareUrl) {
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleKakaoShare = () => {
        if (!isKakaoInitialized || !window.Kakao) {
            // SDK 로드 실패 시 클립보드 복사로 대체하거나 Web Share API 사용
            if (typeof navigator !== 'undefined' && navigator.share && shareUrl) {
                navigator.share({
                    title: '테스트가 준비되었습니다',
                    text: '친구들에게 공유해서 내가 어떻게 보이는지 알아보세요',
                    url: shareUrl,
                });
            } else {
                handleCopyLink();
            }
            return;
        }

        const answerUrl = shareUrl || `${window.location.origin}/htsm/answer/${shareId}`;

        window.Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: '남들이 보는 나는?',
                description: '내 이미지를 찾아줘! 나에게 어울리는 키워드 3~5개를 골라주세요.',
                imageUrl: 'https://box.haroo.site/htsm-logo-v6.png',
                link: {
                    mobileWebUrl: answerUrl,
                    webUrl: answerUrl,
                },
            },
            buttons: [
                {
                    title: '답변 남기기',
                    link: {
                        mobileWebUrl: answerUrl,
                        webUrl: answerUrl,
                    },
                },
                {
                    title: '나도 만들기',
                    link: {
                        mobileWebUrl: 'https://box.haroo.site/htsm',
                        webUrl: 'https://box.haroo.site/htsm',
                    },
                },
            ],
        });
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.narrowContainer}>
                <div className={styles.sharePage}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <div className={styles.shareEmoji}>🎉</div>
                        <h1 className={styles.shareTitle}>테스트가 준비되었습니다</h1>
                        <p className={styles.shareSubtitle}>
                            친구들에게 공유해서 내가 어떻게 보이는지 알아보세요
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
                            <h2 className={styles.shareCardTitle}>남들이 보는 나는?</h2>
                            <p className={styles.shareCardDescription}>
                                내 이미지를 찾아줘! 나에게 어울리는 키워드 3~5개를 골라주세요.
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
                            내 결과 확인하기
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.shareButtonGroup} style={{ marginBottom: '2rem' }}>
                        <button
                            className={`${styles.btnPrimary} ${styles.btnFull}`}
                            onClick={handleKakaoShare}
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
                            카카오톡으로 공유하기
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
                                    링크 복사
                                </>
                            )}
                        </button>
                    </div>


                    {/* Helper Text */}
                    <div className={styles.infoCard}>
                        <p className={styles.shareHelperText}>
                            <strong>친구들이 익명으로 나에 대한 키워드 3~5개를 선택합니다.</strong>
                            <br />
                            더 맋은 친구가 참여할수록 결과가 정확해집니다!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

