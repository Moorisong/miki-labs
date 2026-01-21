import type { Metadata } from 'next';
import { RankingEntry } from '@/lib/api/types';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: '랭킹 | 뽑기중독',
  description: '뽑기중독 플레이어들의 랭킹을 확인하세요. 최고의 인형뽑기 마스터가 되어보세요!',
  openGraph: {
    title: '랭킹 | 뽑기중독',
    description: '뽑기중독 플레이어들의 랭킹을 확인하세요.',
  },
};

// 서버 컴포넌트에서 내부 API 호출
async function getRankings(): Promise<RankingEntry[]> {
  try {
    // 서버 컴포넌트에서는 절대 URL 필요
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/ranking/top?limit=100`,
      {
        cache: 'no-store', // 항상 최신 데이터 조회
      }
    );
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch rankings:', error);
    return [];
  }
}

function getRankMedal(rank: number): string | null {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return null;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default async function RankingPage() {
  const rankings = await getRankings();
  const hasData = rankings.length > 0;
  const totalPages = Math.ceil(rankings.length / 10);
  const currentPage = 1; // 서버 컴포넌트이므로 첫 페이지만 표시 (추후 클라이언트 컴포넌트로 전환 시 페이지네이션 구현)
  const displayRankings = rankings.slice(0, 10);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>랭킹</h1>
        <p className={styles.subtitle}>
          전국 최고의 인형뽑기 마스터들을 확인하세요!
        </p>
      </header>

      {!hasData ? (
        <section className={styles.emptyState}>
          <p className={styles.emptyText}>아직 등록된 랭킹이 없습니다.</p>
          <p className={styles.emptySubtext}>첫 번째 랭킹의 주인공이 되어보세요!</p>
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
                <span className={styles.topMedal}>{getRankMedal(player.rank)}</span>
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
                <span className={styles.colRank}>순위</span>
                <span className={styles.colNickname}>닉네임</span>
                <span className={styles.colScore}>점수</span>
                <span className={styles.colCatches}>성공</span>
                <span className={styles.colDate}>날짜</span>
              </div>
              <div className={styles.tableBody}>
                {displayRankings.map((player, index) => (
                  <div
                    key={`row-${player.oderId || index}`}
                    className={`${styles.tableRow} ${player.rank <= 3 ? styles.highlight : ''}`}
                  >
                    <span className={styles.colRank}>
                      {getRankMedal(player.rank) || player.rank}
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
                  이전
                </button>
                <div className={styles.pageNumbers}>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`${styles.pageNumber} ${page === currentPage ? styles.active : ''}`}
                    >
                      {page}
                    </button>
                  ))}
                  {totalPages > 5 && (
                    <>
                      <span className={styles.pageDots}>...</span>
                      <button className={styles.pageNumber}>{totalPages}</button>
                    </>
                  )}
                </div>
                <button className={styles.pageButton} disabled={currentPage === totalPages}>
                  다음
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
