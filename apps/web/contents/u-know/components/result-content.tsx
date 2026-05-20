'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UKNOW_ROUTES, RESULT_REACTIONS } from '../constants';
import KakaoAdfit, { ADFIT_SIZES, ADFIT_UNITS } from '@/components/ads/kakao-adfit';

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
    
    // 카카오톡 URL 길이 제한(2048자) 및 OG 이미지 URL 길이 제한 방지
    const truncate = (str: string, max: number) => str.length > max ? str.slice(0, max) + '...' : str;
    
    // 공유 링크용 파라미터 (적당히 길이를 줄임)
    const safeQ = truncate(question, 40);
    const safeP = truncate(prediction, 40);
    const safeFa = truncate(friendAnswer, 40);
    const safeName = truncate(friendName, 20);

    const safeParams = new URLSearchParams();
    safeParams.set('q', safeQ);
    safeParams.set('p', safeP);
    safeParams.set('fa', safeFa);
    safeParams.set('name', safeName);
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?${safeParams.toString()}`;

    const resultDescriptions = [
      `${safeName} 답변 실화..? 아무도 예상 못한 결과 나옴 ㄷㄷ`,
      `출제자 예상 vs ${safeName} 실제 답변, 텔레파시 터졌을까? 👀`,
      `${safeName}의 답변에 다들 빵 터짐 ㅋㅋㅋ 직접 확인해봐`,
      `이 조합 레전드임... ${safeName} 답변 꼭 봐야 함`,
      `${safeName} 속마음 들킨 거 실화? 결과 보면 소름 돋음`,
    ];
    const resultDesc = resultDescriptions[Math.floor(Math.random() * resultDescriptions.length)];
    
    // OG 썸네일용 파라미터 (더 짧게 잘라서 에러 방지)
    const ogQ = truncate(question, 30);
    const ogImageUrl = `${window.location.origin}/api/og/u-know/result?q=${encodeURIComponent(ogQ)}&name=${encodeURIComponent(safeName)}&t=${Date.now()}`;
    
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '너잘알 결과 공개 🔮',
        description: resultDesc,
        imageUrl: ogImageUrl,
        imageWidth: 800,
        imageHeight: 400,
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
            <p className="uknow-result-text" style={{ whiteSpace: 'pre-wrap' }}>
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
            <p className="uknow-compare-answer" style={{ whiteSpace: 'pre-wrap' }}>
              {prediction}
            </p>
          </div>

          {/* 가운데 공개 버튼 */}
          {!revealed && (
            <div className="uknow-compare-divider" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <button
                className="uknow-reveal-btn"
                onClick={() => {
                  handleShareKakao();
                  // 카카오톡 팝업이 뜨는 시간을 고려하여 약간의 지연 후 결과 공개
                  setTimeout(() => {
                    handleReveal();
                  }, 500);
                }}
                aria-label="카톡 공유하고 결과 공개하기"
                style={{ background: '#FEE500', color: '#000000', border: '1px solid rgba(0,0,0,0.1)' }}
              >
                <span className="uknow-reveal-btn__text">💬 카톡 공유하고 결과 보기</span>
              </button>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary, #666)', marginTop: '8px', textAlign: 'center', lineHeight: '1.4' }}>
                창을 닫으면 결과를 다시 볼 수 없어요!<br/>'나에게 쓰기'나 친구에게 공유해서 저장해보세요.
              </p>
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
              <p className="uknow-compare-answer" style={{ whiteSpace: 'pre-wrap' }}>
                {friendAnswer}
              </p>
            ) : (
              <div className="uknow-compare-hidden">
                <span>???</span>
                <p className="uknow-compare-hidden-hint">카톡으로 공유해야 결과를 볼 수 있어요 🔒</p>
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

        <div style={{ margin: '8px 0', display: 'flex', justifyContent: 'center' }}>
          <KakaoAdfit unit={ADFIT_UNITS.MAIN_BANNER} {...ADFIT_SIZES.BANNER_320x100} />
        </div>

        {/* 하단 버튼 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px' }}>
          <button
            className="uknow-btn uknow-btn--primary uknow-card--tilted-left"
            onClick={() => router.push(UKNOW_ROUTES.CREATE)}
          >
            나도 만들기
          </button>
          {revealed && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
              <button
                className="uknow-btn uknow-btn--kakao uknow-card--tilted-right"
                onClick={handleShareKakao}
                style={{ flex: 1 }}
              >
                결과 공유하기
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
