'use client';

interface HistoryEntry {
  puzzleId: string;
  title: string;
  imageUrl: string;
  difficulty: 'beginner' | 'expert';
  completionTime: number;
  savedAt: string;
  completed: boolean;
}

interface RecordChartProps {
  history: HistoryEntry[];
}

export default function RecordChart({ history }: RecordChartProps) {
  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    } catch {
      return dateStr;
    }
  };

  // 최근 완료한 최대 5개 퍼즐만 역순(시간 진행 순)으로 정렬하여 바 차트 구성
  const chartData = [...history]
    .slice(0, 5)
    .reverse();

  if (chartData.length === 0) {
    return null;
  }

  // 기준 최고값(최장 시간)을 찾아서 바 높이 스케일링
  const timesInSeconds = chartData.map((h) => h.completionTime);
  const maxTime = Math.max(...timesInSeconds, 1800); // 최소 기준 30분
  const minTime = Math.min(...timesInSeconds, 0);

  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        backgroundColor: 'var(--puzzle-glass-bg)',
        backdropFilter: 'var(--puzzle-glass-blur)',
        borderColor: 'var(--puzzle-border)',
        boxShadow: 'var(--puzzle-shadow-sm)',
      }}
    >
      <p className="text-sm font-extrabold mb-4" style={{ color: 'var(--puzzle-card-foreground)' }}>
        최근 완주 기록 추이
      </p>

      {/* Bar Chart Container */}
      <div className="flex items-end justify-between gap-4 h-24 mt-2">
        {chartData.map((item, i) => {
          // 완주 소요시간이 짧을수록 바 높이가 길게 렌더링되도록 (기록이 좋음을 시각화)
          // 혹은 단순 시간 길이에 비례하게 할 수도 있으나, 여기서는 단순히 완주 시간이 짧을수록 높은 위치로 가거나 직관적으로 비례하도록 처리
          const ratio = (item.completionTime / maxTime) * 100;
          const height = Math.max(15, Math.min(100, 100 - ratio + 15)); // 최솟값 15% 보장

          const isLatest = i === chartData.length - 1;

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span
                className="text-[9px] font-bold tabular-nums"
                style={{ color: isLatest ? 'var(--puzzle-primary)' : 'var(--puzzle-muted-foreground)' }}
              >
                {formatDuration(item.completionTime)}
              </span>
              <div
                className="w-full rounded-lg transition-all duration-500 hover:opacity-80"
                style={{
                  height: `${height}%`,
                  backgroundColor: isLatest ? 'var(--puzzle-primary)' : 'var(--puzzle-secondary)',
                  border: isLatest ? 'none' : '1px solid var(--puzzle-border)',
                  minHeight: '8px',
                }}
              />
              <span className="text-[9px] font-bold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                {formatDate(item.savedAt)}
              </span>
            </div>
          );
        })}
      </div>
      
      <p className="text-[10px] mt-4 text-center font-bold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
        💡 최근 기록일수록 우측에 표시되며, 세로 높이가 높을수록 단시간 내 완성하여 성적이 우수함을 의미합니다!
      </p>
    </div>
  );
}
