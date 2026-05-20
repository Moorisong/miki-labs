'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  UKNOW_ROUTES,
  UKNOW_LIMITS,
  EXAMPLE_QUESTIONS,
  TTL_NOTICE,
} from '../constants';
import ReactionOverlay from './reaction-overlay';
import KakaoAdfit, { ADFIT_SIZES, ADFIT_UNITS } from '@/components/ads/kakao-adfit';

const BADGE_TEXTS = [
  '나 너 꿰뚫고 있음 (진심) 🫵',
  '너 속 다 보임 솔직히 🫵',
  '너 나한테 읽힘 (항상) 🫠',
  '니 생각 이미 파악함ㅋ 🧐',
  '너 뭐라 할지 딱 알겠음 👁️',
];

export default function CreateContent() {
  const router = useRouter();
  const questionInputRef = useRef<HTMLTextAreaElement>(null);
  const [badgeText, setBadgeText] = useState(BADGE_TEXTS[0]);
  const [badgeVisible, setBadgeVisible] = useState(false);
  useEffect(() => {
    setBadgeText(BADGE_TEXTS[Math.floor(Math.random() * BADGE_TEXTS.length)]);
    setBadgeVisible(true);
  }, []);
  const [question, setQuestion] = useState('');
  const [myAnswer, setMyAnswer] = useState('');
  const [showReaction, setShowReaction] = useState(false);

  const isValid = question.trim().length > 0 && myAnswer.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;

    setShowReaction(true);
    setTimeout(() => {
      const testId = Math.random().toString(36).substring(7);
      router.push(
        `${UKNOW_ROUTES.SHARE(testId)}?q=${encodeURIComponent(question)}&a=${encodeURIComponent(myAnswer)}`
      );
    }, 750);
  };

  return (
    <main className="uknow-page">
      <div style={{ maxWidth: '400px', width: '100%', display: 'flex', flexDirection: 'column' }}>
        <header style={{ textAlign: 'center', marginBottom: '32px' }}>
        <style>{`
          @keyframes sparkle-pulse {
            0%, 100% { transform: rotate(-2deg) scale(1); box-shadow: 0 8px 16px rgba(255, 107, 129, 0.4); }
            50% { transform: rotate(-1deg) scale(1.05); box-shadow: 0 16px 32px rgba(255, 107, 129, 0.6); }
          }
          @keyframes slide-right {
            0% { transform: translateX(-4px); opacity: 0.2; }
            50% { transform: translateX(2px); opacity: 1; }
            100% { transform: translateX(6px); opacity: 0.2; }
          }
          @keyframes float-icon {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
        `}</style>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <span
            className="uknow-badge"
            style={{
              opacity: badgeVisible ? 1 : 0,
              transition: 'opacity 0.5s ease',
              transform: 'rotate(-2deg)',
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 900,
              padding: '16px 32px',
              borderRadius: '24px',
              background: '#ff6b81',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 8px 16px rgba(255, 107, 129, 0.4)',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              wordBreak: 'keep-all'
            }}
          >
            {badgeText}
          </span>          
        </div>

        <div className="uknow-card" style={{ 
          marginTop: '48px', 
          padding: '24px 12px', 
          transform: 'rotate(1deg)',
          background: 'rgba(108, 92, 231, 0.03)',
          border: '2px dashed rgba(108, 92, 231, 0.3)',
          boxShadow: 'none',
          position: 'relative'
        }}>
          <p style={{ fontWeight: 900, fontSize: 'var(--font-size-sm)', marginBottom: '20px', color: 'var(--color-primary)', textAlign: 'center', opacity: 0.8 }}>
            어떻게 노는거야?
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
              <div style={{ 
                fontSize: '28px', background: '#fff', width: '56px', height: '56px', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', borderRadius: '20px', 
                border: '2px solid var(--color-primary)', boxShadow: '0 4px 0 var(--color-primary)',
                animation: 'float-icon 2s infinite ease-in-out',
                overflow: 'hidden'
              }}>
                <img src="/images/u-know/icon-write.png" alt="질문작성" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-text)', textAlign: 'center', wordBreak: 'keep-all', lineHeight: 1.3 }}>
                내 질문과<br/>예상답 적기
              </div>
            </div>

            <div style={{ fontSize: '16px', color: 'var(--color-primary)', animation: 'slide-right 1.5s infinite', animationDelay: '0.2s' }}>▶</div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
              <div style={{ 
                fontSize: '28px', background: '#fff', width: '56px', height: '56px', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', borderRadius: '20px', 
                border: '2px solid var(--color-primary)', boxShadow: '0 4px 0 var(--color-primary)',
                animation: 'float-icon 2s infinite ease-in-out', animationDelay: '0.2s',
                overflow: 'hidden'
              }}>
                <img src="/images/u-know/icon-share.png" alt="공유하기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-text)', textAlign: 'center', wordBreak: 'keep-all', lineHeight: 1.3 }}>
                친구한테<br/>링크 보내기
              </div>
            </div>

            <div style={{ fontSize: '16px', color: 'var(--color-primary)', animation: 'slide-right 1.5s infinite', animationDelay: '0.4s' }}>▶</div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
              <div style={{ 
                fontSize: '28px', background: '#fff', width: '56px', height: '56px', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', borderRadius: '20px', 
                border: '2px solid var(--color-primary)', boxShadow: '0 4px 0 var(--color-primary)',
                animation: 'float-icon 2s infinite ease-in-out', animationDelay: '0.4s',
                overflow: 'hidden'
              }}>
                <img src="/images/u-know/icon-target.png" alt="친구맞추기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-text)', textAlign: 'center', wordBreak: 'keep-all', lineHeight: 1.3 }}>
                친구 답변 후<br/>결과 확인!
              </div>
            </div>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
        <div className="uknow-card uknow-card--tilted-left">
          <label className="uknow-label" htmlFor="question-input">
            질문 던지기 👊
          </label>

          <div className="uknow-example-select-wrap">
            <select
              id="example-question-select"
              className="uknow-select"
              value=""
              onChange={(e) => {
                if (e.target.value === 'MANUAL') {
                  setQuestion('');
                  setTimeout(() => questionInputRef.current?.focus(), 50);
                } else if (e.target.value) {
                  setQuestion(e.target.value);
                }
              }}
            >
              <option value="" disabled>
                예시 질문 골라보기
              </option>
              <option value="MANUAL">✍️ 직접 입력하기</option>
              {EXAMPLE_QUESTIONS.map((q, i) => (
                <option key={i} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>

          <textarea
            ref={questionInputRef}
            id="question-input"
            className="uknow-textarea"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="질문을 입력해봐"
            maxLength={UKNOW_LIMITS.MAX_QUESTION_LENGTH}
          />
          <div className="uknow-char-count">
            {question.length}/{UKNOW_LIMITS.MAX_QUESTION_LENGTH}
          </div>
        </div>

        <div className="uknow-card uknow-card--tilted-right">
          <label className="uknow-label" htmlFor="answer-input">
            친구 답변 예상하기 🔮
          </label>
          <textarea
            id="answer-input"
            className="uknow-textarea"
            value={myAnswer}
            onChange={(e) => setMyAnswer(e.target.value)}
            placeholder="친구가 뭐라고 할 것 같아?"
            maxLength={UKNOW_LIMITS.MAX_ANSWER_LENGTH}
          />
          <div className="uknow-char-count">
            {myAnswer.length}/{UKNOW_LIMITS.MAX_ANSWER_LENGTH}
          </div>
        </div>

        <button
          className="uknow-btn uknow-btn--secondary uknow-card--tilted-left"
          onClick={handleSubmit}
          disabled={!isValid}
        >
          카톡으로 던지기
        </button>

        <div style={{ margin: '8px 0', display: 'flex', justifyContent: 'center' }}>
          <KakaoAdfit unit={ADFIT_UNITS.MAIN_BANNER} {...ADFIT_SIZES.BANNER_320x100} />
        </div>

        <p className="uknow-ttl-notice">{TTL_NOTICE}</p>
      </div>

      {showReaction && (
        <ReactionOverlay text={'ㅋㅋㅋㅋㅋ\n질문지 생성 중'} />
      )}
      </div>
    </main>
  );
}
