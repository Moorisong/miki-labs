import { useEffect, useRef } from 'react';

interface KakaoAdfitProps {
    unit: string;
    width: number;
    height: number;
    className?: string;
}

export default function KakaoAdfit({ unit, width, height, className }: KakaoAdfitProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        container.innerHTML = '';

        // iframe 생성
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.overflow = 'hidden';
        iframe.width = String(width);
        iframe.height = String(height);

        container.appendChild(iframe);

        // iframe 내부 문서에 광고 코드 주입
        const doc = iframe.contentWindow?.document;
        if (doc) {
            doc.open();
            doc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { margin: 0; padding: 0; width: 100%; height: 100%; background: transparent; display: flex; justify-content: center; align-items: center; }
                        .kakao_ad_area { display: block; width: 100%; height: 100%; }
                    </style>
                </head>
                <body>
                    <ins class="kakao_ad_area" 
                         style="display:none;" 
                         data-ad-unit="${unit}" 
                         data-ad-width="${width}" 
                         data-ad-height="${height}"></ins>
                    <script type="text/javascript" src="//t1.daumcdn.net/kas/static/ba.min.js" async></script>
                </body>
                </html>
            `);
            doc.close();
        }

        return () => {
            container.innerHTML = '';
        };
    }, [unit, width, height]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                margin: '0 auto',
                overflow: 'hidden',
                maxWidth: '100%',
            }}
        />
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
// (하루상자 메인 배너와 동일한 단위 사용, 필요시 변경 가능)
export const ADFIT_UNITS = {
    MAIN_BANNER: 'DAN-CgWk2fSDQ4BK75tg',
} as const;
