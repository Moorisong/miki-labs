import Link from 'next/link';
import { getDatabase } from '@/lib/mongodb';
import styles from './page.module.css';

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
      .limit(5)
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

const features = [
  {
    icon: '🎯',
    title: '리얼한 물리 엔진',
    description: '실제 인형뽑기처럼 정교한 물리 시뮬레이션으로 진짜 손맛을 느껴보세요.',
  },
  {
    icon: '🏆',
    title: '랭킹 시스템',
    description: '전국의 플레이어들과 점수를 겨루고 최고의 자리에 도전하세요.',
  },
  {
    icon: '🧸',
    title: '다양한 인형',
    description: '귀여운 동물부터 캐릭터까지, 다양한 인형들을 뽑아보세요.',
  },
];

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
            <Link href="/game" className={styles.primaryButton}>
              지금 바로 시작하기
            </Link>
            <Link href="/about" className={styles.secondaryButton}>
              게임 소개
            </Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.clawMachine}>
            <div className={styles.machineBody}>
              <div className={styles.machineGlass}>
                <div className={styles.plushie} style={{ top: '60%', left: '20%' }}>🧸</div>
                <div className={styles.plushie} style={{ top: '65%', left: '45%' }}>🐰</div>
                <div className={styles.plushie} style={{ top: '55%', left: '70%' }}>🐻</div>
                <div className={styles.plushie} style={{ top: '70%', left: '35%' }}>🐱</div>
                <div className={styles.plushie} style={{ top: '60%', left: '60%' }}>🐶</div>
              </div>
              <div className={styles.claw}>
                <div className={styles.clawArm}></div>
                <div className={styles.clawGripper}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>게임 특징</h2>
        <div className={styles.featureGrid}>
          {features.map((feature, index) => (
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
          <Link href="/ranking" className={styles.viewAllLink}>
            전체 보기 →
          </Link>
        </div>
        <div className={styles.rankingTable}>
          <div className={styles.rankingHeader}>
            <span>순위</span>
            <span>닉네임</span>
            <span>점수</span>
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
                      {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
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
              아직 랭킹 정보가 없습니다. 첫 1등의 주인공이 되어보세요!
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>지금 바로 도전하세요!</h2>
        <p className={styles.ctaDescription}>
          무료로 즐기는 웹 인형뽑기, 당신의 실력을 보여주세요.
        </p>
        <Link href="/game" className={styles.ctaButton}>
          게임 시작
        </Link>
      </section>
    </div>
  );
}
