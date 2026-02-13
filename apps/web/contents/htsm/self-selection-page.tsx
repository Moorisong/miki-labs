'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/language-context';

import { HTSM_KEYWORD_CATEGORIES, HTSM_CONFIG, HTSM_STORAGE_KEY } from './constants';
import { fetchProofToken, createTest } from './api';
import { generateFingerprint } from './utils/fingerprint';
import styles from './styles.module.css';

export default function SelfSelectionPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
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
            const shareId = await createTest(selectedKeywords, proofToken, fingerprint);

            // 3. LocalStorage 저장 (재방문 UX)
            if (typeof window !== 'undefined') {
                localStorage.setItem(HTSM_STORAGE_KEY.SHARE_ID, shareId);
            }

            // 4. 공유 페이지로 이동
            router.push(`/htsm/share/${shareId}`);
        } catch (err) {
            console.error('Test creation failed:', err);
            setError(t('create.error'));
            setIsSubmitting(false);
        }
    };

    const selectionCount = selectedKeywords.length;
    const progress = (selectionCount / HTSM_CONFIG.MAX_KEYWORD_SELECTION) * 100;

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
                            {t('create.step')}
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className={styles.selectionTitle}>
                        {t('create.title')}
                    </h1>
                    <p className={styles.selectionCount}>
                        {t('create.count', { current: selectionCount, max: HTSM_CONFIG.MAX_KEYWORD_SELECTION })}
                    </p>

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
                                                {t(`categories.${category.id}`)}
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
                                                        {t(`keywords.${keyword}`)}
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
                            <button
                                className={`${styles.btnPrimary} ${styles.btnFull}`}
                                onClick={handleContinue}
                                disabled={selectedKeywords.length < HTSM_CONFIG.MIN_KEYWORD_SELECTION || isSubmitting}
                            >
                                {isSubmitting ? t('create.creating') : t('create.continue')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

