'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';

import { HTSM_KEYWORD_CATEGORIES, HTSM_CONFIG, HTSM_STORAGE_KEY } from './constants';
import { fetchProofToken, createTest } from './api';
import { generateFingerprint } from './utils/fingerprint';
import { getKoreanKeyword } from './keyword-map';
import styles from './styles.module.css';

const CATEGORY_NAMES: Record<string, string> = {
    positiveTraits: '긍정적 성격',
    boldPersonality: '강한 개성',
    innerSelf: '깊은 내면',
    vibes: '나만의 바이브',
};

export default function SelfSelectionPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [name, setName] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

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

    const handleContinue = async () => {
        if (!name.trim()) {
            setError('이름을 입력해주세요.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        if (selectedKeywords.length < HTSM_CONFIG.MIN_KEYWORD_SELECTION || selectedKeywords.length > HTSM_CONFIG.MAX_KEYWORD_SELECTION) return;
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError('');

        try {
            // 1. Proof Token 발급
            const proofToken = await fetchProofToken();

            // 2. Fingerprint 생성
            const fingerprint = generateFingerprint();

            // 3. 테스트 생성 (API)
            const userId = session?.user?.kakaoId;
            if (!userId) {
                throw new Error('로그인이 필요합니다.');
            }
            const shareId = await createTest(selectedKeywords, proofToken, userId, name, fingerprint);

            // 3. LocalStorage 저장 (재방문 UX)
            if (typeof window !== 'undefined') {
                localStorage.setItem(HTSM_STORAGE_KEY.SHARE_ID, shareId);
            }

            // 4. 공유 페이지로 이동
            router.push(`/htsm/share/${shareId}`);
        } catch (err) {
            console.error('Test creation failed:', err);
            setError('테스트 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
            setIsSubmitting(false);
        }
    };

    const selectionCount = selectedKeywords.length;
    const progress = (selectionCount / HTSM_CONFIG.MAX_KEYWORD_SELECTION) * 100;

    if (status === 'loading') {
        return <div className={styles.pageContainer}><div className={styles.innerContainer}><p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p></div></div>;
    }

    if (status === 'unauthenticated') {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.innerContainer}>
                    <div className={styles.selectionPage} style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div onClick={() => router.push('/htsm')} style={{ cursor: 'pointer', marginBottom: '20px', display: 'inline-block' }}>
                            <img src="/htsm-logo-v6.png" alt="HTSM Logo" style={{ width: '80px', height: '80px', borderRadius: '20px' }} />
                        </div>
                        <p style={{ marginBottom: '40px', color: '#666' }}>
                            테스트를 생성하려면 로그인이 필요합니다.<br />
                            카카오 로그인으로 간편하게 시작하세요.
                        </p>
                        <button
                            className={styles.btnPrimary}
                            style={{
                                backgroundColor: '#FEE500',
                                color: '#191919',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                margin: '0 auto',
                                maxWidth: '300px'
                            }}
                            onClick={() => signIn('kakao', { callbackUrl: window.location.href })}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3C6.48 3 2 6.58 2 11c0 2.85 1.89 5.35 4.72 6.77-.15.53-.96 3.39-1 3.56 0 .05-.01.1-.01.15 0 .16.08.3.22.37.08.04.16.05.24.05.13 0 .26-.05.37-.13.52-.37 4.03-2.73 4.67-3.16.59.08 1.19.12 1.79.12 5.52 0 10-3.58 10-8s-4.48-8-10-8" />
                            </svg>
                            카카오로 시작하기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.innerContainer}>
                <div className={styles.selectionPage}>
                    {/* Progress Bar */}
                    <div className={styles.progressWrapper}>
                        <div className={styles.progressTrack}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className={styles.progressStep}>
                            1단계 / 2단계
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className={styles.selectionTitle}>
                        나를 가장 잘 나타내는 키워드 3~5개를 골라주세요
                    </h1>
                    <p className={styles.selectionCount}>
                        {selectionCount}/{HTSM_CONFIG.MAX_KEYWORD_SELECTION} 선택됨
                    </p>

                    {/* Name Input */}
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                            이름 (닉네임)
                            <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                        </label>
                        <input
                            type="text"
                            className={styles.inputField}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="친구들이 알아볼 수 있는 이름을 입력하세요"
                            maxLength={20}
                            disabled={isSubmitting}
                        />
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
                                                const isSelected = selectedKeywords.includes(keyword);
                                                const isDisabled =
                                                    !isSelected &&
                                                    selectedKeywords.length >= HTSM_CONFIG.MAX_KEYWORD_SELECTION;

                                                return (
                                                    <button
                                                        key={keyword}
                                                        type="button"
                                                        onClick={() => toggleKeyword(keyword)}
                                                        disabled={isDisabled || isSubmitting}
                                                        className={`${styles.keywordChip} ${isSelected ? styles.keywordChipSelected : ''
                                                            } ${isDisabled ? styles.keywordChipDisabled : ''}`}
                                                    >
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

                    {/* Sticky Bottom Button */}
                    <div className={styles.stickyBottom}>
                        <div className={styles.stickyBottomInner}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <button
                                    className={`${styles.btnPrimary} ${styles.btnFull}`}
                                    onClick={handleContinue}
                                    disabled={selectedKeywords.length < HTSM_CONFIG.MIN_KEYWORD_SELECTION || isSubmitting}
                                >
                                    {isSubmitting ? '생성 중...' : '계속하기'}
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

