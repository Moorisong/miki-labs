'use client';

import PieceCell from './piece-cell';

interface PuzzleBoardProps {
  board: (number | null)[];
  image: string;
  gridSize: number;
  zoom: number;
  onCellClick: (slotIndex: number) => void;
  selectedPieceId: number | null;
}

export default function PuzzleBoard({
  board,
  image,
  gridSize,
  zoom,
  onCellClick,
  selectedPieceId,
}: PuzzleBoardProps) {
  // 화면 넓이와 줌 비율에 맞춰 셀 크기를 유연하게 계산 (기본 48px ~ 72px 범위)
  const baseSize = gridSize === 10 ? 46 : 30; // Beginner(10x10) vs Expert(16x16)
  const cellSize = Math.floor(baseSize * zoom);

  return (
    <div className="flex items-center justify-center p-4 overflow-auto scrollbar-hide select-none">
      <div
        className="grid border rounded-xl overflow-hidden shadow-2xl transition-all duration-200"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
          borderColor: 'var(--puzzle-border)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          boxShadow: 'var(--puzzle-shadow-lg)',
        }}
      >
        {board.map((pieceId, slotIdx) => {
          const isPlaced = pieceId !== null;

          return (
            <div
              key={slotIdx}
              onClick={() => onCellClick(slotIdx)}
              className="relative flex items-center justify-center cursor-pointer transition-all duration-150 group"
              style={{
                width: cellSize,
                height: cellSize,
                border: '1px dashed var(--puzzle-border)',
                backgroundColor: isPlaced ? 'transparent' : 'rgba(255, 255, 255, 0.03)',
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
                // 빈 슬롯에 트레이 조각 선택 중인 경우 호버 링 표시
                selectedPieceId !== null && (
                  <div 
                    className="absolute inset-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ border: '2px solid var(--puzzle-primary)' }}
                  />
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
