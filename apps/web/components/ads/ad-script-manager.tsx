'use client';

import Script from 'next/script';
import { useEffect } from 'react';

import { CONFIG } from '@/constants';

const AD_SELECTORS = {
    SKELETON_CLASS: 'ad-skeleton',
    MAIN_CONTENT_CLASS: 'main-content',
    NEXT_ROOT_ID: '__next',
    LOADED_CLASS: 'ad-loaded',
    AD_TAGS: 'iframe, ins',
} as const;

const AD_SCRIPTS = {
    TAG: {
        src: 'https://nap5k.com/tag.min.js',
        zone: '10521391',
    },
    VIGNETTE: {
        src: 'https://gizokraijaw.net/vignette.min.js',
        zone: '10521394',
    },
} as const;

interface WindowWithAdHandler extends Window {
    onAdScriptLoad?: () => void;
}

const STYLE_OBSERVER_FILTER: MutationObserverInit = {
    attributes: true,
    attributeFilter: ['style', 'class', 'hidden'],
};

const isAdElement = (node: HTMLElement): boolean => {
    return (
        node.tagName === 'IFRAME' ||
        node.tagName === 'INS' ||
        (node.tagName === 'DIV' && node.querySelector(AD_SELECTORS.AD_TAGS) !== null)
    );
};

const isSkippedElement = (node: HTMLElement): boolean => {
    return (
        node.classList.contains(AD_SELECTORS.SKELETON_CLASS) ||
        node.classList.contains(AD_SELECTORS.MAIN_CONTENT_CLASS) ||
        node.id === AD_SELECTORS.NEXT_ROOT_ID
    );
};

const isEmptyDiv = (node: HTMLElement): boolean => {
    return node.tagName === 'DIV' && node.childElementCount === 0 && node.innerText.trim() === '';
};

const markAdLoaded = (): void => {
    document.body.classList.add(AD_SELECTORS.LOADED_CLASS);
};

const applyAdStyles = (node: HTMLElement): void => {
    node.removeAttribute('hidden');
    node.style.setProperty('position', 'absolute', 'important');
    node.style.setProperty('top', '0', 'important');
    node.style.setProperty('left', '0', 'important');
    node.style.setProperty('width', '100%', 'important');
    node.style.setProperty('z-index', String(CONFIG.AD.Z_INDEX), 'important');
    node.style.setProperty('background', 'transparent', 'important');
    node.style.setProperty('min-height', `${CONFIG.AD.MIN_HEIGHT_PX}px`, 'important');
    node.style.setProperty('display', 'block', 'important');
    node.style.setProperty('visibility', 'visible', 'important');
};

const enforceAdStyles = (node: HTMLElement): void => {
    if (isEmptyDiv(node)) return;

    applyAdStyles(node);

    const styleObserver = new MutationObserver(() => {
        styleObserver.disconnect();
        applyAdStyles(node);
        styleObserver.observe(node, STYLE_OBSERVER_FILTER);
    });

    styleObserver.observe(node, STYLE_OBSERVER_FILTER);
};

export default function AdScriptManager() {
    useEffect(() => {
        let observer: MutationObserver | null = null;
        let timeoutId: NodeJS.Timeout;

        const checkForExistingAds = (): boolean => {
            const children = Array.from(document.body.children);
            const adNode = children.find(
                node =>
                    node instanceof HTMLElement &&
                    !node.classList.contains(AD_SELECTORS.SKELETON_CLASS) &&
                    isAdElement(node)
            ) as HTMLElement | undefined;

            if (adNode) {
                enforceAdStyles(adNode);
                markAdLoaded();
                return true;
            }
            return false;
        };

        const handleAddedNode = (node: HTMLElement): boolean => {
            if (node.tagName === 'IFRAME' || node.tagName === 'INS') {
                enforceAdStyles(node);
                markAdLoaded();
                return true;
            }

            if (node.tagName === 'DIV') {
                if (node.querySelector(AD_SELECTORS.AD_TAGS)) {
                    enforceAdStyles(node);
                    markAdLoaded();
                    return true;
                }

                const nestedObserver = new MutationObserver(() => {
                    if (node.querySelector(AD_SELECTORS.AD_TAGS)) {
                        enforceAdStyles(node);
                        markAdLoaded();
                        nestedObserver.disconnect();
                        observer?.disconnect();
                    }
                });
                nestedObserver.observe(node, { childList: true, subtree: true });
            }

            return false;
        };

        const handleAdLoad = (): void => {
            if (checkForExistingAds()) return;

            observer = new MutationObserver(mutations => {
                for (const mutation of mutations) {
                    for (const node of Array.from(mutation.addedNodes)) {
                        if (!(node instanceof HTMLElement)) continue;
                        if (isSkippedElement(node)) continue;

                        if (handleAddedNode(node)) {
                            observer?.disconnect();
                            return;
                        }
                    }
                }
            });

            observer.observe(document.body, { childList: true, subtree: false });

            timeoutId = setTimeout(() => {
                if (!document.body.classList.contains(AD_SELECTORS.LOADED_CLASS)) {
                    markAdLoaded();
                }
                observer?.disconnect();
            }, CONFIG.AD.FALLBACK_TIMEOUT_MS);
        };

        (window as WindowWithAdHandler).onAdScriptLoad = handleAdLoad;

        return () => {
            observer?.disconnect();
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <>
            <div className={AD_SELECTORS.SKELETON_CLASS}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: 0.5,
                }}>
                    <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>광고 로딩 중...</span>
                </div>
            </div>
            <Script
                src={AD_SCRIPTS.TAG.src}
                data-zone={AD_SCRIPTS.TAG.zone}
                onLoad={() => {
                    (window as WindowWithAdHandler).onAdScriptLoad?.();
                }}
            />
            <Script
                src={AD_SCRIPTS.VIGNETTE.src}
                data-zone={AD_SCRIPTS.VIGNETTE.zone}
            />
        </>
    );
}
