import type { Metadata } from 'next';
import ClawGame from '@contents/claw/app/claw-game';

import MyorokBanner from '@/components/common/banners/myorok-banner';
import RankingSection from '@contents/claw/app/ranking-section';
import styles from '@contents/claw/app/page.module.css';

export const metadata: Metadata = {
  title: '인형뽑기 | 하루상자',
  description: '하루상자 인형뽑기 게임에서 다양한 캐릭터와 아이템을 즐기세요. 간편하게 참여하고 바로 뽑기의 재미를 경험할 수 있습니다.',
  keywords: [
    '인형뽑기', '온라인 인형뽑기', 'Claw Machine', 'UFO Catcher',
    '랜덤 게임', '뽑기', '미니게임', '캐주얼 게임', '무료 게임',
    '아케이드', '하루상자', 'Haroo Box'
  ],
  alternates: {
    canonical: 'https://box.haroo.site/claw',
  },
  openGraph: {
    title: '인형뽑기 | 하루상자',
    description: '하루상자 인형뽑기 게임에서 다양한 캐릭터와 아이템을 즐기세요.',
    url: 'https://box.haroo.site/claw',
    images: [
      {
        url: '/images/claw-og.png',
        width: 1200,
        height: 630,
        alt: '하루상자 인형뽑기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '인형뽑기 | 하루상자',
    description: '하루상자 인형뽑기 게임에서 다양한 캐릭터와 아이템을 즐기세요.',
    images: ['/images/claw-og.png'],
  },
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
    <div className={styles.main}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Game Section (Immediate Play) */}
      <ClawGame />

      {/* 3. Ranking Section */}
      <RankingSection />

      {/* 4. Myorok Banner (Cross Promotion) */}
      <div style={{ maxWidth: '480px', width: '100%', margin: '0 auto', paddingBottom: '2rem' }}>
        <MyorokBanner />
      </div>
    </div>
  );
}
