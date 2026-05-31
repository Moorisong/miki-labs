'use client';

import { Share2 } from 'lucide-react';
import { Puzzle } from '@/types/puzzle';

interface ShareCardProps {
  puzzle: Puzzle;
}

export default function ShareCard({ puzzle }: ShareCardProps) {
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const Kakao = (window as any).Kakao;
      
      // Kakao SDK가 로드되고 초기화되었는지 확인
      if (Kakao && Kakao.isInitialized && Kakao.isInitialized()) {
        try {
          Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
              title: `🧩 하루퍼즐 - ${puzzle.title}`,
              description: `이번 주 퍼즐 ${puzzle.week}주차에 참여하여 친구들과 랭킹을 겨뤄보세요!`,
              imageUrl: puzzle.imageUrl,
              link: {
                mobileWebUrl: window.location.origin + '/puzzle',
                webUrl: window.location.origin + '/puzzle',
              },
            },
            buttons: [
              {
                title: '퍼즐 맞추러 가기',
                link: {
                  mobileWebUrl: window.location.origin + '/puzzle',
                  webUrl: window.location.origin + '/puzzle',
                },
              },
            ],
          });
          return;
        } catch (e) {
          console.error('Kakao share error:', e);
        }
      }
      
      // Fallback: 복사하기
      navigator.clipboard.writeText(window.location.origin + '/puzzle');
      alert('하루퍼즐 공유 링크가 클립보드에 복사되었습니다! 친구들에게 보내보세요. 💙');
    }
  };

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col justify-between"
      style={{
        backgroundColor: 'var(--puzzle-glass-bg)',
        backdropFilter: 'var(--puzzle-glass-blur)',
        borderColor: 'var(--puzzle-border)',
        boxShadow: 'var(--puzzle-shadow-sm)',
        minHeight: '160px',
      }}
    >
      <div>
        <p className="text-sm font-extrabold" style={{ color: 'var(--puzzle-card-foreground)' }}>
          친구에게 공유하기
        </p>
        <p className="mt-1 text-xs font-semibold leading-relaxed" style={{ color: 'var(--puzzle-muted-foreground)' }}>
          매주 제공되는 새로운 퍼즐을 친구들과 나누며 힐링과 주간 랭킹을 경쟁해보세요!
        </p>
      </div>

      <button
        onClick={handleShare}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-95 text-xs font-extrabold"
        style={{
          backgroundColor: '#FEE500',
          color: '#191919',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#F5DC00';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FEE500';
        }}
      >
        <Share2 size={14} strokeWidth={2.5} />
        카카오톡으로 공유
      </button>
    </div>
  );
}
