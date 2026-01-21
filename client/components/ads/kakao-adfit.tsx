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
    const isLoaded = useRef(false);

    useEffect(() => {
        // 광고가 이미 로드되었으면 중복 로드 방지
        if (isLoaded.current) return;

        const timer = setTimeout(() => {
            if (adRef.current && !isLoaded.current) {
                // 광고 영역 생성
                const ins = document.createElement('ins');
                ins.className = 'kakao_ad_area';
                ins.style.display = 'none';
                ins.setAttribute('data-ad-unit', unit);
                ins.setAttribute('data-ad-width', String(width));
                ins.setAttribute('data-ad-height', String(height));

                adRef.current.innerHTML = '';
                adRef.current.appendChild(ins);

                // 광고 스크립트가 로드되어 있으면 광고 호출
                if (typeof window !== 'undefined' && (window as unknown as { adfit?: { render: () => void } }).adfit) {
                    (window as unknown as { adfit: { render: () => void } }).adfit.render();
                }

                isLoaded.current = true;
            }
        }, 100);

        return () => {
            clearTimeout(timer);
        };
    }, [unit, width, height]);

    return (
        <>
            <Script
                src="//t1.daumcdn.net/kas/static/ba.min.js"
                strategy="lazyOnload"
            />
            <div
                ref={adRef}
                className={className}
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    margin: '0 auto',
                    overflow: 'hidden'
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
