'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRankingStore } from '@/lib/stores/ranking-store';
import { fetchCurrentPuzzle, fetchArchivePuzzles, fetchServiceStats, fetchMyProgress, fetchMyProfile } from '@/lib/puzzle-api';
import { loadPuzzleState } from '@/lib/puzzle-db';
import { Puzzle } from '@/types/puzzle';
import HeroSection from '@/components/puzzle/hero-section';
import RankingPreview from '@/components/puzzle/ranking-preview';
import ShareCard from '@/components/puzzle/share-card';
import StatsCard from '@/components/puzzle/stats-card';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './puzzle-layout.module.css';

export default function PuzzlePageClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.kakaoId;
  const { rankings, isLoading: isRankingLoading, fetchRankings } = useRankingStore();
  
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [totalPuzzles, setTotalPuzzles] = useState(0);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [savedProgress, setSavedProgress] = useState(0);
  const [savedDifficulty, setSavedDifficulty] = useState<'novice' | 'beginner' | 'expert' | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [completedDifficulty, setCompletedDifficulty] = useState<'novice' | 'beginner' | 'expert' | null>(null);
  const [previewDiff, setPreviewDiff] = useState<'novice' | 'beginner' | 'expert'>('novice');
  const [isPuzzleLoading, setIsPuzzleLoading] = useState(true);
  const [serviceStats, setServiceStats] = useState<{ totalPlayCount: number; completionRate: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. 현재 주간 퍼즐 조회
        const res = await fetchCurrentPuzzle();
        if (res.success && res.data) {
          setCurrentPuzzle(res.data);

          // 2. 로컬 저장된 상태 확인 (이어하기 여부)
          const savedState = await loadPuzzleState(res.data._id);
          if (savedState && !savedState.completed) {
            setHasSavedGame(true);
            setSavedProgress(savedState.progress);
            setSavedDifficulty(savedState.difficulty);
          }
        }

        // 3. 아카이브 개수를 위한 전체 목록 조회
        const archiveRes = await fetchArchivePuzzles();
        if (archiveRes.success && archiveRes.data) {
          setTotalPuzzles(archiveRes.data.length);
        }

        // 4. 서비스 전체 통계 조회
        const statsRes = await fetchServiceStats();
        if (statsRes.success && statsRes.data) {
          setServiceStats(statsRes.data);
        }
      } catch (e) {
        console.error('Failed to load puzzle data:', e);
      } finally {
        setIsPuzzleLoading(false);
      }
    }

    loadData();
  }, []);

  // 서버로부터 진행 상황 동기화 및 완료 기록 조회
  useEffect(() => {
    if (!currentPuzzle || !token) return;
    const puzzleId = currentPuzzle._id;
    const userToken = token;

    async function syncUserStatus() {
      try {
        // 1. 서버의 진행 상황 조회 및 로컬 IndexedDB 싱크 맞춤
        const serverProgressRes = await fetchMyProgress(puzzleId, userToken);
        if (serverProgressRes.success && serverProgressRes.data) {
          const serverProgress = serverProgressRes.data.progress;
          const diff = serverProgressRes.data.detailState?.difficulty || 'beginner';
          
          // 로컬 진행상황 불러오기
          const localState = await loadPuzzleState(puzzleId);
          const localProgress = localState ? localState.progress : 0;
          
          // 서버 진행도가 로컬 진행도보다 더 크거나 같거나, 로컬 저장 기록이 없다면 서버 기준으로 동기화
          if (serverProgress > 0 && serverProgress < 100 && (serverProgress >= localProgress || !localState)) {
            setHasSavedGame(true);
            setSavedProgress(serverProgress);
            setSavedDifficulty(diff);
            
            // 로컬 IndexedDB도 서버에서 받아온 상세 상태로 덮어써서 싱크를 맞춥니다.
            if (serverProgressRes.data.detailState) {
              const s = serverProgressRes.data.detailState;
              const { savePuzzleState } = await import('@/lib/puzzle-db');
              await savePuzzleState(puzzleId, {
                difficulty: s.difficulty,
                mode: s.mode || 'solo',
                timerSeconds: s.timerSeconds || 0,
                pieces: s.pieces || [],
                board: s.board,
                trayPieces: s.trayPieces,
                progress: serverProgress,
                completed: false,
                startedAt: s.startedAt || new Date().toISOString(),
              }, true);
            }
          }
        }

        // 2. 완주한 이력이 있는지 조회
        const profileRes = await fetchMyProfile(userToken);
        if (profileRes.success && profileRes.data) {
          const currentHistory = profileRes.data.history.find(
            (h: any) => h.puzzleId === puzzleId && h.completed
          );
          if (currentHistory) {
            setHasCompleted(true);
            setCompletedDifficulty(currentHistory.difficulty);
            
            // 완주 확인 시 로컬 저장 데이터를 비교하여 정리
            try {
              const savedState = await loadPuzzleState(puzzleId);
              if (savedState) {
                const savedTime = savedState.updatedAt ? new Date(savedState.updatedAt).getTime() : 0;
                const completedTime = new Date(currentHistory.savedAt || 0).getTime();
                
                // 로컬 저장 상태의 최종 변경 시간이 완주 시간보다 이전인 경우만 삭제 (기존 진행분 찌꺼기)
                // 만약 완주 시간보다 이후라면, 완주 후 '다시 도전하기'로 새로 진행 중인 세션이므로 삭제하지 않음
                if (savedTime <= completedTime) {
                  const { deletePuzzleState } = await import('@/lib/puzzle-db');
                  await deletePuzzleState(puzzleId);
                  setHasSavedGame(false);
                }
              }
            } catch (err) {
              console.error('Failed to clear local puzzle state after sync:', err);
            }
          }
        }
      } catch (e) {
        console.error('Failed to sync user puzzle status:', e);
      }
    }

    syncUserStatus();
  }, [currentPuzzle, token, hasSavedGame]);

  useEffect(() => {
    if (currentPuzzle) {
      fetchRankings(currentPuzzle._id, previewDiff);
    }
  }, [currentPuzzle, previewDiff, fetchRankings]);

  const handleStart = (difficulty: 'novice' | 'beginner' | 'expert', mode: 'ranked' | 'solo') => {
    if (!currentPuzzle) return;
    // 난이도와 모드를 쿼리스트링에 실어 플레이 페이지로 이동
    router.push(`/puzzle/play/${currentPuzzle._id}?diff=${difficulty}&mode=${mode}`);
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
        />
      </div>

      {/* Main Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 mt-6 md:mt-10">
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
    </div>
  );
}
