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
      className="rounded-2xl border p-6 flex flex-col items-center"
      style={{
        backgroundColor: 'var(--puzzle-glass-bg)',
        backdropFilter: 'var(--puzzle-glass-blur)',
        borderColor: 'var(--puzzle-border)',
        boxShadow: 'var(--puzzle-shadow-sm)',
      }}
    >
      {/* Avatar / Profile Image */}
      <div className="flex flex-col items-center mb-5">
        {profile.profileImage ? (
          <img
            src={profile.profileImage}
            alt={profile.nickname}
            className="w-20 h-20 rounded-full object-cover border-2 shadow-md mb-3"
            style={{ borderColor: 'var(--puzzle-primary)' }}
          />
        ) : (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-md mb-3"
            style={{ backgroundColor: 'var(--puzzle-secondary)' }}
          >
            <span
              className="text-2xl font-black"
              style={{ color: 'var(--puzzle-primary)' }}
            >
              {profile.nickname?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
        )}

        <span className="text-lg font-black truncate max-w-[180px]" style={{ color: 'var(--puzzle-card-foreground)' }}>
          {profile.nickname || '사용자'}
        </span>
        <span className="text-xs mt-1 font-semibold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
          {getFormatDate(profile.createdAt)}
        </span>
      </div>

      {/* Stats Summary Row */}
      <div
        className="grid grid-cols-3 gap-2 w-full pt-4 border-t"
        style={{ borderColor: 'var(--puzzle-border)' }}
      >
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="text-center">
            <Icon size={14} className="mx-auto mb-1" style={{ color: 'var(--puzzle-muted-foreground)' }} />
            <p className="text-sm font-black" style={{ color: 'var(--puzzle-card-foreground)' }}>
              {value}
            </p>
            <p className="text-[10px] font-bold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
