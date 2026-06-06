'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface GuideImagePanelProps {
  imageUrl: string;
  /** 초기 너비(px). PuzzlePanel 크기와 동일하게 맞추기 위해 외부에서 주입 */
  initialSize: number;
  isDraggable: boolean;
  /** 외부에서 position/size을 복원할 때 사용 */
  defaultPosition?: Position;
  defaultSize?: number;
  onPositionChange?: (pos: Position) => void;
  onSizeChange?: (size: number) => void;
}

export default function GuideImagePanel({
  imageUrl,
  initialSize,
  isDraggable,
  defaultPosition,
  defaultSize,
  onPositionChange,
  onSizeChange,
}: GuideImagePanelProps) {
  // controlled component처럼 동작하도록 state 대신 부모의 props를 우선 사용하고 상호작용 시에만 업데이트
  const currentPosition = defaultPosition ?? { x: 0, y: 0 };
  const currentSize = defaultSize ?? initialSize;

  // 드래그 상태
  const dragging = useRef(false);
  const dragStart = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number } | null>(null);

  // 리사이즈 상태
  const resizing = useRef(false);
  const resizeStart = useRef<{
    mouseX: number;
    mouseY: number;
    startSize: number;
  } | null>(null);

  // ────────────────────────────────────────────
  // 패널 드래그 (이동 모드에서만 활성화)
  // ────────────────────────────────────────────
  const handlePanelPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest('[data-resize-handle]')) return;
      if (!isDraggable) return;

      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      dragging.current = true;
      dragStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        posX: currentPosition.x,
        posY: currentPosition.y,
      };
    },
    [isDraggable, currentPosition]
  );

  const handlePanelPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging.current || !dragStart.current) return;
      const dx = e.clientX - dragStart.current.mouseX;
      const dy = e.clientY - dragStart.current.mouseY;
      onPositionChange?.({
        x: dragStart.current.posX + dx,
        y: dragStart.current.posY + dy,
      });
    },
    [onPositionChange]
  );

  const handlePanelPointerUp = useCallback(() => {
    dragging.current = false;
    dragStart.current = null;
  }, []);

  // ────────────────────────────────────────────
  // 모서리 핸들 리사이즈 (delta 방식으로 극도로 부드럽게)
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
        startSize: currentSize,
      };
    },
    [currentSize]
  );

  const handleResizePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!resizing.current || !resizeStart.current) return;
      e.stopPropagation();

      const dx = e.clientX - resizeStart.current.mouseX;
      const dy = e.clientY - resizeStart.current.mouseY;
      
      const delta = (dx + dy) / 2;
      const newSize = Math.max(120, Math.min(800, resizeStart.current.startSize + delta));
      onSizeChange?.(Math.round(newSize));
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
      id="landscape-guide-panel"
      data-testid="guide-panel"
      style={{
        position: 'absolute',
        left: currentPosition.x,
        top: currentPosition.y,
        width: currentSize,
        height: currentSize,
        cursor: isDraggable ? (dragging.current ? 'grabbing' : 'grab') : 'default',
        userSelect: 'none',
        zIndex: 10,
        transition: dragging.current || resizing.current ? 'none' : 'transform 0.15s ease-out',
        touchAction: 'none', // 터치 드래그 시 뷰포트 바운스/스크롤 방지
      }}
      onPointerDown={handlePanelPointerDown}
      onPointerMove={handlePanelPointerMove}
      onPointerUp={handlePanelPointerUp}
      onPointerCancel={handlePanelPointerUp}
    >
      {/* 패널 본체 */}
      <div
        className="w-full h-full rounded-xl overflow-hidden border transition-all duration-300"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.08)',
          backgroundColor: '#ffffff',
          boxShadow: isDraggable
            ? '0 0 0 1px #4f8ef7, 0 8px 30px rgba(0,0,0,0.15)'
            : '0 4px 24px rgba(0, 0, 0, 0.06)',
          touchAction: 'none', // 터치 액션 상속 보장
        }}
      >
        {/* 가이드 이미지 */}
        <img
          src={imageUrl}
          alt="원본 가이드 이미지"
          className="w-full h-full"
          style={{ objectFit: 'contain', display: 'block', pointerEvents: 'none', userSelect: 'none' }}
          draggable={false}
        />
      </div>

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

