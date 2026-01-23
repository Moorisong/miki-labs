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
};
