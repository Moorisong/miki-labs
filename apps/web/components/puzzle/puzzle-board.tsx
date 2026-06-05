'use client';

import { useEffect, useRef, useState } from 'react';
import PieceCell from './piece-cell';

interface PuzzleBoardProps {
  board: (number | null)[];
  image: string;
  gridSize: number;
  zoom: number;
  onCellClick: (slotIndex: number) => void;
  selectedPieceId: number | null;
  difficulty: 'novice' | 'beginner' | 'expert';
}

interface PuzzleBoardCellProps {
  slotIdx: number;
  pieceId: number | null;
  image: string;
  gridSize: number;
  cellSize: number;
  onCellClick: (slotIdx: number) => void;
  selectedPieceId: number | null;
  difficulty: 'novice' | 'beginner' | 'expert';
}

function PuzzleBoardCell({
  slotIdx,
  pieceId,
  image,
  gridSize,
  cellSize,
  onCellClick,
  selectedPieceId,
  difficulty,
}: PuzzleBoardCellProps) {
  const [showRipple, setShowRipple] = useState(false);
  const prevPieceId = useRef<number | null>(pieceId);

  useEffect(() => {
    // 고수 모드('expert')이고, 이전 조각 상태와 다르고, 현재 조각이 제자리인 경우 리플 애니메이션 활성화
    if (
      difficulty === 'expert' &&
      pieceId !== prevPieceId.current &&
      pieceId === slotIdx
    ) {
      setShowRipple(true);
      const timer = setTimeout(() => setShowRipple(false), 600);
      return () => clearTimeout(timer);
    }
    prevPieceId.current = pieceId;
  }, [pieceId, slotIdx, difficulty]);

  const isPlaced = pieceId !== null;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onCellClick(slotIdx);
      }}
      className={`relative flex items-center justify-center cursor-pointer transition-all duration-150 group outline-none select-none ${
        showRipple ? 'puzzle-correct-ripple' : ''
      }`}
      style={{
        width: cellSize,
        height: cellSize,
        border: isPlaced ? '1px solid transparent' : '1px dashed var(--puzzle-border)',
        backgroundColor: isPlaced ? 'transparent' : 'rgba(255, 255, 255, 0.03)',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!isPlaced) {
          e.currentTarget.style.backgroundColor = 'rgba(79, 142, 247, 0.08)';
          e.currentTarget.style.borderColor = 'var(--puzzle-primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isPlaced) {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
          e.currentTarget.style.borderColor = 'var(--puzzle-border)';
        }
      }}
    >
      {isPlaced ? (
        <PieceCell
          pieceIdx={pieceId}
          image={image}
          size={cellSize}
          gridSize={gridSize}
        />
      ) : (
        selectedPieceId !== null && (
          <div 
            className="absolute inset-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ border: '2px solid var(--puzzle-primary)' }}
          />
        )
      )}
    </div>
  );
}

export default function PuzzleBoard({
  board,
  image,
  gridSize,
  zoom,
  onCellClick,
  selectedPieceId,
  difficulty,
}: PuzzleBoardProps) {
  // 화면 넓이와 줌 비율에 맞춰 셀 크기를 유연하게 계산 (기본 48px ~ 72px 범위)
  const baseSize = gridSize === 10 ? 46 : 30; // Beginner(10x10) vs Expert(16x16)
  const cellSize = Math.floor(baseSize * zoom);

  return (
    <div className="w-full h-full flex p-4 overflow-auto scrollbar-hide select-none">
      <div
        className="grid border rounded-xl overflow-hidden shadow-2xl transition-all duration-200 flex-shrink-0 m-auto"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
          borderColor: 'var(--puzzle-border)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          boxShadow: 'var(--puzzle-shadow-lg)',
        }}
      >
        {board.map((pieceId, slotIdx) => (
          <PuzzleBoardCell
            key={slotIdx}
            slotIdx={slotIdx}
            pieceId={pieceId}
            image={image}
            gridSize={gridSize}
            cellSize={cellSize}
            onCellClick={onCellClick}
            selectedPieceId={selectedPieceId}
            difficulty={difficulty}
          />
        ))}
      </div>
    </div>
  );
}

