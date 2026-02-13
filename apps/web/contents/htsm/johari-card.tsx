'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '@/context/language-context';
import styles from './styles.module.css';
import { generateDescription } from './utils/description-generator';

interface JohariCardProps {
    title: string;
    area: 'open' | 'blind' | 'hidden' | 'unknown';
    keywords: string[];
    gradientClass: string;
}

export default function JohariCard({ title, area, keywords, gradientClass }: JohariCardProps) {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    // Get localized keywords for the generator
    const localizedKeywords = useMemo(() => {
        return keywords.map(kw => t(`keywords.${kw}`));
    }, [keywords, t]);

    // Generate description only once (or when keywords change)
    const description = useMemo(() => {
        // Only generate for Korean if the user wants Korean. 
        // The instructions imply Korean text generation.
        // For other languages, we might need other logic or fallback.
        // Since the task is specific about "HTSM 결과 페이지", likely targeting Korean audience or the provided templates are KR only.
        return generateDescription(area, localizedKeywords);
    }, [area, localizedKeywords]);

    return (
        <div className={styles.resultCard}>
            <div className={styles.resultCardHeader}>
                <div>
                    <h3 className={styles.resultCardTitle}>{title}</h3>
                    {/* Replaced short description with the generated long description */}
                    <p className={styles.resultCardDescriptionLong}>
                        {description}
                    </p>
                </div>
            </div>

            <div className={styles.toggleContainer}>
                <button
                    className={styles.toggleButton}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? 'Hide keywords' : 'Show keywords'}
                    <svg
                        className={`${styles.toggleIcon} ${isOpen ? styles.toggleIconOpen : ''}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>
            </div>

            <div className={`${styles.keywordListContainer} ${isOpen ? styles.keywordListOpen : ''}`}>
                <div className={styles.resultCardKeywords}>
                    {keywords.length > 0 ? (
                        keywords.map((kw) => (
                            <div key={kw} className={`${styles.resultCardKeyword} ${gradientClass}`}>
                                {t(`keywords.${kw}`)}
                            </div>
                        ))
                    ) : (
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{t('result.noKeywords')}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
