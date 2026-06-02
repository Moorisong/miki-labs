'use client';

import { useEffect, useState } from 'react';
import { X, Trophy, Share2, Home, Save, LogIn } from 'lucide-react';
import { MyRanking } from '@/types/puzzle';

interface CompletionModalProps {
  onClose: () => void;
  onGoHome: () => void;
  onSaveRecord?: () => void;
  onShare?: () => void;
  completionTimeFormatted: string;
  myRanking: MyRanking | null;
  isLoggedIn: boolean;
  isSaving: boolean;
  isSaved: boolean;
  mode?: 'ranked' | 'solo';
}

const CONFETTI_COLORS = ['#4F8EF7', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function ConfettiPiece({ index }: { index: number }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const left = (index * 17 + 5) % 100;
  const duration = 2.5 + (index % 5) * 0.4;
  const delay = (index * 0.1) % 1.5;
  const size = 7 + (index % 3) * 3;
  const isCircle = index % 3 === 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${left}%`,
        top: '-20px',
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: isCircle ? '50%' : '2px',
        animation: `puzzle-confetti-fall ${duration}s ${delay}s ease-in both`,
        transform: `rotate(${index * 37}deg)`,
      }}
    />
  );
}

export default function CompletionModal({
  onClose,
  onGoHome,
  onSaveRecord,
  onShare,
  completionTimeFormatted,
  myRanking,
  isLoggedIn,
  isSaving,
  isSaved,
  mode = 'solo',
}: CompletionModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
    >
      {/* Confetti Layer */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 60 }, (_, i) => (
          <ConfettiPiece key={i} index={i} />
        ))}
      </div>

      {/* Modal Container */}
      <div
        className="relative w-full max-w-md rounded-3xl border p-8 text-center"
        style={{
          backgroundColor: 'var(--puzzle-background)',
          border: '1px solid var(--puzzle-border)',
          boxShadow: 'var(--puzzle-shadow-lg)',
          transform: visible ? 'scale(1)' : 'scale(0.92)',
          opacity: visible ? 1 : 0,
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg transition-colors"
          style={{ color: 'var(--puzzle-muted-foreground)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--puzzle-muted)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <X size={18} />
        </button>

        {/* Trophy icon container */}
        <div
          className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center animate-bounce"
          style={{ backgroundColor: '#FFF3E0' }}
        >
          <Trophy size={36} style={{ color: '#F59E0B' }} />
        </div>

        {/* Title */}
        <h2
          className="mb-2 text-2xl font-black"
          style={{ color: 'var(--puzzle-card-foreground)' }}
        >
          퍼즐 완성! 🎉
        </h2>
        <p
          className="mb-6 text-sm font-semibold leading-relaxed"
          style={{ color: 'var(--puzzle-muted-foreground)' }}
        >
          모든 퍼즐 조각을 알맞은 자리에 맞추셨습니다!
          <br />
          고요한 힐링 속 뛰어난 집중력이 돋보이네요.
        </p>

        {/* Completion Time Badge */}
        <div
          className="inline-flex flex-col items-center px-8 py-4 rounded-2xl mb-6"
          style={{ backgroundColor: 'var(--puzzle-muted)', border: '1px solid var(--puzzle-border)' }}
        >
          <p className="text-xs mb-1 font-bold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
            소요 시간
          </p>
          <p
            className="tabular-nums font-black"
            style={{ fontSize: '36px', color: 'var(--puzzle-primary)', letterSpacing: '-0.5px' }}
          >
            {completionTimeFormatted}
          </p>
        </div>

        {mode === 'solo' && (
          <p className="text-[11px] font-bold mb-6 -mt-2 leading-relaxed" style={{ color: 'var(--puzzle-muted-foreground)' }}>
            ※ 힐링 플레이 모드는 랭킹 등록 및 순위 경쟁에서 제외됩니다.
          </p>
        )}

        {/* 랭킹 반영 수치 표시 (기록이 저장되었거나 로그인된 상태에서 랭킹 모드일 시) */}
        {myRanking && myRanking.myRank !== null && (
          <div
            className="flex items-center justify-center gap-6 mb-8 py-4 rounded-2xl border"
            style={{ backgroundColor: 'var(--puzzle-glass-bg)', borderColor: 'var(--puzzle-border)' }}
          >
            <div className="text-center">
              <p className="text-xs mb-1 font-bold" style={{ color: 'var(--puzzle-muted-foreground)' }}>현재 내 순위</p>
              <p className="text-lg font-black" style={{ color: 'var(--puzzle-card-foreground)' }}>
                🎖️ {myRanking.myRank}위
              </p>
            </div>
            <div className="w-px h-10" style={{ backgroundColor: 'var(--puzzle-border)' }} />
            <div className="text-center">
              <p className="text-xs mb-1 font-bold" style={{ color: 'var(--puzzle-muted-foreground)' }}>백분율 범위</p>
              <p className="text-lg font-black" style={{ color: 'var(--puzzle-primary)' }}>
                상위 {myRanking.topPercent}%
              </p>
            </div>
          </div>
        )}

        {/* Buttons / Actions */}
        <div className="flex flex-col gap-3">
          {isLoggedIn ? (
            onSaveRecord && (
              <button
                onClick={onSaveRecord}
                disabled={isSaving || isSaved}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-extrabold text-sm text-white transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                style={{ backgroundColor: isSaved ? '#22C55E' : 'var(--puzzle-primary)' }}
              >
                <Save size={16} strokeWidth={2.5} />
                <span>
                  {isSaved 
                    ? (mode === 'solo' ? '기록 저장 완료! 💾' : '기록 저장 완료! 🏆') 
                    : isSaving 
                      ? '기록을 업로드하는 중...' 
                      : (mode === 'solo' ? '내 기록실에 저장하기' : '공식 랭킹에 기록 등록하기')}
                </span>
              </button>
            )
          ) : (
            <button
              onClick={onSaveRecord} // 바깥에서 로그인 가이드를 띄우거나 로그인 페이지로 보냄
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-extrabold text-sm text-white transition-all active:scale-95"
              style={{ backgroundColor: '#EF4444' }}
            >
              <LogIn size={16} strokeWidth={2.5} />
              <span>{mode === 'solo' ? '로그인하고 기록 저장하기 💾' : '로그인하고 랭킹 등록하기 🏆'}</span>
            </button>
          )}

          {onShare && (
            <button
              onClick={onShare}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs transition-all active:scale-95"
              style={{
                backgroundColor: '#FEE500',
                color: '#191919',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5DC00'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FEE500'; }}
            >
              <Share2 size={15} strokeWidth={2.5} />
              카카오톡으로 자랑하기
            </button>
          )}

          <button
            onClick={onGoHome}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border transition-all active:scale-95 font-semibold text-xs"
            style={{
              backgroundColor: 'var(--puzzle-muted)',
              color: 'var(--puzzle-foreground)',
              borderColor: 'var(--puzzle-border)',
            }}
          >
            <Home size={15} strokeWidth={2} />
            메인 페이지로 이동
          </button>
        </div>
      </div>
    </div>
  );
}
