'use client';

import { MyRanking } from '@/types/puzzle';

interface MyRankingCardProps {
  myRanking: MyRanking | null;
  isLoggedIn: boolean;
}

export default function MyRankingCard({ myRanking, isLoggedIn }: MyRankingCardProps) {
  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return '-';
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const stats = [
    {
      label: '현재 내 순위',
      value: myRanking && myRanking.myRank !== null ? `🎖️ ${myRanking.myRank}위` : '-',
      highlight: false,
    },
    {
      label: '백분율 범위',
      value: myRanking && myRanking.topPercent !== null ? `상위 ${myRanking.topPercent}%` : '-',
      highlight: true,
    },
    {
      label: '내 최고 기록',
      value: myRanking ? formatDuration(myRanking.completionTime) : '-',
      highlight: false,
    },
  ];

  return (
    <div
      className="rounded-2xl border p-6 flex flex-col justify-between"
      style={{
        backgroundColor: 'var(--puzzle-glass-bg)',
        backdropFilter: 'var(--puzzle-glass-blur)',
        borderColor: 'var(--puzzle-border)',
        boxShadow: 'var(--puzzle-shadow-sm)',
        minHeight: '220px',
      }}
    >
      <p className="text-sm font-extrabold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
        내 최고 기록
      </p>

      {!isLoggedIn ? (
        <div className="py-6 text-center">
          <p className="text-sm font-bold mb-1" style={{ color: 'var(--puzzle-card-foreground)' }}>
            비로그인 상태입니다.
          </p>
          <p className="text-xs" style={{ color: 'var(--puzzle-muted-foreground)' }}>
            로그인하시면 랭킹 경쟁에 기록을 등재할 수 있습니다. 🏆
          </p>
        </div>
      ) : myRanking && myRanking.myRank !== null ? (
        <div className="flex flex-col gap-3 mt-4">
          {stats.map(({ label, value, highlight }) => (
            <div
              key={label}
              className="flex items-center justify-between py-2 border-b last:border-0"
              style={{ borderColor: 'var(--puzzle-border)' }}
            >
              <span className="text-xs font-bold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                {label}
              </span>
              <span
                className="text-sm font-black tabular-nums"
                style={{
                  color: highlight ? 'var(--puzzle-primary)' : 'var(--puzzle-card-foreground)',
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center">
          <p className="text-sm font-bold mb-1" style={{ color: 'var(--puzzle-card-foreground)' }}>
            아직 완주 기록이 없습니다.
          </p>
          <p className="text-xs" style={{ color: 'var(--puzzle-muted-foreground)' }}>
            Beginner 퍼즐을 완성하고 공식 순위를 확인해 보세요! 🧘
          </p>
        </div>
      )}
    </div>
  );
}
