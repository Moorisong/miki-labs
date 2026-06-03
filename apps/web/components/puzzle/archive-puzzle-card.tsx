'use client';

import { Play, Users, Calendar, Trophy } from 'lucide-react';
import Link from 'next/link';
import { Puzzle } from '@/types/puzzle';

interface ArchivePuzzleCardProps {
  puzzle: Puzzle;
  status: 'current' | 'completed' | 'missed';
  myTime: string | null;
  myRank: number | null;
  isHistoryLoaded?: boolean;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  current: { label: '진행 중', color: '#4F8EF7', bg: '#EBF2FF' },
  completed: { label: '완주 완료', color: '#22C55E', bg: '#E8F5E9' },
  missed: { label: '미참여', color: '#777777', bg: '#F5F5F7' },
};

export default function ArchivePuzzleCard({
  puzzle,
  status,
  myTime,
  myRank,
  isHistoryLoaded = false,
}: ArchivePuzzleCardProps) {
  const currentStatus = STATUS_LABELS[status] || STATUS_LABELS.missed;

  const formatDateRange = (startStr: string, endStr: string) => {
    try {
      const start = new Date(startStr);
      const end = new Date(endStr);
      return `${start.getFullYear()}.${String(start.getMonth() + 1).padStart(2, '0')}.${String(start.getDate()).padStart(2, '0')} ~ ${String(end.getMonth() + 1).padStart(2, '0')}.${String(end.getDate()).padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all duration-300 group"
      style={{
        backgroundColor: 'var(--puzzle-glass-bg)',
        backdropFilter: 'var(--puzzle-glass-blur)',
        borderColor: 'var(--puzzle-border)',
        boxShadow: 'var(--puzzle-shadow-md)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--puzzle-shadow-lg)';
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'var(--puzzle-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--puzzle-shadow-md)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--puzzle-border)';
      }}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden h-44">
        <img
          src={puzzle.imageUrl}
          alt={puzzle.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {/* Status Badge */}
        {isHistoryLoaded && (
          <span
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm"
            style={{
              backgroundColor: currentStatus.bg,
              color: currentStatus.color,
            }}
          >
            {currentStatus.label}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col justify-between" style={{ minHeight: '210px' }}>
        <div>
          <h3 
            className="text-base font-extrabold line-clamp-1 mb-2"
            style={{ color: 'var(--puzzle-card-foreground)' }}
          >
            {puzzle.title}
          </h3>

          <div className="flex flex-col gap-1.5 mb-4">
            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--puzzle-muted-foreground)' }}>
              <Calendar size={13} />
              <span>{formatDateRange(puzzle.startDate, puzzle.endDate)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--puzzle-muted-foreground)' }}>
              <Users size={13} />
              <span>{puzzle.participantCount.toLocaleString()}명 완주</span>
            </div>
          </div>
        </div>

        <div>
          {/* My records if exist */}
          {myTime && (
            <div 
              className="flex items-center justify-between p-3 rounded-xl mb-4 text-xs font-bold"
              style={{ backgroundColor: 'var(--puzzle-muted)', border: '1px solid var(--puzzle-border)' }}
            >
              <span className="flex items-center gap-1" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                <Trophy size={13} style={{ color: '#F59E0B' }} /> 내 기록
              </span>
              <span style={{ color: 'var(--puzzle-card-foreground)' }}>
                {myTime} {myRank ? `(${myRank}위)` : ''}
              </span>
            </div>
          )}

          {/* Action Button */}
          <Link
            href={`/puzzle/play/${puzzle._id}`}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-extrabold text-white transition-all duration-200"
            style={{ backgroundColor: 'var(--puzzle-primary)' }}
          >
            <Play size={13} strokeWidth={2.5} />
            <span>퍼즐 플레이</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
