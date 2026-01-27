import type { Metadata } from 'next';
import ClawGame from '@contents/claw/app/claw-game';

import RankingSection from '@contents/claw/app/ranking-section';
import styles from '@contents/claw/app/page.module.css';

export const metadata: Metadata = {
  title: '하루상자 - 리얼 3D 인형뽑기 게임',
  description: '설치 없이 바로 즐기는 3D 웹 인형뽑기 게임. 물리엔진 기반의 리얼한 조작감으로 인형을 뽑아보세요!',
};

export default function ClawPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GameApplication',
    name: '하루상자',
    url: 'https://claw-addict.com/claw',
    applicationCategory: 'Game',
    operatingSystem: 'Any',
    genre: 'Simulation',
    description: '웹에서 즐기는 리얼한 3D 인형 뽑기 게임',
    image: 'https://claw-addict.com/og-image.png',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    audience: {
      '@type': 'PeopleAudience',
      suggestedMinAge: '12',
    },
  };

  return (
    <main className={styles.main}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Game Section (Immediate Play) */}
      <ClawGame />



      {/* 3. Ranking Section */}
      <RankingSection />


    </main>
  );
}
