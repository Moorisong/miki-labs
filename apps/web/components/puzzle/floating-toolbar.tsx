'use client';

import { Eye, EyeOff, Shuffle, ZoomIn, ZoomOut, Save } from 'lucide-react';

interface FloatingToolbarProps {
  onOriginalToggle: () => void;
  onShuffle: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSave: () => void;
  showOriginal: boolean;
  zoom: number;
}

export default function FloatingToolbar({
  onOriginalToggle,
  onShuffle,
  onZoomIn,
  onZoomOut,
  onSave,
  showOriginal,
  zoom,
}: FloatingToolbarProps) {
  const roundedZoom = Math.round(zoom * 10) / 10;

  return (
    <div className="flex justify-center w-full px-4 select-none">
      <div
        className="flex items-center gap-2 p-3 rounded-2xl border shadow-xl transition-all duration-200"
        style={{
          backgroundColor: 'var(--puzzle-glass-bg)',
          backdropFilter: 'var(--puzzle-glass-blur)',
          borderColor: 'var(--puzzle-border)',
          boxShadow: 'var(--puzzle-shadow-lg)',
        }}
      >
        {/* 원본보기 */}
        <button
          onClick={onOriginalToggle}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150"
          style={{
            backgroundColor: showOriginal ? 'var(--puzzle-secondary)' : 'transparent',
            color: showOriginal ? 'var(--puzzle-primary)' : 'var(--puzzle-muted-foreground)',
          }}
        >
          {showOriginal ? <EyeOff size={15} /> : <Eye size={15} />}
          <span>원본 {showOriginal ? '끄기' : '보기'}</span>
        </button>

        <div className="w-px h-5" style={{ backgroundColor: 'var(--puzzle-border)' }} />

        {/* 섞기 */}
        <button
          onClick={onShuffle}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 hover:bg-red-500/10 hover:text-red-500"
          style={{ color: 'var(--puzzle-muted-foreground)' }}
        >
          <Shuffle size={15} />
          <span>조각 섞기</span>
        </button>

        <div className="w-px h-5" style={{ backgroundColor: 'var(--puzzle-border)' }} />

        {/* 축소 */}
        <button
          onClick={onZoomOut}
          disabled={zoom <= 0.6}
          className="p-2 rounded-xl transition-all duration-150 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none"
          style={{ color: 'var(--puzzle-muted-foreground)' }}
        >
          <ZoomOut size={15} />
        </button>

        {/* 배율 텍스트 */}
        <span className="text-xs font-extrabold px-1 min-w-[36px] text-center tabular-nums" style={{ color: 'var(--puzzle-card-foreground)' }}>
          {roundedZoom}x
        </span>

        {/* 확대 */}
        <button
          onClick={onZoomIn}
          disabled={zoom >= 2.4}
          className="p-2 rounded-xl transition-all duration-150 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none"
          style={{ color: 'var(--puzzle-muted-foreground)' }}
        >
          <ZoomIn size={15} />
        </button>

        <div className="w-px h-5" style={{ backgroundColor: 'var(--puzzle-border)' }} />

        {/* 즉시 저장 */}
        <button
          onClick={onSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all duration-150 hover:scale-[1.01]"
          style={{ backgroundColor: 'var(--puzzle-primary)' }}
        >
          <Save size={15} />
          <span>수동 저장</span>
        </button>
      </div>
    </div>
  );
}
