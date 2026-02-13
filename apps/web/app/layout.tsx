import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import NavBar from '@/components/layout/nav-bar';
import Footer from '@/components/layout/footer';
import SessionProvider from '@/components/providers/session-provider';
import NicknameProvider from '@/components/providers/nickname-provider';

import AdScriptManager from '@/components/ads/ad-script-manager';
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
  metadataBase: new URL('https://box.haroo.site'),
  title: {
    default: '하루상자 | 즐거움이 가득한 일일 콘텐츠 플랫폼',
    template: '%s | 하루상자',
  },
  description: '하루상자는 인형뽑기를 비롯해 다양한 미니콘텐츠를 즐길 수 있는 웹 플랫폼입니다.',
  authors: [{ name: '하루상자' }],
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
    url: 'https://box.haroo.site',
    type: 'website',
    locale: 'ko_KR',
    siteName: '하루상자',
  },
  twitter: {
    card: 'summary_large_image',
    title: '하루상자 | 즐거움이 가득한 일일 콘텐츠 플랫폼',
    description: '하루상자는 인형뽑기를 비롯해 다양한 미니콘텐츠를 즐길 수 있는 웹 플랫폼입니다.',
  },
  verification: {
    google: '46025c5df5a2c939',
    other: {
      'naver-site-verification': 'naverdf6af2d554af798e7a69e37a74d78c40.html',
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          strategy="lazyOnload"
        />
        <AdScriptManager />
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
