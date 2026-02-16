'use client';

import { useState } from 'react';
import styles from './styles.module.css';

interface ResultShareSectionProps {
    shareId: string;
}

export default function ResultShareSection({ shareId }: ResultShareSectionProps) {
    const [activeTab, setActiveTab] = useState<'result' | 'invite'>('result');
    const [copied, setCopied] = useState<boolean>(false);

    const handleCopy = (text: string) => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }).catch(console.error);
        }
    };

    const handleKakaoShare = () => {
        if (typeof window === 'undefined' || !window.Kakao) return;

        if (!window.Kakao.isInitialized()) {
            window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_API_KEY);
        }

        const resultUrl = `${window.location.origin}/htsm/result/${shareId}`;
        const inviteUrl = `${window.location.origin}/htsm/answer/${shareId}`;

        if (activeTab === 'result') {
            // Mode 1: My Result Share
            window.Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: '숨겨진 성격 결과가 공개되었습니다',
                    description: '주변 사람들이 본 나의 모습까지 포함된 결과입니다.\n생각보다 정확하고, 조금 놀랄 수도 있습니다.',
                    imageUrl: 'https://box.haroo.site/htsm-logo-v6.png',
                    link: { mobileWebUrl: resultUrl, webUrl: resultUrl },
                },
                buttons: [
                    {
                        title: '결과 확인하기',
                        link: { mobileWebUrl: resultUrl, webUrl: resultUrl },
                    },
                ],
            });
        } else {
            // Mode 2: Invite Friends
            window.Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: '당신이 보는 저의 모습이 궁금합니다',
                    description: '10명의 평가로 완성되는 성격 테스트입니다.\n잠시 시간을 내어 참여 부탁드립니다.',
                    imageUrl: 'https://box.haroo.site/htsm-logo-v6.png',
                    link: { mobileWebUrl: inviteUrl, webUrl: inviteUrl },
                },
                buttons: [
                    {
                        title: '참여하기',
                        link: { mobileWebUrl: inviteUrl, webUrl: inviteUrl },
                    },
                ],
            });
        }
    };

    const handleLinkCopy = () => {
        const resultUrl = `${window.location.origin}/htsm/result/${shareId}`;
        const inviteUrl = `${window.location.origin}/htsm/answer/${shareId}`;
        handleCopy(activeTab === 'result' ? resultUrl : inviteUrl);
    };

    return (
        <div className={styles.shareSection}>
            <h2 className={styles.shareSectionTitle}>친구에게 공유하기 🔥</h2>

            {/* Tabs */}
            <div className={styles.shareTabs}>
                <button
                    className={`${styles.shareTab} ${activeTab === 'result' ? styles.shareTabActive : ''}`}
                    onClick={() => setActiveTab('result')}
                >
                    내 결과 공유
                </button>
                <button
                    className={`${styles.shareTab} ${activeTab === 'invite' ? styles.shareTabActive : ''}`}
                    onClick={() => setActiveTab('invite')}
                >
                    친구 참여시키기
                </button>
            </div>

            {/* Buttons */}
            <div className={styles.shareButtonGroup}>
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
                    카카오톡 공유
                </button>

                <button
                    className={`${styles.btnSecondary} ${styles.btnFull}`}
                    onClick={handleLinkCopy}
                >
                    {copied ? (
                        <>
                            <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            복사 완료!
                        </>
                    ) : (
                        <>
                            <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            링크 복사
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
