'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function AdScriptManager() {
    useEffect(() => {
        let observer: MutationObserver | null = null;
        let timeoutId: NodeJS.Timeout;

        // 광고 요소 스타일 강제 적용 (레이아웃 이동 방지) 및 감시
        const enforceAdStyles = (node: HTMLElement) => {
            // 빈 DIV는 무시 (차단 방지)
            if (node.tagName === 'DIV' && node.childElementCount === 0 && node.innerText.trim() === '') {
                return;
            }

            const applyStyles = () => {
                node.removeAttribute('hidden'); // hidden 속성 제거
                node.style.setProperty('position', 'absolute', 'important');
                node.style.setProperty('top', '0', 'important');
                node.style.setProperty('left', '0', 'important');
                node.style.setProperty('width', '100%', 'important');
                node.style.setProperty('z-index', '1', 'important'); // 바디보다 낮게 설정 (사용자 요청)
                node.style.setProperty('background', 'transparent', 'important');
                node.style.setProperty('min-height', '200px', 'important');
                node.style.setProperty('display', 'block', 'important');
                node.style.setProperty('visibility', 'visible', 'important');
            };

            applyStyles();

            // 광고 스크립트가 스타일을 변경하려 하면 다시 강제 적용
            const styleObserver = new MutationObserver((mutations) => {
                // 무한 루프 방지: 우리가 적용한 스타일이 유지되고 있다면 무시
                // 하지만 !important는 JS 속성 검사로 확인이 어려우므로, 
                // 변경 감지 시 잠시 연결 해제 후 재적용하는 방식 사용
                styleObserver.disconnect();
                applyStyles();
                styleObserver.observe(node, { attributes: true, attributeFilter: ['style', 'class', 'hidden'] });
            });

            styleObserver.observe(node, { attributes: true, attributeFilter: ['style', 'class', 'hidden'] });
        };

        const handleAdLoad = () => {
            // 1. 이미 존재한다면 즉시 적용 (가장 빠른 체크)
            // body 직계 자식 중 iframe이 있거나, 특정 클래스가 있다면 바로 적용
            const checkForAds = () => {
                const children = Array.from(document.body.children);
                const adNode = children.find(node => {
                    return node instanceof HTMLElement &&
                        !node.classList.contains('ad-skeleton') && // 스켈레톤 제외
                        (node.tagName === 'IFRAME' || node.tagName === 'INS' ||
                            (node.tagName === 'DIV' && node.querySelector('iframe, ins')));
                }) as HTMLElement | undefined;

                if (adNode) {
                    enforceAdStyles(adNode);
                    document.body.classList.add('ad-loaded');
                    return true;
                }
                return false;
            };

            if (checkForAds()) return;

            // 2. MutationObserver로 DOM 변화 감지 (광고 요소 삽입 시점 포착)
            observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    for (const node of Array.from(mutation.addedNodes)) {
                        if (node instanceof HTMLElement) {
                            if (!node.classList.contains('ad-skeleton') &&
                                (node.tagName === 'IFRAME' || node.tagName === 'INS' ||
                                    (node.tagName === 'DIV' && node.querySelector('iframe, ins')))) {
                                enforceAdStyles(node);
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
            <div className="ad-skeleton">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.5 }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <span>광고 로딩 중...</span>
                </div>
            </div>
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
