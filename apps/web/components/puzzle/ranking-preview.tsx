'use client';

import { Trophy, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { RankingEntry } from '@/types/puzzle';

interface RankingPreviewProps {
  rankings: RankingEntry[];
  isLoading: boolean;
}

export default function RankingPreview({ rankings, isLoading }: RankingPreviewProps) {
  const getMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  // 최대 5명만 노출
  const displayRankings = rankings.slice(0, 5);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--puzzle-card-foreground)' }}>
          <Trophy size={18} style={{ color: 'var(--puzzle-primary)' }} />
          이번 주 랭킹 TOP 5
        </h2>
        <Link 
          href="/puzzle/ranking"
          className="flex items-center gap-0.5 text-sm font-bold transition-all duration-200"
          style={{ color: 'var(--puzzle-primary)' }}
        >
          <span>전체 보기</span>
          <ChevronRight size={14} strokeWidth={2.5} />
        </Link>
      </div>

      <div 
        className="rounded-2xl overflow-hidden flex-1 flex flex-col justify-center"
        style={{ 
          backgroundColor: 'var(--puzzle-glass-bg)',
          border: '1px solid var(--puzzle-border)',
          boxShadow: 'var(--puzzle-shadow-sm)'
        }}
      >
        {isLoading ? (
          // Shimmer loading
          Array.from({ length: 5 }).map((_, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-4 px-5 py-4 border-b last:border-0"
              style={{ borderColor: 'var(--puzzle-border)' }}
            >
              <div className="w-8 h-8 rounded bg-zinc-200 animate-pulse" />
              <div className="flex-1 h-4 bg-zinc-200 rounded animate-pulse" />
              <div className="w-12 h-4 bg-zinc-200 rounded animate-pulse" />
            </div>
          ))
        ) : displayRankings.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
            <span style={{ fontSize: '24px' }}>🧘</span>
            <p className="text-sm font-bold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
              아직 등록된 랭킹 기록이 없습니다.
            </p>
            <p className="text-xs" style={{ color: 'var(--puzzle-muted-foreground)' }}>
              첫 번째 도전자가 되어 기록을 등록해 보세요!
            </p>
          </div>
        ) : (
          displayRankings.map((item, idx) => {
            const medal = getMedal(item.rank);
            const avatarColor = ['#EBF2FF', '#FFF3E0', '#E8F5E9', '#F3E8FF', '#FEF3C7'][idx] || '#F1F5F9';
            const textColor = ['#4F8EF7', '#F59E0B', '#22C55E', '#8B5CF6', '#F59E0B'][idx] || '#64748B';
            
            return (
              <div
                key={item.rank}
                className="flex items-center gap-4 px-5 py-4 border-b last:border-0 transition-colors duration-150"
                style={{ borderColor: 'var(--puzzle-border)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--puzzle-muted)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {/* Rank Medal / Number */}
                <div className="w-8 text-center">
                  {medal ? (
                    <span style={{ fontSize: '20px' }}>{medal}</span>
                  ) : (
                    <span className="text-sm font-extrabold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                      {item.rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold shadow-sm"
                  style={{
                    backgroundColor: avatarColor,
                    color: textColor,
                  }}
                >
                  {item.nickname?.[0]?.toUpperCase() ?? '?'}
                </div>

                {/* Nickname */}
                <span
                  className="flex-1 text-sm font-semibold"
                  style={{ color: 'var(--puzzle-card-foreground)' }}
                >
                  {item.nickname}
                </span>

                {/* Time */}
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ color: item.rank === 1 ? 'var(--puzzle-primary)' : 'var(--puzzle-foreground)' }}
                >
                  {formatDuration(item.completionTime)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
