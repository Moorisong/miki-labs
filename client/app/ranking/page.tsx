import type { Metadata } from 'next';

import type { RankingEntry } from '@/lib/api/types';
import { getDatabase } from '@/lib/mongodb';
import { MESSAGES, MEDALS, CONFIG } from '@/constants';

import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '랭킹 | 뽑기중독',
  description: '뽑기중독 플레이어들의 랭킹을 확인하세요. 최고의 인형뽑기 마스터가 되어보세요!',
  openGraph: {
    title: '랭킹 | 뽑기중독',
    description: '뽑기중독 플레이어들의 랭킹을 확인하세요.',
  },
};

// 서버 컴포넌트에서 직접 DB 조회
async function getRankings(): Promise<RankingEntry[]> {
  try {
    const db = await getDatabase();
    const scores = db.collection('scores');

    // 점수 높은 순, 같은 점수면 먼저 달성한 순
    const rankings = await scores
      .find({})
      .sort({ score: -1, createdAt: 1 })
      .limit(CONFIG.GAME.RANKING_MAX_DISPLAY)
      .toArray();

    return rankings.map((entry, index) => ({
      rank: index + 1,
      oderId: entry.userId?.toString() || entry._id.toString(),
      nickname: entry.nickname || 'Unknown',
      score: entry.score,
      catches: entry.dollsCaught,
      createdAt: entry.createdAt ? new Date(entry.createdAt).toISOString() : new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to fetch rankings from DB:', error);
    return [];
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export default async function RankingPage() {
  const rankings = await getRankings();
  const hasData = rankings.length > 0;
  const totalPages = Math.ceil(rankings.length / CONFIG.PAGINATION.PAGE_SIZE);
  const currentPage = 1; // 서버 컴포넌트이므로 첫 페이지만 표시 (추후 클라이언트 컴포넌트로 전환 시 페이지네이션 구현)
  const displayRankings = rankings.slice(0, CONFIG.PAGINATION.PAGE_SIZE);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{MESSAGES.RANKING.TITLE}</h1>
        <p className={styles.subtitle}>
          {MESSAGES.RANKING.SUBTITLE}
        </p>
      </header>

      {!hasData ? (
        <section className={styles.emptyState}>
          <p className={styles.emptyText}>{MESSAGES.RANKING.EMPTY}</p>
          <p className={styles.emptySubtext}>{MESSAGES.RANKING.EMPTY_CTA}</p>
        </section>
      ) : (
        <>
          {/* 상위 3명 하이라이트 */}
          <section className={styles.topThree}>
            {rankings.slice(0, 3).map((player, index) => (
              <div
                key={`top-${player.oderId || index}`}
                className={`${styles.topCard} ${styles[`rank${player.rank}`]}`}
                style={{ order: index === 0 ? 1 : index === 1 ? 0 : 2 }}
              >
                <span className={styles.topMedal}>{MEDALS[player.rank]}</span>
                <span className={styles.topRank}>#{player.rank}</span>
                <h3 className={styles.topNickname}>{player.nickname}</h3>
                <p className={styles.topScore}>{player.score.toLocaleString()} pts</p>
                <p className={styles.topCatches}>{player.catches ?? 0}회 성공</p>
              </div>
            ))}
          </section>

          {/* 랭킹 테이블 */}
          <section className={styles.tableSection}>
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <span className={styles.colRank}>{MESSAGES.TABLE.RANK}</span>
                <span className={styles.colNickname}>{MESSAGES.TABLE.NICKNAME}</span>
                <span className={styles.colScore}>{MESSAGES.TABLE.SCORE}</span>
                <span className={styles.colCatches}>{MESSAGES.TABLE.CATCHES}</span>
                <span className={styles.colDate}>{MESSAGES.TABLE.DATE}</span>
              </div>
              <div className={styles.tableBody}>
                {displayRankings.map((player, index) => (
                  <div
                    key={`row-${player.oderId || index}`}
                    className={`${styles.tableRow} ${player.rank <= 3 ? styles.highlight : ''}`}
                  >
                    <span className={styles.colRank}>
                      {MEDALS[player.rank] || player.rank}
                    </span>
                    <span className={styles.colNickname}>{player.nickname}</span>
                    <span className={styles.colScore}>{player.score.toLocaleString()}</span>
                    <span className={styles.colCatches}>{player.catches ?? 0}</span>
                    <span className={styles.colDate}>{formatDate(player.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 페이지네이션 - 데이터가 10개 이상일 때만 표시 */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button className={styles.pageButton} disabled={currentPage === 1}>
                  {MESSAGES.RANKING.PREV}
                </button>
                <div className={styles.pageNumbers}>
                  {Array.from({ length: Math.min(totalPages, CONFIG.PAGINATION.MAX_PAGE_BUTTONS) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`${styles.pageNumber} ${page === currentPage ? styles.active : ''}`}
                    >
                      {page}
                    </button>
                  ))}
                  {totalPages > CONFIG.PAGINATION.MAX_PAGE_BUTTONS && (
                    <>
                      <span className={styles.pageDots}>...</span>
                      <button className={styles.pageNumber}>{totalPages}</button>
                    </>
                  )}
                </div>
                <button className={styles.pageButton} disabled={currentPage === totalPages}>
                  {MESSAGES.RANKING.NEXT}
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

