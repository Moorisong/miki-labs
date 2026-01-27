import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import NavBar from '@/components/layout/nav-bar';
import Footer from '@/components/layout/footer';
import SessionProvider from '@/components/providers/session-provider';
import NicknameProvider from '@/components/providers/nickname-provider';

import AdBanner from '@/components/ads/ad-banner';
import Script from 'next/script';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://claw-addict-web.haroo.site'),
  title: {
    default: '하루상자 | 즐거움이 가득한 일일 콘텐츠 플랫폼',
    template: '%s | 하루상자',
  },
  description: '하루상자는 인형뽑기를 비롯해 다양한 미니콘텐츠를 즐길 수 있는 웹 플랫폼입니다. 매일 새로운 즐거움을 하루상자에서 만나보세요.',
  keywords: [
    // Brand
    '하루상자', 'Haroo Box', 'Haroo App',
    // Content
    '인형뽑기', '온라인 인형뽑기', 'Claw Machine', 'UFO Catcher', '랜덤 게임', '운세', '뽑기',
    // Genre
    '미니게임', '웹게임', '캐주얼 게임', '하이퍼 캐주얼', '아케이드', '무료 게임', '종합 게임', '플랫폼',
    // Vibe
    '심심풀이', '킬링타임', '힐링 게임', '감성 게임', '레트로', '뉴트로', '놀이형 서비스', '감성 콘텐츠',
    // Tech
    '3D 웹 게임', '모바일 웹 게임', '브라우저 게임', 'HTML5 게임'
  ],
  authors: [{ name: '하루상자' }],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: '하루상자 | 즐거움이 가득한 일일 콘텐츠 플랫폼',
    description: '하루상자는 인형뽑기를 비롯해 다양한 미니콘텐츠를 즐길 수 있는 웹 플랫폼입니다.',
    url: 'https://claw-addict-web.haroo.site',
    type: 'website',
    locale: 'ko_KR',
    siteName: '하루상자',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '하루상자 게임 화면',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '하루상자 | 즐거움이 가득한 일일 콘텐츠 플랫폼',
    description: '하루상자는 인형뽑기를 비롯해 다양한 미니콘텐츠를 즐길 수 있는 웹 플랫폼입니다.',
    images: ['/og-image.png'],
  },
  verification: {
    google: '46025c5df5a2c939',
    other: {
      'naver-site-verification': 'naverdf6af2d554af798e7a69e37a74d78c40.html',
    },
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Script
          src="https://nap5k.com/tag.min.js"
          data-zone="10521391"
        />
        <Script
          src="https://gizokraijaw.net/vignette.min.js"
          data-zone="10521394"
        />
        <SessionProvider>
          <NicknameProvider>
            <NavBar />
            <main className="main-content">
              {children}
            </main>
            <Footer />
          </NicknameProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
