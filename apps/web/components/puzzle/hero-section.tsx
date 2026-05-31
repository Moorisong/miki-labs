'use client';

import { useState } from 'react';
import { Clock, Users, Trophy, Play, Layers } from 'lucide-react';
import { Puzzle } from '@/types/puzzle';

interface HeroSectionProps {
  puzzle: Puzzle;
  onStart: (difficulty: 'beginner' | 'expert') => void;
  onResume?: () => void;
  hasSavedGame: boolean;
  progress: number;
}

export default function HeroSection({
  puzzle,
  onStart,
  onResume,
  hasSavedGame,
  progress,
}: HeroSectionProps) {
  const [showDiffSelect, setShowDiffSelect] = useState(false);

  // 남은 날짜 계산
  const getDaysLeft = () => {
    const end = new Date(puzzle.endDate).getTime();
    const diff = end - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}일` : '마감 임박';
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
              로그인 시 공식 랭킹 및 이력 관리가 가능하며, 비로그인 시에도 즉시 플레이와 이어서 그리드가 가능합니다.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-5 mb-8">
              <div className="flex items-center gap-2">
                <Clock size={16} style={{ color: 'var(--puzzle-primary)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                  <span style={{ color: 'var(--puzzle-card-foreground)', fontWeight: 750 }}>{getDaysLeft()}</span> 남음
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
              {!showDiffSelect ? (
                <button
                  onClick={() => setShowDiffSelect(true)}
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 text-white"
                  style={{
                    backgroundColor: 'var(--puzzle-primary)',
                    fontSize: '15px',
                    fontWeight: 700,
                    boxShadow: 'var(--puzzle-animate-pulse-glow)',
                  }}
                >
                  <Play size={16} strokeWidth={2.5} />
                  퍼즐 시작하기
                </button>
              ) : (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => onStart('beginner')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-white font-bold text-sm transition-transform hover:scale-[1.02]"
                    style={{ backgroundColor: '#22C55E' }}
                  >
                    Beginner (100조각 · 🏆 랭킹반영)
                  </button>
                  <button
                    onClick={() => onStart('expert')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-white font-bold text-sm transition-transform hover:scale-[1.02]"
                    style={{ backgroundColor: 'var(--puzzle-primary)' }}
                  >
                    Expert (256조각 · 🧘 힐링)
                  </button>
                </div>
              )}

              {hasSavedGame && onResume && (
                <button
                  onClick={onResume}
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-95"
                  style={{
                    backgroundColor: 'var(--puzzle-glass-bg)',
                    color: 'var(--puzzle-foreground)',
                    borderColor: 'var(--puzzle-border)',
                    fontSize: '15px',
                    fontWeight: 650,
                  }}
                >
                  이어하기 ({progress}%)
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
                style={{ height: 'clamp(260px, 40vw, 420px)' }}
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

            {/* Floating stats card */}
            <div 
              className="absolute -top-3 -right-3 px-4 py-3 rounded-xl border border-border"
              style={{
                backgroundColor: 'var(--puzzle-glass-bg)',
                backdropFilter: 'var(--puzzle-glass-blur)',
                border: '1px solid var(--puzzle-glass-border)',
                boxShadow: 'var(--puzzle-shadow-md)',
              }}
            >
              <div className="flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--puzzle-primary)' }}>
                <Layers size={13} />
                <span>Beginner / Expert</span>
              </div>
              <p className="mt-0.5 text-sm font-extrabold" style={{ color: 'var(--puzzle-card-foreground)' }}>
                100조각 / 256조각
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
