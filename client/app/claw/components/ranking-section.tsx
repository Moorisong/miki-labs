import Link from 'next/link';
import { getDatabase } from '@/lib/mongodb';
import { CONFIG, MESSAGES, ROUTES, MEDALS } from '@/constants';
import styles from './ranking-section.module.css';

interface RankEntry {
    rank: number;
    nickname: string;
    score: number;
    date: string;
}

async function getTopRankings(): Promise<RankEntry[]> {
    try {
        const db = await getDatabase();
        const scores = db.collection('scores');

        const rankings = await scores
            .find({})
            .sort({ score: -1, createdAt: 1 })
            .limit(CONFIG.PAGINATION.TOP_RANKINGS || 5)
            .toArray();

        return rankings.map((entry, index) => ({
            rank: index + 1,
            nickname: entry.nickname || 'Unknown',
            score: entry.score,
            date: entry.createdAt ? new Date(entry.createdAt).toISOString().split('T')[0] : '',
        }));
    } catch (error) {
        console.error('랭킹 조회 오류:', error);
        return [];
    }
}

export default async function RankingSection() {
    const topRankings = await getTopRankings();

    return (
        <section className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>🏆 명예의 전당</h2>
                <Link href={ROUTES.RANKING} className={styles.viewAllLink}>
                    {MESSAGES.RANKING.VIEW_ALL}
                </Link>
            </div>

            <div className={styles.table}>
                <div className={styles.tableHeader}>
                    <span>{MESSAGES.TABLE.RANK}</span>
                    <span>{MESSAGES.TABLE.NICKNAME}</span>
                    <span>{MESSAGES.TABLE.SCORE}</span>
                </div>

                {topRankings.length > 0 ? (
                    topRankings.map((player) => (
                        <div
                            key={player.rank}
                            className={`${styles.row} ${player.rank <= 3 ? styles.topThree : ''}`}
                        >
                            <span className={styles.rankNumber}>
                                {player.rank <= 3 ? (
                                    <span className={styles.medal}>{MEDALS[player.rank]}</span>
                                ) : (
                                    player.rank
                                )}
                            </span>
                            <span className={styles.nickname}>{player.nickname}</span>
                            <span className={styles.score}>{player.score.toLocaleString()}</span>
                        </div>
                    ))
                ) : (
                    <div className={styles.noData}>
                        {MESSAGES.RANKING.EMPTY}
                    </div>
                )}
            </div>
        </section>
    );
}
