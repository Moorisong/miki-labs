'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { decodeResultData, ELEMENTS } from '@/lib/pet-destiny/fortune';
import { PetDestinyResult, Element } from '@/lib/pet-destiny/types';
import styles from './styles.module.css';

interface ResultData extends PetDestinyResult {
    petType: string;
    petName: string;
    ownerName: string;
}

export default function ResultPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [data, setData] = useState<ResultData | null>(null);

    useEffect(() => {
        const seed = searchParams.get('seed');
        if (!seed) {
            router.push('/pet-destiny');
            return;
        }

        // localStorage에서 결과 데이터 가져오기
        const storedResult = localStorage.getItem('petDestinyResult');
        if (storedResult) {
            try {
                const parsedResult = JSON.parse(storedResult) as ResultData;
                setData(parsedResult);
            } catch {
                router.push('/pet-destiny');
            }
        } else {
            // localStorage에 없으면 seed에서 복원 시도
            const decodedData = decodeResultData(seed);
            if (!decodedData) {
                router.push('/pet-destiny');
            } else {
                // seed만 있고 결과 데이터가 없으면 입력 페이지로
                router.push('/pet-destiny');
            }
        }
    }, [searchParams, router]);

    const handleShare = async () => {
        const url = window.location.href;
        const petName = data?.petName || '우리 아이';
        const ownerName = data?.ownerName || '나';
        const score = data?.compatibility || 0;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: '운명연구소',
                    text: `${petName}와 ${ownerName}의 궁합은 ${score}점!`,
                    url: url,
                });
            } catch {
                // 공유 취소 시 URL 복사
                await navigator.clipboard.writeText(url);
                alert('링크가 복사되었습니다!');
            }
        } else {
            await navigator.clipboard.writeText(url);
            alert('링크가 복사되었습니다!');
        }
    };

    const handleRetry = () => {
        localStorage.removeItem('petDestinyResult');
        router.push('/pet-destiny');
    };

    if (!data) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingContent}>
                    <div className={styles.loadingIcon}>✨</div>
                    <p className={styles.loadingText}>결과를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    const petElementInfo = ELEMENTS[data.petElement as Element];
    const ownerElementInfo = ELEMENTS[data.ownerElement as Element];

    const getSummaryTitle = (score: number) => {
        if (score >= 90) return '천생연분이에요! 💕';
        if (score >= 80) return '환상의 궁합이에요! ✨';
        if (score >= 70) return '좋은 인연이에요! 🌟';
        return '서로를 이해하는 시간이 필요해요! 💗';
    };

    return (
        <div className={styles.resultContainer}>
            <div className={styles.innerContainer}>
                {/* 헤더 */}
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <h1 className={styles.title} style={{ fontSize: '1.5rem' }}>운명연구소</h1>
                    </div>
                </div>

                {/* Summary */}
                <div className={styles.summaryCard}>
                    <p className={styles.summaryPetType}>
                        {data.petType} {data.petName && `'${data.petName}'`}
                        {data.ownerName && ` × 집사 '${data.ownerName}'`}
                    </p>
                    <h2 className={styles.summaryTitle}>
                        {getSummaryTitle(data.compatibility)}
                    </h2>
                    <div className={styles.elementInfo}>
                        <div className={styles.elementItem}>
                            <span>{petElementInfo.emoji}</span>
                            <span>{petElementInfo.name}({petElementInfo.trait})</span>
                        </div>
                        <span>×</span>
                        <div className={styles.elementItem}>
                            <span>{ownerElementInfo.emoji}</span>
                            <span>{ownerElementInfo.name}({ownerElementInfo.trait})</span>
                        </div>
                    </div>
                </div>

                {/* 결과 카드들 */}
                <div className={styles.resultCards}>
                    {/* 1. 궁합 */}
                    <div className={styles.resultCard}>
                        <h3 className={styles.cardTitle}>
                            집사-반려동물 궁합
                        </h3>
                        <div className={styles.gaugeScore}>{data.compatibility}점</div>
                        <div className={styles.gaugeContainer}>
                            <div className={styles.gaugeBar}>
                                <div
                                    className={styles.gaugeFill}
                                    style={{ width: `${data.compatibility}%` }}
                                />
                            </div>
                            <div className={styles.gaugeLabel}>
                                <span>0</span>
                                <span>100</span>
                            </div>
                        </div>
                        <p className={styles.cardContent}>{data.compatibilityLabel}</p>
                    </div>

                    {/* 2. 성격 분석 */}
                    <div className={styles.resultCard}>
                        <h3 className={styles.cardTitle}>
                            성격 분석
                        </h3>
                        <p className={styles.cardContent} style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                            {data.personality.mainTrait}
                        </p>
                        <div className={styles.traitTags}>
                            {data.personality.subTraits.map((trait, index) => (
                                <span key={index} className={styles.traitTag}>{trait}</span>
                            ))}
                        </div>
                        <p className={styles.cardContent}>{data.personality.description}</p>
                    </div>

                    {/* 3. 건강 운 */}
                    <div className={styles.resultCard}>
                        <h3 className={styles.cardTitle}>
                            평생 건강 운
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <span style={{ fontWeight: 600, color: '#059669' }}>{data.health.level}</span>
                            <span style={{ color: '#6b7280' }}>({data.health.score}점)</span>
                        </div>
                        <p className={styles.cardContent}>{data.health.advice}</p>
                    </div>

                    {/* 4. 마음 경계 지수 */}
                    <div className={styles.resultCard}>
                        <h3 className={styles.cardTitle}>
                            마음 경계 지수
                        </h3>
                        <div className={styles.gaugeContainer}>
                            <div className={styles.gaugeBar}>
                                <div
                                    className={styles.gaugeFill}
                                    style={{ width: `${100 - data.mind.level}%` }}
                                />
                            </div>
                            <div className={styles.gaugeLabel}>
                                <span>경계</span>
                                <span>개방</span>
                            </div>
                        </div>
                        <p className={styles.cardContent}>{data.mind.description}</p>
                    </div>

                    {/* 5. 평생 운 흐름 */}
                    <div className={styles.resultCard}>
                        <h3 className={styles.cardTitle}>
                            평생 운 흐름
                        </h3>
                        <div className={styles.lifetimeStages}>
                            {data.lifetimeFlow.map((stage, index) => (
                                <div key={index} className={styles.lifetimeStage}>
                                    <span className={styles.stageAge}>{stage.age}</span>
                                    <span className={styles.stageFortune}>{stage.fortune}</span>
                                    <span className={styles.stageLevel}>{stage.level}점</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 6. 올해 운세 */}
                    <div className={styles.resultCard}>
                        <h3 className={styles.cardTitle}>
                            2026년 운세 {data.yearFortuneLabel}
                        </h3>
                        <p className={styles.cardContent} style={{ marginBottom: '0.75rem' }}>
                            {data.yearFortune.overall}
                        </p>
                        <div className={styles.yearFortuneGrid}>
                            <div className={styles.yearFortuneItem}>
                                <div className={styles.yearFortuneLabel}>💕 애정운</div>
                                <div className={styles.yearFortuneValue}>{data.yearFortune.love}</div>
                            </div>
                            <div className={styles.yearFortuneItem}>
                                <div className={styles.yearFortuneLabel}>💚 건강운</div>
                                <div className={styles.yearFortuneValue}>{data.yearFortune.health}</div>
                            </div>
                            <div className={styles.yearFortuneItem}>
                                <div className={styles.yearFortuneLabel}>🍀 행운</div>
                                <div className={styles.yearFortuneValue}>{data.yearFortune.wealth}</div>
                            </div>
                            <div className={`${styles.yearFortuneItem} ${styles.yearFortuneFull}`}>
                                <div className={styles.yearFortuneLabel}>🎁 행운 아이템</div>
                                <div className={styles.yearFortuneValue}>{data.yearFortune.lucky}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 액션 버튼 */}
                <div className={styles.actionButtons}>
                    <button onClick={handleShare} className={styles.shareButton}>
                        📤 공유하기
                    </button>
                    <button onClick={handleRetry} className={styles.retryButton}>
                        🔄 다시 해보기
                    </button>
                </div>

                {/* 푸터 */}
                <div className={styles.resultFooter}>
                    <p>✨ 본 콘텐츠는 엔터테인먼트 목적의 운세 서비스입니다.</p>
                    <p>© 2026 운명연구소. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
