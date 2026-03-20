"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { usePathname } from "next/navigation";

// 샘플 랭킹 데이터
const rankings = [
    { rank: 1, nickname: "영어왕", badge: "👑", points: 1250, borderColor: "linear-gradient(135deg, #facc15, #f97316)" },
    { rank: 2, nickname: "공부벌레", badge: "🔥", points: 1180, borderColor: "linear-gradient(135deg, #9ca3af, #6b7280)" },
    { rank: 3, nickname: "달리기선수", badge: "⚡", points: 1050, borderColor: "linear-gradient(135deg, #fb923c, #d97706)" },
    { rank: 4, nickname: "책벌레", badge: "📚", points: 980, borderColor: "linear-gradient(135deg, #60a5fa, #06b6d4)" },
    { rank: 5, nickname: "열정맨", badge: "💪", points: 920, borderColor: "linear-gradient(135deg, #c084fc, #ec4899)" },
    { rank: 6, nickname: "스타", badge: "⭐", points: 850, borderColor: "linear-gradient(135deg, #4ade80, #14b8a6)" },
    { rank: 7, nickname: "치코런", badge: "🎯", points: 780, borderColor: "linear-gradient(135deg, #f87171, #f43f5e)" },
    { rank: 8, nickname: "파이터", badge: "🥊", points: 720, borderColor: "linear-gradient(135deg, #818cf8, #3b82f6)" },
];

const IconBook = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

const IconTrophy = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#eab308" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
        <path d="M4 22h16"></path>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>
);

const IconMedal = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="#64748b" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"></path>
        <path d="M11 12 5.12 2.2"></path>
        <path d="m13 12 5.88-9.8"></path>
        <path d="M8 7h8"></path>
        <circle cx="12" cy="17" r="5"></circle>
        <polyline points="12 18 10.5 16.5 12 15 13.5 16.5 12 18"></polyline>
    </svg>
);

const IconAward = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="#ea580c" stroke="#c2410c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6"></circle>
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
    </svg>
);

const IconZap = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#f97316" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
);

const getRankIcon = (rank: number) => {
    switch (rank) {
        case 1: return <IconTrophy />;
        case 2: return <IconMedal />;
        case 3: return <IconAward />;
        default: return <span className={styles.rankNumber}>#{rank}</span>;
    }
};

export default function RankingPage() {
    const pathname = usePathname();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/chicorun" className={styles.headerLogo}>
                    <div className={styles.iconBox}>
                        <IconBook />
                    </div>
                    <span>하루상자</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'normal' }}>Haroo Box</span>
                </Link>
                <nav className={styles.navLinks}>
                    <Link href="/chicorun" className={pathname === "/chicorun" ? styles.activeLink : styles.navLink}>홈</Link>
                    <Link href="/chicorun/ranking" className={pathname === "/chicorun/ranking" ? styles.activeLink : styles.navLink}>랭킹</Link>
                    <Link href="/chicorun/customize" className={pathname === "/chicorun/customize" ? styles.activeLink : styles.navLink}>꾸미기</Link>
                </nav>
            </header>

            <main className={styles.main}>
                {/* 타이틀 */}
                <div className={styles.titleArea}>
                    <h1 className={styles.title}>🏆 랭킹</h1>
                    <p className={styles.subtitle}>최고 점수를 향해 달려보세요!</p>
                </div>

                {/* 랭킹 리스트 */}
                <div className={styles.rankingList}>
                    {rankings.map((user, index) => (
                        <div
                            key={user.rank}
                            className={styles.rankingItem}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div style={{ background: user.borderColor, padding: "4px" }}>
                                <div className={styles.itemInner} style={{ background: "white", borderRadius: "1.25rem" }}>

                                    {/* 순위 아이콘 */}
                                    <div className={styles.rankBadgeBox}>
                                        {getRankIcon(user.rank)}
                                    </div>

                                    {/* 프로필 카드 미리보기 */}
                                    <div className={styles.profilePreview} style={{ background: user.borderColor }}>
                                        <div className={styles.profilePreviewInner}>
                                            <span className={styles.badge}>{user.badge}</span>
                                            <span className={styles.nickname}>{user.nickname}</span>
                                        </div>
                                    </div>

                                    {/* 포인트 */}
                                    <div className={styles.pointsBox}>
                                        <IconZap />
                                        <span className={styles.points}>{user.points}P</span>
                                    </div>

                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 하단 정보 */}
                <div className={styles.hintText}>
                    💡 더 많은 문제를 풀고 랭킹을 올려보세요!
                </div>
            </main>
        </div>
    );
}
