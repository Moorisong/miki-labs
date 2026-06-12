'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import HeroSection from '@/components/puzzle/hero-section';
import RankingPreview from '@/components/puzzle/ranking-preview';
import ShareCard from '@/components/puzzle/share-card';
import StatsCard from '@/components/puzzle/stats-card';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './puzzle-layout.module.css';
import KakaoAdfit, { ADFIT_SIZES, ADFIT_UNITS } from '@/components/ads/kakao-adfit';
import OrientationSuggestion from '@/components/puzzle/orientation-suggestion';
import { usePuzzleDashboard } from './hooks/use-puzzle-dashboard';

export default function PuzzlePageClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.kakaoId;

  const {
    rankings,
    isRankingLoading,
    currentPuzzle,
    totalPuzzles,
    hasSavedGame,
    savedProgress,
    savedDifficulty,
    hasCompleted,
    completedDifficulty,
    completedDifficulties,
    previewDiff,
    setPreviewDiff,
    isPuzzleLoading,
    serviceStats,
  } = usePuzzleDashboard(token);

  const handleStart = (difficulty: 'novice' | 'beginner' | 'expert') => {
    if (!currentPuzzle) return;
    router.push(`/puzzle/play/${currentPuzzle._id}?diff=${difficulty}&mode=ranked`);
  };

  const handleResume = () => {
    if (!currentPuzzle) return;
    router.push(`/puzzle/play/${currentPuzzle._id}?resume=true`);
  };

  if (isPuzzleLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] flex-col gap-3 font-semibold">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--puzzle-primary) var(--puzzle-primary) var(--puzzle-primary) transparent' }} />
        <span style={{ color: 'var(--puzzle-muted-foreground)' }}>아름다운 퍼즐 조각을 불러오는 중...</span>
      </div>
    );
  }

  if (!currentPuzzle) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] flex-col gap-2 select-none">
        <span className="text-3xl">🧘</span>
        <p className="text-sm font-bold" style={{ color: 'var(--puzzle-muted-foreground)' }}>이번 주 출제된 퍼즐이 없습니다.</p>
        <Link href="/puzzle/archive" className="mt-4 px-5 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold shadow hover:bg-blue-600 transition-all">아카이브로 이동</Link>
      </div>
    );
  }

  return (
    <>
      <OrientationSuggestion />
      <div className={`${styles.container} puzzle-animate-fade-in-up`}>
        {/* Hero Section */}
        <div className="mb-10">
        <HeroSection
          puzzle={currentPuzzle}
          onStart={handleStart}
          onResume={handleResume}
          hasSavedGame={hasSavedGame}
          progress={savedProgress}
          savedDifficulty={savedDifficulty}
          isLoggedIn={!!token}
          hasCompleted={hasCompleted}
          completedDifficulty={completedDifficulty}
          completedDifficulties={completedDifficulties}
        />
      </div>

      {/* Main Bottom Grid (align items to start to prevent stretching height) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 mt-6 md:mt-10 items-start">
        {/* Top 5 Rankings */}
        <div className="md:col-span-2">
          <RankingPreview 
            rankings={rankings} 
            isLoading={isRankingLoading} 
            difficulty={previewDiff}
            onDifficultyChange={setPreviewDiff}
          />
        </div>

        {/* Share & Stats Cards */}
        <div className="flex flex-col gap-4">
          <ShareCard puzzle={currentPuzzle} />
          
          <StatsCard 
            participantCount={currentPuzzle.participantCount} 
            totalPlayCount={serviceStats?.totalPlayCount ?? 0}
            totalPuzzles={totalPuzzles} 
            completionRate={serviceStats?.completionRate ?? '0%'} 
          />

        {/* Archive teaser */}
        <Link
          href="/puzzle/archive"
          className="flex items-center justify-between px-5 py-4 rounded-2xl border transition-all duration-200 group"
          style={{
            backgroundColor: 'var(--puzzle-glass-bg)',
            backdropFilter: 'var(--puzzle-glass-blur)',
            borderColor: 'var(--puzzle-border)',
            boxShadow: 'var(--puzzle-shadow-sm)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--puzzle-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--puzzle-border)'; }}
        >
          <div>
            <p className="text-sm font-extrabold" style={{ color: 'var(--puzzle-card-foreground)' }}>
              지난 아카이브 퍼즐 보기
            </p>
            <p className="text-[10px] font-bold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
              이전 주차 퍼즐 플레이 목록
            </p>
          </div>
          <ArrowRight size={18} strokeWidth={2.5} style={{ color: 'var(--puzzle-primary)' }} />
        </Link>
      </div>
      </div>
      
      {/* 최하단 광고 배너 */}
      <div className="flex justify-center mt-12 w-full">
        <div className="block sm:hidden">
          <KakaoAdfit unit={ADFIT_UNITS.MAIN_BANNER} {...ADFIT_SIZES.BANNER_320x100} />
        </div>
        <div className="hidden sm:block">
          <KakaoAdfit unit={ADFIT_UNITS.MAIN_BANNER} {...ADFIT_SIZES.BANNER_728x90} />
        </div>
      </div>
    </div>
    </>
  );
}
