'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession, signIn } from 'next-auth/react';
import styles from './success-effect.module.css';

interface SuccessEffectProps {
  show: boolean;
  score: number;
  totalScore?: number; // 누적 점수 (로그인 시 저장용)
  onComplete?: () => void;
  showLoginPrompt?: boolean; // 로그인 유도 문구 표시 여부
}

interface Particle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
}

interface Confetti {
  id: number;
  x: number;
  delay: number;
  rotation: number;
  color: string;
  shape: 'square' | 'circle' | 'triangle';
}

interface Firework {
  id: number;
  angle: number;
  distance: number;
  delay: number;
  color: string;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  delay: number;
  size: number;
}

const COLORS = [
  '#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7',
  '#FF69B4', '#00CED1', '#FFA500', '#32CD32',
  '#FF1493', '#00FFFF', '#FFE66D', '#9370DB'
];

const generateParticles = (count: number): Particle[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.4,
    duration: 1 + Math.random() * 0.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 8,
  }));

const generateConfetti = (count: number): Confetti[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.6,
    rotation: Math.random() * 360,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: (['square', 'circle', 'triangle'] as const)[Math.floor(Math.random() * 3)],
  }));

const generateFireworks = (count: number): Firework[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (i / count) * 360,
    distance: 80 + Math.random() * 60,
    delay: Math.random() * 0.2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));

const generateSparkles = (count: number): Sparkle[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    delay: Math.random() * 1,
    size: 10 + Math.random() * 20,
  }));

export default function SuccessEffect({ show, score, totalScore, onComplete, showLoginPrompt = false }: SuccessEffectProps) {
  const { status } = useSession();
  const isLoggedIn = status === 'authenticated';
  const [isVisible, setIsVisible] = useState(false);

  const particles = useMemo(() => generateParticles(20), []);
  const confetti = useMemo(() => generateConfetti(35), []);
  const fireworks = useMemo(() => generateFireworks(16), []);
  const sparkles = useMemo(() => generateSparkles(12), []);

  useEffect(() => {
    if (show) {
      setIsVisible(true);

      // 비로그인 상태이면서 로그인 유도 문구가 켜져 있다면 자동 사라짐 방지
      if (showLoginPrompt && !isLoggedIn) {
        return;
      }

      const duration = 2500;
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete, showLoginPrompt, isLoggedIn]);

  if (!isVisible) return null;

  return (
    <div className={styles.container}>
      <div className={styles.flash} />

      <div className={styles.shockwave} />
      <div className={styles.shockwave2} />

      <div className={styles.confettiContainer}>
        {confetti.map((c) => (
          <div
            key={c.id}
            className={`${styles.confetti} ${styles[c.shape]}`}
            style={{
              left: `${c.x}%`,
              animationDelay: `${c.delay}s`,
              backgroundColor: c.color,
              transform: `rotate(${c.rotation}deg)`,
            }}
          />
        ))}
      </div>

      <div className={styles.particles}>
        {particles.map((p) => (
          <div
            key={p.id}
            className={styles.particle}
            style={{
              left: `${p.x}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              backgroundColor: p.color,
              width: p.size,
              height: p.size,
            }}
          />
        ))}
      </div>

      <div className={styles.fireworksContainer}>
        {fireworks.map((f) => (
          <div
            key={f.id}
            className={styles.firework}
            style={{
              '--angle': `${f.angle}deg`,
              '--distance': `${f.distance}px`,
              animationDelay: `${f.delay}s`,
              backgroundColor: f.color,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <div className={styles.sparklesContainer}>
        {sparkles.map((s) => (
          <div
            key={s.id}
            className={styles.sparkle}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              animationDelay: `${s.delay}s`,
              fontSize: s.size,
            }}
          >
            ✦
          </div>
        ))}
      </div>

      <div className={styles.content}>
        <div className={styles.perfectBadge}>PERFECT!</div>
        <div className={styles.successText}>SUCCESS!</div>
        <div className={styles.scoreText}>+{score}</div>

        {/* 비로그인 시 로그인 유도 문구 */}
        {showLoginPrompt && !isLoggedIn && (
          <div className={styles.loginPrompt}>
            <p>🎉 성공! 로그인하면 이 기록을 랭킹에 저장할 수 있어요</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                className={styles.loginLink}
                onClick={() => {
                  // 로그인 전 점수 저장 (누적 점수 사용)
                  const scoreToSave = totalScore ?? score;
                  sessionStorage.setItem('pendingRankingScore', scoreToSave.toString());
                  signIn('kakao', { callbackUrl: '/game' });
                }}
              >
                로그인하고 랭킹 등록하기 →
              </button>
              <button
                className={styles.loginLink}
                style={{ background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255,255,255,0.4)' }}
                onClick={() => {
                  setIsVisible(false);
                  onComplete?.();
                }}
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.starBurst}>
        {[...Array(8)].map((_, i) => (
          <span
            key={i}
            className={styles.burstStar}
            style={{
              '--rotation': `${i * 45}deg`,
              animationDelay: `${i * 0.05}s`,
            } as React.CSSProperties}
          >
            ★
          </span>
        ))}
      </div>

      <div className={styles.rings}>
        <div className={styles.ring} />
        <div className={styles.ring} style={{ animationDelay: '0.15s' }} />
        <div className={styles.ring} style={{ animationDelay: '0.3s' }} />
      </div>
    </div>
  );
}
