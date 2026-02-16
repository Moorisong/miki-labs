'use client';

import { useState, useEffect } from 'react';
import { HTSM_MESSAGES } from './constants';
import HtsmShareSection from './share-section';
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
            handleCopyLink();
            return;
        }

        const answerUrl = `${window.location.origin}/htsm/answer/${shareId}`;

        window.Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: '[자아탐험] 친구를 가장 잘 표현하는 키워드를 선택해주세요',
                description: '당신의 선택 하나가 누군가의 ‘숨겨진 자아’를 완성합니다.',
                imageUrl: 'https://box.haroo.site/htsm-og-base.png?v=2',
                link: {
                    mobileWebUrl: answerUrl,
                    webUrl: answerUrl,
                },
            },
            buttons: [
                {
                    title: '참여하기',
                    link: {
                        mobileWebUrl: answerUrl,
                        webUrl: answerUrl,
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

                    {/* New Share Section (Request Page Spec) */}
                    <HtsmShareSection
                        title="친구에게 요청하기 👇"
                        kakaoLabel="카카오톡 공유	"
                        copyLabel="링크 복사"
                        onKakaoClick={handleKakaoShare}
                        onCopyClick={handleCopyLink}
                        isCopied={copied}
                    />

                    {/* View Result Button */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '3rem' }}>
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

                    {/* Helper Text */}
                    <div className={styles.infoCard}>
                        <p className={styles.shareHelperText}>
                            <strong>친구들이 익명으로 나에 대한 키워드 3~5개를 선택합니다.</strong>
                            <br />
                            더 많은 친구가 참여할수록 결과가 정확해집니다!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

