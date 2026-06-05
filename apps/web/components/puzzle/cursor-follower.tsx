'use client';

import { useEffect, useRef } from 'react';
import PieceCell from './piece-cell';

interface CursorFollowerProps {
  selectedPieceId: number | null;
  image: string;
  gridSize: number;
}

export default function CursorFollower({
  selectedPieceId,
  image,
  gridSize,
}: CursorFollowerProps) {
  const followerRef = useRef<HTMLDivElement>(null);
  const lastCoords = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const trackMouse = (e: MouseEvent) => {
      lastCoords.current = { x: e.clientX, y: e.clientY };
      if (followerRef.current) {
        const size = 50;
        const x = e.clientX - size / 2;
        const y = e.clientY - size / 2;
        followerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    };

    const trackTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        lastCoords.current = { x: t.clientX, y: t.clientY };
        if (followerRef.current) {
          const size = 50;
          const x = t.clientX - size / 2;
          const y = t.clientY - size / 2;
          followerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }
      }
    };

    window.addEventListener('mousemove', trackMouse);
    window.addEventListener('mousedown', trackMouse);
    window.addEventListener('touchmove', trackTouch, { passive: true });
    window.addEventListener('touchstart', trackTouch, { passive: true });

    return () => {
      window.removeEventListener('mousemove', trackMouse);
      window.removeEventListener('mousedown', trackMouse);
      window.removeEventListener('touchmove', trackTouch);
      window.removeEventListener('touchstart', trackTouch);
    };
  }, []); // 빈 배열로 마운트 시 1회만 리스너를 등록하여 중단 없는 포인터 트래킹 보장

  const initialTransform = lastCoords.current.x !== -100
    ? `translate3d(${lastCoords.current.x - 25}px, ${lastCoords.current.y - 25}px, 0)`
    : 'translate3d(-100px, -100px, 0)';

  return (
    <div
      ref={followerRef}
      className="fixed top-0 left-0 z-[9999] pointer-events-none transition-transform duration-[40ms] ease-out"
      style={{
        width: 50,
        height: 50,
        willChange: 'transform',
        transform: initialTransform,
        display: selectedPieceId === null ? 'none' : 'block',
      }}
    >
      <div 
        className="animate-pulse"
        style={{
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4), 0 0 0 3px var(--puzzle-primary)',
          borderRadius: '6px',
          overflow: 'hidden',
          opacity: 0.85,
        }}
      >
        {selectedPieceId !== null && (
          <PieceCell
            pieceIdx={selectedPieceId}
            image={image}
            size={50}
            gridSize={gridSize}
          />
        )}
      </div>
    </div>
  );
}
