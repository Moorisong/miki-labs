'use client';

import { TrendingUp } from 'lucide-react';

interface PercentileChartProps {
  topPercent: number | null;
  totalParticipants: number;
  myRank: number | null;
}

export default function PercentileChart({
  topPercent,
  totalParticipants,
  myRank,
}: PercentileChartProps) {
  const levels = [
    { label: '상위 1%', threshold: 1, width: 15 },
    { label: '상위 5%', threshold: 5, width: 30 },
    { label: '상위 10%', threshold: 10, width: 48 },
    { label: '상위 25%', threshold: 25, width: 68 },
    { label: '상위 50%', threshold: 50, width: 85 },
  ];

  // 내 성적이 어느 단계에 속하는지 체크
  const getActiveLevelIndex = () => {
    if (topPercent === null) return -1;
    for (let i = 0; i < levels.length; i++) {
      if (topPercent <= levels[i].threshold) {
        return i;
      }
    }
    return levels.length - 1; // 50% 이상인 경우 마지막
  };

  const activeIndex = getActiveLevelIndex();

  return (
    <div
      className="rounded-2xl border p-6 flex flex-col"
      style={{
        backgroundColor: 'var(--puzzle-glass-bg)',
        backdropFilter: 'var(--puzzle-glass-blur)',
        borderColor: 'var(--puzzle-border)',
        boxShadow: 'var(--puzzle-shadow-sm)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} style={{ color: 'var(--puzzle-primary)' }} />
        <p className="text-sm font-extrabold" style={{ color: 'var(--puzzle-card-foreground)' }}>
          성적 분포 분석
        </p>
      </div>

      {/* Bar Visualization */}
      <div className="space-y-3">
        {levels.map((level, i) => {
          const isMyLevel = i === activeIndex;
          return (
            <div key={level.label} className="flex items-center gap-3">
              <span
                className="text-xs w-16 text-right flex-shrink-0 font-bold"
                style={{
                  color: isMyLevel ? 'var(--puzzle-primary)' : 'var(--puzzle-muted-foreground)',
                }}
              >
                {level.label}
              </span>
              <div
                className="flex-1 h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--puzzle-border)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${level.width}%`,
                    backgroundColor: isMyLevel ? 'var(--puzzle-primary)' : 'var(--puzzle-muted-foreground)',
                    opacity: isMyLevel ? 1 : 0.25,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {myRank && totalParticipants > 0 ? (
        <p className="mt-5 text-xs font-bold text-center" style={{ color: 'var(--puzzle-muted-foreground)' }}>
          완주 챌린저 <span style={{ color: 'var(--puzzle-card-foreground)' }}>{totalParticipants.toLocaleString()}명</span> 중 현재 <span style={{ color: 'var(--puzzle-primary)' }}>{myRank}위</span>입니다!
        </p>
      ) : (
        <p className="mt-5 text-xs font-bold text-center" style={{ color: 'var(--puzzle-muted-foreground)' }}>
          완주 후 본인의 성적 위치를 그래프로 확인해 보세요!
        </p>
      )}
    </div>
  );
}
