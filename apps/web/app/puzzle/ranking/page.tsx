'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Trophy, Clock, Users, Calendar } from 'lucide-react';
import { fetchCurrentPuzzle, fetchCurrentRankings, fetchMyRanking } from '@/lib/puzzle-api';
import { Puzzle, RankingEntry, MyRanking } from '@/types/puzzle';
import RankingTable from '@/components/puzzle/ranking-table';
import MyRankingCard from '@/components/puzzle/my-ranking-card';
import PercentileChart from '@/components/puzzle/percentile-chart';
import Link from 'next/link';
import styles from '../puzzle-layout.module.css';

export default function RankingPage() {
  const { data: session } = useSession();
  const token = session?.user?.kakaoId;

  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [myRanking, setMyRanking] = useState<MyRanking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRankings() {
      try {
        // 1. 현재 활성 퍼즐 조회
        const res = await fetchCurrentPuzzle();
        if (res.success && res.data) {
          setCurrentPuzzle(res.data);
          const pId = res.data._id;

          // 2. 전체 랭킹 조회
          const rankRes = await fetchCurrentRankings(pId);
          if (rankRes.success && rankRes.data) {
            setRankings(rankRes.data);
          }

          // 3. 내 랭킹 조회 (로그인 시)
          if (token) {
            const myRankRes = await fetchMyRanking(pId, token);
            if (myRankRes.success && myRankRes.data) {
              setMyRanking(myRankRes.data);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load ranking details:', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadRankings();
  }, [token]);

  const getDaysLeft = (endDateStr: string) => {
    try {
      const end = new Date(endDateStr).getTime();
      const diff = end - Date.now();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days > 0 ? `${days}일 남음` : '종료 임박';
    } catch {
      return '';
    }
  };

  const getFormatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}월 ${Math.ceil(date.getDate() / 7)}주차`;
    } catch {
      return '주간 대회';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] flex-col gap-3 font-semibold">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--puzzle-primary) var(--puzzle-primary) var(--puzzle-primary) transparent' }} />
        <span style={{ color: 'var(--puzzle-muted-foreground)' }}>주간 랭킹 보드를 동기화하는 중...</span>
      </div>
    );
  }

  if (!currentPuzzle) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] flex-col gap-2 select-none">
        <span className="text-3xl">🏆</span>
        <p className="text-sm font-bold" style={{ color: 'var(--puzzle-muted-foreground)' }}>현재 등록된 주간 랭킹 이벤트가 없습니다.</p>
        <Link href="/puzzle" className="mt-4 px-5 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold shadow hover:bg-blue-600 transition-all">메인 페이지</Link>
      </div>
    );
  }

  return (
    <div className={`${styles.container} puzzle-animate-fade-in-up`}>
      {/* Page Title Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2 mb-1.5" style={{ color: 'var(--puzzle-card-foreground)' }}>
          <Trophy size={28} style={{ color: '#F59E0B' }} />
          주간 랭킹 경쟁
        </h1>
        <p className="text-sm font-semibold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
          {getFormatDate(currentPuzzle.startDate)} · {currentPuzzle.title}
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Table and Preview banner */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Puzzle Info Preview Banner */}
          <div
            className="flex items-center gap-4 p-4 rounded-2xl border overflow-hidden"
            style={{ 
              backgroundColor: 'var(--puzzle-glass-bg)', 
              backdropFilter: 'var(--puzzle-glass-blur)',
              borderColor: 'var(--puzzle-border)',
              boxShadow: 'var(--puzzle-shadow-sm)'
            }}
          >
            <img
              src={currentPuzzle.imageUrl}
              alt={currentPuzzle.title}
              className="w-20 h-14 object-cover rounded-xl flex-shrink-0 border"
              style={{ borderColor: 'var(--puzzle-border)' }}
            />
            <div className="flex-1 min-w-0">
              <p
                className="truncate mb-1 text-sm font-extrabold"
                style={{ color: 'var(--puzzle-card-foreground)' }}
              >
                {currentPuzzle.title}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                  <Users size={11} /> {currentPuzzle.participantCount.toLocaleString()}명 완주
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                  <Clock size={11} /> {getDaysLeft(currentPuzzle.endDate)}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                  <Trophy size={11} /> Beginner 난이도
                </span>
              </div>
            </div>
          </div>

          {/* Leaderboard Board */}
          <RankingTable
            rankings={rankings}
            myNickname={session?.user?.nickname || undefined}
            totalParticipants={rankings.length}
          />
        </div>

        {/* Right side: Personal record stats & charts */}
        <div className="flex flex-col gap-4">
          <MyRankingCard
            myRanking={myRanking}
            isLoggedIn={!!token}
          />

          <PercentileChart
            topPercent={myRanking ? myRanking.topPercent : null}
            totalParticipants={myRanking ? myRanking.totalParticipants : 0}
            myRank={myRanking ? myRanking.myRank : null}
          />
        </div>
      </div>
    </div>
  );
}
