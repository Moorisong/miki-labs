'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Folder, HelpCircle, Lock } from 'lucide-react';
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
  const cellSize = isLarge ? 54 : 40;

  const [activeBasket, setActiveBasket] = useState<string>('basket1');
  const [isOrganizeMode, setIsOrganizeMode] = useState(false);
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
  const lastCoords = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const globalMoveRef = useRef<any>(null);
  const globalUpRef = useRef<any>(null);
  const globalCancelRef = useRef<any>(null);

  // 꾹 누르기(롱프레스) 및 모바일 스크롤 충돌 방지용 Refs
  const longPressTimeout = useRef<any>(null);
  const hasMovedRef = useRef<boolean>(false);

  // 스크롤 감지 및 드래그/클릭 방지용 Ref
  const scrolledRecentlyRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ignoreNextClickRef = useRef<boolean>(false);

  // 언마운트 시 글로벌 리스너 및 타이머 정리
  useEffect(() => {
    return () => {
      if (globalMoveRef.current) {
        window.removeEventListener('pointermove', globalMoveRef.current);
        window.removeEventListener('touchmove', globalMoveRef.current);
      }
      if (globalUpRef.current) {
        window.removeEventListener('pointerup', globalUpRef.current);
        window.removeEventListener('touchend', globalUpRef.current);
      }
      if (globalCancelRef.current) {
        window.removeEventListener('pointercancel', globalCancelRef.current);
        window.removeEventListener('touchcancel', globalCancelRef.current);
      }
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
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
    if (selectedPieceId === pieceId) {
      onTrayClick?.();
    }
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

  // 드래그 시작 (마우스 및 가상 포인터용)
  const startDrag = (e: React.PointerEvent, pieceId: number) => {
    if (e.pointerType === 'touch') return;
    if (!isPlayMode) return;
    if (e.button !== 0) return;
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
        ignoreNextClickRef.current = true;
      } else {
        ignoreNextClickRef.current = false;
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

  // 모바일 터치 드래그 시작 (롱프레스 220ms 후 스크롤 차단 및 드래그 모드 진입)
  const handleTouchStart = (e: React.TouchEvent, pieceId: number) => {
    if (!isPlayMode) return;
    const touch = e.touches[0];
    if (!touch) return;

    const clientX = touch.clientX;
    const clientY = touch.clientY;

    startCoords.current = { x: clientX, y: clientY };
    lastCoords.current = { x: clientX, y: clientY };
    dragActiveRef.current = false;
    hasMovedRef.current = false;

    longPressTimeout.current = setTimeout(() => {
      dragActiveRef.current = true;
      setDraggedPiece({ id: pieceId, x: clientX, y: clientY });

      const onTouchMove = (event: TouchEvent) => {
        if (event.cancelable) {
          event.preventDefault(); // 드래그 중 브라우저 스크롤 완벽 차단
        }
        const t = event.touches[0];
        if (t) {
          setDraggedPiece({ id: pieceId, x: t.clientX, y: t.clientY });
          lastCoords.current = { x: t.clientX, y: t.clientY };

          const dropElement = document.elementFromPoint(t.clientX, t.clientY);
          const basketTab = dropElement?.closest('[data-basket-id]');
          setHoveredBasket(basketTab?.getAttribute('data-basket-id') || null);
        }
      };

      const onTouchEnd = (event: TouchEvent) => {
        cleanupTouch();
        dragActiveRef.current = false;
        startCoords.current = null;

        const t = event.changedTouches[0];
        const endX = t ? t.clientX : lastCoords.current.x;
        const endY = t ? t.clientY : lastCoords.current.y;

        const dropElement = document.elementFromPoint(endX, endY);
        const basketTab = dropElement?.closest('[data-basket-id]');
        const targetBasket = basketTab?.getAttribute('data-basket-id');
        if (targetBasket) {
          movePieceToBasket(pieceId, targetBasket);
        }

        setDraggedPiece(null);
        setHoveredBasket(null);
        ignoreNextClickRef.current = true;
      };

      const onTouchCancel = () => {
        cleanupTouch();
        dragActiveRef.current = false;
        startCoords.current = null;
        setDraggedPiece(null);
        setHoveredBasket(null);
      };

      const cleanupTouch = () => {
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
        window.removeEventListener('touchcancel', onTouchCancel);
        globalMoveRef.current = null;
        globalUpRef.current = null;
        globalCancelRef.current = null;
      };

      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd, { passive: true });
      window.addEventListener('touchcancel', onTouchCancel);
      globalMoveRef.current = onTouchMove;
      globalUpRef.current = onTouchEnd;
      globalCancelRef.current = onTouchCancel;
    }, 180);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startCoords.current) return;
    if (dragActiveRef.current) return;

    const touch = e.touches[0];
    if (!touch) return;

    const dx = touch.clientX - startCoords.current.x;
    const dy = touch.clientY - startCoords.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 4) {
      hasMovedRef.current = true;
    }

    if (distance > 6) {
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = null;
      }
      startCoords.current = null;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, pieceId: number) => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }

    const wasDragging = dragActiveRef.current;
    dragActiveRef.current = false;
    startCoords.current = null;

    if (wasDragging || hasMovedRef.current) {
      ignoreNextClickRef.current = true;
    } else {
      ignoreNextClickRef.current = false;
    }
    hasMovedRef.current = false;
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
      className="relative flex flex-col h-full min-h-0 border-l"
      style={{
        backgroundColor: '#ffffff',
        borderColor: 'rgba(0, 0, 0, 0.08)',
        minWidth: isLarge ? '320px' : '220px', // 가로 폭 최솟값 대폭 확장 (기존 240px/140px에서 업그레이드)
        maxWidth: isLarge ? '400px' : '300px', // 가로 폭 최댓값 확장
        width: isLarge ? '25%' : '28%', // 가로 가용 영역 점유 비율 상향
        flexShrink: 0,
        overscrollBehavior: 'none',
        zIndex: 10,
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isPlayMode) return;
        if (selectedPieceId !== null) onTrayClick?.();
      }}
    >
      {/* 헤더 */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0 gap-1"
        style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Folder size={14} className="text-blue-500 flex-shrink-0" />
          <span className="text-sm font-bold text-gray-800 truncate">보관함</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsOrganizeMode(!isOrganizeMode);
            }}
            className="flex items-center gap-1.5 cursor-pointer select-none group"
            title="보관함 분류 모드"
          >
            <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-700 transition-colors">
              분류
            </span>
            <div
              className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                isOrganizeMode ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            >
              <div
                className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform duration-200 ${
                  isOrganizeMode ? 'translate-x-3' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
          <span className="text-[10px] font-medium text-gray-500">
            대기: <span className="text-gray-800 font-mono font-semibold">{trayPieces.length}</span>
          </span>
        </div>
      </div>

      {/* 바구니 탭 */}
      <div
        className="grid grid-cols-5 gap-1 p-2 border-b flex-shrink-0"
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
                if (isOrganizeMode && selectedPieceId !== null) {
                  movePieceToBasket(selectedPieceId, key);
                } else {
                  setActiveBasket(key);
                }
              }}
              className={`flex flex-row items-center justify-center rounded-lg border transition-all cursor-pointer gap-1.5 ${
                isLarge ? 'py-2.5 px-1.5' : 'p-1'
              } ${isOrganizeMode && selectedPieceId !== null ? 'animate-pulse' : ''}`}
              style={{
                borderColor: isHovered
                  ? 'rgba(79, 142, 247, 0.5)'
                  : isActive
                  ? 'rgba(0, 0, 0, 0.25)'
                  : isOrganizeMode && selectedPieceId !== null
                  ? 'rgba(59, 130, 246, 0.6)'
                  : 'rgba(0, 0, 0, 0.05)',
                backgroundColor: isHovered
                  ? 'rgba(79, 142, 247, 0.08)'
                  : isActive
                  ? 'rgba(0, 0, 0, 0.06)'
                  : isOrganizeMode && selectedPieceId !== null
                  ? 'rgba(59, 130, 246, 0.05)'
                  : 'rgba(0, 0, 0, 0.01)',
                transform: isHovered ? 'scale(1.03)' : 'scale(1)',
              }}
            >
              <span
                className={`rounded-full flex-shrink-0 ${isLarge ? 'w-2 h-2' : 'w-1.5 h-1.5'}`}
                style={{ backgroundColor: meta.color }}
              />
              <span
                className={`${isLarge ? 'text-sm' : 'text-xs'} font-semibold leading-none font-mono`}
                style={{ color: isActive || isHovered || (isOrganizeMode && selectedPieceId !== null) ? '#1f2937' : 'rgba(0, 0, 0, 0.4)' }}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* 도움말 / 분류 가이드 */}
      {isOrganizeMode ? (
        <div 
          className="px-3 py-1.5 border-b flex-shrink-0 bg-blue-50/50"
          style={{ borderColor: 'rgba(59, 130, 246, 0.15)' }}
        >
          <p className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping shrink-0" />
            <span>
              {selectedPieceId === null 
                ? "① 아래 조각을 눌러 선택해주세요." 
                : "② 위 바구니 탭을 눌러 조각을 옮기세요."}
            </span>
          </p>
        </div>
      ) : (
        isLarge && (
          <div className="px-4 py-1.5 border-b flex-shrink-0" style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}>
            <p className="text-[10px] font-medium text-gray-500 flex items-center gap-1">
              <HelpCircle size={12} className="text-gray-400 flex-shrink-0" />
              <span>조각 목록 스크롤 가능</span>
            </p>
          </div>
        )
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
            style={{ gridTemplateColumns: isLarge ? 'repeat(auto-fill, minmax(54px, 1fr))' : 'repeat(auto-fill, minmax(40px, 1fr))' }}
          >
            {displayPieces.map((pieceId) => {
              const isSelected = selectedPieceId === pieceId;
              const isHold = pieceId === holdPieceId;

              return (
                <div
                  key={pieceId}
                  data-tray-piece="true"
                  data-piece-id={pieceId}
                  data-selected={isSelected ? "true" : "false"}
                  onPointerDown={(e) => startDrag(e, pieceId)}
                  onTouchStart={(e) => handleTouchStart(e, pieceId)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={(e) => handleTouchEnd(e, pieceId)}
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (ignoreNextClickRef.current) {
                      ignoreNextClickRef.current = false;
                      return;
                    }
                    if (!scrolledRecentlyRef.current) {
                      if (isOrganizeMode && selectedPieceId === pieceId) {
                        onTrayClick?.();
                      } else {
                        onPieceClick(pieceId);
                      }
                    }
                  }}
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
      {draggedPiece && typeof document !== 'undefined' && createPortal(
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
        </div>,
        document.body
      )}

      {/* 비활성화 오버레이 (이동 모드 시) */}
      {!isPlayMode && (
        <div className="absolute inset-0 bg-slate-50/70 backdrop-blur-[2px] z-30 flex flex-col items-center justify-center p-4 text-center transition-all duration-300 animate-in fade-in">
          <div className="bg-white/95 p-5 rounded-2xl shadow-xl border border-slate-200/60 flex flex-col items-center gap-3 max-w-[85%]">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
              <Lock size={18} className="text-slate-600" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-slate-800">보관함 비활성화</p>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                이동 모드 해제 후 사용 가능
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
