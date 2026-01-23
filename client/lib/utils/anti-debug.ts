'use client';

import { useEffect } from 'react';

/**
 * 개발자 도구 방지 (Anti-Debugging)
 * 개발자 도구를 열면 debugger에 걸려서 코드 분석을 방해함
 */
export const useAntiDebug = () => {
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') return;

        const PreventDevTools = () => {
            // 무한 디버거 루프
            setInterval(() => {
                // Function constructor를 사용하여 정적 분석 도구 우회 시도
                (function () {
                    return false;
                }
                ['constructor']('debugger')
                ['call'](null));
            }, 500); // 0.5초마다 실행
        };

        try {
            PreventDevTools();
        } catch (e) {
            // 무시
        }

        // F12 키 방지 등 추가적인 키보드 이벤트 차단
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.code === 'F12' ||
                (e.ctrlKey && e.shiftKey && e.code === 'KeyI') || // Ctrl+Shift+I
                (e.ctrlKey && e.shiftKey && e.code === 'KeyC') || // Ctrl+Shift+C
                (e.ctrlKey && e.shiftKey && e.code === 'KeyJ') || // Ctrl+Shift+J
                (e.ctrlKey && e.code === 'KeyU') // Ctrl+U (소스 보기)
            ) {
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // 우클릭 방지
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };
        window.addEventListener('contextmenu', handleContextMenu);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);
};
