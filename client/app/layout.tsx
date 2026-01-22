import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import NavBar from '@/components/layout/nav-bar';
import Footer from '@/components/layout/footer';
import SessionProvider from '@/components/providers/session-provider';
import NicknameProvider from '@/components/providers/nickname-provider';
import AdBanner from '@/components/ads/ad-banner';
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
  title: '뽑기중독 | 리얼한 웹 인형뽑기 게임',
  description: '리얼한 물리 엔진으로 즐기는 웹 인형뽑기 게임. 실제 인형뽑기의 손맛을 느껴보세요!',
  keywords: ['인형뽑기', '뽑기', '게임', '웹게임', 'claw machine', 'crane game'],
  authors: [{ name: '뽑기중독' }],
  openGraph: {
    title: '뽑기중독 | 리얼한 웹 인형뽑기 게임',
    description: '리얼한 물리 엔진으로 즐기는 웹 인형뽑기 게임',
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SessionProvider>
          <NicknameProvider>
            <NavBar />
            <main style={{ paddingTop: '64px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              {children}
              <div style={{ marginTop: 'auto', width: '100%' }}>
                <AdBanner />
              </div>
            </main>
            <Footer />
          </NicknameProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
