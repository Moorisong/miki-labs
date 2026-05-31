'use client';

import { Puzzle as PuzzleIcon, Trophy } from 'lucide-react';

interface HistoryEntry {
  puzzleId: string;
  title: string;
  imageUrl: string;
  difficulty: 'beginner' | 'expert';
  completionTime: number;
  savedAt: string;
  completed: boolean;
  myRank?: number;
}

interface HistoryListProps {
  history: HistoryEntry[];
}

export default function HistoryList({ history }: HistoryListProps) {
  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {history.length === 0 ? (
        <div 
          className="rounded-2xl border p-8 text-center font-bold text-sm"
          style={{
            backgroundColor: 'var(--puzzle-glass-bg)',
            borderColor: 'var(--puzzle-border)',
            color: 'var(--puzzle-muted-foreground)'
          }}
        >
          아직 완성 기록 히스토리가 존재하지 않습니다.
        </div>
      ) : (
        history.map((item, idx) => {
          const isRanked = item.difficulty === 'beginner' && item.myRank;
          return (
            <div
              key={idx}
              className="flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200"
              style={{
                backgroundColor: 'var(--puzzle-glass-bg)',
                borderColor: 'var(--puzzle-border)',
                boxShadow: 'var(--puzzle-shadow-sm)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--puzzle-primary)';
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.boxShadow = 'var(--puzzle-shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--puzzle-border)';
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'var(--puzzle-shadow-sm)';
              }}
            >
              {/* Thumbnail */}
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-16 h-12 object-cover rounded-xl flex-shrink-0 border"
                style={{ borderColor: 'var(--puzzle-border)' }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold truncate mb-1" style={{ color: 'var(--puzzle-card-foreground)' }}>
                  {item.title}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                  <span>{formatDate(item.savedAt)}</span>
                  <span className="flex items-center gap-1">
                    <PuzzleIcon size={11} /> {item.difficulty === 'beginner' ? 'Beginner (100조각)' : 'Expert (256조각)'}
                  </span>
                </div>
              </div>

              {/* Record */}
              <div className="flex-shrink-0 text-right">
                <p className="tabular-nums text-sm font-black mb-1" style={{ color: 'var(--puzzle-card-foreground)' }}>
                  {formatDuration(item.completionTime)}
                </p>
                {isRanked ? (
                  <div
                    className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      backgroundColor: item.myRank! <= 10 ? '#E8F5E9' : 'var(--puzzle-muted)',
                      color: item.myRank! <= 10 ? '#22C55E' : 'var(--puzzle-muted-foreground)',
                    }}
                  >
                    <Trophy size={9} />
                    <span>{item.myRank}위</span>
                  </div>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--puzzle-muted)', color: 'var(--puzzle-muted-foreground)' }}>
                    일반 플레이
                  </span>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
