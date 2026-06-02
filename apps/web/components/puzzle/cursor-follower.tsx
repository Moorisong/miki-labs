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
      if (selectedPieceId !== null && followerRef.current) {
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
        if (selectedPieceId !== null && followerRef.current) {
          const size = 50;
          const x = t.clientX - size / 2;
          const y = t.clientY - size / 2;
          followerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }
      }
    };

    window.addEventListener('mousemove', trackMouse);
    window.addEventListener('touchmove', trackTouch, { passive: true });

    // 즉각적인 위치 동기화
    if (selectedPieceId !== null && followerRef.current && lastCoords.current.x !== -100) {
      const size = 50;
      const x = lastCoords.current.x - size / 2;
      const y = lastCoords.current.y - size / 2;
      followerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }

    return () => {
      window.removeEventListener('mousemove', trackMouse);
      window.removeEventListener('touchmove', trackTouch);
    };
  }, [selectedPieceId]);

  if (selectedPieceId === null) return null;

  return (
    <div
      ref={followerRef}
      className="fixed top-0 left-0 z-[9999] pointer-events-none transition-transform duration-[40ms] ease-out"
      style={{
        width: 50,
        height: 50,
        willChange: 'transform',
        transform: 'translate3d(-100px, -100px, 0)',
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
        <PieceCell
          pieceIdx={selectedPieceId}
          image={image}
          size={50}
          gridSize={gridSize}
        />
      </div>
    </div>
  );
}
