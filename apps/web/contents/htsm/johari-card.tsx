'use client';

import { useMemo } from 'react';
import styles from './styles.module.css';
import { generateDescription } from './utils/description-generator';
import { getKoreanKeyword } from './keyword-map';

interface JohariCardProps {
    title: string;
    area: 'open' | 'blind' | 'hidden' | 'unknown';
    keywords: string[];
    colorClass: string;
}

const SUBTITLES = {
    open: "나도 알고, 남도 아는 나",
    blind: "나는 모르지만 남이 보는 나",
    hidden: "나만 알고 있을지도 모르는 진짜 나",
    unknown: "새로운 환경에서 드러날 가능성"
};

export default function JohariCard({ title, area, keywords, colorClass }: JohariCardProps) {
    const localizedKeywords = useMemo(() => {
        return keywords.map(kw => getKoreanKeyword(kw));
    }, [keywords]);

    const description = useMemo(() => {
        return generateDescription(area, localizedKeywords);
    }, [area, localizedKeywords]);

    const subtitle = SUBTITLES[area];

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
                            {getKoreanKeyword(kw)}
                        </div>
                    ))
                ) : (
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>아직 키워드가 없습니다</p>
                )}
            </div>
        </div>
    );
}
