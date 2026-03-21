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
}

// ─── 아이콘 ──────────────────────────────────────────────────────────────────────
const IconBook = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

const IconTrophy = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#eab308" stroke="#ca8a04"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
        <path d="M4 22h16"></path>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>
);

const IconMedal = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="#9ca3af" stroke="#6b7280"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="17" r="5"></circle>
        <polyline points="12 18 10.5 16.5 12 15 13.5 16.5 12 18"></polyline>
        <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"></path>
    </svg>
);

const IconAward = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="#fb923c" stroke="#c2410c"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6"></circle>
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
    </svg>
);

const IconZap = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#f97316" stroke="#ea580c"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

function getRankIcon(rank: number) {
    switch (rank) {
        case 1: return <IconTrophy />;
        case 2: return <IconMedal />;
        case 3: return <IconAward />;
        default: return <span className={styles.rankNumber}>#{rank}</span>;
    }
}

// 프로필 카드 렌더링 컴포넌트
function ProfileCard({ nickname, badge, cardStyle, nicknameStyle }: {
    nickname: string;
    badge: string;
    cardStyle: string;
    nicknameStyle: RankingEntry['nicknameStyle'];
}) {
    return (
        <div style={{
            width: '72px', height: '72px', borderRadius: '1rem',
            background: cardStyle || 'linear-gradient(135deg, #60a5fa, #06b6d4)', padding: '3px',
            flexShrink: 0,
        }}>
            <div style={{
                width: '100%', height: '100%', borderRadius: '0.75rem',
                background: 'white', display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '2px',
            }}>
                <span style={{ fontSize: '1.5rem' }}>{badge || '⭐'}</span>
                <span style={{
                    fontSize: '0.5rem', fontWeight: nicknameStyle?.bold ? 700 : 500,
                    fontStyle: nicknameStyle?.italic ? 'italic' : 'normal',
                    color: (nicknameStyle?.color === '#ffffff' || !nicknameStyle?.color) ? '#1e293b' : nicknameStyle.color,
                    maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                    {nickname}
                </span>
            </div>
        </div>
    );
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
                    {rankings.map((user, index) => (
                        <div
                            key={user.id ?? user.rank}
                            className={styles.rankingItem}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className={styles.rankBadgeBox}>
                                {getRankIcon(user.rank)}
                            </div>

                            <ProfileCard
                                nickname={user.nickname}
                                badge={user.badge}
                                cardStyle={user.cardStyle}
                                nicknameStyle={user.nicknameStyle}
                            />

                            <div className={styles.rankInfo}>
                                <div className={styles.rankNickname}>{user.nickname}</div>
                                <div className={styles.rankBadgeEmoji}>{user.badge}</div>
                            </div>

                            <div className={styles.pointsBox}>
                                <IconZap />
                                <span className={styles.points}>{user.point.toLocaleString()}P</span>
                            </div>
                        </div>
                    ))}
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
