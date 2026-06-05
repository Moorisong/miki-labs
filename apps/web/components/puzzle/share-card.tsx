'use client';

import { useState } from 'react';
import { Share2, Link2, Check } from 'lucide-react';
import { Puzzle } from '@/types/puzzle';

interface ShareCardProps {
  puzzle: Puzzle;
}

export default function ShareCard({ puzzle }: ShareCardProps) {
  const [isCopied, setIsCopied] = useState(false);

  const getAbsoluteImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // 상대 경로 이미지인 경우 도메인을 붙여 절대 경로로 변환 (카카오 연동 필수 조건)
    return window.location.origin + url;
  };

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
            const absImgUrl = getAbsoluteImageUrl(puzzle.imageUrl);
            Kakao.Share.sendDefault({
              objectType: 'feed',
              content: {
                title: `[하루퍼즐] 이번 주 퍼즐 도착!`,
                description: `바쁜 일상 속 소소한 퍼즐 한 조각 어떠세요? ☕`,
                imageUrl: absImgUrl,
                link: {
                  mobileWebUrl: window.location.origin + '/puzzle',
                  webUrl: window.location.origin + '/puzzle',
                },
              },
              buttons: [
                {
                  title: '함께 플레이하기',
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
      alert('카카오톡 공유 기능을 불러오지 못했습니다. 아래 링크 복사 버튼을 이용해 주세요!');
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin + '/puzzle');
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
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
          친구에게 자랑하기
        </p>
        <p className="mt-1 text-xs font-semibold leading-relaxed" style={{ color: 'var(--puzzle-muted-foreground)' }}>
          매주 갱신되는 갓생 맞춤형 감성 퍼즐! 내 뇌지컬 순위 폼을 친구들한테 당당하게 인증해 보세요.
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
          disabled={isCopied}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.01] active:scale-95 text-xs font-extrabold disabled:pointer-events-none"
          style={{
            backgroundColor: isCopied ? 'var(--puzzle-secondary)' : 'var(--puzzle-glass-bg)',
            color: isCopied ? 'var(--puzzle-primary)' : 'var(--puzzle-foreground)',
            borderColor: isCopied ? 'var(--puzzle-primary)' : 'var(--puzzle-border)',
          }}
          onMouseEnter={(e) => {
            if (!isCopied) e.currentTarget.style.borderColor = 'var(--puzzle-primary)';
          }}
          onMouseLeave={(e) => {
            if (!isCopied) e.currentTarget.style.borderColor = 'var(--puzzle-border)';
          }}
        >
          {isCopied ? (
            <>
              <Check size={13} strokeWidth={2.5} style={{ color: 'var(--puzzle-primary)' }} />
              링크 복사 완료
            </>
          ) : (
            <>
              <Link2 size={13} strokeWidth={2.5} style={{ color: 'var(--puzzle-primary)' }} />
              공유 링크 복사하기
            </>
          )}
        </button>
      </div>
    </div>
  );
}
