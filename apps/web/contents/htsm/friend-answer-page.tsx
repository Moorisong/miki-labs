'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/language-context';

import { HTSM_KEYWORDS, HTSM_CONFIG } from './constants';
import { submitAnswer } from './api';
import styles from './styles.module.css';

interface FriendAnswerPageProps {
    shareId: string;
}

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
    const { t } = useLanguage();
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const toggleKeyword = (keyword: string) => {
        if (selectedKeywords.includes(keyword)) {
            setSelectedKeywords(selectedKeywords.filter((k) => k !== keyword));
        } else if (selectedKeywords.length < HTSM_CONFIG.MAX_KEYWORD_SELECTION) {
            setSelectedKeywords([...selectedKeywords, keyword]);
        }
    };

    const handleSubmit = async () => {
        if (selectedKeywords.length !== HTSM_CONFIG.MAX_KEYWORD_SELECTION) return;
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError('');

        try {
            const fingerprintHash = generateFingerprint();
            await submitAnswer(shareId, selectedKeywords, fingerprintHash);
            setSubmitted(true);
        } catch (err) {
            const message = err instanceof Error ? err.message : t('answer.error');
            setError(message);
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.submittedContainer}>
                    <div className={styles.submittedContent}>
                        <div className={styles.submittedEmoji}>✨</div>
                        <h1 className={styles.submittedTitle}>{t('answer.thanksTitle')}</h1>
                        <p className={styles.submittedSubtitle}>
                            {t('answer.thanksSubtitle')}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                            <button className={styles.btnPrimary} onClick={() => router.push(`/htsm/result/${shareId}`)}>
                                {t('answer.viewResult')}
                            </button>
                            <button className={styles.btnSecondary} onClick={() => router.push('/htsm')}>
                                {t('answer.createMine')}
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
                        <h1 className={styles.friendTitle}>{t('answer.title')}</h1>
                        <p className={styles.friendCount}>{t('answer.count', { current: count, max: HTSM_CONFIG.MAX_KEYWORD_SELECTION })}</p>
                        <div className={styles.trustIndicators}>
                            <div className={styles.trustItem}>
                                <svg className={styles.trustIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                <span>{t('answer.anonymous')}</span>
                            </div>
                            <div className={styles.trustItem}>
                                <svg className={styles.trustIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                <span>{t('answer.takesTime')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem' }}>
                            {error}
                        </p>
                    )}

                    <div className={styles.keywordGrid}>
                        {HTSM_KEYWORDS.map((keyword) => {
                            const sel = selectedKeywords.includes(keyword);
                            const dis = !sel && count >= HTSM_CONFIG.MAX_KEYWORD_SELECTION;
                            return (
                                <button key={keyword} type="button" onClick={() => toggleKeyword(keyword)} disabled={dis || isSubmitting}
                                    className={`${styles.keywordChip} ${sel ? styles.keywordChipSelected : ''} ${dis ? styles.keywordChipDisabled : ''}`}>
                                    {keyword}
                                </button>
                            );
                        })}
                    </div>

                    <div className={styles.stickyBottom}>
                        <div className={styles.stickyBottomInner}>
                            <button className={`${styles.btnPrimary} ${styles.btnFull}`} onClick={handleSubmit}
                                disabled={count !== HTSM_CONFIG.MAX_KEYWORD_SELECTION || isSubmitting}>
                                {isSubmitting ? t('answer.submitting') : t('answer.submit')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
