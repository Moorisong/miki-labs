'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2 } from 'lucide-react';
import PieceCell from './piece-cell';
import { usePuzzleBaskets } from './hooks/use-puzzle-baskets';
import { usePieceDrag } from './hooks/use-piece-drag';
import PieceDrawerModal, { basketMetadata } from './piece-drawer-modal';

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
  const cellSize = 52;
  const drawerCellSize = 46;

  const [mounted, setMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isOrganizeMode, setIsOrganizeMode] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    baskets,
    activeBasket,
    setActiveBasket,
    hoveredBasket,
    setHoveredBasket,
    movePieceToBasket: baseMovePieceToBasket,
  } = usePuzzleBaskets(trayPieces);

  const movePieceToBasket = (pieceId: number, targetBasket: string) => {
    if (selectedPieceId === pieceId) {
      onTrayClick?.();
    }
    baseMovePieceToBasket(pieceId, targetBasket);
  };

  const {
    draggedPiece,
    startDrag,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    ignoreNextClickRef,
  } = usePieceDrag({
    isDrawerOpen,
    setIsDrawerOpen,
    movePieceToBasket,
    setHoveredBasket,
  });

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
      <div className="flex justify-between items-center mb-3 select-none">
        <div className="flex items-center gap-3.5 sm:gap-2">
          <span className="text-xs sm:text-sm font-extrabold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
            남은 조각: {trayPieces.length}
          </span>
          <div className="flex rounded-lg p-0.5 border ml-3 sm:ml-0" style={{ borderColor: 'var(--puzzle-border)' }}>
            {['basket1', 'basket2', 'basket3', 'basket4', 'basket5'].map((key) => {
              const isActive = activeBasket === key;
              const meta = basketMetadata[key];
              return (
                <button
                  key={key}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isOrganizeMode && selectedPieceId !== null) {
                      movePieceToBasket(selectedPieceId, key);
                    } else {
                      setActiveBasket(key);
                    }
                  }}
                  className="px-1.5 py-0.5 rounded-md transition-all flex items-center justify-center select-none"
                  style={{ backgroundColor: isActive ? 'var(--puzzle-secondary)' : 'transparent' }}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0" 
                    style={{ 
                      backgroundColor: meta.color,
                      transform: isActive ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: isActive ? `0 0 8px ${meta.color}` : 'none',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }} 
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedPieceId !== null && (
            <span className="hidden sm:inline text-[10px] sm:text-xs font-bold animate-pulse" style={{ color: 'var(--puzzle-primary)' }}>
              ● 보드 격자를 터치하여 배치하세요
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (selectedPieceId !== null) onTrayClick?.();
              setIsDrawerOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-black transition-all shadow flex items-center gap-1 hover:brightness-110 select-none"
            style={{ backgroundColor: 'var(--puzzle-primary)', color: '#fff' }}
          >
            <Maximize2 size={12} strokeWidth={2.5} />
            <span>모아보기</span>
          </button>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pt-4 pb-2 px-1 scrollbar-hide" style={{ scrollBehavior: 'smooth' }}>
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
                <PieceCell pieceIdx={selectedPieceId} image={image} size={cellSize} gridSize={gridSize} small />
                <span className="absolute -top-2 -right-1 px-1 py-0.5 bg-blue-500 text-white rounded text-[8px] font-black shadow-md pointer-events-none">
                  HOLD
                </span>
              </div>
            )}

            {activeBasketPieces.map((pieceId) => {
              const isSelected = selectedPieceId === pieceId;
              return (
                <div
                  key={pieceId}
                  data-tray-piece="true"
                  data-piece-id={pieceId}
                  data-selected={isSelected ? 'true' : undefined}
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
                    onPieceClick(pieceId);
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
                  <PieceCell pieceIdx={pieceId} image={image} size={cellSize} gridSize={gridSize} small />
                </div>
              );
            })}
          </>
        )}
      </div>
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

      <PieceDrawerModal
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isOrganizeMode={isOrganizeMode}
        setIsOrganizeMode={setIsOrganizeMode}
        onGuideClick={onGuideClick}
        selectedPieceId={selectedPieceId}
        onTrayClick={onTrayClick}
        onPieceClick={onPieceClick}
        activeBasket={activeBasket}
        setActiveBasket={setActiveBasket}
        baskets={baskets}
        hoveredBasket={hoveredBasket}
        movePieceToBasket={movePieceToBasket}
        activeBasketPieces={activeBasketPieces}
        image={image}
        gridSize={gridSize}
        drawerCellSize={drawerCellSize}
        draggedPiece={draggedPiece}
        startDrag={startDrag}
        handlePointerMove={handlePointerMove}
        handlePointerUp={handlePointerUp}
        handlePointerCancel={handlePointerCancel}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
        ignoreNextClickRef={ignoreNextClickRef}
      />
    </div>
  );
}
