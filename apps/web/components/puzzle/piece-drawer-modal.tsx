'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, X, Folder, HelpCircle, Eye } from 'lucide-react';
import PieceCell from './piece-cell';

export const basketMetadata: Record<string, { label: string; color: string }> = {
  basket1: { label: '빨강', color: '#ef4444' },
  basket2: { label: '파랑', color: '#3b82f6' },
  basket3: { label: '초록', color: '#22c55e' },
  basket4: { label: '노랑', color: '#eab308' },
  basket5: { label: '보라', color: '#a855f7' },
};

interface PieceDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOrganizeMode: boolean;
  setIsOrganizeMode: (val: boolean) => void;
  onGuideClick?: () => void;
  selectedPieceId: number | null;
  onTrayClick?: () => void;
  onPieceClick: (pieceId: number) => void;
  activeBasket: string;
  setActiveBasket: (basket: string) => void;
  baskets: Record<string, number[]>;
  hoveredBasket: string | null;
  movePieceToBasket: (pieceId: number, targetBasket: string) => void;
  activeBasketPieces: number[];
  image: string;
  gridSize: number;
  drawerCellSize: number;
  draggedPiece: any;
  startDrag: (e: React.PointerEvent, pieceId: number) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: (e: React.PointerEvent, pieceId: number) => void;
  handlePointerCancel: (e: React.PointerEvent) => void;
  handleTouchStart: (e: React.TouchEvent, pieceId: number) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent, pieceId: number) => void;
  ignoreNextClickRef: React.MutableRefObject<boolean>;
}

