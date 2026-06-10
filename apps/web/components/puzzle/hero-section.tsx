'use client';

import { useState, useEffect } from 'react';
import { Clock, Users, Trophy, Play, Layers, X, Check, Flame } from 'lucide-react';
import { Puzzle } from '@/types/puzzle';
import Link from 'next/link';

interface HeroSectionProps {
  puzzle: Puzzle;
  onStart: (difficulty: 'novice' | 'beginner' | 'expert') => void;
  onResume?: () => void;
  hasSavedGame: boolean;
  progress: number;
  savedDifficulty?: 'novice' | 'beginner' | 'expert' | null;
  isLoggedIn?: boolean;
  hasCompleted?: boolean;
  completedDifficulty?: 'novice' | 'beginner' | 'expert' | null;
  completedDifficulties?: ('novice' | 'beginner' | 'expert')[];
}

export default function HeroSection({
  puzzle,
  onStart,
  onResume,
  hasSavedGame,
  progress,
  savedDifficulty,
  isLoggedIn = false,
  hasCompleted = false,
  completedDifficulty = null,
  completedDifficulties = [],
}: HeroSectionProps) {
  const [showDiffSelect, setShowDiffSelect] = useState(false);
  const [tempDiff, setTempDiff] = useState<'novice' | 'beginner' | 'expert'>('novice');
  const [showConfirmRestart, setShowConfirmRestart] = useState(false);

  // 진행률 기반 맞춘 조각수 계산
  const totalPieces = savedDifficulty === 'novice' ? 36 : savedDifficulty === 'expert' ? 256 : 100;
  const matchedPieces = Math.round((progress / 100) * totalPieces);

  const [daysLeft, setDaysLeft] = useState<string>('');

  // 남은 날짜 계산
  useEffect(() => {
    const end = new Date(puzzle.endDate).getTime();
    const diff = end - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    setDaysLeft(days > 0 ? `${days}일` : '마감 임박');
  }, [puzzle.endDate]);

  const handleOpenModal = () => {
    setShowDiffSelect(true);
  };

  const handleLaunchGame = () => {
    if (hasSavedGame) {
      setShowConfirmRestart(true);
    } else {
      onStart(tempDiff);
      setShowDiffSelect(false);
    }
  };

  const handleConfirmRestart = () => {
    onStart(tempDiff);
    setShowConfirmRestart(false);
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
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <div 
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: 'var(--puzzle-secondary)', color: 'var(--puzzle-primary)' }}
              >
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--puzzle-primary)' }} />
                이번 주 퍼즐 · {puzzle.week}주차
              </div>
              {hasCompleted && (
                <div 
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200"
                >
                  <Check size={13} strokeWidth={3} />
                  완료함 {completedDifficulty && `(${completedDifficulty === 'novice' ? '초보' : completedDifficulty === 'expert' ? '고수' : '일반'})`}
                </div>
              )}
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
              매주 배달되는 몽글몽글 감성 퍼즐 ✨<br />
              한 조각 한 조각 맞추며 바쁜 일상 속 나만의 퍼즐 타임을 채워보세요. 불꽃 튀는 실시간 순위 대결, 원하는 난이도로 지금 바로 도전해 볼까요?
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
            <div className="flex flex-col sm:flex-row sm:flex-nowrap gap-3 relative">
              {hasCompleted && hasSavedGame && onResume ? (
                <>
                  <button
                    onClick={onResume}
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 text-white puzzle-animate-pulse-glow"
                    style={{
                      backgroundColor: 'var(--puzzle-primary)',
                      fontSize: '15px',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Play size={16} strokeWidth={2.5} />
                    이어하기 ({progress}%)
                  </button>

                  <Link
                    href="/puzzle/ranking"
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-95 text-center hover:!text-[var(--puzzle-foreground)]"
                    style={{
                      backgroundColor: 'var(--puzzle-glass-bg)',
                      color: 'var(--puzzle-foreground)',
                      border: '1px solid var(--puzzle-border)',
                      fontSize: '15px',
                      fontWeight: 650,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Trophy size={16} className="inline mr-1" strokeWidth={2.5} />
                    결과 및 랭킹 보기
                  </Link>

                  <button
                    onClick={handleOpenModal}
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-95"
                    style={{
                      backgroundColor: 'var(--puzzle-glass-bg)',
                      color: 'var(--puzzle-foreground)',
                      border: '1px solid var(--puzzle-border)',
                      fontSize: '15px',
                      fontWeight: 650,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    새로 도전하기
                  </button>
                </>
              ) : hasCompleted ? (
                <>
                  <Link
                    href="/puzzle/ranking"
                    className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 text-white hover:!text-white puzzle-animate-pulse-glow"
                    style={{
                      backgroundColor: 'var(--puzzle-primary)',
                      fontSize: '15px',
                      fontWeight: 700,
                    }}
                  >
                    <Trophy size={16} strokeWidth={2.5} />
                    결과 및 랭킹 보기
                  </Link>

                  <button
                    onClick={handleOpenModal}
                    className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-95"
                    style={{
                      backgroundColor: 'var(--puzzle-glass-bg)',
                      color: 'var(--puzzle-foreground)',
                      border: '1px solid var(--puzzle-border)',
                      fontSize: '15px',
                      fontWeight: 650,
                    }}
                  >
                    다시 도전하기
                  </button>
                </>
              ) : hasSavedGame && onResume ? (
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
                    onClick={handleOpenModal}
                    className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-95"
                    style={{
                      backgroundColor: 'var(--puzzle-glass-bg)',
                      color: 'var(--puzzle-foreground)',
                      border: '1px solid var(--puzzle-border)',
                      fontSize: '15px',
                      fontWeight: 650,
                    }}
                  >
                    새로 시작하기
                  </button>
                </>
              ) : (
                <button
                  onClick={handleOpenModal}
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
              {hasCompleted ? (
                <>
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <Check size={13} strokeWidth={3} />
                    <span>완료됨 ({completedDifficulty === 'novice' ? '초보' : completedDifficulty === 'expert' ? '고수' : '일반'})</span>
                  </div>
                  <p className="mt-0.5 text-sm font-extrabold text-emerald-700">
                    랭킹 등록 완료! 🏅
                  </p>
                </>
              ) : hasSavedGame && savedDifficulty ? (
                <>
                  <div className="flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--puzzle-primary)' }}>
                    <Layers size={13} />
                    <span>진행 중 ({savedDifficulty === 'novice' ? '초보' : savedDifficulty === 'expert' ? '고수' : '일반'})</span>
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
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
            className="relative w-full max-w-lg rounded-3xl border p-6 md:p-8 overflow-y-auto max-h-[90vh] sm:max-h-[85vh] landscape-short-padding"
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
                <h3 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--puzzle-card-foreground)' }}>
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
            <div className="mb-6 landscape-short-space">
              <h4 className="text-sm font-extrabold uppercase tracking-wider mb-3 flex items-center gap-1.5 landscape-short-space" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                <Layers size={14} style={{ color: 'var(--puzzle-primary)' }} />
                난이도 선택
              </h4>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {/* Novice Card */}
                <button
                  onClick={() => setTempDiff('novice')}
                  className="flex flex-col items-center justify-center text-center p-2.5 sm:p-3.5 rounded-2xl border transition-all duration-200 hover-scale-effect active-scale-effect-95 min-w-0"
                  style={{
                    backgroundColor: tempDiff === 'novice' ? 'var(--puzzle-secondary)' : 'var(--puzzle-glass-bg)',
                    borderColor: tempDiff === 'novice' ? 'var(--puzzle-primary)' : 'var(--puzzle-border)',
                  }}
                >
                  <div className="flex flex-col items-center justify-center w-full gap-1 min-w-0">
                    <span className="text-xs sm:text-sm font-black truncate" style={{ color: tempDiff === 'novice' ? 'var(--puzzle-primary)' : 'var(--puzzle-card-foreground)' }}>
                      초보
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 w-auto inline-flex justify-center items-center flex-shrink-0">
                      <span>36조각</span>
                    </span>
                  </div>
                </button>

                {/* Beginner Card */}
                <button
                  onClick={() => setTempDiff('beginner')}
                  className="flex flex-col items-center justify-center text-center p-2.5 sm:p-3.5 rounded-2xl border transition-all duration-200 hover-scale-effect active-scale-effect-95 min-w-0"
                  style={{
                    backgroundColor: tempDiff === 'beginner' ? 'var(--puzzle-secondary)' : 'var(--puzzle-glass-bg)',
                    borderColor: tempDiff === 'beginner' ? 'var(--puzzle-primary)' : 'var(--puzzle-border)',
                  }}
                >
                  <div className="flex flex-col items-center justify-center w-full gap-1 min-w-0">
                    <span className="text-xs sm:text-sm font-black truncate" style={{ color: tempDiff === 'beginner' ? 'var(--puzzle-primary)' : 'var(--puzzle-card-foreground)' }}>
                      일반
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 w-auto inline-flex justify-center items-center flex-shrink-0">
                      <span>100조각</span>
                    </span>
                  </div>
                </button>

                {/* Expert Card */}
                <button
                  onClick={() => setTempDiff('expert')}
                  className="flex flex-col items-center justify-center text-center p-2.5 sm:p-3.5 rounded-2xl border transition-all duration-200 hover-scale-effect active-scale-effect-95 min-w-0"
                  style={{
                    backgroundColor: tempDiff === 'expert' ? 'var(--puzzle-secondary)' : 'var(--puzzle-glass-bg)',
                    borderColor: tempDiff === 'expert' ? 'var(--puzzle-primary)' : 'var(--puzzle-border)',
                  }}
                >
                  <div className="flex flex-col items-center justify-center w-full gap-1 min-w-0">
                    <span className="text-xs sm:text-sm font-black truncate" style={{ color: tempDiff === 'expert' ? 'var(--puzzle-primary)' : 'var(--puzzle-card-foreground)' }}>
                      고수
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 w-auto inline-flex justify-center items-center flex-shrink-0">
                      <span>256조각</span>
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Ranked Mode Info */}
            <div className="mb-6 flex items-start gap-3.5 p-4 rounded-2xl border landscape-short-hide landscape-short-space" style={{ backgroundColor: 'var(--puzzle-secondary)', borderColor: 'var(--puzzle-primary)' }}>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: 'var(--puzzle-primary)', color: '#fff' }}
              >
                <Trophy size={18} />
              </div>
              <div className="flex-1">
                {completedDifficulties.includes(tempDiff) ? (
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

            {/* Warning for unauthenticated user */}
            {!isLoggedIn && (
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
                className="w-full sm:flex-1 py-3.5 rounded-xl text-white font-black text-sm transition-all duration-200 hover-scale-effect active-scale-effect-98"
                style={{
                  backgroundColor: 'var(--puzzle-primary)',
                  boxShadow: 'var(--puzzle-shadow-md)',
                }}
              >
                {completedDifficulties.includes(tempDiff) ? '다시 플레이하기' : '도전 시작하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Restarting */}
      {showConfirmRestart && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        >
          <div 
            className="relative w-full max-w-sm rounded-3xl border p-6 md:p-8"
            style={{
              backgroundColor: 'var(--puzzle-background)',
              borderColor: 'var(--puzzle-border)',
              boxShadow: 'var(--puzzle-shadow-lg)',
              animation: 'puzzle-modal-slide-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
            }}
          >
            <h3 className="text-xl font-black mb-3 text-red-500 flex items-center gap-2">
              ⚠️ 새로 시작하시겠습니까?
            </h3>
            <p className="text-sm font-medium leading-relaxed mb-6" style={{ color: 'var(--puzzle-muted-foreground)' }}>
              이미 진행 중인 퍼즐이 있습니다. 처음부터 다시 시작하시면 <strong className="text-red-500 font-bold">기존 진행 데이터는 삭제</strong>됩니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmRestart(false)}
                className="flex-1 py-3 rounded-xl border font-bold text-sm transition-colors hover:bg-zinc-50 active:bg-zinc-100"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--puzzle-foreground)',
                  borderColor: 'var(--puzzle-border)',
                }}
              >
                취소
              </button>
              <button
                onClick={handleConfirmRestart}
                className="flex-1 py-3 rounded-xl text-white font-black text-sm bg-red-500 hover:bg-red-600 transition-colors"
                style={{
                  boxShadow: 'var(--puzzle-shadow-md)',
                }}
              >
                새로 시작
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

