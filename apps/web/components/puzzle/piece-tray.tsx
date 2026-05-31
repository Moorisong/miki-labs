'use client';

import PieceCell from './piece-cell';

interface PieceTrayProps {
  trayPieces: number[];
  image: string;
  gridSize: number;
  selectedPieceId: number | null;
  onPieceClick: (pieceId: number) => void;
}

export default function PieceTray({
  trayPieces,
  image,
  gridSize,
  selectedPieceId,
  onPieceClick,
}: PieceTrayProps) {
  const cellSize = 60; // 트레이 조각은 고정 사이즈로 작게 표시해 일목요연하게 노출

  return (
    <div
      className="rounded-2xl border p-4 shadow-inner"
      style={{
        backgroundColor: 'var(--puzzle-glass-bg)',
        backdropFilter: 'var(--puzzle-glass-blur)',
        borderColor: 'var(--puzzle-border)',
        width: '100%',
      }}
    >
      <div className="text-xs font-bold mb-2 flex justify-between items-center" style={{ color: 'var(--puzzle-muted-foreground)' }}>
        <span>미배치 조각 보관함 ({trayPieces.length}개 남음)</span>
        {trayPieces.length > 0 && <span className="text-[10px] animate-pulse" style={{ color: 'var(--puzzle-primary)' }}>● 아래 조각을 선택한 후 빈 보드 격자를 클릭하세요</span>}
      </div>

      <div 
        className="flex gap-3 overflow-x-auto py-2 px-1 scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        {trayPieces.length === 0 ? (
          <div className="w-full text-center py-4 text-sm font-semibold" style={{ color: 'var(--puzzle-primary)' }}>
            🎉 모든 조각이 보드에 배치되었습니다! 완성 여부를 확인하세요.
          </div>
        ) : (
          trayPieces.map((pieceId) => {
            const isSelected = selectedPieceId === pieceId;

            return (
              <div
                key={pieceId}
                onClick={() => onPieceClick(pieceId)}
                className="relative cursor-pointer transition-all duration-200"
                style={{
                  transform: isSelected ? 'scale(1.08) translateY(-4px)' : 'scale(1)',
                  boxShadow: isSelected ? '0 0 0 3px var(--puzzle-primary), 0 8px 16px rgba(79, 142, 247, 0.3)' : 'none',
                  borderRadius: '6px',
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
          })
        )}
      </div>
    </div>
  );
}
