'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

interface KakaoAdfitProps {
    unit: string;
    width: number;
    height: number;
    className?: string;
}

export default function KakaoAdfit({ unit, width, height, className }: KakaoAdfitProps) {
    const adRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!adRef.current) return;

        // 이미 광고 영역이 생성되어 있다면 스킵
        if (adRef.current.querySelector('ins.kakao_ad_area')) {
            return;
        }

        // 광고 영역 생성
        const ins = document.createElement('ins');
        ins.className = 'kakao_ad_area';
        ins.style.display = 'none';
        ins.style.width = '100%';
        ins.setAttribute('data-ad-unit', unit);
        ins.setAttribute('data-ad-width', String(width));
        ins.setAttribute('data-ad-height', String(height));

        adRef.current.appendChild(ins);

        const tryRender = () => {
            if ((window as any).adfit) {
                try {
                    (window as any).adfit.render();
                    return true;
                } catch (e) {
                    console.error('AdFit render error:', e);
                }
            }
            return false;
        };

        // 지연 로딩 및 반복 시도 (스크립트 로드 대기)
        let timer: NodeJS.Timeout;
        let attempts = 0;

        const checkAndRender = () => {
            attempts++;
            if (tryRender() || attempts > 30) {
                return;
            }
            timer = setTimeout(checkAndRender, 200);
        };

        checkAndRender();

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [unit, width, height]);

    return (
        <>
            <Script
                id="kakao-adfit-script"
                src="//t1.daumcdn.net/kas/static/ba.min.js"
                strategy="lazyOnload"
                onLoad={() => {
                    if ((window as any).adfit) {
                        try { (window as any).adfit.render(); } catch (e) { }
                    }
                }}
            />
            <div
                ref={adRef}
                className={className}
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    margin: '0 auto',
                    overflow: 'hidden',
                    minHeight: `${height}px`
                }}
            />
        </>
    );
}

// 기본 배너 크기 상수
export const ADFIT_SIZES = {
    BANNER_320x100: { width: 320, height: 100 },
    BANNER_300x250: { width: 300, height: 250 },
    BANNER_320x50: { width: 320, height: 50 },
    BANNER_728x90: { width: 728, height: 90 },
} as const;

// 사용자의 광고 단위 ID
export const ADFIT_UNITS = {
    MAIN_BANNER: 'DAN-CgWk2fSDQ4BK75tg',
} as const;