export default function PieceDrawerModal({
  isOpen,
  onClose,
  isOrganizeMode,
  setIsOrganizeMode,
  onGuideClick,
  selectedPieceId,
  onTrayClick,
  onPieceClick,
  activeBasket,
  setActiveBasket,
  baskets,
  hoveredBasket,
  movePieceToBasket,
  activeBasketPieces,
  image,
  gridSize,
  drawerCellSize,
  draggedPiece,
  startDrag,
  handlePointerMove,
  handlePointerUp,
  handlePointerCancel,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  ignoreNextClickRef,
}: PieceDrawerModalProps) {
  const [mounted, setMounted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerDragStart = useRef<{ y: number; time: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  console.log("PieceDrawerModal isOpen:", isOpen, "mounted:", mounted);
  if (!isOpen || !mounted || typeof document === 'undefined') return null;

  const handleDrawerDragStart = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const target = e.currentTarget as HTMLElement;
    try { target.setPointerCapture(e.pointerId); } catch (err) {}
    drawerDragStart.current = { y: e.clientY, time: Date.now() };
    if (drawerRef.current) drawerRef.current.style.transition = 'none';
  };

  const handleDrawerDragMove = (e: React.PointerEvent) => {
    if (!drawerDragStart.current || !drawerRef.current) return;
    const deltaY = e.clientY - drawerDragStart.current.y;
    if (deltaY > 0) drawerRef.current.style.transform = `translateY(${deltaY}px)`;
    else drawerRef.current.style.transform = 'translateY(0px)';
  };

  const handleDrawerDragEnd = (e: React.PointerEvent) => {
    if (!drawerDragStart.current) return;
    const target = e.currentTarget as HTMLElement;
    try { target.releasePointerCapture(e.pointerId); } catch (err) {}

    const deltaY = e.clientY - drawerDragStart.current.y;
    const deltaTime = Date.now() - drawerDragStart.current.time;
    drawerDragStart.current = null;

    if (!drawerRef.current) return;

    drawerRef.current.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    const velocity = deltaY / Math.max(deltaTime, 1);
    const isFlick = deltaY > 50 && velocity > 0.5;

    if (deltaY > 120 || isFlick) {
      drawerRef.current.style.transform = 'translateY(100%)';
      setTimeout(() => onClose(), 250);
    } else {
      drawerRef.current.style.transform = 'translateY(0px)';
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9990] flex flex-col justify-end select-none">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 cursor-pointer"
        onClick={onClose}
        onPointerDown={onClose}
      />
      <div
        ref={drawerRef}
        className="relative w-full h-[85vh] flex flex-col rounded-t-[2rem] border-t shadow-2xl transition-all duration-300 puzzle-animate-slide-up pb-8"
        style={{ backgroundColor: '#1f2937', borderColor: 'var(--puzzle-border)', color: '#f8fafc' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-full flex flex-col items-center cursor-ns-resize select-none touch-none py-3"
          onPointerDown={handleDrawerDragStart}
          onPointerMove={handleDrawerDragMove}
          onPointerUp={handleDrawerDragEnd}
          onPointerCancel={handleDrawerDragEnd}
        >
          <div className="w-12 h-1 bg-slate-500/40 rounded-full" />
        </div>

        <div className="flex justify-between items-center px-5 pb-3 border-b select-none" style={{ borderColor: 'var(--puzzle-border)' }}>
          <div
            className="flex-1 cursor-ns-resize py-1 touch-none"
            onPointerDown={handleDrawerDragStart}
            onPointerMove={handleDrawerDragMove}
            onPointerUp={handleDrawerDragEnd}
            onPointerCancel={handleDrawerDragEnd}
          >
            <h3 className="text-base font-black flex items-center gap-1.5" style={{ color: '#f8fafc' }}>
              <Folder size={18} className="text-blue-400" />
              <span>전체 조각 모아보기</span>
            </h3>
            {isOrganizeMode ? (
              <p className="text-[10px] sm:text-xs font-bold mt-0.5 text-blue-400 animate-pulse">
                ● 조각 터치 후, 이동할 바구니를 선택하세요.
              </p>
            ) : (
              <>
                <p className="hidden sm:flex text-[10px] font-bold mt-0.5 items-center gap-1" style={{ color: '#9ca3af' }}>
                  <HelpCircle size={10} className="text-blue-400" />
                  <span>조각을 길게 드래그해서 바구니 번호 위에 놓으면 분류됩니다.</span>
                </p>
                <p className="sm:hidden text-[9px] font-bold mt-0.5 flex items-center gap-1" style={{ color: '#9ca3af' }}>
                  <HelpCircle size={9} className="text-blue-400" />
                  <span>조각 드래그 시 바구니 분류 가능</span>
                </p>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setIsOrganizeMode(!isOrganizeMode); }}
              className="px-2.5 py-1 rounded-lg text-xs font-black transition-all border select-none shrink-0"
              style={{
                backgroundColor: isOrganizeMode ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                borderColor: isOrganizeMode ? '#60a5fa' : 'rgba(255, 255, 255, 0.1)',
                color: isOrganizeMode ? '#60a5fa' : '#9ca3af',
              }}
            >
              분류 모드 {isOrganizeMode ? 'ON' : 'OFF'}
            </button>
            {onGuideClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedPieceId !== null) onTrayClick?.();
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
              onClick={onClose}
              className="p-1.5 rounded-full transition-colors"
              style={{ backgroundColor: 'var(--puzzle-secondary)', color: 'var(--puzzle-muted-foreground)' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 p-4 border-b" style={{ borderColor: 'var(--puzzle-border)', backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
          {['basket1', 'basket2', 'basket3', 'basket4', 'basket5'].map((key) => {
            const isActive = activeBasket === key;
            const isHovered = hoveredBasket === key;
            const count = baskets[key]?.length || 0;
            const meta = basketMetadata[key];

            return (
              <div
                key={key}
                data-basket-id={key}
                onClick={() => {
                  if (isOrganizeMode && selectedPieceId !== null) movePieceToBasket(selectedPieceId, key);
                  else setActiveBasket(key);
                }}
                className="flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all cursor-pointer select-none gap-1"
                style={{
                  borderColor: isHovered ? 'var(--puzzle-primary)' : isActive ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.05)',
                  backgroundColor: isHovered ? 'rgba(59, 130, 246, 0.2)' : isActive ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                }}
              >
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full border border-white/10 shrink-0" style={{ backgroundColor: meta.color }} />
                  <span className="text-[10px] font-black transition-colors" style={{ color: isActive || isHovered ? '#60a5fa' : '#94a3b8' }}>
                    {meta.label}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-slate-400">({count}개)</span>
              </div>
            );
          })}
        </div>

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
                    data-drawer-piece="true"
                    data-piece-id={pieceId}
                    data-selected={isSelected ? "true" : "false"}
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
                      if (ignoreNextClickRef.current) { ignoreNextClickRef.current = false; return; }
                      if (isOrganizeMode) {
                        if (selectedPieceId === pieceId) onTrayClick?.();
                        else onPieceClick(pieceId);
                      } else {
                        onPieceClick(pieceId);
                        setTimeout(() => onClose(), 60);
                      }
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
                    <PieceCell pieceIdx={pieceId} image={image} size={drawerCellSize} gridSize={gridSize} small />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
