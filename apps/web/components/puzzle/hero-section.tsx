'use client';

import { useState, useEffect } from 'react';
import { Clock, Users, Trophy, Play, Layers, X, HelpCircle, Check, Flame } from 'lucide-react';
import { Puzzle } from '@/types/puzzle';

interface HeroSectionProps {
  puzzle: Puzzle;
  onStart: (difficulty: 'beginner' | 'expert', mode: 'ranked' | 'solo') => void;
  onResume?: () => void;
  hasSavedGame: boolean;
  progress: number;
  savedDifficulty?: 'beginner' | 'expert' | null;
  isLoggedIn?: boolean;
}

export default function HeroSection({
  puzzle,
  onStart,
  onResume,
  hasSavedGame,
  progress,
  savedDifficulty,
  isLoggedIn = false,
}: HeroSectionProps) {
  const [showDiffSelect, setShowDiffSelect] = useState(false);
  const [tempDiff, setTempDiff] = useState<'beginner' | 'expert'>('beginner');
  const [tempMode, setTempMode] = useState<'ranked' | 'solo'>('ranked');

  // 진행률 기반 맞춘 조각수 계산
  const totalPieces = savedDifficulty === 'expert' ? 256 : 100;
  const matchedPieces = Math.round((progress / 100) * totalPieces);

  const [daysLeft, setDaysLeft] = useState<string>('');

  // 남은 날짜 계산
  useEffect(() => {
    const end = new Date(puzzle.endDate).getTime();
    const diff = end - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    setDaysLeft(days > 0 ? `${days}일` : '마감 임박');
  }, [puzzle.endDate]);

  const handleLaunchGame = () => {
    if (hasSavedGame) {
      const confirmRestart = window.confirm('이미 진행 중인 퍼즐이 있습니다. 처음부터 다시 시작하시겠습니까? (기존 진행 데이터는 삭제됩니다.)');
      if (!confirmRestart) return;
    }
    onStart(tempDiff, tempMode);
    setShowDiffSelect(false);
  };

  return (
    <section className="puzzle-animate-fade-in-up">
      <div 
        className="puzzle-glass-card p-6 md:p-10 rounded-3xl"
        style={{
          background: 'var(--puzzle-glass-bg)',
          border: '1px solid var(--puzzle-glass-border)',
          boxShadow: 'var(--puzzle-shadow-lg)',
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Info */}
          <div>
            <div 
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-5"
              style={{ backgroundColor: 'var(--puzzle-secondary)', color: 'var(--puzzle-primary)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--puzzle-primary)' }} />
              이번 주 퍼즐 · {puzzle.week}주차
            </div>

            <h1 
              className="text-3xl md:text-4xl font-extrabold leading-tight mb-4"
              style={{ color: 'var(--puzzle-card-foreground)', letterSpacing: '-0.02em' }}
            >
              {puzzle.title}
            </h1>

            <p 
              className="text-base mb-8 font-medium leading-relaxed"
              style={{ color: 'var(--puzzle-muted-foreground)' }}
            >
              매주 찾아오는 고유한 힐링 콘텐츠. 잔잔한 아침 공기가 가득 담긴 감성 일러스트를 퍼즐로 맞추어 보세요.
              원하는 난이도와 모드(실시간 랭킹 경쟁 vs 편안한 힐링)를 직접 선택하여 나만의 스타일로 플레이할 수 있습니다.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-5 mb-8">
              <div className="flex items-center gap-2">
                <Clock size={16} style={{ color: 'var(--puzzle-primary)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                  <span style={{ color: 'var(--puzzle-card-foreground)', fontWeight: 750 }}>{daysLeft}</span> 남음
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} style={{ color: 'var(--puzzle-primary)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                  <span style={{ color: 'var(--puzzle-card-foreground)', fontWeight: 750 }}>{puzzle.participantCount.toLocaleString()}명</span> 완료함
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 relative">
              {hasSavedGame && onResume ? (
                <>
                  <button
                    onClick={onResume}
                    className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 text-white puzzle-animate-pulse-glow"
                    style={{
                      backgroundColor: 'var(--puzzle-primary)',
                      fontSize: '15px',
                      fontWeight: 700,
                    }}
                  >
                    <Play size={16} strokeWidth={2.5} />
                    이어하기 ({progress}%)
                  </button>

                  <button
                    onClick={() => setShowDiffSelect(true)}
                    className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-95"
                    style={{
                      backgroundColor: 'var(--puzzle-glass-bg)',
                      color: 'var(--puzzle-foreground)',
                      borderColor: 'var(--puzzle-border)',
                      fontSize: '15px',
                      fontWeight: 650,
                    }}
                  >
                    새로 시작하기
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowDiffSelect(true)}
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 text-white puzzle-animate-pulse-glow"
                  style={{
                    backgroundColor: 'var(--puzzle-primary)',
                    fontSize: '15px',
                    fontWeight: 700,
                  }}
                >
                  <Play size={16} strokeWidth={2.5} />
                  퍼즐 시작하기
                </button>
              )}
            </div>
          </div>

          {/* Puzzle Image */}
          <div className="relative group">
            <div 
              className="relative rounded-2xl overflow-hidden shadow-2xl transition-transform duration-300 group-hover:scale-[1.01]"
              style={{ border: '1px solid var(--puzzle-glass-border)' }}
            >
              <img
                src={puzzle.imageUrl}
                alt={puzzle.title}
                className="w-full object-cover"
                style={{ height: 'clamp(200px, 45vw, 420px)' }}
              />
              {/* Progress overlay bar if game was started */}
              {progress > 0 && (
                <div 
                  className="absolute bottom-0 left-0 right-0 p-4"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/80 font-bold">내 진행률</span>
                    <span className="text-xs text-white/85 font-extrabold">{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%`, backgroundColor: 'var(--puzzle-primary)' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Floating stats card — 모바일에서 숨김 (overflow 방지) */}
            <div 
              className="absolute -top-3 -right-3 px-4 py-3 rounded-xl border border-border hidden sm:block"
              style={{
                backgroundColor: 'var(--puzzle-glass-bg)',
                backdropFilter: 'var(--puzzle-glass-blur)',
                border: '1px solid var(--puzzle-glass-border)',
                boxShadow: 'var(--puzzle-shadow-md)',
              }}
            >
              {hasSavedGame && savedDifficulty ? (
                <>
                  <div className="flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--puzzle-primary)' }}>
                    <Layers size={13} />
                    <span>진행 중 ({savedDifficulty === 'expert' ? 'Expert' : 'Beginner'})</span>
                  </div>
                  <p className="mt-0.5 text-sm font-extrabold" style={{ color: 'var(--puzzle-card-foreground)' }}>
                    {matchedPieces} / {totalPieces} 조각
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--puzzle-primary)' }}>
                    <Trophy size={13} />
                    <span>실시간 랭킹 도전</span>
                  </div>
                  <p className="mt-0.5 text-sm font-extrabold" style={{ color: 'var(--puzzle-card-foreground)' }}>
                    망설임은 순위만 늦출 뿐! ⚡
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mode / Difficulty Selection Premium Modal */}
      {showDiffSelect && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
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
                <h3 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--puzzle-card-foreground)' }}>
                  <Play size={22} className="text-emerald-500 fill-emerald-500/20" />
                  플레이 옵션 설정
                </h3>
                <p className="text-sm font-semibold mt-1.5" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                  난이도와 플레이 모드를 선택해주세요.
                </p>
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
                1. 난이도 선택
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {/* Beginner Card */}
                <button
                  onClick={() => setTempDiff('beginner')}
                  className="flex flex-col text-left p-3 sm:p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.01] active:scale-95 min-w-0"
                  style={{
                    backgroundColor: tempDiff === 'beginner' ? 'var(--puzzle-secondary)' : 'var(--puzzle-glass-bg)',
                    borderColor: tempDiff === 'beginner' ? 'var(--puzzle-primary)' : 'var(--puzzle-border)',
                  }}
                >
                  <div className="flex items-center justify-between w-full mb-1 gap-1 min-w-0">
                    <span className="text-sm sm:text-base font-black truncate" style={{ color: tempDiff === 'beginner' ? 'var(--puzzle-primary)' : 'var(--puzzle-card-foreground)' }}>
                      Beginner
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 w-10 sm:w-auto inline-flex justify-center items-center flex-shrink-0">
                      <span className="hidden sm:inline">100조각</span>
                      <span className="inline sm:hidden">100</span>
                    </span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed mt-1 whitespace-nowrap overflow-hidden text-ellipsis w-full" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                    편안하게 완성하기
                  </p>
                </button>

                {/* Expert Card */}
                <button
                  onClick={() => setTempDiff('expert')}
                  className="flex flex-col text-left p-3 sm:p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.01] active:scale-95 min-w-0"
                  style={{
                    backgroundColor: tempDiff === 'expert' ? 'var(--puzzle-secondary)' : 'var(--puzzle-glass-bg)',
                    borderColor: tempDiff === 'expert' ? 'var(--puzzle-primary)' : 'var(--puzzle-border)',
                  }}
                >
                  <div className="flex items-center justify-between w-full mb-1 gap-1 min-w-0">
                    <span className="text-sm sm:text-base font-black truncate" style={{ color: tempDiff === 'expert' ? 'var(--puzzle-primary)' : 'var(--puzzle-card-foreground)' }}>
                      Expert
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 w-10 sm:w-auto inline-flex justify-center items-center flex-shrink-0">
                      <span className="hidden sm:inline">256조각</span>
                      <span className="inline sm:hidden">256</span>
                    </span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed mt-1 whitespace-nowrap overflow-hidden text-ellipsis w-full" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                    고도의 집중과 몰입
                  </p>
                </button>
              </div>
            </div>

            {/* Play Mode Selector */}
            <div className="mb-6">
              <h4 className="text-sm font-extrabold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                <Trophy size={14} style={{ color: 'var(--puzzle-primary)' }} />
                2. 플레이 모드 선택
              </h4>
              <div className="flex flex-col gap-3">
                {/* Ranked Mode Button */}
                <button
                  onClick={() => setTempMode('ranked')}
                  className="flex items-start gap-3.5 text-left p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.005] active:scale-95"
                  style={{
                    backgroundColor: tempMode === 'ranked' ? 'var(--puzzle-secondary)' : 'var(--puzzle-glass-bg)',
                    borderColor: tempMode === 'ranked' ? 'var(--puzzle-primary)' : 'var(--puzzle-border)',
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: tempMode === 'ranked' ? 'var(--puzzle-primary)' : 'var(--puzzle-muted)', color: tempMode === 'ranked' ? '#fff' : 'var(--puzzle-muted-foreground)' }}
                  >
                    <Trophy size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black" style={{ color: 'var(--puzzle-card-foreground)' }}>
                        🏆 <span className="hidden sm:inline">랭킹 도전 모드</span>
                        <span className="inline sm:hidden">랭킹 도전</span>
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600">
                        <span className="hidden sm:inline">기록 측정</span>
                        <span className="inline sm:hidden">기록</span>
                      </span>
                    </div>
                    <p className="text-xs font-medium mt-1 leading-relaxed whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                      완성 기록으로 주간 랭킹 도전
                    </p>
                  </div>
                </button>

                {/* Healing (Solo) Mode Button */}
                <button
                  onClick={() => setTempMode('solo')}
                  className="flex items-start gap-3.5 text-left p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.005] active:scale-95"
                  style={{
                    backgroundColor: tempMode === 'solo' ? 'var(--puzzle-secondary)' : 'var(--puzzle-glass-bg)',
                    borderColor: tempMode === 'solo' ? 'var(--puzzle-primary)' : 'var(--puzzle-border)',
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: tempMode === 'solo' ? 'var(--puzzle-primary)' : 'var(--puzzle-muted)', color: tempMode === 'solo' ? '#fff' : 'var(--puzzle-muted-foreground)' }}
                  >
                    <Clock size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black" style={{ color: 'var(--puzzle-card-foreground)' }}>
                        🧘 <span className="hidden sm:inline">힐링 플레이 모드</span>
                        <span className="inline sm:hidden">힐링 플레이</span>
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600">
                        <span className="hidden sm:inline">연습 & 힐링</span>
                        <span className="inline sm:hidden">힐링</span>
                      </span>
                    </div>
                    <p className="text-xs font-medium mt-1 leading-relaxed whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                      경쟁 없이 음악과 함께 힐링
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Warning for unauthenticated user choosing Ranked */}
            {!isLoggedIn && tempMode === 'ranked' && (
              <div 
                className="mb-6 px-4 py-3 rounded-2xl text-xs font-bold leading-relaxed border flex items-start gap-2"
                style={{ backgroundColor: 'var(--puzzle-destructive-bg, #FEF2F2)', borderColor: 'var(--puzzle-destructive, #FEE2E2)', color: '#DC2626' }}
              >
                <Flame size={16} className="flex-shrink-0 mt-0.5" />
                <span>
                  로그인 후 완료하셔야 공식 랭킹에 등록됩니다.
                </span>
              </div>
            )}

            {/* Submit Actions */}
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
                도전 시작하기
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

