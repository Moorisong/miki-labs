import Link from 'next/link';

import { getDatabase } from '@/lib/mongodb';
import { ROUTES, MESSAGES, FEATURES, MEDALS, CONFIG } from '@/constants';
import AdBanner from '@/components/ads/ad-banner';

import styles from './page.module.css';

export const dynamic = 'force-dynamic';

// 랭킹 데이터 타입 정의
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

    // 점수 높은 순, 같은 점수면 먼저 달성한 순으로 5개만 가져오기
    const rankings = await scores
      .find({})
      .sort({ score: -1, createdAt: 1 })
      .limit(CONFIG.PAGINATION.TOP_RANKINGS)
      .toArray();

    return rankings.map((entry, index) => ({
      rank: index + 1,
      nickname: entry.nickname || 'Unknown',
      score: entry.score,
      date: entry.createdAt ? new Date(entry.createdAt).toISOString().split('T')[0] : '',
    }));
  } catch (error) {
    console.error('메인 랭킹 조회 오류:', error);
    return [];
  }
}

export default async function HomePage() {
  const topRankings = await getTopRankings();

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <span className={styles.titleLine}>리얼한 손맛의</span>
            <span className={styles.titleHighlight}>웹 인형뽑기</span>
          </h1>
          <p className={styles.heroDescription}>
            진짜 인형뽑기의 짜릿함을 웹에서 그대로!
            <br />
            물리 엔진 기반의 리얼한 크레인 게임을 즐겨보세요.
          </p>
          <div className={styles.heroCta}>
            <Link href={ROUTES.GAME} className={styles.primaryButton}>
              {MESSAGES.CTA.START_NOW}
            </Link>
          </div>
        </div>
        <Link href={ROUTES.GAME} className={styles.heroVisual}>
          <img
            src="/hero_character.png"
            alt="Claw Machine Character"
            className={styles.heroImage}
          />
        </Link>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>게임 특징</h2>
        <div className={styles.featureGrid}>
          {FEATURES.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mini Ranking Section */}
      <section className={styles.ranking}>
        <div className={styles.rankingHeader}>
          <h2 className={styles.sectionTitle}>TOP 5 랭킹</h2>
          <Link href={ROUTES.RANKING} className={styles.viewAllLink}>
            {MESSAGES.RANKING.VIEW_ALL}
          </Link>
        </div>
        <div className={styles.rankingTable}>
          <div className={styles.rankingHeader}>
            <span>{MESSAGES.TABLE.RANK}</span>
            <span>{MESSAGES.TABLE.NICKNAME}</span>
            <span>{MESSAGES.TABLE.SCORE}</span>
          </div>
          {topRankings.length > 0 ? (
            topRankings.map((player) => (
              <div
                key={player.rank}
                className={`${styles.rankingRow} ${player.rank <= 3 ? styles.topThree : ''}`}
              >
                <span className={styles.rankNumber}>
                  {player.rank <= 3 ? (
                    <span className={styles.medal}>
                      {MEDALS[player.rank]}
                    </span>
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
              {MESSAGES.RANKING.EMPTY} {MESSAGES.RANKING.EMPTY_CTA}
            </div>
          )}
        </div>
      </section>

      {/* Ad Section */}
      <div className={styles.adSection}>
        <AdBanner />
      </div>

    </div>
  );
}
