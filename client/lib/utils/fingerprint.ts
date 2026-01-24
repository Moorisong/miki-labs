import FingerprintJS, { Agent } from '@fingerprintjs/fingerprintjs';

export interface FingerprintData {
    hash: string;
    userAgent: string;
    screenResolution?: string;
    timezone?: string;
    language?: string;
    platform?: string;
}

let fpPromise: Promise<Agent> | undefined;

if (typeof window !== 'undefined') {
    fpPromise = FingerprintJS.load();
}

export const getFingerprintData = async (): Promise<FingerprintData> => {
    try {
        if (typeof window === 'undefined' || !fpPromise) {
            return {
                hash: 'unknown',
                userAgent: 'server',
            };
        }

        const fp = await fpPromise;
        const result = await fp.get();

        return {
            hash: result.visitorId,
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            platform: navigator.platform,
        };
    } catch (error) {
        console.warn('[Fingerprint] Failed to get fingerprint data:', error);
        // 광고 차단기 등에 의해 실패하더라도 앱이 죽지 않도록 fallback 데이터 반환
        return {
            hash: 'error-fallback-' + Math.random().toString(36).substring(2, 9),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
            platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown'
        };
    }
};
