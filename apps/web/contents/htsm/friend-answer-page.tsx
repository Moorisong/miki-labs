'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { HTSM_KEYWORDS, HTSM_CONFIG, HTSM_STORAGE_KEY } from './constants';
import styles from './styles.module.css';

interface FriendAnswerPageProps {
    shareId: string;
}

export default function FriendAnswerPage({ shareId }: FriendAnswerPageProps) {
    const router = useRouter();
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState<boolean>(false);

    const toggleKeyword = (keyword: string) => {
        if (selectedKeywords.includes(keyword)) {
            setSelectedKeywords(selectedKeywords.filter((k) => k !== keyword));
        } else if (selectedKeywords.length < HTSM_CONFIG.MAX_KEYWORD_SELECTION) {
            setSelectedKeywords([...selectedKeywords, keyword]);
        }
    };

    const handleSubmit = () => {
        if (selectedKeywords.length === HTSM_CONFIG.MAX_KEYWORD_SELECTION) {
            const existing = JSON.parse(
                localStorage.getItem(HTSM_STORAGE_KEY.FRIEND_ANSWERS) || '[]'
            );
            existing.push(selectedKeywords);
            localStorage.setItem(HTSM_STORAGE_KEY.FRIEND_ANSWERS, JSON.stringify(existing));
            setSubmitted(true);
        }
    };

    if (submitted) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.submittedContainer}>
                    <div className={styles.submittedContent}>
                        <div className={styles.submittedEmoji}>✨</div>
                        <h1 className={styles.submittedTitle}>Thanks for your answer!</h1>
                        <p className={styles.submittedSubtitle}>
                            Your friend will see the combined results
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                            <button className={styles.btnPrimary} onClick={() => router.push(`/htsm/result/${shareId}`)}>
                                View Result
                            </button>
                            <button className={styles.btnSecondary} onClick={() => router.push('/htsm')}>
                                Create Your Own Test
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
                        <h1 className={styles.friendTitle}>Describe your friend in 3 words</h1>
                        <p className={styles.friendCount}>{count}/{HTSM_CONFIG.MAX_KEYWORD_SELECTION} selected</p>
                        <div className={styles.trustIndicators}>
                            <div className={styles.trustItem}>
                                <svg className={styles.trustIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                <span>Anonymous</span>
                            </div>
                            <div className={styles.trustItem}>
                                <svg className={styles.trustIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                <span>Takes 10 seconds</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.keywordGrid}>
                        {HTSM_KEYWORDS.map((keyword) => {
                            const sel = selectedKeywords.includes(keyword);
                            const dis = !sel && count >= HTSM_CONFIG.MAX_KEYWORD_SELECTION;
                            return (
                                <button key={keyword} type="button" onClick={() => toggleKeyword(keyword)} disabled={dis}
                                    className={`${styles.keywordChip} ${sel ? styles.keywordChipSelected : ''} ${dis ? styles.keywordChipDisabled : ''}`}>
                                    {keyword}
                                </button>
                            );
                        })}
                    </div>

                    <div className={styles.stickyBottom}>
                        <div className={styles.stickyBottomInner}>
                            <button className={`${styles.btnPrimary} ${styles.btnFull}`} onClick={handleSubmit}
                                disabled={count !== HTSM_CONFIG.MAX_KEYWORD_SELECTION}>
                                Submit Answer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
