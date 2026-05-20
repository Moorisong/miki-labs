'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UKNOW_ROUTES, RESULT_REACTIONS } from '../constants';

interface ResultContentProps {
  token: string;
}

export default function ResultContent({ token }: ResultContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [revealed, setRevealed] = useState(false);

  // query params에서 실제 데이터 읽기
  const question = searchParams.get('q') || '질문을 불러올 수 없어요';
  const prediction = searchParams.get('p') || '예상 답변을 불러올 수 없어요';
  const friendAnswer = searchParams.get('fa') || '친구 답변을 불러올 수 없어요';
  const friendName = searchParams.get('name') || '친구';


  const reaction = useMemo(
    () => RESULT_REACTIONS[Math.floor(Math.random() * RESULT_REACTIONS.length)],
    []
  );

  const handleReveal = () => {
    if (revealed) return;
    setRevealed(true);
  };

  const handleShareKakao = () => {
    if (typeof window === 'undefined' || !window.Kakao) return;
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_API_KEY);
    }
    const shareUrl = window.location.href;
    const ogImageUrl = `${window.location.origin}/api/og/u-know/result?q=${encodeURIComponent(question)}&name=${encodeURIComponent(friendName)}`;
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '우리의 텔레파시 결과는?! 🔮',
        description: `"${question}"\n출제자의 예상과 ${friendName}의 실제 답변 결과를 확인해보세요!`,
        imageUrl: ogImageUrl,
        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
      },
      buttons: [
        {
          title: '결과 구경하기',
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
            결과 공개! 🎊
          </h1>
          <p className="uknow-subtitle">
            과연 답이 맞았을까?
          </p>
        </header>

        {/* 질문 카드 */}
        <div className="uknow-card uknow-card--tilted-left">
          <div className="uknow-question-box">
            <p className="uknow-result-label">
              질문
            </p>
            <p className="uknow-result-text">
              &ldquo;{question}&rdquo;
            </p>
          </div>
        </div>

        {/* 답변 비교 영역 */}
        <div className="uknow-compare-section">
          {/* 내 예상 */}
          <div className="uknow-compare-card uknow-compare-card--mine">
            <div className="uknow-compare-header">
              <span className="uknow-compare-emoji">🤔</span>
              <span className="uknow-compare-who">출제자의 예상</span>
            </div>
            <p className="uknow-compare-answer">
              {prediction}
            </p>
          </div>

          {/* 가운데 공개 버튼 */}
          {!revealed && (
            <div className="uknow-compare-divider">
              <button
                className="uknow-reveal-btn"
                onClick={handleReveal}
                aria-label="친구 답변 공개하기"
              >
                <span className="uknow-reveal-btn__text">👇 터치해서 공개</span>
              </button>
            </div>
          )}

          {/* 친구 실제 답변 */}
          <div className={`uknow-compare-card uknow-compare-card--friend ${revealed ? 'uknow-compare-card--revealed' : ''}`} style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-16px', right: '-12px', fontSize: '32px', transform: 'rotate(15deg)', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.15))', zIndex: 10 }}>
              ✨
            </div>
            <div className="uknow-compare-header">
              <span className="uknow-compare-emoji">💬</span>
              <span className="uknow-compare-who">{friendName}의 실제 답변</span>
            </div>
            {revealed ? (
              <p className="uknow-compare-answer">
                {friendAnswer}
              </p>
            ) : (
              <div className="uknow-compare-hidden">
                <span>???</span>
                <p className="uknow-compare-hidden-hint">위 버튼을 눌러서 확인해봐</p>
              </div>
            )}
          </div>
        </div>

        {/* 리액션 */}
        {revealed && (
          <div className="uknow-reaction-card" style={{ transform: 'rotate(2deg)', padding: '12px 20px', marginTop: '16px' }}>
            <p style={{ fontSize: 'var(--font-size-md)', fontWeight: 800 }}>
              {reaction}
            </p>
          </div>
        )}

        {/* 하단 버튼 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px' }}>
          <button
            className="uknow-btn uknow-btn--primary uknow-card--tilted-left"
            onClick={() => router.push(UKNOW_ROUTES.CREATE)}
          >
            나도 만들기
          </button>
          <button
            className="uknow-btn uknow-btn--kakao uknow-card--tilted-right"
            onClick={handleShareKakao}
          >
            결과 공유하기
          </button>
        </div>
      </div>
    </main>
  );
}
