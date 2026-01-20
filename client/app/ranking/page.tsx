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

// 서버 컴포넌트에서 직접 fetch
async function getRankings(): Promise<RankingEntry[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/ranking/top?limit=100`,
      {
        next: { revalidate: 60 }, // 60초마다 재검증
      }
    );
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch rankings:', error);
    // 에러 발생 시 빈 배열 반환하여 페이지 크래시 방지 및 폴백 데이터 사용 유도
    return [];
  }
}

// 더미 데이터 (API 연결 실패 시 fallback)
const fallbackRankings: RankingEntry[] = [
  { rank: 1, userId: '1', nickname: 'ClawMaster', score: 15800, catches: 42, createdAt: '2024-01-15' },
  { rank: 2, userId: '2', nickname: '인형킹', score: 14200, catches: 38, createdAt: '2024-01-14' },
  { rank: 3, userId: '3', nickname: 'GamerPro', score: 13500, catches: 35, createdAt: '2024-01-13' },
  { rank: 4, userId: '4', nickname: '뽑기달인', score: 12800, catches: 33, createdAt: '2024-01-12' },
  { rank: 5, userId: '5', nickname: 'LuckyOne', score: 11900, catches: 31, createdAt: '2024-01-11' },
  { rank: 6, userId: '6', nickname: '크레인장인', score: 11200, catches: 29, createdAt: '2024-01-10' },
  { rank: 7, userId: '7', nickname: 'ToyHunter', score: 10500, catches: 27, createdAt: '2024-01-09' },
  { rank: 8, userId: '8', nickname: '인형수집가', score: 9800, catches: 25, createdAt: '2024-01-08' },
  { rank: 9, userId: '9', nickname: 'ClawKing99', score: 9200, catches: 24, createdAt: '2024-01-07' },
  { rank: 10, userId: '10', nickname: '뽑기신', score: 8600, catches: 22, createdAt: '2024-01-06' },
];

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
  let rankings = await getRankings();

  // API 연결 실패 시 fallback 데이터 사용
  if (rankings.length === 0) {
    rankings = fallbackRankings;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>랭킹</h1>
        <p className={styles.subtitle}>
          전국 최고의 인형뽑기 마스터들을 확인하세요!
        </p>
      </header>

      {/* 상위 3명 하이라이트 */}
      <section className={styles.topThree}>
        {rankings.slice(0, 3).map((player, index) => (
          <div
            key={player.userId}
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
            {rankings.map((player) => (
              <div
                key={player.userId}
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

        {/* 페이지네이션 (UI만) */}
        <div className={styles.pagination}>
          <button className={styles.pageButton} disabled>
            이전
          </button>
          <div className={styles.pageNumbers}>
            <button className={`${styles.pageNumber} ${styles.active}`}>1</button>
            <button className={styles.pageNumber}>2</button>
            <button className={styles.pageNumber}>3</button>
            <span className={styles.pageDots}>...</span>
            <button className={styles.pageNumber}>10</button>
          </div>
          <button className={styles.pageButton}>
            다음
          </button>
        </div>
      </section>
    </div>
  );
}
