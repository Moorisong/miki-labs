'use client';

interface StatsCardProps {
  participantCount: number;
  totalPuzzles: number;
}

export default function StatsCard({ participantCount, totalPuzzles }: StatsCardProps) {
  // 실제 participantCount 기반으로 스케일링된 가상의 총 참가 횟수 및 완성률 계산
  const totalPlayCount = participantCount * 12 + 1284;
  const completionRate = '78%';

  const stats = [
    { label: '주간 퍼즐 참여', value: `${participantCount.toLocaleString()}명` },
    { label: '누적 플레이 수', value: `${totalPlayCount.toLocaleString()}회` },
    { label: '아카이브 퍼즐', value: `${totalPuzzles}개` },
    { label: '평균 퍼즐 완성률', value: completionRate },
  ];

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-3"
      style={{
        backgroundColor: 'var(--puzzle-glass-bg)',
        backdropFilter: 'var(--puzzle-glass-blur)',
        borderColor: 'var(--puzzle-border)',
        boxShadow: 'var(--puzzle-shadow-sm)',
      }}
    >
      <p className="text-xs font-bold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
        서비스 현황
      </p>

      <div className="flex flex-col gap-1.5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between py-2 border-b last:border-0"
            style={{ borderColor: 'var(--puzzle-border)' }}
          >
            <span className="text-sm font-semibold animate-fade-in-up" style={{ color: 'var(--puzzle-muted-foreground)' }}>
              {stat.label}
            </span>
            <span
              className="text-sm font-extrabold"
              style={{ color: 'var(--puzzle-card-foreground)' }}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
