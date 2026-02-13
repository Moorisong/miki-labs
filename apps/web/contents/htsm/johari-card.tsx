'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '@/context/language-context';
import styles from './styles.module.css';
import { generateDescription } from './utils/description-generator';

interface JohariCardProps {
    title: string;
    area: 'open' | 'blind' | 'hidden' | 'unknown';
    keywords: string[];
    colorClass: string;
}

export default function JohariCard({ title, area, keywords, colorClass }: JohariCardProps) {
    const { t, language } = useLanguage();

    const localizedKeywords = useMemo(() => {
        return keywords.map(kw => t(`keywords.${kw}`));
    }, [keywords, t]);

    const description = useMemo(() => {
        return generateDescription(area, localizedKeywords, language);
    }, [area, localizedKeywords, language]);

    const subtitle = t(`result.subtitles.${area}`);

    return (
        <div className={styles.resultCard}>
            <div className={styles.resultCardHeader}>
                <div className={styles.resultCardTitleGroup}>
                    <h3 className={styles.resultCardTitle}>{title}</h3>
                    <p className={styles.resultCardSubtitle}>{subtitle}</p>
                </div>
            </div>

            <div className={styles.resultCardDescriptionSection}>
                <p className={styles.resultCardDescriptionLong}>
                    {description}
                </p>
            </div>

            <div className={styles.resultCardKeywords}>
                {keywords.length > 0 ? (
                    keywords.map((kw) => (
                        <div key={kw} className={`${styles.resultCardKeyword} ${colorClass}`}>
                            {t(`keywords.${kw}`)}
                        </div>
                    ))
                ) : (
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{t('result.noKeywords')}</p>
                )}
            </div>
        </div>
    );
}
