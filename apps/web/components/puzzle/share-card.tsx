'use client';

import { Share2, Link2 } from 'lucide-react';
import { Puzzle } from '@/types/puzzle';

interface ShareCardProps {
  puzzle: Puzzle;
}

export default function ShareCard({ puzzle }: ShareCardProps) {
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const Kakao = (window as any).Kakao;
      
      // Kakao SDK가 로드되었는지 확인
      if (Kakao) {
        // 초기화가 안 되어 있다면 명시적으로 초기화 수행
        if (Kakao.isInitialized && !Kakao.isInitialized()) {
          Kakao.init(process.env.NEXT_PUBLIC_KAKAO_API_KEY);
        }
        
        // 초기화 성공 시 공유 실행
        if (Kakao.isInitialized && Kakao.isInitialized()) {
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
      }
      
      // Kakao SDK 로드 또는 실행 실패 시 안내
      alert('카카오톡 공유 기능을 불러오지 못했습니다. 아래 링크 복사 버튼을 이용해 주세요! 💙');
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin + '/puzzle');
      alert('하루퍼즐 공유 링크가 클립보드에 복사되었습니다! 친구들에게 보내보세요. 💙');
    }
  };

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col justify-between gap-4"
      style={{
        backgroundColor: 'var(--puzzle-glass-bg)',
        backdropFilter: 'var(--puzzle-glass-blur)',
        borderColor: 'var(--puzzle-border)',
        boxShadow: 'var(--puzzle-shadow-sm)',
        minHeight: '180px',
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

      <div className="flex flex-col gap-2 w-full">
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-95 text-xs font-extrabold"
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
          <Share2 size={13} strokeWidth={2.5} />
          카카오톡으로 공유
        </button>

        <button
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.01] active:scale-95 text-xs font-extrabold"
          style={{
            backgroundColor: 'var(--puzzle-glass-bg)',
            color: 'var(--puzzle-foreground)',
            borderColor: 'var(--puzzle-border)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--puzzle-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--puzzle-border)';
          }}
        >
          <Link2 size={13} strokeWidth={2.5} style={{ color: 'var(--puzzle-primary)' }} />
          공유 링크 복사하기
        </button>
      </div>
    </div>
  );
}
