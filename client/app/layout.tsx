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
    default: '뽑기중독 | 리얼한 웹 인형뽑기 게임',
    template: '%s | 뽑기중독',
  },
  description: '뽑기중독은 실제 인형뽑기 기계의 조작감을 웹에서 구현한 3D 인형뽑기 게임입니다. 물리엔진 기반 집게 조작으로 위치와 타이밍에 따라 결과가 달라집니다.',
  keywords: ['인형뽑기', '인형뽑기 게임', '캐주얼 게임', '웹 게임', '미니게임', '감성 콘텐츠', '놀이형 서비스', '뽑기', '게임', 'claw machine', 'crane game', 'arcadegame'],
  authors: [{ name: '뽑기중독' }],
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
    title: '뽑기중독 | 리얼한 웹 인형뽑기 게임',
    description: '리얼한 물리 엔진으로 즐기는 웹 인형뽑기 게임',
    url: 'https://claw-addict-web.haroo.site',
    type: 'website',
    locale: 'ko_KR',
    siteName: '뽑기중독',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '뽑기중독 게임 화면',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '뽑기중독 | 리얼한 웹 인형뽑기 게임',
    description: '리얼한 물리 엔진으로 즐기는 웹 인형뽑기 게임',
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
            <main style={{ paddingTop: '64px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              {children}
            </main>
            <Footer />
          </NicknameProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
