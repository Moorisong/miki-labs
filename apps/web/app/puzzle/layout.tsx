'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/puzzle/header';
import Footer from '@/components/puzzle/footer';
import '@/styles/puzzle-theme.css';

export default function PuzzleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPlayPage = pathname?.includes('/play/') ?? false;

  if (isPlayPage) {
    return (
      <div className="puzzle-page h-screen h-[100dvh] overflow-hidden flex flex-col">
        {children}
      </div>
    );
  }

  return (
    <div className="puzzle-page">
      <Header />
      <div style={{ minHeight: 'calc(100vh - 140px)' }}>{children}</div>
      <Footer />
    </div>
  );
}
