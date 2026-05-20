'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UKNOW_ROUTES, UKNOW_LIMITS } from '../constants';
import { submitAnswer } from '../api';
import ReactionOverlay from './reaction-overlay';
import KakaoAdfit, { ADFIT_SIZES, ADFIT_UNITS } from '@/components/ads/kakao-adfit';

interface PlayContentProps {
  token: string;
}

export default function PlayContent({ token }: PlayContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [friendAnswer, setFriendAnswer] = useState('');
  const [responderName, setResponderName] = useState('');
  const [showReaction, setShowReaction] = useState(false);

  // 질문 데이터를 query param에서 가져오기
  const question = searchParams.get('q') || '질문을 불러올 수 없어요';
  const prediction = searchParams.get('p') || '';

  const isValid = friendAnswer.trim().length > 0 && responderName.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;

    setShowReaction(true);

    const res = await submitAnswer({
      token,
      responderName,
      answers: [
        {
          questionIndex: 0,
          actualAnswer: friendAnswer,
        },
      ],
      security: {
        fingerprintHash: 'dummy',
        ipHash: 'dummy',
      },
    });

    if (res.success) {
      setTimeout(() => {
        const params = new URLSearchParams();
        params.set('q', question);
        params.set('p', prediction);
        params.set('fa', friendAnswer);
        params.set('name', responderName);
        router.push(`${UKNOW_ROUTES.RESULT(token)}?${params.toString()}`);
      }, 750);
    } else {
      setShowReaction(false);
      alert(res.error || '답변 제출 중 오류가 발생했습니다.');
    }
  };

  return (
    <main className="uknow-page">
      <div style={{ maxWidth: '400px', width: '100%', display: 'flex', flexDirection: 'column' }}>
        <header style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 className="uknow-title" style={{ fontSize: 'var(--font-size-2xl)' }}>
          친구가 보낸<br />질문이야
        </h1>
        <span className="uknow-badge uknow-badge--accent" style={{ marginTop: '12px' }}>
          네 답을 어떻게 예상했을까? 👀
        </span>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
        <div className="uknow-card uknow-card--tilted-left">
          <div className="uknow-question-box" style={{ marginBottom: '16px' }}>
            <p style={{ fontWeight: 900, fontSize: 'var(--font-size-sm)', color: '#666', marginBottom: '8px' }}>
              질문
            </p>
            <p style={{ fontWeight: 900, fontSize: 'var(--font-size-xl)', whiteSpace: 'pre-wrap' }}>
              {question}
            </p>
          </div>

          <label className="uknow-label" htmlFor="name-input">
            이름 ✍️
          </label>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input
              id="name-input"
              className="uknow-input"
              type="text"
              value={responderName}
              onChange={(e) => setResponderName(e.target.value)}
              placeholder="이름 입력"
              maxLength={UKNOW_LIMITS.MAX_NAME_LENGTH}
              style={{ paddingRight: '60px' }}
            />
            <span style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-text-muted, #999)'
            }}>
              {responderName.length}/{UKNOW_LIMITS.MAX_NAME_LENGTH}
            </span>
          </div>

          <label className="uknow-label" htmlFor="friend-answer-input">
            네 답변은? 💬
          </label>
          <textarea
            id="friend-answer-input"
            className="uknow-textarea"
            value={friendAnswer}
            onChange={(e) => setFriendAnswer(e.target.value)}
            placeholder="솔직하게 답해봐 ㅋㅋ"
            maxLength={UKNOW_LIMITS.MAX_ANSWER_LENGTH}
          />
          <div className="uknow-char-count">
            {friendAnswer.length}/{UKNOW_LIMITS.MAX_ANSWER_LENGTH}
          </div>
        </div>

        <button
          className="uknow-btn uknow-btn--primary uknow-card--tilted-right"
          onClick={handleSubmit}
          disabled={!isValid}
        >
          답변 제출!
        </button>

        <div style={{ margin: '8px 0', display: 'flex', justifyContent: 'center' }}>
          <KakaoAdfit unit={ADFIT_UNITS.MAIN_BANNER} {...ADFIT_SIZES.BANNER_320x100} />
        </div>

        <div className="uknow-hint-box">
          💡 친구가 내 답변 예상했을까?<br />
          궁금하면 답변 고고
        </div>
      </div>

      {showReaction && (
        <ReactionOverlay text={'보내는 중...\n두근두근 😎'} />
      )}
      </div>
    </main>
  );
}
