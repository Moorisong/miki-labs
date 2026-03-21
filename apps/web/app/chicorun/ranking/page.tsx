'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import { CHICORUN_API, CHICORUN_ROUTES, CHICORUN_STORAGE_KEY } from '@/constants/chicorun';

// ─── 타입 ──────────────────────────────────────────────────────────────────────
interface RankingEntry {
    rank: number;
    id: string;
    nickname: string;
    point: number;
    badge: string;
    nicknameStyle: {
        color: string;
        bold: boolean;
        italic: boolean;
        underline: boolean;
    };
    cardStyle: string;
    customize?: {
        stickers?: {
            id: string;
            emoji: string;
            x: number;
            y: number;
            scale?: number;
            rotate?: number;
        }[];
    };
}

// ─── 아이콘 ──────────────────────────────────────────────────────────────────────
const IconBook = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

const IconZap = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#f97316" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
);

const IconClass = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
);

function getRankIcon(rank: number) {
    if (rank === 1) {
        return <span className={styles.rankNumber} style={{ color: '#ca8a04', fontSize: '1.75rem' }}>#{rank}</span>;
    }
    if (rank === 2 || rank === 3) {
        return <span className={styles.rankNumber} style={{ color: '#ca8a04' }}>#{rank}</span>;
    }
    return <span className={styles.rankNumber}>#{rank}</span>;
}



function RankingContent() {
    const searchParams = useSearchParams();
    const urlClassCode = searchParams.get('classCode');

    const [rankings, setRankings] = useState<RankingEntry[]>([]);
    const [classCode, setClassCode] = useState('');
    const [className, setClassName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        // 1. URL 파라미터 확인 (교사가 특정 클래스 랭킹을 볼 때 등)
        if (urlClassCode) {
            setClassCode(urlClassCode);
            fetchRanking(urlClassCode);
            return;
        }

        // 2. 로그인된 학생의 classCode로 랭킹 자동 조회
        const studentInfo = localStorage.getItem(CHICORUN_STORAGE_KEY.STUDENT_INFO);
        if (studentInfo) {
            try {
                const info = JSON.parse(studentInfo);
                if (info.classCode) {
                    setClassCode(info.classCode);
                    fetchRanking(info.classCode);
                }
            } catch {
                // ignore
            }
        }
    }, [urlClassCode]);

    const fetchRanking = async (code: string) => {
        if (!code.trim()) return;
        setIsLoading(true);
        setHasSearched(true);
        try {
            const res = await fetch(CHICORUN_API.CLASS_RANKING(code.toUpperCase()));
            const data = await res.json();
            if (data.success && data.data) {
                if (Array.isArray(data.data)) {
                    setRankings(data.data);
                } else if (data.data.ranking && Array.isArray(data.data.ranking)) {
                    setRankings(data.data.ranking);
                    setClassName(data.data.className || '');
                } else {
                    setRankings([]);
                }
            } else {
                setRankings([]);
            }
        } catch {
            setRankings([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>

            <main className={styles.main}>
                <div className={styles.titleArea}>
                    {className && (
                        <div className={styles.classInfoContainer}>
                            <div className={styles.classInfoBadge}>
                                <IconClass />
                                {className}
                            </div>
                        </div>
                    )}
                    <h1 className={styles.title}>🏆 랭킹</h1>
                    <p className={styles.subtitle}>최고 점수를 향해 달려보세요!</p>
                </div>


                {hasSearched && !isLoading && rankings.length === 0 && (
                    <p className={styles.mockNotice}>
                        해당 클래스의 랭킹 데이터가 없거나 코드가 올바르지 않습니다.
                    </p>
                )}

                {/* 랭킹 리스트 */}
                <div className={styles.rankingList}>
                    {rankings.map((user, index) => {
                        const isFirst = user.rank === 1;
                        return (
                            <div
                                key={user.id ?? user.rank}
                                className={styles.rankingItem}
                                style={{
                                    animationDelay: `${index * 0.05}s`,
                                    background: user.cardStyle || 'white',
                                    position: 'relative',
                                    overflow: isFirst ? 'visible' : 'hidden', // 1등 뱃지가 잘리지 않게 visible 처리
                                    transform: isFirst ? 'scale(1.05)' : 'translateZ(0)',
                                    zIndex: isFirst ? 10 : 1, // 크기가 커지므로 zIndex 높임
                                    margin: isFirst ? '1rem 0' : '0', // 커진 만큼 마진 추가
                                    border: isFirst ? '3px solid #facc15' : 'none', // 1등 테두리 금색 하이라이트
                                    boxShadow: isFirst ? '0 20px 25px -5px rgba(250, 204, 21, 0.4)' : undefined,
                                }}
                            >
                                {/* 1등 좌측 상단 강조 뱃지 스티커 */}
                                {isFirst && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-15px',
                                        left: '-15px',
                                        background: 'linear-gradient(135deg, #fef08a, #ca8a04)',
                                        color: '#fff',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontWeight: 900,
                                        fontSize: '1rem',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                                        transform: 'rotate(-10deg)',
                                        zIndex: 20,
                                        border: '2px solid white',
                                        pointerEvents: 'none',
                                    }}>
                                        👑 TOP 1
                                    </div>
                                )}

                                {/* 장식용 스티커 */}
                                {user.customize?.stickers?.map((sticker) => (
                                    <div
                                        key={sticker.id}
                                        style={{
                                            position: 'absolute',
                                            left: sticker.x,
                                            top: sticker.y,
                                            fontSize: '2rem',
                                            userSelect: 'none',
                                            pointerEvents: 'none',
                                            zIndex: 0,
                                            transform: `scale(${sticker.scale || 1}) rotate(${sticker.rotate || 0}deg)`,
                                        }}
                                    >
                                        {sticker.emoji}
                                    </div>
                                ))}

                                <div className={styles.rankBadgeBox} style={{ position: 'relative', zIndex: 1 }}>
                                    {getRankIcon(user.rank)}
                                </div>

                                <div className={styles.rankInfo} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative', zIndex: 1 }}>
                                    <div className={styles.rankBadgeEmoji} style={{ fontSize: '1.5rem', marginTop: 0 }}>{user.badge || '⭐'}</div>
                                    <div
                                        className={styles.rankNickname}
                                        style={{
                                            color: user.nicknameStyle?.color || '#1e293b',
                                            fontWeight: user.nicknameStyle?.bold ? 800 : 500,
                                            fontStyle: user.nicknameStyle?.italic ? 'italic' : 'normal',
                                            textDecoration: user.nicknameStyle?.underline ? 'underline' : 'none',
                                            textShadow: user.cardStyle && user.cardStyle !== 'white' && (!user.nicknameStyle?.color || user.nicknameStyle.color === '#ffffff') ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
                                        }}
                                    >
                                        {user.nickname}
                                    </div>
                                </div>

                                <div className={styles.pointsBox} style={{ position: 'relative', zIndex: 1 }}>
                                    <IconZap />
                                    <span className={styles.points}>{user.point.toLocaleString()}P</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className={styles.hintText}>
                    💡 더 많은 문제를 풀고 랭킹을 올려보세요!
                </div>
            </main>
        </div>
    );
}

export default function RankingPage() {
    return (
        <Suspense fallback={
            <div className={styles.container}>
                <main className={styles.main}>
                    <p style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>랭킹 불러오는 중...</p>
                </main>
            </div>
        }>
            <RankingContent />
        </Suspense>
    );
}
