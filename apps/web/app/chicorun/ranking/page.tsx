'use client';

import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import { CHICORUN_API, CHICORUN_STORAGE_KEY } from '@/constants/chicorun';

// Defaults matching the customize page
const DEFAULTS = {
    rank: { x: 24, y: 20 },
    badge: { x: 80, y: 20 },
    nickname: { x: 120, y: 25 },
    point: { x: 580, y: 20 }
};

interface RankingEntry {
    id: string;
    rank: number;
    nickname: string;
    point: number;
    badge?: string;
    cardStyle?: string;
    nicknameStyle?: {
        color: string;
        bold: boolean;
        italic: boolean;
        underline: boolean;
        fontSize?: number;
        x?: number;
        y?: number;
    };
    customize?: {
        stickers?: { id: string; emoji: string; x: number; y: number; scale?: number; rotate?: number }[];
        borderStyle?: {
            color: string;
            width: number;
            style: string;
            radius: number;
        };
        pointStyle?: {
            color: string;
            background: string;
            borderWidth: number;
            borderColor: string;
            fontSize: number;
            x: number;
            y: number;
        };
        rankStyle?: {
            color: string;
            fontSize: number;
            x: number;
            y: number;
        };
        badgeStyle?: {
            fontSize: number;
            x: number;
            y: number;
        };
    };
}

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

