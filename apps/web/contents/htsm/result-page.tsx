'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { HTSM_CONFIG } from './constants';
import { fetchResult, HtsmResult } from './api';
import ResultShareSection from './result-share-section';
import JohariCard from './johari-card';
import styles from './styles.module.css';

interface ResultPageProps {
    shareId: string;
}

export default function ResultPage({ shareId }: ResultPageProps) {
    const [result, setResult] = useState<HtsmResult | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const loadResult = async () => {
            try {
                const data = await fetchResult(shareId);
                setResult(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : '결과를 불러올 수 없습니다.');
            } finally {
                setLoading(false);
            }
        };
        loadResult();
    }, [shareId]);

    if (loading) {
        return (
            <div className={styles.pageContainer}>
                <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>결과를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className={styles.pageContainer}>
                <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: '#ef4444', fontSize: '1.125rem' }}>{error || '결과를 불러올 수 없습니다.'}</p>
                </div>
            </div>
        );
    }

    const { answerCount, johari } = result;
    const totalFriends = HTSM_CONFIG.MIN_FRIENDS_FOR_RESULT;
    const percent = Math.min(Math.round((answerCount / totalFriends) * 100), 100);

    const johariCards = [
        { title: '개방된 자아', area: 'open' as const, data: johari.open, colorClass: styles.colorGreen },
        { title: '눈먼 자아', area: 'blind' as const, data: johari.blind, colorClass: styles.colorBlue },
        { title: '숨겨진 자아', area: 'hidden' as const, data: johari.hidden, colorClass: styles.colorPurple },
        { title: '미지의 자아', area: 'unknown' as const, data: answerCount === 0 ? { keywords: [] } : johari.unknown, colorClass: styles.colorCyan },
    ];

    return (
        <div className={styles.pageContainer}>
            <div className={styles.wideContainer}>
                <div className={styles.resultPage}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <Link href="/htsm" style={{ display: 'inline-block', marginBottom: '1rem' }}>
                            <Image
                                src="/htsm-logo-v6.png"
                                alt="HTSM Logo"
                                width={80}
                                height={80}
                                style={{ objectFit: 'contain' }}
                            />
                        </Link>
                        <h1 className={styles.resultTitle}>나의 자아탐험 결과</h1>
                        <p className={styles.resultSubtitle}>
                            내가 보는 나 vs 남들이 보는 나
                        </p>
                    </div>

                    {/* Participation Progress */}
                    <div className={`${styles.glassCard} ${styles.participationCard}`}>
                        <div className={styles.participationHeader}>
                            <div className={styles.participationInfo}>
                                <svg className={styles.participationIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                <span className={styles.participationText}>
                                    {answerCount}명의 친구가 응답했습니다
                                </span>
                            </div>
                            <span className={styles.participationPercent}>{percent}%</span>
                        </div>
                        <div className={styles.participationBar}>
                            <div className={styles.participationBarFill} style={{ width: `${percent}%` }} />
                        </div>
                        {answerCount < totalFriends && (
                            <p className={styles.participationHint}>
                                {totalFriends - answerCount}명만 더 응답하면 전체 결과가 공개됩니다
                            </p>
                        )}
                    </div>

                    {/* Johari Grid */}
                    <div className={styles.johariGrid}>
                        {johariCards.map((card) => (
                            <JohariCard
                                key={card.title}
                                title={card.title}
                                area={card.area}
                                keywords={card.data.keywords}
                                colorClass={card.colorClass}
                                shareId={shareId}
                            />
                        ))}
                    </div>

                    {/* New Share Section (Result Page Spec) */}
                    <ResultShareSection shareId={shareId} />


                    {/* Johari Info */}
                    <div className={styles.infoCard}>
                        <h3 className={styles.johariInfoTitle}>조하리의 창이란?</h3>
                        <p className={styles.johariInfoText}>
                            조하리의 창(Johari Window)은 1955년 심리학자 조셉 루프트와 해리 잉햄이 개발한 심리학 도구입니다. 나와 타인의 관계 속에서 내가 어떤 사람인지 이해하도록 도와줍니다. 내가 아는 나와 모르는 나, 타인이 아는 나와 모르는 나를 구분하여 4가지 영역(개방, 맹목, 숨겨진, 미지)으로 나눕니다.
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
}
