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
      e.currentTarget.setPointerCapture(e.pointerId);
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

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging.current || !dragStart.current) return;
      const dx = e.clientX - dragStart.current.mouseX;
      const dy = e.clientY - dragStart.current.mouseY;
      onPositionChange({
        x: dragStart.current.posX + dx,
        y: dragStart.current.posY + dy,
      });
    },
    [onPositionChange]
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
    dragStart.current = null;
  }, []);

  // ────────────────────────────────────────────
  // 모서리 핸들 리사이즈 (delta 방식)
  // ────────────────────────────────────────────
  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      resizing.current = true;
      resizeStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        startSize: size,
      };
    },
    [size]
  );

  const handleResizePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!resizing.current || !resizeStart.current) return;
      e.stopPropagation();

      const dx = e.clientX - resizeStart.current.mouseX;
      const dy = e.clientY - resizeStart.current.mouseY;
      
      const delta = (dx + dy) / 2;
      const newSize = Math.max(160, Math.min(900, resizeStart.current.startSize + delta));
      onSizeChange(Math.round(newSize));
    },
    [onSizeChange]
  );

  const handleResizePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    resizing.current = false;
    resizeStart.current = null;
  }, []);

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
        zIndex: 5,
        transition: dragging.current || resizing.current ? 'none' : 'transform 0.15s ease-out',
        touchAction: 'none', // 모바일/태블릿 터치 이동 시 브라우저 스크롤 바운스 방지
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {children}

      {/* 우하단 리사이즈 핸들 */}
      <div
        data-resize-handle="br"
        onPointerDown={handleResizePointerDown}
        onPointerMove={handleResizePointerMove}
        onPointerUp={handleResizePointerUp}
        onPointerCancel={handleResizePointerUp}
        className="absolute bottom-0 right-0 w-6 h-6 z-20 flex items-center justify-end p-1 cursor-se-resize"
        title="크기 조절 (드래그)"
      >
        <div 
          className="w-2.5 h-2.5 rounded-tl-[2px] transition-colors"
          style={{
            borderRight: '2px solid rgba(0, 0, 0, 0.3)',
            borderBottom: '2px solid rgba(0, 0, 0, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#4f8ef7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.3)';
          }}
        />
      </div>
    </div>
  );
}

