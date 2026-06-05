'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, X, Folder, HelpCircle, Eye } from 'lucide-react';
import PieceCell from './piece-cell';

interface PieceTrayProps {
  trayPieces: number[];
  image: string;
  gridSize: number;
  selectedPieceId: number | null;
  onPieceClick: (pieceId: number) => void;
  onTrayClick?: () => void;
  onGuideClick?: () => void;
}

export default function PieceTray({
  trayPieces,
  image,
  gridSize,
  selectedPieceId,
  onPieceClick,
  onTrayClick,
  onGuideClick,
}: PieceTrayProps) {
  const cellSize = 52; // 트레이 조각 고정 사이즈
  const drawerCellSize = 46; // 모아보기 서랍장 내 조각 고정 사이즈
  
  // 상태 관리
  const [mounted, setMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeBasket, setActiveBasket] = useState<string>('basket1');
  const [hoveredBasket, setHoveredBasket] = useState<string | null>(null);
  const [baskets, setBaskets] = useState<Record<string, number[]>>({
    basket1: [],
    basket2: [],
    basket3: [],
    basket4: [],
    basket5: [],
  });

  // 드래그앤드롭 추적 상태
  const [draggedPiece, setDraggedPiece] = useState<{
    id: number;
    x: number;
    y: number;
    startX: number;
    startY: number;
    pointerId: number;
  } | null>(null);

  // 롱프레스(꾹 누르기) 및 스크롤 충돌 방지를 위한 Ref
  const longPressTimeout = useRef<any>(null);
  const dragActiveRef = useRef<boolean>(false);
  const startCoords = useRef<{ x: number; y: number } | null>(null);
  const lastCoords = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false); // 스크롤과 클릭 구분을 위한 Ref

  // 글로벌 이벤트 리스너 참조 Ref
  const globalMoveRef = useRef<any>(null);
  const globalUpRef = useRef<any>(null);
  const globalCancelRef = useRef<any>(null);

  // 컴포넌트 언마운트 시 글로벌 리스너 정리
  useEffect(() => {
    setMounted(true);
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
    };
  }, []);

  // 로컬스토리지에서 바구니 데이터 로드 (마운트 시)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = `puzzle-baskets-${window.location.pathname}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setBaskets(parsed);
        }
      } catch (e) {}
    }
  }, []);

  // Zustand trayPieces 데이터와 로컬 바구니 동기화
  useEffect(() => {
    setBaskets((prev) => {
      const allPiecesInBaskets = new Set(Object.values(prev).flat());
      const traySet = new Set(trayPieces);

      // 1. 트레이에 없는 조각은 바구니에서도 삭제 (보드에 배치된 경우)
      const nextBaskets = { ...prev };
      for (const key in nextBaskets) {
        nextBaskets[key] = nextBaskets[key].filter((id) => traySet.has(id));
      }

      // 2. 바구니에 없는 새로운 조각은 기본으로 'basket1'에 추가
      const newPieces = trayPieces.filter((id) => !allPiecesInBaskets.has(id));
      if (newPieces.length > 0) {
        nextBaskets.basket1 = [...(nextBaskets.basket1 || []), ...newPieces];
      }

      // 로컬스토리지 저장
      if (typeof window !== 'undefined') {
        const key = `puzzle-baskets-${window.location.pathname}`;
        localStorage.setItem(key, JSON.stringify(nextBaskets));
      }

      return nextBaskets;
    });
  }, [trayPieces]);

  // 특정 바구니로 조각 이동
  const movePieceToBasket = (pieceId: number, targetBasket: string) => {
    setBaskets((prev) => {
      const next = { ...prev };
      // 모든 바구니에서 제거
      for (const key in next) {
        next[key] = next[key].filter((id) => id !== pieceId);
      }
      // 목표 바구니에 추가
      next[targetBasket] = [...(next[targetBasket] || []), pieceId];

      // 로컬스토리지 저장
      if (typeof window !== 'undefined') {
        const key = `puzzle-baskets-${window.location.pathname}`;
        localStorage.setItem(key, JSON.stringify(next));
      }

      return next;
    });
  };


  // 포인터 드래그 시작 핸들러 (데스크톱 마우스용)
  const startDrag = (e: React.PointerEvent, pieceId: number) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    
    const clientX = e.clientX;
    const clientY = e.clientY;
    const pointerId = e.pointerId;
    const currentTarget = e.currentTarget as HTMLElement;

    startCoords.current = { x: clientX, y: clientY };
    lastCoords.current = { x: clientX, y: clientY };
    dragActiveRef.current = false;
    hasMovedRef.current = false;

    try {
      currentTarget.setPointerCapture(pointerId);
    } catch (err) {}

    longPressTimeout.current = setTimeout(() => {
      dragActiveRef.current = true;
      setDraggedPiece({
        id: pieceId,
        x: clientX,
        y: clientY,
        startX: clientX,
        startY: clientY,
        pointerId: pointerId,
      });

      const onGlobalMove = (event: PointerEvent) => {
        if (event.pointerType === 'mouse') {
          setDraggedPiece({
            id: pieceId,
            x: event.clientX,
            y: event.clientY,
            startX: clientX,
            startY: clientY,
            pointerId: pointerId,
          });
          lastCoords.current = { x: event.clientX, y: event.clientY };
          
          const dropElement = document.elementFromPoint(event.clientX, event.clientY);
          const basketTab = dropElement?.closest('[data-basket-id]');
          const targetBasket = basketTab?.getAttribute('data-basket-id') || null;
          setHoveredBasket(targetBasket);
        }
      };

      const onGlobalUp = (event: PointerEvent) => {
        cleanupListeners();

        dragActiveRef.current = false;
        startCoords.current = null;

        const endX = event.clientX || lastCoords.current.x;
        const endY = event.clientY || lastCoords.current.y;

        const dropElement = document.elementFromPoint(endX, endY);
        const basketTab = dropElement?.closest('[data-basket-id]');
        const targetBasket = basketTab?.getAttribute('data-basket-id');
        
        if (targetBasket) {
          movePieceToBasket(pieceId, targetBasket);
        }

        setDraggedPiece(null);
        setHoveredBasket(null);
      };

      const onGlobalCancel = () => {
        cleanupListeners();
        dragActiveRef.current = false;
        startCoords.current = null;
        setDraggedPiece(null);
        setHoveredBasket(null);
      };

      const cleanupListeners = () => {
        window.removeEventListener('pointermove', onGlobalMove);
        window.removeEventListener('pointerup', onGlobalUp);
        window.removeEventListener('pointercancel', onGlobalCancel);

        globalMoveRef.current = null;
        globalUpRef.current = null;
        globalCancelRef.current = null;
      };

      window.addEventListener('pointermove', onGlobalMove, { passive: true });
      window.addEventListener('pointerup', onGlobalUp, { passive: true });
      window.addEventListener('pointercancel', onGlobalCancel);

      globalMoveRef.current = onGlobalMove;
      globalUpRef.current = onGlobalUp;
      globalCancelRef.current = onGlobalCancel;
    }, 220);
  };

  // 모바일 터치 드래그 시작 핸들러
  const handleTouchStart = (e: React.TouchEvent, pieceId: number) => {
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
      setDraggedPiece({
        id: pieceId,
        x: clientX,
        y: clientY,
        startX: clientX,
        startY: clientY,
        pointerId: 0,
      });

      const onGlobalTouchMove = (event: TouchEvent) => {
        if (event.cancelable) {
          event.preventDefault();
        }
        const t = event.touches[0];
        if (t) {
          setDraggedPiece({
            id: pieceId,
            x: t.clientX,
            y: t.clientY,
            startX: clientX,
            startY: clientY,
            pointerId: 0,
          });
          lastCoords.current = { x: t.clientX, y: t.clientY };

          const dropElement = document.elementFromPoint(t.clientX, t.clientY);
          const basketTab = dropElement?.closest('[data-basket-id]');
          const targetBasket = basketTab?.getAttribute('data-basket-id') || null;
          setHoveredBasket(targetBasket);
        }
      };

      const onGlobalTouchEnd = (event: TouchEvent) => {
        cleanupTouchListeners();

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
      };

      const onGlobalTouchCancel = () => {
        cleanupTouchListeners();
        dragActiveRef.current = false;
        startCoords.current = null;
        setDraggedPiece(null);
        setHoveredBasket(null);
      };

      const cleanupTouchListeners = () => {
        window.removeEventListener('touchmove', onGlobalTouchMove);
        window.removeEventListener('touchend', onGlobalTouchEnd);
        window.removeEventListener('touchcancel', onGlobalTouchCancel);

        globalMoveRef.current = null;
        globalUpRef.current = null;
        globalCancelRef.current = null;
      };

      window.addEventListener('touchmove', onGlobalTouchMove, { passive: false });
      window.addEventListener('touchend', onGlobalTouchEnd, { passive: true });
      window.addEventListener('touchcancel', onGlobalTouchCancel);

      globalMoveRef.current = onGlobalTouchMove;
      globalUpRef.current = onGlobalTouchEnd;
      globalCancelRef.current = onGlobalTouchCancel;
    }, 220);
  };

  // 모바일 터치 이동 핸들러 (롱프레스 활성화 전 스크롤 허용용)
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startCoords.current) return;
    if (dragActiveRef.current) return;

    const touch = e.touches[0];
    if (!touch) return;

    const dx = touch.clientX - startCoords.current.x;
    const dy = touch.clientY - startCoords.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 미세 움직임 감지 시 스크롤 중임을 임시 마킹하여 클릭 전환 방지
    if (distance > 8) {
      hasMovedRef.current = true;
    }

    // 스크롤 및 큰 움직임 감지 시 롱프레스 취소 (임계값을 10px로 하향 조정)
    if (distance > 10) {
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = null;
      }
      startCoords.current = null;
    }
  };

  // 모바일 터치 업 핸들러 (단순 클릭/탭 감지)
  const handleTouchEnd = (e: React.TouchEvent, pieceId: number) => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }

    const wasDragging = dragActiveRef.current;
    dragActiveRef.current = false;
    startCoords.current = null;

    // 터치 이동(스크롤)이 없었고 드래그 활성화도 안 되었던 순수 탭 동작인 경우에만 조각 클릭으로 처리
    if (!wasDragging && !hasMovedRef.current) {
      e.stopPropagation();
      onPieceClick(pieceId);
      if (isDrawerOpen) {
        setTimeout(() => {
          setIsDrawerOpen(false);
        }, 60);
      }
    }
    
    // 상태 초기화
    hasMovedRef.current = false;
  };

  // 포인터 이동 핸들러 (마우스용)
  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    if (!startCoords.current) return;

    const dx = e.clientX - startCoords.current.x;
    const dy = e.clientY - startCoords.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (!dragActiveRef.current) {
      if (distance > 24) {
        if (longPressTimeout.current) {
          clearTimeout(longPressTimeout.current);
          longPressTimeout.current = null;
        }
        startCoords.current = null;
        const target = e.currentTarget as HTMLElement;
        try {
          target.releasePointerCapture(e.pointerId);
        } catch (err) {}
      }
    }
  };

  // 포인터 업 핸들러 (마우스용 단순 클릭)
  const handlePointerUp = (e: React.PointerEvent, pieceId: number) => {
    if (e.pointerType !== 'mouse') return;
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }

    const wasDragging = dragActiveRef.current;
    dragActiveRef.current = false;
    startCoords.current = null;

    if (!wasDragging) {
      e.stopPropagation();
      e.preventDefault();
      onPieceClick(pieceId);
      if (isDrawerOpen) {
        setTimeout(() => {
          setIsDrawerOpen(false);
        }, 60);
      }
    }
  };

  // 포인터 드래그 취소 핸들러
  const handlePointerCancel = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
    dragActiveRef.current = false;
    startCoords.current = null;
    setDraggedPiece(null);
    setHoveredBasket(null);
  };

  const activeBasketPieces = baskets[activeBasket] || [];

  return (
    <div
      className="rounded-2xl border p-3 sm:p-4 shadow-inner relative"
      style={{
        backgroundColor: 'var(--puzzle-glass-bg)',
        backdropFilter: 'var(--puzzle-glass-blur)',
        borderColor: 'var(--puzzle-border)',
        width: '100%',
        cursor: selectedPieceId !== null ? 'pointer' : 'default',
      }}
      onClick={() => {
        if (selectedPieceId !== null) {
          onTrayClick?.();
        }
      }}
    >
      {/* 트레이 헤더 영역 */}
      <div className="flex justify-between items-center mb-3 select-none">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-extrabold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
            남은 조각: {trayPieces.length}
          </span>

          {/* 바구니 1,2,3,4,5 탭 버튼 */}
          <div className="flex bg-black/20 rounded-lg p-0.5 border border-white/5">
            {['basket1', 'basket2', 'basket3', 'basket4', 'basket5'].map((key, i) => {
               const isActive = activeBasket === key;
               const count = baskets[key]?.length || 0;
               return (
                 <button
                   key={key}
                   onClick={(e) => {
                     e.stopPropagation();
                     setActiveBasket(key);
                   }}
                   className="px-2.5 py-0.5 rounded text-[11px] font-black transition-all flex items-center gap-0.5 select-none"
                   style={{
                     backgroundColor: isActive ? 'var(--puzzle-primary)' : 'transparent',
                     color: isActive ? '#fff' : 'var(--puzzle-muted-foreground)',
                   }}
                 >
                   <span>{i + 1}</span>
                   <span className="hidden sm:inline opacity-70 text-[9px]">({count})</span>
                 </button>
               );
            })}
          </div>
        </div>

        {/* 모아보기 및 상태 안내 */}
        <div className="flex items-center gap-2">
          {selectedPieceId !== null && (
            <span className="hidden sm:inline text-[10px] sm:text-xs font-bold animate-pulse" style={{ color: 'var(--puzzle-primary)' }}>
              ● 보드 격자를 터치하여 배치하세요
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // 모아보기를 켜는 순간 기존에 선택해서 들고 있던 조각 해제
              if (selectedPieceId !== null) {
                onTrayClick?.();
              }
              setIsDrawerOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-black transition-all shadow flex items-center gap-1 hover:brightness-110 select-none"
            style={{
              backgroundColor: 'var(--puzzle-primary)',
              color: '#fff',
            }}
          >
            <Maximize2 size={12} strokeWidth={2.5} />
            <span>모아보기</span>
          </button>
        </div>
      </div>

      {/* 컴팩트 가로 스크롤 영역 */}
      <div
        className="flex gap-3 overflow-x-auto pt-4 pb-2 px-1 scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        {trayPieces.length === 0 && selectedPieceId === null ? (
          <div className="w-full text-center py-4 text-sm font-semibold" style={{ color: 'var(--puzzle-primary)' }}>
            🎉 모든 조각이 보드에 배치되었습니다!
          </div>
        ) : activeBasketPieces.length === 0 && selectedPieceId === null ? (
          <div className="w-full text-center py-4 text-xs font-bold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
            바구니 {activeBasket.replace('basket', '')}번이 비어 있습니다. 모아보기에서 조각을 드래그해 옮겨보세요!
          </div>
        ) : (
          <>
            {/* HOLD 조각 표시 */}
            {selectedPieceId !== null && !trayPieces.includes(selectedPieceId) && (
              <div
                key={selectedPieceId}
                onClick={(e) => {
                  e.stopPropagation();
                  onPieceClick(selectedPieceId);
                }}
                className="relative cursor-pointer transition-all duration-200 flex-shrink-0 outline-none select-none"
                style={{
                  transform: 'scale(1.08) translateY(-4px)',
                  boxShadow: '0 0 0 3px var(--puzzle-primary), 0 8px 16px rgba(79, 142, 247, 0.3)',
                  borderRadius: '6px',
                  outline: 'none',
                  touchAction: 'none',
                }}
              >
                <PieceCell
                  pieceIdx={selectedPieceId}
                  image={image}
                  size={cellSize}
                  gridSize={gridSize}
                  small
                />
                <span className="absolute -top-2 -right-1 px-1 py-0.5 bg-blue-500 text-white rounded text-[8px] font-black shadow-md pointer-events-none">
                  HOLD
                </span>
              </div>
            )}

            {/* 현재 선택된 바구니의 조각들 표시 */}
            {activeBasketPieces.map((pieceId) => {
              const isSelected = selectedPieceId === pieceId;

              return (
                <div
                  key={pieceId}
                  onPointerDown={(e) => startDrag(e, pieceId)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={(e) => handlePointerUp(e, pieceId)}
                  onPointerCancel={handlePointerCancel}
                  onTouchStart={(e) => handleTouchStart(e, pieceId)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={(e) => handleTouchEnd(e, pieceId)}
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  className="relative cursor-pointer transition-all duration-200 flex-shrink-0 outline-none select-none touch-pan-x"
                  style={{
                    transform: isSelected && draggedPiece?.id !== pieceId ? 'scale(1.08) translateY(-4px)' : 'scale(1)',
                    boxShadow: isSelected && draggedPiece?.id !== pieceId ? '0 0 0 3px var(--puzzle-primary), 0 8px 16px rgba(79, 142, 247, 0.3)' : 'none',
                    opacity: draggedPiece?.id === pieceId ? 0.25 : 1,
                    borderRadius: '6px',
                    outline: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    touchAction: 'pan-x',
                  }}
                >
                  <PieceCell
                    pieceIdx={pieceId}
                    image={image}
                    size={cellSize}
                    gridSize={gridSize}
                    small
                  />
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* 바텀시트 서랍장 모달 */}
      {isDrawerOpen && mounted && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9990] flex flex-col justify-end select-none">
          {/* 어두운 반투명 배경 (클릭 또는 터치 시 닫힘) */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 cursor-pointer"
            onClick={() => setIsDrawerOpen(false)}
            onPointerDown={() => setIsDrawerOpen(false)}
          />

          {/* 슬라이드 서랍 본체 */}
          <div
            className="relative w-full max-h-[88vh] min-h-[65vh] flex flex-col rounded-t-[2rem] border-t shadow-2xl transition-all duration-300 animate-slide-up pb-8"
            style={{
              backgroundColor: '#1f2937', // 적당한 회색 (Gray 800)
              borderColor: 'var(--puzzle-border)',
              color: '#f8fafc',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 상단 드래그 핸들바 디자인 */}
            <div className="w-12 h-1 bg-slate-500/40 rounded-full mx-auto my-3" />

            {/* 헤더 */}
            <div className="flex justify-between items-center px-5 pb-3 border-b" style={{ borderColor: 'var(--puzzle-border)' }}>
              <div>
                <h3 className="text-base font-black flex items-center gap-1.5" style={{ color: '#f8fafc' }}>
                  <Folder size={18} className="text-blue-400" />
                  <span>전체 조각 모아보기</span>
                </h3>
                <p className="hidden sm:flex text-[10px] font-bold mt-0.5 items-center gap-1" style={{ color: '#9ca3af' }}>
                  <HelpCircle size={10} className="text-blue-400" />
                  <span>조각을 길게 드래그해서 바구니 번호 위에 놓으면 분류됩니다.</span>
                </p>
                <p className="sm:hidden text-[9px] font-bold mt-0.5 flex items-center gap-1" style={{ color: '#9ca3af' }}>
                  <HelpCircle size={9} className="text-blue-400" />
                  <span>조각 드래그 시 바구니 분류 가능</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                {onGuideClick && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onGuideClick();
                    }}
                    className="p-1.5 rounded-lg text-xs font-black transition-colors"
                    style={{ backgroundColor: 'var(--puzzle-secondary)', color: 'var(--puzzle-foreground)' }}
                    title="가이드 보기"
                  >
                    <Eye size={18} />
                  </button>
                )}
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-full transition-colors"
                  style={{ backgroundColor: 'var(--puzzle-secondary)', color: 'var(--puzzle-muted-foreground)' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* 분류 바구니 드롭 영역 (드랍존 역할) */}
            <div className="grid grid-cols-5 gap-2 p-4 border-b" style={{ borderColor: 'var(--puzzle-border)', backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
              {['basket1', 'basket2', 'basket3', 'basket4', 'basket5'].map((key, i) => {
                const isActive = activeBasket === key;
                const isHovered = hoveredBasket === key;
                const count = baskets[key]?.length || 0;

                return (
                  <div
                    key={key}
                    data-basket-id={key}
                    onClick={() => setActiveBasket(key)}
                    className="flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all cursor-pointer select-none"
                    style={{
                      borderColor: isHovered
                        ? 'var(--puzzle-primary)'
                        : isActive
                        ? 'rgba(59, 130, 246, 0.4)'
                        : 'rgba(255, 255, 255, 0.05)',
                      backgroundColor: isHovered
                        ? 'rgba(59, 130, 246, 0.2)'
                        : isActive
                        ? 'rgba(59, 130, 246, 0.08)'
                        : 'rgba(255, 255, 255, 0.02)',
                      transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                    }}
                  >
                    <span
                      className="text-[10px] font-black transition-colors"
                      style={{ color: isActive || isHovered ? '#60a5fa' : '#94a3b8' }}
                    >
                      바구니 {i + 1}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 mt-0.5">({count}개)</span>
                  </div>
                );
              })}
            </div>

            {/* 조각 세로 그리드 목록 */}
            <div className={`flex-1 p-4 pb-16 scrollbar-hide ${draggedPiece ? 'overflow-hidden' : 'overflow-y-auto'}`}>
              {activeBasketPieces.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                  <span className="text-sm font-black mb-1">바구니가 비어 있습니다.</span>
                  <span className="text-xs text-slate-500">다른 바구니에서 조각을 드래그하여 옮겨보세요!</span>
                </div>
              ) : (
                <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-2.5 justify-items-center">
                  {activeBasketPieces.map((pieceId) => {
                    const isSelected = selectedPieceId === pieceId;
                    return (
                      <div
                        key={pieceId}
                        onPointerDown={(e) => startDrag(e, pieceId)}
                        onPointerMove={handlePointerMove}
                        onPointerUp={(e) => handlePointerUp(e, pieceId)}
                        onPointerCancel={handlePointerCancel}
                        onTouchStart={(e) => handleTouchStart(e, pieceId)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={(e) => handleTouchEnd(e, pieceId)}
                        onContextMenu={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        className="relative cursor-pointer transition-all duration-200 select-none touch-pan-y"
                        style={{
                          transform: isSelected && draggedPiece?.id !== pieceId ? 'scale(1.08)' : 'scale(1)',
                          boxShadow: isSelected && draggedPiece?.id !== pieceId ? '0 0 0 3px var(--puzzle-primary)' : 'none',
                          opacity: draggedPiece?.id === pieceId ? 0.25 : 1,
                          borderRadius: '6px',
                          WebkitTouchCallout: 'none',
                          WebkitUserSelect: 'none',
                          outline: 'none',
                          WebkitTapHighlightColor: 'transparent',
                          touchAction: 'pan-y',
                        }}
                      >
                        <PieceCell
                          pieceIdx={pieceId}
                          image={image}
                          size={drawerCellSize}
                          gridSize={gridSize}
                          small
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 드래그 중인 조각의 화면 고스트 피드백 */}
      {draggedPiece && mounted && typeof document !== 'undefined' && createPortal(
        <div
          className="pointer-events-none fixed z-[9999] opacity-90 select-none"
          style={{
            left: `${draggedPiece.x - drawerCellSize / 2}px`,
            top: `${draggedPiece.y - drawerCellSize / 2}px`,
            width: drawerCellSize,
            height: drawerCellSize,
            transform: 'scale(1.15)',
            boxShadow: '0 0 0 3px var(--puzzle-primary), 0 10px 20px rgba(0, 0, 0, 0.4)',
            borderRadius: '6px',
          }}
        >
          <PieceCell
            pieceIdx={draggedPiece.id}
            image={image}
            size={drawerCellSize}
            gridSize={gridSize}
            small
          />
        </div>,
        document.body
      )}
    </div>
  );
}
