'use client';

import { useState, useEffect, useRef } from 'react';
import { Folder, HelpCircle } from 'lucide-react';
import PieceCell from '../piece-cell';

interface LandscapeTrayPanelProps {
  trayPieces: number[];
  image: string;
  gridSize: number;
  selectedPieceId: number | null;
  onPieceClick: (pieceId: number) => void;
  onTrayClick?: () => void;
  /** Large Landscape 여부 (true=Large, false=Compact) */
  isLarge: boolean;
  isPlayMode?: boolean;
}

const basketMetadata: Record<string, { label: string; color: string }> = {
  basket1: { label: '빨강', color: '#ef4444' },
  basket2: { label: '파랑', color: '#3b82f6' },
  basket3: { label: '초록', color: '#22c55e' },
  basket4: { label: '노랑', color: '#eab308' },
  basket5: { label: '보라', color: '#a855f7' },
};

/**
 * 가로모드 전용 조각 보관함.
 * - 세로모드의 "모아보기 보관함(Drawer)" 기능만 단일 패널로 항상 표시
 * - 우측 고정, 이동/크기조절 불가, 세로 스크롤 지원
 * - 바구니(basket) 탭 분류 기능 유지
 * - 조각 드래그 앤 드롭(바구니 간 이동)은 데스크탑에서 지원
 */
