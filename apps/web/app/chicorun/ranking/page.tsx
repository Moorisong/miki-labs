'use client';

import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import { CHICORUN_API, CHICORUN_STORAGE_KEY } from '@/constants/chicorun';

import { RankingCard, CARD_WIDTH, CARD_HEIGHT, CHICORUN_CARD_DEFAULTS, RankingEntry } from '../RankingCard';

// Defaults matching the new card layout
const DEFAULTS = CHICORUN_CARD_DEFAULTS;


// Using imported RankingEntry from RankingCard.tsx

const IconZap = ({ color = '#ea580c' }: { color?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
);
const IconClass = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
);

// Helper removed as it's now in RankingCard.tsx

function RankingContent() {
    const searchParams = useSearchParams();
    const [classCode, setClassCode] = useState<string | null>(null);

    const [rankings, setRankings] = useState<RankingEntry[]>([]);
    const [className, setClassName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [hasSearched, setHasSearched] = useState(false);

    const [scale, setScale] = useState(1);
    const [isMounted, setIsMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const updateScale = useCallback(() => {
        if (!containerRef.current) return;
        const rectWidth = containerRef.current.clientWidth;
        const winWidth = window.innerWidth;
        const docWidth = document.documentElement.clientWidth;

        const availableWidth = Math.min(rectWidth > 0 ? rectWidth : winWidth, winWidth, docWidth);
        const baseWidth = CARD_WIDTH + 32;

        if (availableWidth < baseWidth) {
            const newScale = (availableWidth - 32) / baseWidth;
            setScale(Math.max(0.5, newScale));
        } else {
            setScale(1);
        }
    }, [containerRef]);

    useEffect(() => {
        setIsMounted(true);
        updateScale();

        window.addEventListener('resize', updateScale);
        const observer = new ResizeObserver(updateScale);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => {
            window.removeEventListener('resize', updateScale);
            observer.disconnect();
        };
    }, [updateScale, isLoading, rankings]);

    // Initial class code detection & sync points
    useEffect(() => {
        const urlCode = searchParams.get('classCode');
        if (urlCode) {
            setClassCode(urlCode);
        } else {
            // Try localStorage if URL is missing code
            const studentInfo = localStorage.getItem(CHICORUN_STORAGE_KEY.STUDENT_INFO);
            if (studentInfo) {
                try {
                    const info = JSON.parse(studentInfo);
                    if (info.classCode) setClassCode(info.classCode);
                } catch (e) {
                    console.error('Failed to parse student info', e);
                }
            }
        }
    }, [searchParams]);


    useEffect(() => {
        if (classCode) {
            fetchRankings(classCode);
        } else {
            setIsLoading(false); // Stop loading if no code is found
        }
    }, [classCode]);

    const fetchRankings = async (code: string) => {
        setIsLoading(true);
        setHasSearched(true);
        try {
            const res = await fetch(CHICORUN_API.CLASS_RANKING(code));
            const data = await res.json();
            if (data.success) {
                const list = data.data.ranking || (Array.isArray(data.data) ? data.data : []);
                setRankings(list);
                if (data.data.className) setClassName(data.data.className);
            }
        } catch (err) {
            console.error('Failed to fetch rankings:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.main}>
            <div className={styles.classInfoContainer}>
                <div className={styles.classInfoBadge}>
                    <IconClass />
                    {className || (classCode ? `${classCode} 클래스` : '클래스를 선택해주세요')}
                </div>
            </div>

            <div className={styles.titleArea}>
                <h1 className={styles.title}>실시간 랭킹 보드</h1>
                <p className={styles.subtitle}>최고 점수를 향해 달려보세요!</p>
            </div>

            {isLoading && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    <p>랭킹 정보를 불러오는 중입니다...</p>
                </div>
            )}

            {!isLoading && hasSearched && rankings.length === 0 && (
                <p className={styles.mockNotice}>
                    해당 클래스의 랭킹 데이터가 없거나 코드가 올바르지 않습니다.
                </p>
            )}

            {!isLoading && classCode && rankings.length > 0 && (
                <div className={styles.rankingGrid} ref={containerRef}>
                    {/* 1등 랭커 강조 영역 */}
                    {rankings.find(u => u.rank === 1) && (
                        <div className={styles.firstRankerRow} style={{ scale: scale > 1 ? 1 : scale }}>
                            <RankingCard
                                user={rankings.find(u => u.rank === 1)!}
                                isFirst={true}
                                scale={1.2}
                            />
                        </div>
                    )}

                    {/* 나머지 랭커들 그리드 */}
                    <div className={styles.otherRankersGrid}>
                        {rankings.filter(u => u.rank !== 1).map((user, index) => (
                            <div
                                key={user.id || index.toString()}
                                style={{
                                    animation: `${styles.slideUp} 0.5s ease-out forwards`,
                                    animationDelay: `${index * 0.05}s`,
                                    display: 'flex',
                                    justifyContent: 'center'
                                }}
                            >
                                <RankingCard
                                    user={user}
                                    isFirst={false}
                                    scale={scale < 1 ? scale : 1}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!isLoading && !classCode && (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <p style={{ color: '#64748b' }}>
                        로그인 정보가 없거나 잘못된 접근입니다.<br />
                        선생님이 공유해주신 링크로 다시 접속해 주세요.
                    </p>
                </div>
            )}

            <div className={styles.hintText}>
                💡 더 많은 문제를 풀고 랭킹을 올려보세요!
            </div>
        </main>
    );
}

export default function RankingPage() {
    return (
        <div className={styles.container}>
            <Suspense fallback={
                <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>
                    <p>로딩 중...</p>
                </div>
            }>
                <RankingContent />
            </Suspense>
        </div>
    );
}

// Helper removed
