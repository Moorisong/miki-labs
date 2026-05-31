'use client';

import { RankingEntry } from '@/types/puzzle';

interface RankingTableProps {
  rankings: RankingEntry[];
  myNickname?: string;
  totalParticipants: number;
}

export default function RankingTable({
  rankings,
  myNickname,
  totalParticipants,
}: RankingTableProps) {
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

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}.${date.getDate()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className="rounded-2xl border overflow-hidden flex flex-col"
      style={{
        backgroundColor: 'var(--puzzle-glass-bg)',
        backdropFilter: 'var(--puzzle-glass-blur)',
        borderColor: 'var(--puzzle-border)',
        boxShadow: 'var(--puzzle-shadow-sm)',
      }}
    >
      {/* Table Header */}
      <div
        className="grid grid-cols-12 gap-2 px-5 py-3 border-b"
        style={{ backgroundColor: 'var(--puzzle-muted)', borderColor: 'var(--puzzle-border)' }}
      >
        <span className="text-xs col-span-2 font-bold" style={{ color: 'var(--puzzle-muted-foreground)' }}>순위</span>
        <span className="text-xs col-span-5 font-bold" style={{ color: 'var(--puzzle-muted-foreground)' }}>닉네임</span>
        <span className="text-xs col-span-3 font-bold" style={{ color: 'var(--puzzle-muted-foreground)' }}>기록</span>
        <span className="text-xs col-span-2 font-bold" style={{ color: 'var(--puzzle-muted-foreground)' }}>저장일</span>
      </div>

      {/* Rows */}
      {rankings.length === 0 ? (
        <div className="py-20 text-center font-bold text-sm" style={{ color: 'var(--puzzle-muted-foreground)' }}>
          아직 랭킹에 도전한 사용자가 없습니다.
        </div>
      ) : (
        rankings.map((item, idx) => {
          const isMe = myNickname && item.nickname === myNickname;
          const medal = getMedal(item.rank);

          const avatarColor = [
            '#EBF2FF', '#FFF3E0', '#E8F5E9', '#F3E8FF', '#FEF3C7',
            '#FCE4EC', '#E0F7FA', '#FFF8E1', '#F3E5F5', '#E8EAF6',
            '#E0F2F1', '#FBE9E7',
          ][idx % 12] || '#F1F5F9';
          
          const textColor = [
            '#4F8EF7', '#F59E0B', '#22C55E', '#8B5CF6', '#F59E0B',
            '#EC4899', '#06B6D4', '#F59E0B', '#8B5CF6', '#6366F1',
            '#10B981', '#EF4444',
          ][idx % 12] || '#64748B';

          return (
            <div
              key={idx}
              className="grid grid-cols-12 gap-2 items-center px-5 py-4 border-b last:border-0 transition-colors"
              style={{
                borderColor: 'var(--puzzle-border)',
                backgroundColor: isMe ? 'var(--puzzle-secondary)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!isMe) e.currentTarget.style.backgroundColor = 'var(--puzzle-muted)';
              }}
              onMouseLeave={(e) => {
                if (!isMe) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {/* Rank */}
              <div className="col-span-2 flex items-center">
                {medal ? (
                  <span style={{ fontSize: '18px' }}>{medal}</span>
                ) : (
                  <span className="text-sm font-extrabold" style={{ color: 'var(--puzzle-muted-foreground)', paddingLeft: '4px' }}>
                    {item.rank}
                  </span>
                )}
              </div>

              {/* Nickname */}
              <div className="col-span-5 flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: avatarColor,
                    color: textColor,
                  }}
                >
                  {item.nickname[0].toUpperCase()}
                </div>
                <span
                  className="text-sm font-semibold truncate"
                  style={{ color: isMe ? 'var(--puzzle-primary)' : 'var(--puzzle-card-foreground)' }}
                >
                  {item.nickname}
                </span>
              </div>

              {/* Time */}
              <div className="col-span-3">
                <span
                  className="tabular-nums text-sm font-bold"
                  style={{ color: item.rank === 1 ? 'var(--puzzle-primary)' : 'var(--puzzle-foreground)' }}
                >
                  {formatDuration(item.completionTime)}
                </span>
              </div>

              {/* Date */}
              <div className="col-span-2">
                <span className="text-xs font-medium" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                  {formatDate(item.savedAt)}
                </span>
              </div>
            </div>
          );
        })
      )}

      {/* Footer Stat Row */}
      {totalParticipants > 0 && (
        <div
          className="px-5 py-3.5 text-center text-xs font-bold"
          style={{ 
            color: 'var(--puzzle-muted-foreground)', 
            borderTop: '1px solid var(--puzzle-border)',
            backgroundColor: 'var(--puzzle-muted)'
          }}
        >
          총 {totalParticipants.toLocaleString()}명의 챌린저가 완주했습니다.
        </div>
      )}
    </div>
  );
}
