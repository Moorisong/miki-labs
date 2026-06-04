'use client';

import PieceCell from './piece-cell';

interface PieceTrayProps {
  trayPieces: number[];
  image: string;
  gridSize: number;
  selectedPieceId: number | null;
  onPieceClick: (pieceId: number) => void;
  onTrayClick?: () => void;
}

export default function PieceTray({
  trayPieces,
  image,
  gridSize,
  selectedPieceId,
  onPieceClick,
  onTrayClick,
}: PieceTrayProps) {
  const cellSize = 60; // 트레이 조각은 고정 사이즈로 작게 표시해 일목요연하게 노출

  return (
    <div
      className="rounded-2xl border p-3 sm:p-4 shadow-inner"
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
      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-baseline mb-2 select-none">
        <span className="text-xs sm:text-sm font-extrabold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
          미배치 조각 보관함 ({trayPieces.length}개 남음)
        </span>
        {trayPieces.length > 0 && (
          <span className="text-[10px] sm:text-xs font-bold animate-pulse" style={{ color: 'var(--puzzle-primary)' }}>
            ● 아래 조각을 선택한 후 빈 보드 격자를 클릭하세요
          </span>
        )}
      </div>

      <div 
        className="flex gap-3 overflow-x-auto py-2 px-1 scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        {trayPieces.length === 0 && selectedPieceId === null ? (
          <div className="w-full text-center py-4 text-sm font-semibold" style={{ color: 'var(--puzzle-primary)' }}>
            🎉 모든 조각이 보드에 배치되었습니다! 완성 여부를 확인하세요.
          </div>
        ) : (
          <>
            {/* 보드에서 뗀 조각을 들고 있어 트레이 목록에 없는 경우 맨 앞에 특별 표시 */}
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
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <PieceCell
                  pieceIdx={selectedPieceId}
                  image={image}
                  size={cellSize}
                  gridSize={gridSize}
                  small
                />
                <span className="absolute -top-2.5 -right-2 px-1 py-0.5 bg-blue-500 text-white rounded text-[8px] font-black select-none pointer-events-none shadow-md">
                  HOLD
                </span>
              </div>
            )}

            {/* 기존 트레이 조각들 */}
            {trayPieces.map((pieceId) => {
              const isSelected = selectedPieceId === pieceId;

              return (
                <div
                  key={pieceId}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPieceClick(pieceId);
                  }}
                  className="relative cursor-pointer transition-all duration-200 flex-shrink-0 outline-none select-none"
                  style={{
                    transform: isSelected ? 'scale(1.08) translateY(-4px)' : 'scale(1)',
                    boxShadow: isSelected ? '0 0 0 3px var(--puzzle-primary), 0 8px 16px rgba(79, 142, 247, 0.3)' : 'none',
                    borderRadius: '6px',
                    outline: 'none',
                    WebkitTapHighlightColor: 'transparent',
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
    </div>
  );
}
