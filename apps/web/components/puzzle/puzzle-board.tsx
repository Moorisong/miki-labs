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
  isPlayMode?: boolean;
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
  isPlayMode?: boolean;
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
  isPlayMode = true,
}: PuzzleBoardCellProps) {
  const [showRipple, setShowRipple] = useState(false);
  const prevPieceId = useRef<number | null>(pieceId);

  useEffect(() => {
    // 모든 난이도에서 이전 조각 상태와 다르고 현재 놓인 조각이 제자리(정답)인 경우 리플 활성화
    if (
      pieceId !== prevPieceId.current &&
      pieceId === slotIdx
    ) {
      setShowRipple(true);
      const timer = setTimeout(() => setShowRipple(false), 600);
      return () => clearTimeout(timer);
    }
    prevPieceId.current = pieceId;
  }, [pieceId, slotIdx]);

  const isPlaced = pieceId !== null;
  const isCorrect = isPlaced && pieceId === slotIdx; // 정답 자리 조각인지 확인

  return (
    <div
      data-board-cell="true"
      onClick={(e) => {
        e.stopPropagation();
        if (!isPlayMode) return; // 이동모드일 때는 클릭 무시
        if (isCorrect) return; // 정답 위치 조각은 클릭 전파 및 동작 차단
        onCellClick(slotIdx);
      }}
      className={`relative flex items-center justify-center transition-all duration-150 group outline-none select-none ${
        showRipple ? 'puzzle-correct-ripple' : ''
      }`}
      style={{
        width: cellSize,
        height: cellSize,
        border: isCorrect 
          ? '2px solid #3b82f6' // 정답 위치 조각은 푸른색(Blue) 테두리로 고정 표시
          : isPlaced 
          ? '1px solid transparent' 
          : '1px dashed var(--puzzle-border)',
        backgroundColor: isPlaced ? 'transparent' : 'rgba(255, 255, 255, 0.03)',
        boxShadow: isCorrect ? '0 0 12px rgba(59, 130, 246, 0.6)' : 'none',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        cursor: !isPlayMode ? 'default' : isCorrect ? 'default' : 'pointer', // 고정 및 이동모드에서는 포인터 제외
        pointerEvents: !isPlayMode ? 'auto' : isCorrect ? 'none' : 'auto', // 이동모드 시 드래그 버블링을 위해 auto 유지
      }}
      onMouseEnter={(e) => {
        if (!isPlayMode) return; // 이동모드일 때는 호버 제외
        if (!isPlaced) {
          e.currentTarget.style.backgroundColor = 'rgba(79, 142, 247, 0.08)';
          e.currentTarget.style.borderColor = 'var(--puzzle-primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isPlayMode) return;
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
  isPlayMode = true,
}: PuzzleBoardProps) {
  // 화면 넓이와 줌 비율에 맞춰 셀 크기를 유연하게 계산 (기본 48px ~ 72px 범위)
  const baseSize = gridSize === 10 ? 46 : 30; // Beginner(10x10) vs Expert(16x16)
  const cellSize = Math.floor(baseSize * zoom);

  return (
    <div 
      className="w-full h-full flex p-4 overflow-auto scrollbar-hide select-none"
      style={{ touchAction: 'pan-x pan-y' }} // 가로/세로 방향의 스크롤 및 팬(pan) 이동을 허용
    >
      <div
        className="grid border rounded-xl overflow-hidden shadow-2xl transition-all duration-200 flex-shrink-0 m-auto"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
          borderColor: 'var(--puzzle-border)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          boxShadow: 'var(--puzzle-shadow-lg)',
          touchAction: 'pan-x pan-y', // 내부 그리드도 스크롤 허용
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
            isPlayMode={isPlayMode}
          />
        ))}
      </div>
    </div>
  );
}

