import { useState, useEffect } from 'react';
import { Eye, EyeOff, Shuffle, ZoomIn, ZoomOut, Save, Check, X } from 'lucide-react';

interface FloatingToolbarProps {
  onOriginalToggle: () => void;
  onShuffle: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSave: () => void;
  showOriginal: boolean;
  zoom: number;
  saveStatus?: 'idle' | 'saving' | 'saved';

}

export default function FloatingToolbar({
  onOriginalToggle,
  onShuffle,
  onZoomIn,
  onZoomOut,
  onSave,
  showOriginal,
  zoom,
  saveStatus = 'idle',

}: FloatingToolbarProps) {
  const roundedZoom = Math.round(zoom * 10) / 10;
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // 이미 툴팁을 닫았는지 확인
    const isDismissed = localStorage.getItem('puzzle_save_tooltip_dismissed');
    if (!isDismissed) {
      // 컴포넌트 렌더링 1.5초 후 자연스럽게 노출
      const timer = setTimeout(() => {
        setShowTooltip(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismissTooltip = (e: React.MouseEvent) => {
    e.stopPropagation(); // 저장 버튼 클릭 동작 간섭 방지
    setShowTooltip(false);
    localStorage.setItem('puzzle_save_tooltip_dismissed', 'true');
  };

  // 사용자가 수동 저장을 성공적으로 누르면 툴팁이 활성화되어 있을 경우 자동으로 닫고 노출 해제 처리
  useEffect(() => {
    if (saveStatus === 'saved' && showTooltip) {
      setShowTooltip(false);
      localStorage.setItem('puzzle_save_tooltip_dismissed', 'true');
    }
  }, [saveStatus, showTooltip]);

  return (
    <div className="flex justify-center w-full px-4 select-none">
      <div
        className="flex items-center gap-2 p-3 rounded-2xl border shadow-xl transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
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
          className="flex items-center gap-1 px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all duration-150"
          style={{
            backgroundColor: showOriginal ? 'var(--puzzle-secondary)' : 'transparent',
            color: showOriginal ? 'var(--puzzle-primary)' : 'var(--puzzle-muted-foreground)',
          }}
        >
          {showOriginal ? <EyeOff size={15} /> : <Eye size={15} />}
          <span className="hidden sm:inline">원본 {showOriginal ? '끄기' : '보기'}</span>
        </button>

        <div className="w-px h-5" style={{ backgroundColor: 'var(--puzzle-border)' }} />

        {/* 섞기 */}
        <button
          onClick={onShuffle}
          className="flex items-center gap-1 px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all duration-150 hover:bg-red-500/10 hover:text-red-500"
          style={{ color: 'var(--puzzle-muted-foreground)' }}
        >
          <Shuffle size={15} />
          <span className="hidden sm:inline">판 엎기</span>
        </button>

        <div className="w-px h-5" style={{ backgroundColor: 'var(--puzzle-border)' }} />

        {/* 축소 */}
        <button
          onClick={onZoomOut}
          disabled={zoom <= 0.6}
          className="p-1.5 sm:p-2 rounded-xl transition-all duration-150 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none"
          style={{ color: 'var(--puzzle-muted-foreground)' }}
        >
          <ZoomOut size={15} />
        </button>

        {/* 배율 텍스트 */}
        <span className="text-xs font-extrabold px-0.5 sm:px-1 min-w-[28px] sm:min-w-[36px] text-center tabular-nums" style={{ color: 'var(--puzzle-card-foreground)' }}>
          {roundedZoom}x
        </span>

        {/* 확대 */}
        <button
          onClick={onZoomIn}
          disabled={zoom >= 2.4}
          className="p-1.5 sm:p-2 rounded-xl transition-all duration-150 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none"
          style={{ color: 'var(--puzzle-muted-foreground)' }}
        >
          <ZoomIn size={15} />
        </button>

        <div className="w-px h-5" style={{ backgroundColor: 'var(--puzzle-border)' }} />

          <button
            onClick={onSave}
            disabled={saveStatus === 'saving'}
            className="relative flex items-center gap-1 px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold text-white transition-all duration-150 disabled:opacity-85 hover:scale-[1.01]"
            style={{ 
              backgroundColor: 
                saveStatus === 'saved' 
                  ? '#10B981' 
                  : saveStatus === 'saving'
                    ? 'var(--puzzle-primary-hover)' 
                    : 'var(--puzzle-primary)'
            }}
          >
            {/* 백업 권장 툴팁 말풍선 (모바일 우측 잘림 방지 오프셋 적용) */}
            {showTooltip && (
              <div 
                className="absolute bottom-full mb-2.5 animate-bounce right-0 sm:right-auto sm:left-1/2"
                style={{ 
                  zIndex: 40, 
                  animationDuration: '2s',
                }}
                onClick={(e) => e.stopPropagation()} // 클릭 시 부모 버튼 이벤트 막기
              >
                {/* 
                  모바일과 PC 모두 width를 고정하지 않고 콘텐츠 크기에 자연스럽게 맞추며(w-max),
                  PC(sm)에서는 left-1/2과 margin-left를 콘텐츠의 근사치 너비인 164px의 절반(-82px)으로 적용하여 transform bounce 버그를 우회합니다.
                */}
                <div className="relative bg-zinc-900 text-white text-[10px] sm:text-[11px] font-medium pl-3 pr-1.5 py-1.5 rounded-xl shadow-2xl flex items-center gap-1.5 border border-zinc-800 whitespace-nowrap cursor-default w-max sm:ml-[-82px]">
                  <span className="flex items-center gap-1">
                    <span>☁️</span>
                    <span>수동 저장해야 서버에 백업됩니다!</span>
                  </span>
                  <span 
                    onClick={handleDismissTooltip}
                    className="hover:text-zinc-400 p-0.5 rounded-full cursor-pointer flex items-center justify-center flex-shrink-0"
                    role="button"
                    aria-label="닫기"
                  >
                    <X size={10} strokeWidth={3} />
                  </span>
                  {/* 말풍선 꼬리 (모바일과 PC 위치 대칭 조율) */}
                  <div 
                    className="absolute w-2 h-2 bg-zinc-900 border-r border-b border-zinc-800 rotate-45 right-6 sm:right-auto sm:left-1/2 sm:ml-[-4px]"
                    style={{ 
                      bottom: '-4px',
                    }}
                  />
                </div>
              </div>
            )}

            {saveStatus === 'saving' ? (
              <div className="w-3.5 h-3.5 border-2 border-t-transparent border-white rounded-full animate-spin mr-0.5" />
            ) : saveStatus === 'saved' ? (
              <Check size={15} />
            ) : (
              <Save size={15} />
            )}
            <span className="hidden sm:inline">
              {saveStatus === 'saving' 
                ? '저장/제출 중...' 
                : saveStatus === 'saved' 
                  ? '저장/제출 완료!' 
                  : '저장/제출'}
            </span>
          </button>
      </div>
    </div>
  );
}
