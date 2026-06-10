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
  // 패널 드래그 (이동 모드 상관없이 드래그 헤더를 통해서만 드래그 허용)
  // ────────────────────────────────────────────
  const handlePanelPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest('[data-resize-handle]')) return;
      if (!isDraggable) return;

      e.preventDefault();
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

  // ────────────────────────────────────────────
  // 모서리 핸들 리사이즈 (delta 방식으로 극도로 부드럽게)
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
        startSize: currentSize,
      };
    },
    [isDraggable, currentSize]
  );

  // ── 글로벌 마우스/터치 리스너 ──
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (resizing.current && resizeStart.current) {
        const dx = e.clientX - resizeStart.current.mouseX;
        const dy = e.clientY - resizeStart.current.mouseY;
        const delta = (dx + dy) / 2;
        const newSize = Math.max(120, Math.min(800, resizeStart.current.startSize + delta));
        onSizeChange?.(Math.round(newSize));
      } else if (dragging.current && dragStart.current) {
        const dx = e.clientX - dragStart.current.mouseX;
        const dy = e.clientY - dragStart.current.mouseY;
        onPositionChange?.({
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
        zIndex: 30,
        transition: dragging.current || resizing.current ? 'none' : 'transform 0.15s ease-out',
        touchAction: 'none', // 터치 드래그 시 뷰포트 바운스/스크롤 방지
      }}
      onPointerDown={handlePanelPointerDown}
    >
      {/* 패널 본체 */}
      <div
        className="w-full h-full rounded-xl overflow-hidden border transition-all duration-300"
        style={{
          borderColor: dragging.current ? '#4f8ef7' : 'rgba(0, 0, 0, 0.08)',
          backgroundColor: '#ffffff',
          boxShadow: dragging.current
            ? '0 0 0 1px #4f8ef7, 0 8px 30px rgba(0,0,0,0.15)'
            : '0 4px 24px rgba(0, 0, 0, 0.06)',
          touchAction: 'none', // 터치 액션 상속 보장
        }}
      >

        {/* 가이드 이미지 본체 */}
        <div className="flex-1 min-h-0 w-full relative">
          <img
            src={imageUrl}
            alt="원본 가이드 이미지"
            className="w-full h-full"
            style={{ objectFit: 'contain', display: 'block', pointerEvents: 'none', userSelect: 'none' }}
            draggable={false}
          />
        </div>
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
