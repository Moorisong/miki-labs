'use client';

interface PieceCellProps {
  pieceIdx: number;
  image: string;
  size: number;
  gridSize: number;
  dim?: boolean;
  small?: boolean;
}

export default function PieceCell({
  pieceIdx,
  image,
  size,
  gridSize,
  dim = false,
  small = false,
}: PieceCellProps) {
  // 그리드 내 조각의 정적 좌표(행, 열) 계산
  const row = Math.floor(pieceIdx / gridSize);
  const col = pieceIdx % gridSize;
  
  // 백그라운드 이미지 포지션 비율 계산
  // (col / (gridSize - 1)) * 100% 로 하여 가장자리 조각들이 이미지 모서리에 정확히 매칭되도록 처리
  const bgX = gridSize > 1 ? (col / (gridSize - 1)) * 100 : 0;
  const bgY = gridSize > 1 ? (row / (gridSize - 1)) * 100 : 0;

  return (
    <div
      className="transition-all duration-200"
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${image})`,
        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
        backgroundPosition: `${bgX}% ${bgY}%`,
        opacity: dim ? 0.35 : 1,
        borderRadius: small ? '4px' : '6px',
        boxShadow: small ? '0 2px 6px rgba(0, 0, 0, 0.15)' : 'none',
        border: small ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
        flexShrink: 0,
      }}
    />
  );
}
