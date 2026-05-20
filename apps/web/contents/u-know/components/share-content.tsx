'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UKNOW_ROUTES } from '../constants';
import KakaoAdfit, { ADFIT_SIZES, ADFIT_UNITS } from '@/components/ads/kakao-adfit';

interface ShareContentProps {
  token: string;
  question?: string;
  myAnswer?: string;
}

export default function ShareContent({ token, question: questionProp, myAnswer: myAnswerProp }: ShareContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  // props로 안 넘어온 경우 query string에서 읽기
  const question = questionProp ?? searchParams.get('q') ?? undefined;
  const myAnswer = myAnswerProp ?? searchParams.get('a') ?? undefined;

  // play 링크에 질문과 예상 답변을 query param으로 포함 (친구에게는 prediction이 보이지 않음)
  const playParams = new URLSearchParams();
  if (question) playParams.set('q', question);
  if (myAnswer) playParams.set('p', myAnswer);
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${UKNOW_ROUTES.PLAY(token)}?${playParams.toString()}`
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard API unavailable */
    }
  };

  const handleKakaoShare = () => {
    if (typeof window === 'undefined' || !window.Kakao) return;
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_API_KEY);
    }
    
    // 너무 긴 질문이나 답변으로 인한 카카오톡 링크 오류(2048자 제한) 방지
    const truncate = (str: string, max: number) => str.length > max ? str.slice(0, max) + '...' : str;
    const safeQ = truncate(question || '내가 뭐라고 답할까?', 40);
    const ogQ = truncate(question || '내가 뭐라고 답할까?', 30);
    
    const ogImageUrl = `${window.location.origin}/api/og/u-know/play?q=${encodeURIComponent(ogQ)}&t=${Date.now()}`;
    
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '질문지가 도착했어요!',
        description: `"${safeQ}"\n내가 뭐라고 답할지 맞춰봐! 😆`,
        imageUrl: ogImageUrl,
        imageWidth: 800,
        imageHeight: 400,
        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
      },
      buttons: [
        {
          title: '질문 확인하고 답하기',
          link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
        },
      ],
    });
  };

  return (
    <main className="uknow-page">
      <div style={{ maxWidth: '400px', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <header style={{ textAlign: 'center' }}>
          <h1 className="uknow-title" style={{ fontSize: 'var(--font-size-2xl)' }}>
            준비 완료! 🎉
          </h1>
          <p className="uknow-subtitle">이제 친구한테 던져봐</p>
        </header>

        <div className="uknow-card uknow-card--tilted-left" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {question && (
            <div className="uknow-question-box">
              <p style={{ fontWeight: 900, fontSize: 'var(--font-size-sm)', color: '#666', marginBottom: '8px' }}>
                내가 만든 질문
              </p>
              <p style={{ fontWeight: 900, fontSize: 'var(--font-size-lg)', whiteSpace: 'pre-wrap' }}>
                {question}
              </p>
            </div>
          )}
          {myAnswer && (
            <div className="uknow-prediction-box" style={{ transform: 'none', background: '#FFFAED', borderColor: '#FAD7A1', boxShadow: '3px 3px 0 0 #FAD7A1' }}>
              <p style={{ fontWeight: 900, fontSize: 'var(--font-size-sm)', color: '#E67E22', marginBottom: '8px' }}>
                친구가 이렇게 답할 것 같음
              </p>
              <p style={{ fontWeight: 900, fontSize: 'var(--font-size-lg)', whiteSpace: 'pre-wrap' }}>
                {myAnswer}
              </p>
            </div>
          )}
        </div>

        <div style={{ margin: '8px 0', display: 'flex', justifyContent: 'center' }}>
          <KakaoAdfit unit={ADFIT_UNITS.MAIN_BANNER} {...ADFIT_SIZES.BANNER_320x100} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 카카오 공유 + 로컬 OG 미리보기 버튼 (row) */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
            <button
              className="uknow-btn uknow-btn--kakao uknow-card--tilted-left"
              onClick={handleKakaoShare}
              style={{ flex: 1 }}
            >
              💬 카톡 단톡방에 투척
            </button>
          </div>

          <button
            className="uknow-btn uknow-btn--outline uknow-card--tilted-right"
            onClick={handleCopy}
          >
            {copied ? '복사 완료! ✅' : '📋 링크 복사'}
          </button>
        </div>


      </div>
    </main>
  );
}


