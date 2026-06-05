import { Play, Users, Calendar, Trophy, Layers, X, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Puzzle } from '@/types/puzzle';

interface ArchivePuzzleCardProps {
  puzzle: Puzzle;
  status: 'current' | 'completed' | 'missed';
  myTime: string | null;
  myRank: number | null;
  isHistoryLoaded?: boolean;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  current: { label: '도전 중', color: '#4F8EF7', bg: '#EBF2FF' },
  completed: { label: '완료', color: '#22C55E', bg: '#E8F5E9' },
  missed: { label: '미참여', color: '#777777', bg: '#F5F5F7' },
};

export default function ArchivePuzzleCard({
  puzzle,
  status,
  myTime,
  myRank,
  isHistoryLoaded = false,
}: ArchivePuzzleCardProps) {
  const router = useRouter();
  const [showDiffSelect, setShowDiffSelect] = useState(false);
  const [selectedDiff, setSelectedDiff] = useState<'novice' | 'beginner' | 'expert'>('novice');

  const [isResetStart, setIsResetStart] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const isCompletedActive = status === 'completed' && !puzzle.archived;



  const handlePlayStart = (resetProgress = false) => {
    setIsResetStart(resetProgress);
    setShowDiffSelect(true);
  };

  const handleLaunchGame = () => {
    setShowDiffSelect(false);
    router.push(`/puzzle/play/${puzzle._id}?diff=${selectedDiff}&mode=ranked`);
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
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold shadow-sm"
              style={{
                backgroundColor: currentStatus.bg,
                color: currentStatus.color,
              }}
            >
              {currentStatus.label}
            </span>
            {new Date(puzzle.startDate) <= new Date() && new Date() <= new Date(puzzle.endDate) && (
              <span
                className="px-3 py-1 rounded-full text-[10px] font-black shadow-sm text-white animate-pulse"
                style={{ backgroundColor: 'var(--puzzle-primary)' }}
              >
                🏆 이번주 대회
              </span>
            )}
          </div>
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

          {/* Action Button(s) based on status */}
          {status === 'completed' ? (
            <button
              onClick={() => handlePlayStart(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-extrabold text-white transition-all duration-200 hover:scale-[1.01]"
              style={{ backgroundColor: 'var(--puzzle-primary)' }}
            >
              <Play size={13} strokeWidth={2.5} />
              <span>재도전</span>
            </button>
          ) : status === 'current' ? (
            <div className="flex gap-2 w-full">
              <Link
                href={`/puzzle/play/${puzzle._id}?resume=true`}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-extrabold text-white transition-all duration-200 hover:scale-[1.01]"
                style={{ backgroundColor: 'var(--puzzle-primary)' }}
              >
                <span>이어서 하기</span>
              </Link>
              <button
                onClick={() => handlePlayStart(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-extrabold border transition-all duration-200 hover:bg-[var(--puzzle-muted)]"
                style={{ 
                  borderColor: 'var(--puzzle-border)',
                  backgroundColor: 'var(--puzzle-glass-bg)',
                  color: 'var(--puzzle-card-foreground)'
                }}
              >
                <span>새로 시작</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => handlePlayStart(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-extrabold text-white transition-all duration-200 hover:scale-[1.01]"
              style={{ backgroundColor: 'var(--puzzle-primary)' }}
            >
              <Play size={13} strokeWidth={2.5} />
              <span>퍼즐 플레이</span>
            </button>
          )}
        </div>
      </div>

      {/* Difficulty Selection Premium Modal */}
      {showDiffSelect && mounted && createPortal(
        <div 
          className="puzzle-page fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', minHeight: 'auto' }}
        >
          <div 
            className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl border p-6 md:p-8 overflow-y-auto max-h-[90vh] sm:max-h-[85vh]"
            style={{
              backgroundColor: 'var(--puzzle-background)',
              borderColor: 'var(--puzzle-border)',
              boxShadow: 'var(--puzzle-shadow-lg)',
              animation: 'puzzle-modal-slide-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black flex items-center gap-2 text-left" style={{ color: 'var(--puzzle-card-foreground)' }}>
                  <Play size={22} className="text-emerald-500 fill-emerald-500/20" />
                  플레이 옵션 설정
                </h3>
              </div>
              <button 
                onClick={() => setShowDiffSelect(false)}
                className="p-2 rounded-xl transition-colors hover:bg-zinc-100"
                style={{ color: 'var(--puzzle-muted-foreground)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Difficulty Selector */}
            <div className="mb-6">
              <h4 className="text-sm font-extrabold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                <Layers size={14} style={{ color: 'var(--puzzle-primary)' }} />
                난이도 선택
              </h4>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {/* Novice Card */}
                <button
                  onClick={() => setSelectedDiff('novice')}
                  className="flex flex-col justify-center text-left p-2.5 sm:p-3.5 rounded-2xl border transition-all duration-200 hover:scale-[1.01] active:scale-95 min-w-0"
                  style={{
                    backgroundColor: selectedDiff === 'novice' ? 'var(--puzzle-secondary)' : 'var(--puzzle-glass-bg)',
                    borderColor: selectedDiff === 'novice' ? 'var(--puzzle-primary)' : 'var(--puzzle-border)',
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-1 min-w-0">
                    <span className="text-xs sm:text-sm font-black truncate" style={{ color: selectedDiff === 'novice' ? 'var(--puzzle-primary)' : 'var(--puzzle-card-foreground)' }}>
                      초보
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 w-auto inline-flex justify-center items-center flex-shrink-0">
                      <span>36조각</span>
                    </span>
                  </div>
                </button>

                {/* Beginner Card */}
                <button
                  onClick={() => setSelectedDiff('beginner')}
                  className="flex flex-col justify-center text-left p-2.5 sm:p-3.5 rounded-2xl border transition-all duration-200 hover:scale-[1.01] active:scale-95 min-w-0"
                  style={{
                    backgroundColor: selectedDiff === 'beginner' ? 'var(--puzzle-secondary)' : 'var(--puzzle-glass-bg)',
                    borderColor: selectedDiff === 'beginner' ? 'var(--puzzle-primary)' : 'var(--puzzle-border)',
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-1 min-w-0">
                    <span className="text-xs sm:text-sm font-black truncate" style={{ color: selectedDiff === 'beginner' ? 'var(--puzzle-primary)' : 'var(--puzzle-card-foreground)' }}>
                      일반
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 w-auto inline-flex justify-center items-center flex-shrink-0">
                      <span>100조각</span>
                    </span>
                  </div>
                </button>

                {/* Expert Card */}
                <button
                  onClick={() => setSelectedDiff('expert')}
                  className="flex flex-col justify-center text-left p-2.5 sm:p-3.5 rounded-2xl border transition-all duration-200 hover:scale-[1.01] active:scale-95 min-w-0"
                  style={{
                    backgroundColor: selectedDiff === 'expert' ? 'var(--puzzle-secondary)' : 'var(--puzzle-glass-bg)',
                    borderColor: selectedDiff === 'expert' ? 'var(--puzzle-primary)' : 'var(--puzzle-border)',
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-1 min-w-0">
                    <span className="text-xs sm:text-sm font-black truncate" style={{ color: selectedDiff === 'expert' ? 'var(--puzzle-primary)' : 'var(--puzzle-card-foreground)' }}>
                      고수
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 w-auto inline-flex justify-center items-center flex-shrink-0">
                      <span>256조각</span>
                    </span>
                  </div>
                </button>
              </div>
            </div>



            {/* Warning for Reset Game */}
            {isResetStart && (
              <div 
                className="mb-6 px-4 py-3 rounded-2xl text-xs font-bold text-left leading-relaxed border flex items-start gap-2"
                style={{ backgroundColor: 'var(--puzzle-destructive-bg, #FEF2F2)', borderColor: 'var(--puzzle-destructive, #FEE2E2)', color: '#DC2626' }}
              >
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <span>
                  새로 시작할 경우 기존에 기록 중이던 퍼즐판 진행 데이터가 완전히 초기화됩니다. 계속하시겠습니까?
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                onClick={() => setShowDiffSelect(false)}
                className="w-full sm:flex-1 py-3.5 rounded-xl border font-bold text-sm transition-colors hover:bg-zinc-50 active:bg-zinc-100"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--puzzle-foreground)',
                  borderColor: 'var(--puzzle-border)',
                }}
              >
                취소
              </button>
              <button
                onClick={handleLaunchGame}
                className="w-full sm:flex-1 py-3.5 rounded-xl text-white font-black text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]"
                style={{
                  backgroundColor: 'var(--puzzle-primary)',
                  boxShadow: 'var(--puzzle-shadow-md)',
                }}
              >
                플레이 시작
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
