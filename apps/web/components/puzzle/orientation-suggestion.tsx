'use client';

import { useState, useEffect } from 'react';
import { RotateCw, Smartphone } from 'lucide-react';

export default function OrientationSuggestion() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('orientation-suggestion-dismissed') === 'true';
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const checkOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      // 태블릿 및 모바일 기기 감지 (터치 지원 기기이거나 가로/세로 중 긴 쪽이 태블릿 범위인 경우)
      const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
      const isSmallScreen = Math.max(window.innerWidth, window.innerHeight) < 1366;

      setIsVisible(isPortrait && (isTouchDevice || isSmallScreen));
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('orientation-suggestion-dismissed', 'true');
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 text-center select-none bg-black/60 backdrop-blur-md transition-all duration-300">
      <div 
        className="max-w-md w-full rounded-3xl p-8 border flex flex-col items-center gap-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: '#ffffff',
          borderColor: 'rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* 애니메이션 아이콘 영역 */}
        <div className="relative w-20 h-20 flex items-center justify-center bg-blue-50 rounded-full text-blue-600">
          <Smartphone size={40} className="animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center animate-spin" style={{ animationDuration: '6s' }}>
            <RotateCw size={20} className="text-blue-500 offset-y-[-10px]" />
          </div>
        </div>

        {/* 텍스트 안내 */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-extrabold text-slate-900">
            가로 모드를 권장합니다 🔄
          </h3>
          <p className="text-sm font-semibold leading-relaxed text-slate-600">
            태블릿같은 큰 화면 기기에서는<br />
            기기를 <strong className="text-blue-600 font-bold">가로 모드</strong>로 회전하여 플레이하시면<br />
            더욱 넓고 쾌적한 화면에서 퍼즐을 즐기실 수 있습니다.
          </p>
        </div>

        {/* 닫기 / 세로모드 계속 진행 버튼 */}
        <button
          onClick={handleDismiss}
          className="mt-2 text-xs font-bold text-slate-400 hover:text-slate-600 underline transition-colors"
        >
          세로 모드로 계속 진행하기
        </button>
      </div>
    </div>
  );
}
