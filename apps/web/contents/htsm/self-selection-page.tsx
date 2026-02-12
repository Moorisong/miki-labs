'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { HTSM_KEYWORDS, HTSM_CONFIG, HTSM_STORAGE_KEY } from './constants';
import styles from './styles.module.css';

export default function SelfSelectionPage() {
    const router = useRouter();
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

    const toggleKeyword = (keyword: string) => {
        if (selectedKeywords.includes(keyword)) {
            setSelectedKeywords(selectedKeywords.filter((k) => k !== keyword));
        } else if (selectedKeywords.length < HTSM_CONFIG.MAX_KEYWORD_SELECTION) {
            setSelectedKeywords([...selectedKeywords, keyword]);
        }
    };

    const handleContinue = () => {
        if (selectedKeywords.length === HTSM_CONFIG.MAX_KEYWORD_SELECTION) {
            localStorage.setItem(
                HTSM_STORAGE_KEY.SELF_SELECTION,
                JSON.stringify(selectedKeywords)
            );
            // Demo: generate a simple share ID
            const shareId = Math.random().toString(36).substring(2, 12);
            localStorage.setItem(HTSM_STORAGE_KEY.SHARE_ID, shareId);
            router.push(`/htsm/share/${shareId}`);
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
                            Step 1 of 2
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className={styles.selectionTitle}>
                        Pick 3 words that describe you
                    </h1>
                    <p className={styles.selectionCount}>
                        {selectionCount}/{HTSM_CONFIG.MAX_KEYWORD_SELECTION} selected
                    </p>

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
                                    disabled={isDisabled}
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
                                disabled={selectionCount !== HTSM_CONFIG.MAX_KEYWORD_SELECTION}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
