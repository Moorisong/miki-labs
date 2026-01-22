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

        // 이미 광고 영역이 생성되어 있다면 스킵 (Strict Mode 등에서의 중복 실행 방지)
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

        // 광고 스크립트가 이미 로드되어 있으면 렌더링 시도
        // 약간의 지연을 주어 DOM이 확실히 적용된 후 실행
        if ((window as any).adfit) {
            setTimeout(() => {
                try {
                    (window as any).adfit.render();
                } catch (e) {
                    // ignore
                }
            }, 50);
        }
    }, [unit, width, height]);

    return (
        <>
            <Script
                src="//t1.daumcdn.net/kas/static/ba.min.js"
                strategy="lazyOnload"
                onLoad={() => {
                    // 스크립트 로드 완료 시 render 호출
                    if ((window as any).adfit) {
                        try {
                            (window as any).adfit.render();
                        } catch (e) {
                            // console.error('AdFit render error on load:', e);
                        }
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
