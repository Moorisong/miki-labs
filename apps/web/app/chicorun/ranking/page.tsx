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
    const [myNickname, setMyNickname] = useState<string | null>(null);
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
        // 1등 카드는 1.2배 스케일이므로 이를 고려한 기준 너비 설정
        const baseWidth = (CARD_WIDTH * 1.2) + 40;

        if (availableWidth < baseWidth) {
            const newScale = (availableWidth - 40) / baseWidth;
            setScale(Math.max(0.4, newScale));
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

    // 1. URL이나 DB(서버)에서 최신 정보를 가져와서 설정
    useEffect(() => {
        const fetchMeAndInitialize = async () => {
            // URL 파라미터 확인이 최우선
            const urlCode = searchParams.get('classCode');
            if (urlCode) setClassCode(urlCode);

            const token = localStorage.getItem(CHICORUN_STORAGE_KEY.TOKEN);
            if (!token) {
                if (!urlCode) setIsLoading(false);
                return;
            }

            try {
                // 로컬 스토리지가 아닌 서버(DB) 정보를 확인
                const res = await fetch(CHICORUN_API.STUDENT_ME, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success && data.data) {
                    const info = data.data;
                    setMyNickname(info.nickname || null);
                    // URL 코드가 없을 때만 DB의 클래스 코드를 보조적으로 사용
                    if (!urlCode && info.classCode) setClassCode(info.classCode);
                }
            } catch (err) {
                console.error('Failed to fetch latest info from server:', err);
            }
        };

        fetchMeAndInitialize();
    }, [searchParams]);

    // 2. 클래스 코드가 확정되면 랭킹 데이터를 가져옴
    useEffect(() => {
        if (classCode) {
            fetchRankings(classCode);
        } else if (!isLoading) {
            // 초기 로딩 후에도 코드가 없으면 중단
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

    const myRankEntry = rankings.find(r => r.nickname === myNickname);
    const top3 = rankings.filter(u => u.rank <= 3).sort((a, b) => a.rank - b.rank);
    const others = rankings.filter(u => u.rank > 3);

    // Sorted for podium: [2nd, 1st, 3rd]
    const podium = [
        top3.find(u => u.rank === 2),
        top3.find(u => u.rank === 1),
        top3.find(u => u.rank === 3)
    ].filter(Boolean) as RankingEntry[];


    const scrollToMyCard = () => {
        if (!myRankEntry) return;
        const id = `student-card-${myRankEntry.id || myRankEntry.nickname}`;
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a brief highlight effect
            const originalTransform = element.style.transform;
            element.style.transition = 'transform 0.3s ease';
            element.style.transform = `${originalTransform} scale(1.05)`;
            setTimeout(() => {
                element.style.transform = originalTransform;
            }, 600);
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
                <h1 className={styles.title}>실시간 포인트 랭킹 보드</h1>
                <p className={styles.subtitle}>포인트 1등을 향해 달려보세요!</p>
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
                    {/* Top 3 Podium Area */}
                    {podium.length > 0 && (
                        <div className={styles.podiumSection}>
                            {podium.map((user) => (
                                <div
                                    key={user.id || user.nickname}
                                    id={`student-card-${user.id || user.nickname}`}
                                    className={`${styles.podiumCardWrapper} ${user.rank === 1 ? styles.podiumRank1 : ''}`}
                                >
                                    <div className={`${styles.podiumBadge} ${styles[`badgeRank${user.rank}`]}`}>
                                        <span className={styles.rankNum}>{user.rank}</span>
                                    </div>
                                    <RankingCard
                                        user={user}
                                        isFirst={user.rank === 1}
                                        scale={(user.rank === 1 ? 1.15 : 1.0) * (scale < 1 ? scale : 1) * 0.8}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 나머지 랭커들 그리드 */}
                    <div className={styles.otherRankersGrid}>
                        {others.map((user, index) => (
                            <div
                                key={user.id || index.toString()}
                                id={`student-card-${user.id || user.nickname}`}
                                style={{
                                    animation: `${styles.slideUp} 0.5s ease-out forwards`,
                                    animationDelay: `${index * 0.05}s`,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    transition: 'transform 0.3s ease'
                                }}
                            >
                                <div className={styles.cardRankWrapper}>
                                    <div className={styles.cardRankLabel}>{user.rank}등</div>
                                    <RankingCard
                                        user={user}
                                        isFirst={false}
                                        scale={(scale < 1 ? scale : 1) * 0.8}
                                    />
                                </div>
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

            {/* 내 랭킹 스티키 바 */}
            {!isLoading && myRankEntry && (
                <div className={styles.myRankBar} onClick={scrollToMyCard}>
                    <div className={styles.myRankInfo}>
                        <div className={styles.myRankBadge}>{myRankEntry.rank}등</div>
                        <div className={styles.myRankText}>
                            <strong>{myRankEntry.nickname}</strong>님의 현재 랭킹
                        </div>
                    </div>
                    <div className={styles.myRankPoints}>
                        <IconZap />
                        {myRankEntry.point.toLocaleString()}P
                    </div>
                    <div className={styles.jumpHint}>
                        내 카드로 이동 ➔
                    </div>
                </div>
            )}
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
