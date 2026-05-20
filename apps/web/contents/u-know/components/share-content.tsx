'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UKNOW_ROUTES } from '../constants';

interface ShareContentProps {
  token: string;
  question?: string;
  myAnswer?: string;
}

export default function ShareContent({ token, question: questionProp, myAnswer: myAnswerProp }: ShareContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  // 로컬 개발 환경 여부
  const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

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
    const ogImageUrl = `${window.location.origin}/api/og/u-know/play?q=${encodeURIComponent(question || '내가 뭐라고 답할까?')}&t=${Date.now()}`;
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '너잘알👀 질문지가 도착했어요!',
        description: `"${question}"\n내가 뭐라고 답할지 맞춰봐! 😆`,
        imageUrl: ogImageUrl,
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

  const handleOgPreview = () => {
    const ogUrl = `/api/og/u-know/play?q=${encodeURIComponent(question || '내가 뭐라고 답할까?')}`;
    window.open(ogUrl, '_blank');
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
              <p style={{ fontWeight: 900, fontSize: 'var(--font-size-lg)' }}>
                {question}
              </p>
            </div>
          )}
          {myAnswer && (
            <div className="uknow-prediction-box" style={{ transform: 'none', background: '#FFFAED', borderColor: '#FAD7A1', boxShadow: '3px 3px 0 0 #FAD7A1' }}>
              <p style={{ fontWeight: 900, fontSize: 'var(--font-size-sm)', color: '#E67E22', marginBottom: '8px' }}>
                친구가 이렇게 답할 것 같음
              </p>
              <p style={{ fontWeight: 900, fontSize: 'var(--font-size-lg)' }}>
                {myAnswer}
              </p>
            </div>
          )}
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

            {isDev && (
              <button
                onClick={handleOgPreview}
                title="OG 이미지 미리보기"
                style={{
                  flexShrink: 0,
                  padding: '0 14px',
                  borderRadius: '12px',
                  border: '2px solid #1E293B',
                  background: '#F1F5F9',
                  color: '#1E293B',
                  fontWeight: 900,
                  fontSize: '20px',
                  cursor: 'pointer',
                  boxShadow: '3px 3px 0 0 #1E293B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'rotate(1deg)',
                  transition: 'all 0.15s',
                }}
              >
                🖼️
              </button>
            )}
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


