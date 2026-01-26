import Link from 'next/link';
import NextImage from 'next/image';

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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: '뽑기중독',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    description: '뽑기중독은 실제 인형뽑기 기계의 조작감을 웹에서 구현한 3D 인형뽑기 게임입니다. 물리엔진 기반 집게 조작으로 위치와 타이밍에 따라 결과가 달라집니다.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '124',
    },
    keywords: '인형뽑기, 인형뽑기 게임, 캐주얼 게임, 웹 게임, 미니게임, 감성 콘텐츠, 놀이형 서비스, 뽑기, 게임',
  };

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <span className={styles.titleLine}>리얼한 손맛의</span>
            <span className={styles.titleHighlight}>웹 인형뽑기 게임</span>
          </h1>
          <p className={styles.heroDescription}>
            뽑기중독은 실제 인형뽑기 기계의 조작감을
            <br />
            웹에서 구현한 3D 인형뽑기 게임입니다.
            <br />
            <br />
            앞으로 다양한 미니게임과
            <br />
            아기자기한 놀이 콘텐츠가 순차적으로 추가될 예정입니다.
          </p>
          <div className={styles.heroCta}>
            <Link href={ROUTES.GAME} className={styles.primaryButton}>
              {MESSAGES.CTA.START_NOW}
            </Link>
          </div>
        </div>
        <Link href={ROUTES.GAME} className={styles.heroVisual}>
          <NextImage
            src="/hero_character.png"
            alt="인형뽑기 게임 캐릭터"
            width={500}
            height={400}
            className={styles.heroImage}
            priority
          />
        </Link>
      </section>

      {/* Ad Section */}
      <div className={styles.adSection}>
        <AdBanner />
      </div>

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

    </div>
  );
}
