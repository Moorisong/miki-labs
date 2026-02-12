'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/language-context';

import { HTSM_KEYWORDS, HTSM_CONFIG, HTSM_STORAGE_KEY } from './constants';
import { fetchProofToken, createTest } from './api';
import styles from './styles.module.css';

export default function SelfSelectionPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const toggleKeyword = (keyword: string) => {
        if (selectedKeywords.includes(keyword)) {
            setSelectedKeywords(selectedKeywords.filter((k) => k !== keyword));
        } else if (selectedKeywords.length < HTSM_CONFIG.MAX_KEYWORD_SELECTION) {
            setSelectedKeywords([...selectedKeywords, keyword]);
        }
    };

    const handleContinue = async () => {
        if (selectedKeywords.length !== HTSM_CONFIG.MAX_KEYWORD_SELECTION) return;
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError('');

        try {
            // 1. Proof Token 발급
            const proofToken = await fetchProofToken();

            // 2. 테스트 생성 (API)
            const shareId = await createTest(selectedKeywords, proofToken);

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

                    {/* Keyword Grid */}
                    <div className={styles.keywordGrid}>
                        {HTSM_KEYWORDS.map((keyword) => {
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
                                    {keyword}
                                </button>
                            );
                        })}
                    </div>

                    {/* Sticky Bottom Button */}
                    <div className={styles.stickyBottom}>
                        <div className={styles.stickyBottomInner}>
                            <button
                                className={`${styles.btnPrimary} ${styles.btnFull}`}
                                onClick={handleContinue}
                                disabled={selectionCount !== HTSM_CONFIG.MAX_KEYWORD_SELECTION || isSubmitting}
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
