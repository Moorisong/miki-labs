'use client';

import { Trophy, Clock, Puzzle } from 'lucide-react';

interface ProfileCardProps {
  profile: {
    nickname: string;
    profileImage?: string;
    createdAt: string;
  };
  statistics: {
    totalCompleted: number;
    bestTimeBeginner: number | null;
    bestRank: number | null;
  };
}

export default function ProfileCard({ profile, statistics }: ProfileCardProps) {
  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return '-';
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const getFormatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return `${date.getFullYear()}년 ${date.getMonth() + 1}월 가입`;
    } catch {
      return dateStr;
    }
  };

  const stats = [
    { icon: Puzzle, label: '완주 수', value: `${statistics.totalCompleted}개` },
    { icon: Trophy, label: '최고 순위', value: statistics.bestRank ? `${statistics.bestRank}위` : '-' },
    { icon: Clock, label: '최고 기록', value: formatDuration(statistics.bestTimeBeginner) },
  ];

  return (
    <div
      className="rounded-2xl border p-4 md:p-6 flex flex-col items-center"
      style={{
        backgroundColor: 'var(--puzzle-glass-bg)',
        backdropFilter: 'var(--puzzle-glass-blur)',
        borderColor: 'var(--puzzle-border)',
        boxShadow: 'var(--puzzle-shadow-sm)',
      }}
    >
      {/* Avatar / Profile Image */}
      <div className="flex flex-row md:flex-col items-center gap-3.5 md:gap-0 md:mb-5 w-full mb-4">
        {profile.profileImage ? (
          <img
            src={profile.profileImage}
            alt={profile.nickname}
            className="w-12 h-12 md:w-20 md:h-20 rounded-full object-cover border-2 shadow-sm md:shadow-md md:mb-3"
            style={{ borderColor: 'var(--puzzle-primary)' }}
          />
        ) : (
          <div
            className="w-12 h-12 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-sm md:shadow-md md:mb-3"
            style={{ backgroundColor: 'var(--puzzle-secondary)' }}
          >
            <span
              className="text-lg md:text-2xl font-black"
              style={{ color: 'var(--puzzle-primary)' }}
            >
              {profile.nickname?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
        )}

        <div className="flex flex-col items-start md:items-center min-w-0">
          <span className="text-base md:text-lg font-black truncate max-w-[150px] md:max-w-[180px]" style={{ color: 'var(--puzzle-card-foreground)' }}>
            {profile.nickname || '사용자'}
          </span>
          <span className="text-[10px] md:text-xs mt-0.5 md:mt-1 font-semibold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
            {getFormatDate(profile.createdAt)}
          </span>
        </div>
      </div>

      {/* Stats Summary Row */}
      <div
        className="grid grid-cols-3 gap-1 w-full pt-3 md:pt-4 border-t"
        style={{ borderColor: 'var(--puzzle-border)' }}
      >
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="text-center py-0.5 md:py-0">
            <Icon size={12} className="mx-auto mb-0.5 md:mb-1" style={{ color: 'var(--puzzle-muted-foreground)' }} />
            <p className="text-xs md:text-sm font-black" style={{ color: 'var(--puzzle-card-foreground)' }}>
              {value}
            </p>
            <p className="text-[9px] md:text-[10px] font-bold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
