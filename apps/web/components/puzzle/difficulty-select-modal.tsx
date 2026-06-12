'use client';

import { Play, Layers, Trophy, X, Flame, AlertTriangle } from 'lucide-react';
import { PUZZLE_DIFFICULTY, PUZZLE_PIECE_COUNT } from '@/constants/puzzle';

interface DifficultySelectModalProps {
  onClose: () => void;
  onLaunch: () => void;
  selectedDiff: 'novice' | 'beginner' | 'expert';
  setSelectedDiff: (diff: 'novice' | 'beginner' | 'expert') => void;
  completedDifficulties?: ('novice' | 'beginner' | 'expert')[];
  isLoggedIn?: boolean;
  showRankedInfo?: boolean;
  showResetWarning?: boolean;
  launchText?: string;
}

export default function DifficultySelectModal({
  onClose,
  onLaunch,
  selectedDiff,
  setSelectedDiff,
  completedDifficulties = [],
  isLoggedIn = true,
  showRankedInfo = false,
  showResetWarning = false,
  launchText = '도전 시작하기',
}: DifficultySelectModalProps) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in puzzle-page"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', minHeight: 'auto' }}
    >
      <style>{`
        @media (max-height: 620px) {
          .landscape-short-hide {
            display: none !important;
          }
          .landscape-short-space {
            margin-bottom: 0.75rem !important;
          }
          .landscape-short-padding {
            padding: 1.25rem !important;
          }
        }
        @media (hover: hover) {
          .hover-scale-effect:hover {
            transform: scale(1.01) !important;
          }
        }
        .active-scale-effect-95:active {
          transform: scale(0.95) !important;
        }
        .active-scale-effect-98:active {
          transform: scale(0.98) !important;
        }
      `}</style>
      <div 
        className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl border p-6 md:p-8 overflow-y-auto max-h-[90vh] sm:max-h-[85vh] landscape-short-padding"
        style={{
          backgroundColor: 'var(--puzzle-background)',
          borderColor: 'var(--puzzle-border)',
          boxShadow: 'var(--puzzle-shadow-lg)',
          animation: 'puzzle-modal-slide-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6 landscape-short-space">
          <div>
            <h3 className="text-2xl font-black flex items-center gap-2 text-left" style={{ color: 'var(--puzzle-card-foreground)' }}>
              <Play size={22} className="text-emerald-500 fill-emerald-500/20" />
              플레이 옵션 설정
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl transition-colors hover:bg-zinc-100"
            style={{ color: 'var(--puzzle-muted-foreground)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Difficulty Selector */}
        <div className="mb-6 landscape-short-space">
          <h4 className="text-sm font-extrabold uppercase tracking-wider mb-3 flex items-center gap-1.5 landscape-short-space" style={{ color: 'var(--puzzle-muted-foreground)' }}>
            <Layers size={14} style={{ color: 'var(--puzzle-primary)' }} />
            난이도 선택
          </h4>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* Novice Card */}
            <button
              onClick={() => setSelectedDiff(PUZZLE_DIFFICULTY.NOVICE)}
              className="flex flex-col justify-center items-center sm:flex-row sm:justify-between text-left sm:items-center p-2.5 sm:p-3.5 rounded-2xl border transition-all duration-200 hover-scale-effect active-scale-effect-95 min-w-0"
              style={{
                backgroundColor: selectedDiff === PUZZLE_DIFFICULTY.NOVICE ? 'var(--puzzle-secondary)' : 'var(--puzzle-glass-bg)',
                borderColor: selectedDiff === PUZZLE_DIFFICULTY.NOVICE ? 'var(--puzzle-primary)' : 'var(--puzzle-border)',
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-1 min-w-0">
                <span className="text-xs sm:text-sm font-black truncate" style={{ color: selectedDiff === PUZZLE_DIFFICULTY.NOVICE ? 'var(--puzzle-primary)' : 'var(--puzzle-card-foreground)' }}>
                  초보
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 w-auto inline-flex justify-center items-center flex-shrink-0">
                  <span>{PUZZLE_PIECE_COUNT[PUZZLE_DIFFICULTY.NOVICE]}조각</span>
                </span>
              </div>
            </button>

            {/* Beginner Card */}
            <button
              onClick={() => setSelectedDiff(PUZZLE_DIFFICULTY.BEGINNER)}
              className="flex flex-col justify-center items-center sm:flex-row sm:justify-between text-left sm:items-center p-2.5 sm:p-3.5 rounded-2xl border transition-all duration-200 hover-scale-effect active-scale-effect-95 min-w-0"
              style={{
                backgroundColor: selectedDiff === PUZZLE_DIFFICULTY.BEGINNER ? 'var(--puzzle-secondary)' : 'var(--puzzle-glass-bg)',
                borderColor: selectedDiff === PUZZLE_DIFFICULTY.BEGINNER ? 'var(--puzzle-primary)' : 'var(--puzzle-border)',
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-1 min-w-0">
                <span className="text-xs sm:text-sm font-black truncate" style={{ color: selectedDiff === PUZZLE_DIFFICULTY.BEGINNER ? 'var(--puzzle-primary)' : 'var(--puzzle-card-foreground)' }}>
                  일반
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 w-auto inline-flex justify-center items-center flex-shrink-0">
                  <span>{PUZZLE_PIECE_COUNT[PUZZLE_DIFFICULTY.BEGINNER]}조각</span>
                </span>
              </div>
            </button>

            {/* Expert Card */}
            <button
              onClick={() => setSelectedDiff(PUZZLE_DIFFICULTY.EXPERT)}
              className="flex flex-col justify-center items-center sm:flex-row sm:justify-between text-left sm:items-center p-2.5 sm:p-3.5 rounded-2xl border transition-all duration-200 hover-scale-effect active-scale-effect-95 min-w-0"
              style={{
                backgroundColor: selectedDiff === PUZZLE_DIFFICULTY.EXPERT ? 'var(--puzzle-secondary)' : 'var(--puzzle-glass-bg)',
                borderColor: selectedDiff === PUZZLE_DIFFICULTY.EXPERT ? 'var(--puzzle-primary)' : 'var(--puzzle-border)',
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-1 min-w-0">
                <span className="text-xs sm:text-sm font-black truncate" style={{ color: selectedDiff === PUZZLE_DIFFICULTY.EXPERT ? 'var(--puzzle-primary)' : 'var(--puzzle-card-foreground)' }}>
                  고수
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 w-auto inline-flex justify-center items-center flex-shrink-0">
                  <span>{PUZZLE_PIECE_COUNT[PUZZLE_DIFFICULTY.EXPERT]}조각</span>
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Ranked Mode Info (Hero Section) */}
        {showRankedInfo && (
          <div className="mb-6 flex items-start gap-3.5 p-4 rounded-2xl border landscape-short-hide landscape-short-space" style={{ backgroundColor: 'var(--puzzle-secondary)', borderColor: 'var(--puzzle-primary)' }}>
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: 'var(--puzzle-primary)', color: '#fff' }}
            >
              <Trophy size={18} />
            </div>
            <div className="flex-1">
              {completedDifficulties.includes(selectedDiff) ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black" style={{ color: 'var(--puzzle-card-foreground)' }}>
                      자유 연습 모드
                    </span>
                  </div>
                  <p className="text-xs font-medium mt-1 leading-relaxed" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                    이미 이번 주에 완주한 난이도입니다. 랭킹에는 반영되지 않지만 자유롭게 다시 연습해보세요!
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black" style={{ color: 'var(--puzzle-card-foreground)' }}>
                      랭킹 도전 모드
                    </span>
                  </div>
                  <p className="text-xs font-medium mt-1 leading-relaxed" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                    기록을 제출하고 주간 랭킹에 도전하세요!
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Warning for unauthenticated user */}
        {showRankedInfo && !isLoggedIn && (
          <div 
            className="mb-6 px-4 py-3 rounded-2xl text-xs font-bold leading-relaxed border flex items-start gap-2 landscape-short-space"
            style={{ backgroundColor: 'var(--puzzle-destructive-bg, #FEF2F2)', borderColor: 'var(--puzzle-destructive, #FEE2E2)', color: '#DC2626' }}
          >
            <Flame size={16} className="flex-shrink-0 mt-0.5" />
            <span>
              로그인 후 완료하셔야 공식 랭킹에 등록됩니다.
            </span>
          </div>
        )}

        {/* Warning for Reset Game (Archive Card) */}
        {showResetWarning && (
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

        {/* Submit Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={onClose}
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
            onClick={onLaunch}
            className="w-full sm:flex-1 py-3.5 rounded-xl text-white font-black text-sm transition-all duration-200 hover-scale-effect active-scale-effect-98"
            style={{
              backgroundColor: 'var(--puzzle-primary)',
              boxShadow: 'var(--puzzle-shadow-md)',
            }}
          >
            {launchText}
          </button>
        </div>
      </div>
    </div>
  );
}
