'use client';

import { useEffect, useState } from 'react';
import styles from './success-effect.module.css';

interface SuccessEffectProps {
  show: boolean;
  score: number;
  onComplete?: () => void;
}

export default function SuccessEffect({ show, score, onComplete }: SuccessEffectProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; delay: number }[]>([]);

  useEffect(() => {
    if (show) {
      setIsVisible(true);

      // 파티클 생성
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.3,
      }));
      setParticles(newParticles);

      // 애니메이션 후 숨김
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!isVisible) return null;

  return (
    <div className={styles.container}>
      {/* 배경 플래시 */}
      <div className={styles.flash} />

      {/* 파티클 */}
      <div className={styles.particles}>
        {particles.map((p) => (
          <div
            key={p.id}
            className={styles.particle}
            style={{
              left: `${p.x}%`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* 메인 텍스트 */}
      <div className={styles.content}>
        <div className={styles.successText}>SUCCESS!</div>
        <div className={styles.scoreText}>+{score}</div>
      </div>

      {/* 별 이펙트 */}
      <div className={styles.stars}>
        <span className={styles.star} style={{ animationDelay: '0s' }}>★</span>
        <span className={styles.star} style={{ animationDelay: '0.1s' }}>★</span>
        <span className={styles.star} style={{ animationDelay: '0.2s' }}>★</span>
      </div>
    </div>
  );
}
