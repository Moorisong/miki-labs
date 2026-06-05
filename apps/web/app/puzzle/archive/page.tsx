'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { fetchArchivePuzzles, fetchMyProfile } from '@/lib/puzzle-api';
import { Puzzle } from '@/types/puzzle';
import ArchiveGrid from '@/components/puzzle/archive-grid';
import Link from 'next/link';
import styles from '../puzzle-layout.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import KakaoAdfit, { ADFIT_SIZES, ADFIT_UNITS } from '@/components/ads/kakao-adfit';

export default function ArchivePage() {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.kakaoId;

  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [myHistory, setMyHistory] = useState<any[]>([]);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [bestRank, setBestRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    const container = scrollRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftArrow(scrollLeft > 8);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 8);
    }
  };

  useEffect(() => {
    if (puzzles.length > 0) {
      const timer = setTimeout(checkScroll, 200);
      window.addEventListener('resize', checkScroll);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [puzzles]);

  useEffect(() => {
    async function loadArchiveData() {
      try {
        let archivePuzzles: Puzzle[] = [];
        // 1. 아카이브 퍼즐 조회
        const res = await fetchArchivePuzzles();
        if (res.success && res.data) {
          archivePuzzles = res.data;
          setPuzzles(archivePuzzles);
        }

        // 2. 내 완주 기록 조회 (로그인 시)
        if (sessionStatus === 'authenticated' && token) {
          const profileRes = await fetchMyProfile(token);
          if (profileRes.success && profileRes.data) {
            const historyList = profileRes.data.history || [];
            setMyHistory(historyList);
            
            // 서버에서 퍼즐ID 기준 중복 제거된 완주 수를 그대로 사용 (마이페이지 통계와 통일)
            setTotalCompleted(profileRes.data.statistics.totalCompleted);
            setBestRank(profileRes.data.statistics.bestRank);
          }
          setIsHistoryLoaded(true);
        } else if (sessionStatus === 'unauthenticated') {
          setIsHistoryLoaded(true);
        }
      } catch (e) {
        console.error('Failed to load archive page data:', e);
      } finally {
        setIsLoading(false);
      }
    }

    if (sessionStatus !== 'loading') {
      loadArchiveData();
    }
  }, [token, sessionStatus]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] flex-col gap-3 font-semibold">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--puzzle-primary) var(--puzzle-primary) var(--puzzle-primary) transparent' }} />
        <span style={{ color: 'var(--puzzle-muted-foreground)' }}>아카이브 보관함을 열고 있습니다...</span>
      </div>
    );
  }

  // 퍼즐 데이터가 존재하는 월(1~12월) 목록 구하기 (1-indexed)
  const availableMonths = Array.from(
    new Set(
      puzzles.map((p) => {
        const d = new Date(p.startDate);
        return d.getMonth() + 1;
      })
    )
  ).sort((a, b) => a - b);

  // 선택된 월에 따라 퍼즐 필터링
  const filteredPuzzles = selectedMonth
    ? puzzles.filter((p) => {
        const d = new Date(p.startDate);
        return d.getMonth() + 1 === selectedMonth;
      })
    : puzzles;

  return (
    <div className={`${styles.container} puzzle-animate-fade-in-up`}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-1.5" style={{ color: 'var(--puzzle-card-foreground)' }}>
          퍼즐 아카이브
        </h1>
        <p className="text-sm font-semibold mb-3.5" style={{ color: 'var(--puzzle-muted-foreground)' }}>
          지난 주차들의 다양한 아름다운 퍼즐을 다시 플레이하고 도전을 이어나가 보세요.
        </p>
        <span className="inline-block text-[11px] font-extrabold px-3 py-1 rounded-full border" style={{ borderColor: 'var(--puzzle-border)', color: 'var(--puzzle-primary)', backgroundColor: 'var(--puzzle-glass-bg)' }}>
          ℹ️ 올해 출시된 아카이브 퍼즐만 표시됩니다.
        </span>
      </div>

      {/* Stats Summary row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: '전체 아카이브', value: `${puzzles.length}개` },
          { label: '내가 완성한 퍼즐', value: `${totalCompleted}개` },
          { label: '주간 최고 등수', value: bestRank ? `${bestRank}위` : '-' },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl border p-4 text-center"
            style={{ 
              backgroundColor: 'var(--puzzle-glass-bg)', 
              backdropFilter: 'var(--puzzle-glass-blur)',
              borderColor: 'var(--puzzle-border)',
              boxShadow: 'var(--puzzle-shadow-sm)' 
            }}
          >
            <p className="text-xl md:text-2xl font-black mb-0.5" style={{ color: 'var(--puzzle-card-foreground)' }}>
              {value}
            </p>
            <p className="text-[10px] font-bold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Monthly Filter Buttons Row */}
      {puzzles.length > 0 && (
        <div className="relative mb-8 group">
          {/* Left Scroll Indicator Arrow */}
          {showLeftArrow && (
            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 dark:bg-zinc-800/90 shadow-md flex items-center justify-center pointer-events-none md:hidden z-10 animate-pulse border border-zinc-200 dark:border-zinc-700">
              <ChevronLeft size={14} className="text-[var(--puzzle-primary)]" />
            </div>
          )}
          
          <div 
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex md:flex-wrap items-center gap-1.5 p-1.5 rounded-2xl border overflow-x-auto scrollbar-hide" 
            style={{ 
              backgroundColor: 'var(--puzzle-glass-bg)', 
              borderColor: 'var(--puzzle-border)' 
            }}
          >
            <button
              onClick={() => setSelectedMonth(null)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-[1.01] flex-shrink-0 ${
                selectedMonth === null
                  ? 'text-white'
                  : 'hover:text-[var(--puzzle-card-foreground)]'
              }`}
              style={
                selectedMonth === null 
                  ? { backgroundColor: 'var(--puzzle-primary)' } 
                  : { color: 'var(--puzzle-muted-foreground)' }
              }
            >
              전체
            </button>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
              const isAvailable = availableMonths.includes(m);
              const isSelected = selectedMonth === m;
              return (
                <button
                  key={m}
                  disabled={!isAvailable}
                  onClick={() => setSelectedMonth(m)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-[1.01] flex-shrink-0 ${
                    isSelected
                      ? 'text-white'
                      : isAvailable
                      ? 'hover:text-[var(--puzzle-card-foreground)]'
                      : 'opacity-20 cursor-not-allowed'
                  }`}
                  style={
                    isSelected 
                      ? { backgroundColor: 'var(--puzzle-primary)' } 
                      : { color: 'var(--puzzle-muted-foreground)' }
                  }
                >
                  {m}월
                </button>
              );
            })}
          </div>

          {/* Right Scroll Indicator Arrow */}
          {showRightArrow && (
            <div className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 dark:bg-zinc-800/90 shadow-md flex items-center justify-center pointer-events-none md:hidden z-10 animate-pulse border border-zinc-200 dark:border-zinc-700">
              <ChevronRight size={14} className="text-[var(--puzzle-primary)]" />
            </div>
          )}
        </div>
      )}

      {/* Adfit AD Banner (Placed above ArchiveGrid to catch attention naturally) */}
      <div className="mb-8 flex justify-center">
        <div className="block md:hidden">
          <KakaoAdfit unit={ADFIT_UNITS.MAIN_BANNER} {...ADFIT_SIZES.BANNER_320x100} />
        </div>
        <div className="hidden md:block">
          <KakaoAdfit unit={ADFIT_UNITS.MAIN_BANNER} {...ADFIT_SIZES.BANNER_728x90} />
        </div>
      </div>

      {/* Archive Grid */}
      {filteredPuzzles.length === 0 ? (
        <div className="py-20 text-center font-bold text-sm rounded-2xl border" style={{ color: 'var(--puzzle-muted-foreground)', backgroundColor: 'var(--puzzle-glass-bg)', borderColor: 'var(--puzzle-border)' }}>
          {selectedMonth ? `${selectedMonth}월에 발행된 아카이브 퍼즐이 없습니다.` : '아직 발행된 아카이브 퍼즐이 존재하지 않습니다.'}
        </div>
      ) : (
        <ArchiveGrid puzzles={filteredPuzzles} myHistory={myHistory} isHistoryLoaded={isHistoryLoaded} />
      )}
    </div>
  );
}
