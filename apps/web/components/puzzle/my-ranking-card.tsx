'use client';

import { MyRanking } from '@/types/puzzle';

interface MyRankingCardProps {
  myRanking: MyRanking | null;
  isLoggedIn: boolean;
  onRankClick?: () => void;
}

export default function MyRankingCard({ myRanking, isLoggedIn, onRankClick }: MyRankingCardProps) {
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
      className="rounded-2xl border p-3.5 sm:p-5 lg:p-6 flex flex-col justify-between"
      style={{
        backgroundColor: 'var(--puzzle-glass-bg)',
        backdropFilter: 'var(--puzzle-glass-blur)',
        borderColor: 'var(--puzzle-border)',
        boxShadow: 'var(--puzzle-shadow-sm)',
      }}
    >
      <p className="text-xs sm:text-sm font-extrabold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
        내 최고 기록
      </p>

      {!isLoggedIn ? (
        <div className="py-4 sm:py-6 text-center">
          <p className="text-xs sm:text-sm font-bold mb-0.5" style={{ color: 'var(--puzzle-card-foreground)' }}>
            비로그인 상태입니다.
          </p>
          <p className="text-[10px] sm:text-xs" style={{ color: 'var(--puzzle-muted-foreground)' }}>
            로그인하시면 랭킹 경쟁에 참여할 수 있습니다. 🏆
          </p>
        </div>
      ) : myRanking && myRanking.myRank !== null ? (
        <div className="flex flex-row lg:flex-col gap-2 lg:gap-3 mt-3 lg:mt-4">
          {stats.map(({ label, value, highlight }) => {
            const isRank = label === '현재 내 순위';
            return (
              <div
                key={label}
                className="flex-1 flex flex-col lg:flex-row lg:items-center justify-center lg:justify-between p-2 lg:p-0 lg:py-2 border lg:border-0 rounded-xl lg:rounded-none text-center lg:text-left"
                style={{ borderColor: 'var(--puzzle-border)' }}
              >
                <span className="text-[10px] sm:text-xs font-bold mb-1 lg:mb-0" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                  {label}
                </span>
                {isRank && onRankClick ? (
                  <div className="flex justify-center">
                    <button
                      onClick={onRankClick}
                      className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-black rounded-full border transition-all duration-200 hover:bg-[var(--puzzle-primary)] hover:text-white hover:border-transparent active:scale-95 flex items-center gap-1 shadow-sm"
                      style={{
                        backgroundColor: 'var(--puzzle-muted)',
                        color: 'var(--puzzle-primary)',
                        borderColor: 'var(--puzzle-border)',
                      }}
                    >
                      {value}
                    </button>
                  </div>
                ) : (
                  <span
                    className="text-xs sm:text-sm font-black tabular-nums"
                    style={{
                      color: highlight ? 'var(--puzzle-primary)' : 'var(--puzzle-card-foreground)',
                    }}
                  >
                    {value}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-4 sm:py-6 text-center">
          <p className="text-xs sm:text-sm font-bold mb-0.5" style={{ color: 'var(--puzzle-card-foreground)' }}>
            아직 완주 기록이 없습니다.
          </p>
          <p className="text-[10px] sm:text-xs" style={{ color: 'var(--puzzle-muted-foreground)' }}>
            퍼즐을 완성하고 공식 순위를 확인해 보세요! 🧘
          </p>
        </div>
      )}
    </div>
  );
}
