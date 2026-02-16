'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { HTSM_KEYWORD_CATEGORIES, HTSM_CONFIG } from './constants';
import { submitAnswer, fetchTestInfo } from './api';
import { getKoreanKeyword } from './keyword-map';
import styles from './styles.module.css';

interface FriendAnswerPageProps {
    shareId: string;
}

const CATEGORY_NAMES: Record<string, string> = {
    positiveTraits: '긍정적 성격',
    boldPersonality: '강한 개성',
    innerSelf: '깊은 내면',
    vibes: '나만의 바이브',
};

/** 간단한 브라우저 fingerprint 생성 */
function generateFingerprint(): string {
    const data = [
        navigator.userAgent,
        navigator.language,
        screen.width,
        screen.height,
        new Date().getTimezoneOffset(),
    ].join('|');

    // 간단한 해시
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash).toString(36);
}

export default function FriendAnswerPage({ shareId }: FriendAnswerPageProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [isClosed, setIsClosed] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
    const [isCreator, setIsCreator] = useState<boolean>(false);

    useEffect(() => {
        const checkStatus = async () => {
            if (status === 'loading') return;

            try {
                const fingerprint = generateFingerprint();
                const info = await fetchTestInfo(
                    shareId,
                    fingerprint,
                    session?.user?.kakaoId
                );

                if (info.isCreator) {
                    setIsCreator(true);
                    setIsLoading(false);
                    return;
                }

                if (info.isClosed || info.answerCount >= HTSM_CONFIG.MAX_FRIENDS) {
                    setIsClosed(true);
                }
            } catch (err) {
                console.error('Failed to fetch test info:', err);
            } finally {
                setIsLoading(false);
            }
        };

        checkStatus();
    }, [shareId, session, status]);

    const toggleKeyword = (keyword: string) => {
        if (selectedKeywords.includes(keyword)) {
            setSelectedKeywords(selectedKeywords.filter((k) => k !== keyword));
        } else if (selectedKeywords.length < HTSM_CONFIG.MAX_KEYWORD_SELECTION) {
            setSelectedKeywords([...selectedKeywords, keyword]);
        }
    };

    const toggleCategory = (categoryId: string) => {
        setCollapsedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(categoryId)) {
                next.delete(categoryId);
            } else {
                next.add(categoryId);
            }
            return next;
        });
    };

    const handleSubmit = async () => {
        if (selectedKeywords.length < HTSM_CONFIG.MIN_KEYWORD_SELECTION || selectedKeywords.length > HTSM_CONFIG.MAX_KEYWORD_SELECTION) return;
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError('');

        try {
            const fingerprintHash = generateFingerprint();
            await submitAnswer(shareId, selectedKeywords, fingerprintHash, session?.user?.kakaoId);
            setSubmitted(true);
        } catch (err) {
            const message = err instanceof Error ? err.message : '답변 제출에 실패했습니다.';
            setError(message);
            setIsSubmitting(false);
        }
    };


    if (isLoading) {
        return (
            <div className={styles.pageContainer}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <p>로딩 중...</p>
                </div>
            </div>
        );
    }

    if (isCreator) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.submittedContainer}>
                    <div className={styles.submittedContent}>
                        <div className={styles.submittedEmoji}>🚫</div>
                        <h1 className={styles.submittedTitle}>본인의 테스트입니다</h1>
                        <p className={styles.submittedSubtitle}>
                            자신의 테스트에는 답변을 남길 수 없어요.<br />
                            친구들에게 링크를 공유해보세요!
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
                            <button className={`${styles.btnPrimary} ${styles.btnFull}`} onClick={() => router.push(`/htsm/share/${shareId}`)}>
                                공유하기
                            </button>
                            <button className={`${styles.btnSecondary} ${styles.btnFull}`} onClick={() => router.push(`/htsm/result/${shareId}`)}>
                                결과 보기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isClosed) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.submittedContainer}>
                    <div className={styles.submittedContent}>
                        <div className={styles.submittedEmoji}>🔒</div>
                        <h1 className={styles.submittedTitle}>이미 많은 친구들이 참여했어요!</h1>
                        <p className={styles.submittedSubtitle}>
                            최대 인원(10명)이 모두 참여하여 더 이상 응답을 남길 수 없습니다.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
                            <button className={`${styles.btnPrimary} ${styles.btnFull}`} onClick={() => router.push(`/htsm/result/${shareId}`)}>
                                친구 결과 보기
                            </button>
                            <button className={`${styles.btnSecondary} ${styles.btnFull}`} onClick={() => router.push('/htsm')}>
                                나도 테스트 만들기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.submittedContainer}>
                    <div className={styles.submittedContent}>
                        <div className={styles.submittedEmoji}>✨</div>
                        <h1 className={styles.submittedTitle}>답변해주셔서 감사합니다!</h1>
                        <p className={styles.submittedSubtitle}>
                            친구가 종합된 결과를 확인할 수 있게 되었습니다
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
                            <button className={`${styles.btnPrimary} ${styles.btnFull}`} onClick={() => router.push(`/htsm/result/${shareId}`)}>
                                친구 결과 보기
                            </button>
                            <button className={`${styles.btnSecondary} ${styles.btnFull}`} onClick={() => router.push('/htsm')}>
                                나도 테스트 만들기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const count = selectedKeywords.length;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.innerContainer}>
                <div className={styles.friendPage}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h1 className={styles.friendTitle}>친구를 표현하는 단어 3~5개를 골라주세요</h1>
                        <p className={styles.friendCount}>{count}/{HTSM_CONFIG.MAX_KEYWORD_SELECTION} 선택됨</p>
                        <div className={styles.trustIndicators}>
                            <div className={styles.trustItem}>
                                <svg className={styles.trustIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                <span>익명 보장</span>
                            </div>
                            <div className={styles.trustItem}>
                                <svg className={styles.trustIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                <span>1분 투자하세요</span>
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem' }}>
                            {error}
                        </p>
                    )}

                    {/* Categorized Keywords */}
                    <div className={styles.categoryContainer}>
                        {HTSM_KEYWORD_CATEGORIES.map((category) => {
                            const isCollapsed = collapsedCategories.has(category.id);
                            const selectedInCategory = category.keywords.filter(
                                (k) => selectedKeywords.includes(k)
                            ).length;

                            return (
                                <div
                                    key={category.id}
                                    className={`${styles.categorySection} ${styles[category.gradientClass] || ''}`}
                                >
                                    <button
                                        type="button"
                                        className={styles.categoryHeader}
                                        onClick={() => toggleCategory(category.id)}
                                        aria-expanded={!isCollapsed}
                                    >
                                        <div className={styles.categoryHeaderLeft}>
                                            <span className={styles.categoryEmoji}>
                                                {category.emoji}
                                            </span>
                                            <span className={styles.categoryName}>
                                                {CATEGORY_NAMES[category.id] || category.id}
                                            </span>
                                            {selectedInCategory > 0 && (
                                                <span className={styles.categoryBadge}>
                                                    {selectedInCategory}
                                                </span>
                                            )}
                                        </div>
                                        <svg
                                            className={`${styles.categoryChevron} ${isCollapsed ? styles.categoryChevronCollapsed : ''}`}
                                            width="20"
                                            height="20"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    {!isCollapsed && (
                                        <div className={styles.keywordGrid}>
                                            {category.keywords.map((keyword) => {
                                                const sel = selectedKeywords.includes(keyword);
                                                const dis = !sel && count >= HTSM_CONFIG.MAX_KEYWORD_SELECTION;
                                                return (
                                                    <button key={keyword} type="button" onClick={() => toggleKeyword(keyword)} disabled={dis || isSubmitting}
                                                        className={`${styles.keywordChip} ${sel ? styles.keywordChipSelected : ''} ${dis ? styles.keywordChipDisabled : ''}`}>
                                                        {getKoreanKeyword(keyword)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className={styles.stickyBottom}>
                        <div className={styles.stickyBottomInner}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <button className={`${styles.btnPrimary} ${styles.btnFull}`} onClick={handleSubmit}
                                    disabled={selectedKeywords.length < HTSM_CONFIG.MIN_KEYWORD_SELECTION || isSubmitting}>
                                    {isSubmitting ? '제출 중...' : '답변 제출하기'}
                                </button>
                                <button
                                    className={`${styles.btnCancel} ${styles.btnFull}`}
                                    onClick={() => router.push('/htsm')}
                                    disabled={isSubmitting}
                                >
                                    취소하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