const getCardBorderStyle = (borderStyle: any) => {
    if (!borderStyle) return {};
    const { color, width, style, radius } = borderStyle;
    const baseStyle: React.CSSProperties = {
        borderRadius: `${radius !== undefined ? radius : 24}px`,
        borderWidth: `${width !== undefined ? width : 3}px`,
        borderColor: color || '#facc15',
        borderStyle: ['solid', 'dashed', 'dotted'].includes(style) ? (style as any) : 'none',
        backgroundClip: 'padding-box',
    };

    return baseStyle;
};

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

        const availableWidth = Math.min(rectWidth > 0 ? rectWidth : winWidth, winWidth, docWidth) - 32;
        const baseWidth = 800;

        if (availableWidth < baseWidth) {
            const newScale = availableWidth / baseWidth;
            setScale(newScale);
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
                <div className={styles.rankingList} ref={containerRef}>
                    {rankings.map((user, index) => {
                        if (!user) return null;

                        const isFirst = user.rank === 1;

                        // Decide if we should use absolute layout
                        // Uninitialized or 0,0 users will get the defaults
                        const rX = user.customize?.rankStyle?.x || DEFAULTS.rank.x;
                        const rY = user.customize?.rankStyle?.y || DEFAULTS.rank.y;
                        const bX = user.customize?.badgeStyle?.x || DEFAULTS.badge.x;
                        const bY = user.customize?.badgeStyle?.y || DEFAULTS.badge.y;
                        const nX = user.nicknameStyle?.x || DEFAULTS.nickname.x;
                        const nY = user.nicknameStyle?.y || DEFAULTS.nickname.y;
                        const pX = user.customize?.pointStyle?.x || DEFAULTS.point.x;
                        const pY = user.customize?.pointStyle?.y || DEFAULTS.point.y;

                        return (
                            <div
                                key={user.id || index.toString()}
                                style={{
                                    width: `${800 * scale * (isFirst ? 1.05 : 1)}px`,
                                    height: `${80 * scale * (isFirst ? 1.05 : 1)}px`,
                                    margin: isFirst ? `${16 * scale}px auto` : '0 auto',
                                    zIndex: isFirst ? 10 : 1,
                                    position: 'relative',
                                    animation: `${styles.slideUp} 0.5s ease-out forwards`,
                                    animationDelay: `${index * 0.05}s`,
                                    // 1등 카드의 왕관 아이콘이나 리본이 잘리지 않도록 overflow visible 허용
                                    overflow: isFirst || user.customize?.borderStyle?.style === 'ribbon' ? 'visible' : 'hidden'
                                }}
                            >
                                <div
                                    className={styles.rankingItem}
                                    style={{
                                        width: '800px',
                                        height: '80px',
                                        minWidth: '800px',
                                        ...((user.cardStyle || 'white').startsWith('linear-gradient')
                                            ? { backgroundImage: user.cardStyle || 'white' }
                                            : { backgroundColor: user.cardStyle || 'white' }),
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        overflow: isFirst || user.customize?.borderStyle?.style === 'ribbon' ? 'visible' : 'hidden',
                                        transformOrigin: 'top left',
                                        transform: `scale(${scale * (isFirst ? 1.05 : 1)})`,
                                        ...getCardBorderStyle(user.customize?.borderStyle),
                                        boxShadow: isFirst && user.customize?.borderStyle?.style !== 'neon' ? '0 20px 25px -5px rgba(250, 204, 21, 0.4)' : undefined,
                                        display: 'block',
                                        margin: 0,
                                    }}
                                >
                                    {user.customize?.borderStyle?.style === 'ribbon' && (
                                        <>
                                            <div style={{ position: 'absolute', top: -10, left: -10, fontSize: '1.5rem', transform: 'rotate(-45deg)', zIndex: 100 }}>🎀</div>
                                            <div style={{ position: 'absolute', top: -10, right: -10, fontSize: '1.5rem', transform: 'rotate(45deg)', zIndex: 100 }}>🎀</div>
                                        </>
                                    )}
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
                                            zIndex: 30,
                                            border: '2px solid white',
                                            pointerEvents: 'none',
                                        }}>
                                            👑 TOP 1
                                        </div>
                                    )}

                                    {user.customize?.stickers?.map((sticker) => (
                                        <div
                                            key={sticker.id}
                                            style={{
                                                position: 'absolute',
                                                left: sticker.x,
                                                top: sticker.y,
                                                fontSize: '2rem',
                                                zIndex: 5,
                                                transform: `scale(${sticker.scale || 1}) rotate(${sticker.rotate || 0}deg)`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {sticker.emoji.startsWith('/') ? (
                                                <img src={sticker.emoji} style={{ width: '1em', height: '1em', objectFit: 'contain' }} alt="sticker" />
                                            ) : sticker.emoji}
                                        </div>
                                    ))}

                                    {/* Rank */}
                                    <div style={{ position: 'absolute', left: rX, top: rY, zIndex: 10 }}>
                                        <span className={styles.rankNumber} style={{
                                            color: user.customize?.rankStyle?.color || (user.rank <= 3 ? '#ca8a04' : '#94a3b8'),
                                            fontSize: user.customize?.rankStyle?.fontSize ? `${user.customize.rankStyle.fontSize}px` : (isFirst ? '1.75rem' : '1.25rem'),
                                            lineHeight: 1
                                        }}>
                                            #{user.rank}
                                        </span>
                                    </div>

                                    {/* Badge */}
                                    <div style={{ position: 'absolute', left: bX, top: bY, zIndex: 10 }}>
                                        <div style={{
                                            fontSize: user.customize?.badgeStyle?.fontSize ? `${user.customize.badgeStyle.fontSize}px` : '1.5rem',
                                            lineHeight: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {user.badge?.startsWith('/') ? (
                                                <div style={{
                                                    background: getBadgeStyles(user.badge).bg,
                                                    border: `3px solid ${getBadgeStyles(user.badge).border}`,
                                                    borderRadius: '22%',
                                                    width: '1em',
                                                    height: '1em',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden'
                                                }}>
                                                    <img
                                                        src={user.badge}
                                                        style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }}
                                                        alt="badge"
                                                    />
                                                </div>
                                            ) : (user.badge || '')}
                                        </div>
                                    </div>

                                    {/* Nickname */}
                                    <div style={{ position: 'absolute', left: nX, top: nY, zIndex: 10 }}>
                                        <div
                                            className={styles.rankNickname}
                                            style={{
                                                color: user.nicknameStyle?.color || '#1e293b',
                                                fontWeight: user.nicknameStyle?.bold ? 800 : 500,
                                                fontStyle: user.nicknameStyle?.italic ? 'italic' : 'normal',
                                                textDecoration: user.nicknameStyle?.underline ? 'underline' : 'none',
                                                fontSize: user.nicknameStyle?.fontSize ? `${user.nicknameStyle.fontSize}px` : '1.1rem',
                                                lineHeight: 1,
                                                whiteSpace: 'nowrap',
                                                paddingRight: user.nicknameStyle?.italic ? '0.2em' : '0'
                                            }}
                                        >
                                            {user.nickname}
                                        </div>
                                    </div>

                                    {/* Points */}
                                    <div style={{ position: 'absolute', left: pX, top: pY, zIndex: 10 }}>
                                        <div className={styles.pointsBox} style={{
                                            background: user.customize?.pointStyle?.background || 'linear-gradient(90deg, #ffedd5, #fef3c7)',
                                            color: user.customize?.pointStyle?.color || '#ea580c',
                                            border: user.customize?.pointStyle?.borderWidth ? `${user.customize.pointStyle.borderWidth}px solid ${user.customize.pointStyle.borderColor}` : 'none',
                                            padding: '0.5rem 0.8rem',
                                            margin: 0
                                        }}>
                                            <IconZap color={user.customize?.pointStyle?.color || '#ea580c'} />
                                            <span className={styles.points} style={{
                                                color: user.customize?.pointStyle?.color || '#ea580c',
                                                fontSize: user.customize?.pointStyle?.fontSize ? `${user.customize.pointStyle.fontSize}px` : '1.1rem'
                                            }}>{user.point.toLocaleString()}P</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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

/**
 * 뱃지 스타일 헬퍼 (배경색 및 테두리 색상)
 */
const getBadgeStyles = (path: string) => {
    if (path.includes('tralallero')) return { bg: '#FFD700', border: '#1D4ED8' }; // Yellow
    if (path.includes('tungtung')) return { bg: '#D1FAE5', border: '#7C2D12' }; // Mint green
    if (path.includes('ballerina')) return { bg: '#DDD6FE', border: '#DB2777' }; // Lavender
    if (path.includes('bombardiro')) return { bg: '#FFEDD5', border: '#374151' }; // Orange
    if (path.includes('assassino')) return { bg: '#E0F2FE', border: '#000000' }; // SkyBlue
    return { bg: '#f1f5f9', border: '#e2e8f0' };
};