export default function LandscapeTrayPanel({
  trayPieces,
  image,
  gridSize,
  selectedPieceId,
  onPieceClick,
  onTrayClick,
  isLarge,
  isPlayMode = true,
}: LandscapeTrayPanelProps) {
  const cellSize = isLarge ? 46 : 34;

  const [activeBasket, setActiveBasket] = useState<string>('basket1');
  const [hoveredBasket, setHoveredBasket] = useState<string | null>(null);
  const [baskets, setBaskets] = useState<Record<string, number[]>>({
    basket1: [],
    basket2: [],
    basket3: [],
    basket4: [],
    basket5: [],
  });

  // 드래그 상태
  const [draggedPiece, setDraggedPiece] = useState<{
    id: number;
    x: number;
    y: number;
  } | null>(null);
  const dragActiveRef = useRef(false);
  const startCoords = useRef<{ x: number; y: number } | null>(null);
  const globalMoveRef = useRef<any>(null);
  const globalUpRef = useRef<any>(null);
  const globalCancelRef = useRef<any>(null);

  // 스크롤 감지 및 드래그/클릭 방지용 Ref
  const scrolledRecentlyRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 언마운트 시 글로벌 리스너 및 타이머 정리
  useEffect(() => {
    return () => {
      if (globalMoveRef.current) window.removeEventListener('pointermove', globalMoveRef.current);
      if (globalUpRef.current) window.removeEventListener('pointerup', globalUpRef.current);
      if (globalCancelRef.current) window.removeEventListener('pointercancel', globalCancelRef.current);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // 로컬스토리지 바구니 로드
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = `puzzle-baskets-landscape-${window.location.pathname}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') setBaskets(parsed);
      } catch (e) {}
    }
  }, []);

  // trayPieces 동기화
  useEffect(() => {
    setBaskets((prev) => {
      const allPiecesInBaskets = new Set(Object.values(prev).flat());
      const traySet = new Set(trayPieces);

      const nextBaskets = { ...prev };
      for (const key in nextBaskets) {
        nextBaskets[key] = nextBaskets[key].filter((id) => traySet.has(id));
      }

      const newPieces = trayPieces.filter((id) => !allPiecesInBaskets.has(id));
      if (newPieces.length > 0) {
        const target = activeBasket || 'basket1';
        nextBaskets[target] = [...(nextBaskets[target] || []), ...newPieces];
      }

      if (typeof window !== 'undefined') {
        const key = `puzzle-baskets-landscape-${window.location.pathname}`;
        localStorage.setItem(key, JSON.stringify(nextBaskets));
      }

      return nextBaskets;
    });
  }, [trayPieces, activeBasket]);

  const movePieceToBasket = (pieceId: number, targetBasket: string) => {
    setBaskets((prev) => {
      const next = { ...prev };
      for (const key in next) {
        next[key] = next[key].filter((id) => id !== pieceId);
      }
      next[targetBasket] = [...(next[targetBasket] || []), pieceId];

      if (typeof window !== 'undefined') {
        const key = `puzzle-baskets-landscape-${window.location.pathname}`;
        localStorage.setItem(key, JSON.stringify(next));
      }
      return next;
    });
  };

  // 드래그 시작
  const startDrag = (e: React.PointerEvent, pieceId: number) => {
    if (!isPlayMode) return;
    // 마우스 클릭(좌클릭) 또는 터치 드래그 모두 허용
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // 만약 현재 스크롤 중이라면 무시
    if (scrolledRecentlyRef.current) return;

    const clientX = e.clientX;
    const clientY = e.clientY;
    const pointerId = e.pointerId;
    const target = e.currentTarget as HTMLElement;

    startCoords.current = { x: clientX, y: clientY };
    dragActiveRef.current = false;

    try { target.setPointerCapture(pointerId); } catch (err) {}

    const onMove = (ev: PointerEvent) => {
      if (!startCoords.current) return;
      const dx = ev.clientX - startCoords.current.x;
      const dy = ev.clientY - startCoords.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (!dragActiveRef.current) {
        if (dist > 5) {
          dragActiveRef.current = true;
          setDraggedPiece({ id: pieceId, x: ev.clientX, y: ev.clientY });
        }
      } else {
        setDraggedPiece({ id: pieceId, x: ev.clientX, y: ev.clientY });
        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        const basketTab = el?.closest('[data-basket-id]');
        setHoveredBasket(basketTab?.getAttribute('data-basket-id') || null);
      }
    };

    const onUp = (ev: PointerEvent) => {
      cleanup();
      const wasDragging = dragActiveRef.current;
      dragActiveRef.current = false;
      startCoords.current = null;

      if (wasDragging) {
        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        const basketTab = el?.closest('[data-basket-id]');
        const targetBasket = basketTab?.getAttribute('data-basket-id');
        if (targetBasket) movePieceToBasket(pieceId, targetBasket);
        setDraggedPiece(null);
        setHoveredBasket(null);
      } else {
        // 스크롤이 감지된 직후라면 클릭 처리를 무시
        if (!scrolledRecentlyRef.current) {
          onPieceClick(pieceId);
        }
      }
    };

    const onCancel = () => {
      cleanup();
      dragActiveRef.current = false;
      startCoords.current = null;
      setDraggedPiece(null);
      setHoveredBasket(null);
    };

    const cleanup = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      globalMoveRef.current = null;
      globalUpRef.current = null;
      globalCancelRef.current = null;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointercancel', onCancel, { passive: true });
    globalMoveRef.current = onMove;
    globalUpRef.current = onUp;
    globalCancelRef.current = onCancel;
  };

  // 터치 탭 (드래그하지 않고 가볍게 두드릴 때만 탭 동작을 하도록 처리)
  const handleTouchEnd = (e: React.TouchEvent, pieceId: number) => {
    // PointerEvent의 startDrag에서 드래그/클릭 판정을 처리하므로 터치중복 탭 방지를 위해 여기서는 아무것도 하지 않고 이벤트 버블링만 제어
    e.stopPropagation();
  };

  const activeBasketPieces = baskets[activeBasket] || [];

  const displayPieces = [...activeBasketPieces];
  const holdPieceId = selectedPieceId !== null && !trayPieces.includes(selectedPieceId) ? selectedPieceId : null;
  if (holdPieceId !== null) {
    displayPieces.unshift(holdPieceId);
  }

  const handleScroll = () => {
    scrolledRecentlyRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      scrolledRecentlyRef.current = false;
    }, 150);
  };

  return (
    <div
      id="landscape-tray-panel"
      className="flex flex-col h-full min-h-0 border-l"
      style={{
        backgroundColor: '#ffffff',
        borderColor: 'rgba(0, 0, 0, 0.08)',
        minWidth: isLarge ? '320px' : '220px', // 가로 폭 최솟값 대폭 확장 (기존 240px/140px에서 업그레이드)
        maxWidth: isLarge ? '400px' : '300px', // 가로 폭 최댓값 확장
        width: isLarge ? '25%' : '28%', // 가로 가용 영역 점유 비율 상향
        flexShrink: 0,
        overscrollBehavior: 'none',
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isPlayMode) return;
        if (selectedPieceId !== null) onTrayClick?.();
      }}
    >
      {/* 헤더 */}
      <div
        className="flex flex-col gap-1 px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}
      >
        <div className="flex items-center gap-1.5">
          <Folder size={14} className="text-blue-500 flex-shrink-0" />
          <span className="text-sm font-bold text-gray-800">보관함</span>
        </div>
        <span className="text-xs font-medium text-gray-500">
          대기 조각: <span className="text-gray-800 font-mono font-semibold">{trayPieces.length}</span>
        </span>
      </div>

      {/* 바구니 탭 */}
      <div
        className="grid grid-cols-5 gap-1.5 p-3 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}
      >
        {['basket1', 'basket2', 'basket3', 'basket4', 'basket5'].map((key) => {
          const isActive = activeBasket === key;
          const isHovered = hoveredBasket === key;
          const count = baskets[key]?.length || 0;
          const meta = basketMetadata[key];

          return (
            <div
              key={key}
              data-basket-id={key}
              onClick={(e) => {
                e.stopPropagation();
                if (!isPlayMode) return;
                setActiveBasket(key);
              }}
              className="flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer gap-1"
              style={{
                borderColor: isHovered
                  ? 'rgba(79, 142, 247, 0.5)'
                  : isActive
                  ? 'rgba(0, 0, 0, 0.15)'
                  : 'rgba(0, 0, 0, 0.05)',
                backgroundColor: isHovered
                  ? 'rgba(79, 142, 247, 0.08)'
                  : isActive
                  ? 'rgba(0, 0, 0, 0.04)'
                  : 'rgba(0, 0, 0, 0.01)',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: meta.color }}
              />
              <span
                className="text-[11px] font-semibold leading-none font-mono"
                style={{ color: isActive || isHovered ? '#1f2937' : 'rgba(0, 0, 0, 0.4)' }}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* 도움말 */}
      {isLarge && (
        <div className="px-4 py-1.5 border-b flex-shrink-0" style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}>
          <p className="text-[10px] font-medium text-gray-500 flex items-center gap-1">
            <HelpCircle size={12} className="text-gray-400 flex-shrink-0" />
            <span>조각 목록 스크롤 가능</span>
          </p>
        </div>
      )}

      {/* 조각 목록 - 세로 스크롤 영역 (overflow-y-auto 필수) */}
      <div 
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-2 scrollbar-hide"
        style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
        onScroll={handleScroll}
      >
        {trayPieces.length === 0 && selectedPieceId === null ? (
          <div className="flex flex-col items-center justify-center h-32 text-center text-slate-400">
            <span className="text-sm font-black mb-1">🎉</span>
            <span className="text-[10px] font-black">모든 조각 배치!</span>
          </div>
        ) : displayPieces.length === 0 && selectedPieceId === null ? (
          <div className="flex flex-col items-center justify-center h-24 text-center">
            <span className="text-[10px] font-bold text-slate-500">바구니가 비어 있습니다.</span>
          </div>
        ) : (
          <div
            className="grid gap-1.5 justify-items-center"
            style={{ gridTemplateColumns: isLarge ? 'repeat(auto-fill, minmax(46px, 1fr))' : 'repeat(auto-fill, minmax(34px, 1fr))' }}
          >
            {displayPieces.map((pieceId) => {
              const isSelected = selectedPieceId === pieceId;
              const isHold = pieceId === holdPieceId;

              return (
                <div
                  key={pieceId}
                  onPointerDown={(e) => startDrag(e, pieceId)}
                  onTouchEnd={(e) => handleTouchEnd(e, pieceId)}
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                  className="relative cursor-pointer transition-all duration-200 select-none"
                  style={{
                    transform: isSelected && draggedPiece?.id !== pieceId ? 'scale(1.08)' : 'scale(1)',
                    boxShadow: isSelected && draggedPiece?.id !== pieceId
                      ? '0 0 0 3px var(--puzzle-primary)'
                      : 'none',
                    opacity: draggedPiece?.id === pieceId ? 0.25 : 1,
                    borderRadius: '6px',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    touchAction: 'pan-y',
                  }}
                >
                  <PieceCell
                    pieceIdx={pieceId}
                    image={image}
                    size={cellSize}
                    gridSize={gridSize}
                    small
                  />
                  {isHold && (
                    <span className="absolute -top-1.5 -right-1 px-0.5 py-0.5 bg-blue-500 text-white rounded text-[7px] font-black shadow-md pointer-events-none z-10">
                      HOLD
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 드래그 고스트 */}
      {draggedPiece && typeof document !== 'undefined' && (
        <div
          className="pointer-events-none fixed z-[9999] opacity-90 select-none"
          style={{
            left: `${draggedPiece.x - cellSize / 2}px`,
            top: `${draggedPiece.y - cellSize / 2}px`,
            width: cellSize,
            height: cellSize,
            transform: 'scale(1.15)',
            boxShadow: '0 0 0 3px var(--puzzle-primary), 0 10px 20px rgba(0,0,0,0.4)',
            borderRadius: '6px',
          }}
        >
          <PieceCell
            pieceIdx={draggedPiece.id}
            image={image}
            size={cellSize}
            gridSize={gridSize}
            small
          />
        </div>
      )}
    </div>
  );
}
