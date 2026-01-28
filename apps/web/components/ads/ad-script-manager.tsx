'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function AdScriptManager() {
    useEffect(() => {
        let observer: MutationObserver | null = null;
        let timeoutId: NodeJS.Timeout;

        const handleAdLoad = () => {
            // 1. 이미 존재한다면 즉시 적용 (안전장치)
            if (document.body.classList.contains('ad-loaded')) return;

            // 2. MutationObserver로 DOM 변화 감지 (광고 요소 삽입 시점 포착)
            observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    for (const node of Array.from(mutation.addedNodes)) {
                        if (node instanceof HTMLElement) {
                            // 조건 완화: 스타일 체크 제거 (클래스로 스타일이 적용될 수 있음)
                            // 스크립트 로드 직후 body에 추가되는 div나 iframe은 광고일 확률이 매우 높음
                            if (node.tagName === 'IFRAME' || node.tagName === 'DIV') {
                                document.body.classList.add('ad-loaded');
                                observer?.disconnect();
                                return;
                            }
                        }
                    }
                }
            });

            observer.observe(document.body, { childList: true, subtree: false });

            // 3. Fallback: 2.5초 후에도 감지 안되면 강제로 적용
            timeoutId = setTimeout(() => {
                if (!document.body.classList.contains('ad-loaded')) {
                    document.body.classList.add('ad-loaded');
                }
                observer?.disconnect();
            }, 2500);
        };

        // window 객체에 로드 핸들러 노출
        (window as any).onAdScriptLoad = handleAdLoad;

        return () => {
            observer?.disconnect();
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <>
            <Script
                src="https://nap5k.com/tag.min.js"
                data-zone="10521391"
                onLoad={() => {
                    if ((window as any).onAdScriptLoad) {
                        (window as any).onAdScriptLoad();
                    }
                }}
            />
            <Script
                src="https://gizokraijaw.net/vignette.min.js"
                data-zone="10521394"
            />
        </>
    );
}
