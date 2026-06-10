'use client';

import { useRef, useCallback, useState, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface PuzzlePanelWrapperProps {
  isDraggable: boolean;
  position: Position;
  onPositionChange: (pos: Position) => void;
  size: number;
  onSizeChange: (size: number) => void;
  children: React.ReactNode;
}

/**
 * 퍼즐판을 감싸는 래퍼.
 * - isDraggable(이동 모드)일 때만 드래그로 패널 이동 가능
 * - 모서리 드래그를 통해 크기 조절 기능 제공
 * - 기존 PuzzleBoard, 줌 등 퍼즐 로직은 children으로 그대로 통과
 */
export default function PuzzlePanelWrapper({
  isDraggable,
  position,
  onPositionChange,
  size,
  onSizeChange,
  children,
}: PuzzlePanelWrapperProps) {
  const dragging = useRef(false);
  const dragStart = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number } | null>(null);

  const resizing = useRef(false);
  const resizeStart = useRef<{ mouseX: number; mouseY: number; startSize: number } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest('[data-resize-handle]')) return;
      if (!isDraggable) return;

      e.preventDefault();

      dragging.current = true;

      dragStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        posX: position.x,
        posY: position.y,
      };
    },
    [isDraggable, position]
  );

  // ────────────────────────────────────────────
  // 모서리 핸들 리사이즈 (delta 방식)
  // ────────────────────────────────────────────
  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggable) return;
      e.stopPropagation();
      e.preventDefault();
      resizing.current = true;
      resizeStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        startSize: size,
      };
    },
    [isDraggable, size]
  );

  // ── 글로벌 마우스/터치 리스너 ──
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (resizing.current && resizeStart.current) {
        const dx = e.clientX - resizeStart.current.mouseX;
        const dy = e.clientY - resizeStart.current.mouseY;
        const delta = (dx + dy) / 2;
        const newSize = Math.max(160, Math.min(900, resizeStart.current.startSize + delta));
        onSizeChange(Math.round(newSize));
      } else if (dragging.current && dragStart.current) {
        const dx = e.clientX - dragStart.current.mouseX;
        const dy = e.clientY - dragStart.current.mouseY;
        onPositionChange({
          x: dragStart.current.posX + dx,
          y: dragStart.current.posY + dy,
        });
      }
    };

    const handleGlobalPointerUp = () => {
      if (resizing.current) {
        resizing.current = false;
        resizeStart.current = null;
      }
      if (dragging.current) {
        dragging.current = false;
        dragStart.current = null;
      }
    };

    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, [onSizeChange, onPositionChange]);

  return (
    <div
      id="landscape-puzzle-panel"
      data-testid="puzzle-panel"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: size,
        height: size,
        cursor: isDraggable ? (dragging.current ? 'grabbing' : 'grab') : 'default',
        userSelect: 'none',
        zIndex: 30,
        transition: dragging.current || resizing.current ? 'none' : 'transform 0.15s ease-out',
        touchAction: 'none', // 모바일/태블릿 터치 이동 시 브라우저 스크롤 바운스 방지
      }}
      onPointerDown={handlePointerDown}
    >
      <div
        className="w-full h-full border rounded-xl overflow-hidden transition-all duration-300"
        style={{
          borderColor: dragging.current ? '#4f8ef7' : 'rgba(0, 0, 0, 0.08)',
          backgroundColor: '#ffffff',
          boxShadow: dragging.current
            ? '0 0 0 1px #4f8ef7, 0 8px 30px rgba(0,0,0,0.15)'
            : '0 4px 24px rgba(0, 0, 0, 0.06)',
          touchAction: 'none',
        }}
      >
        {children}
      </div>

      {/* 우하단 리사이즈 핸들 (이동 모드일 때만 렌더링) */}
      {isDraggable && (
        <div
          data-resize-handle="br"
          onPointerDown={handleResizePointerDown}
          className="absolute bottom-1 right-1 w-9 h-9 z-[99] flex items-center justify-center cursor-se-resize rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg border border-white transition-all scale-100 hover:scale-105"
          title="크기 조절 (드래그)"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>

          {/* 눈에 띄는 크기 조절 팁 */}
          <div 
            className="absolute bottom-11 right-0 bg-blue-600/95 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap animate-bounce"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' }}
          >
            ↔ 크기 조절
            <div className="absolute top-full right-4 w-1.5 h-1.5 bg-blue-600/95 rotate-45 transform -translate-y-0.5" />
          </div>
        </div>
      )}
    </div>
  );
}

