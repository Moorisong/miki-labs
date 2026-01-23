import CryptoJS from 'crypto-js';

// 주의: 클라이언트 사이드에 키가 노출되는 것은 불가피함.
// 하지만 난독화(Obfuscation)와 결합하면 스크립트 키디들의 공격을 효과적으로 지연시킬 수 있음.
const SIGNATURE_SECRET = process.env.NEXT_PUBLIC_SIGNATURE_SECRET || 'fallback_secret_for_dev';

export interface ScoreData {
    score: number;
    attempts: number;
    dollsCaught: number;
    timestamp: number;
    nickname?: string;
    tempUserId?: string;
    userId?: string;
    fingerprintHash?: string;
}

export function generateSignature(data: ScoreData): string {
    // 서버와 동일한 순서로 데이터 결합
    const payload = [
        data.score,
        data.attempts,
        data.dollsCaught,
        data.timestamp,
        data.nickname || '',
        data.tempUserId || '',
        data.userId || '',
        data.fingerprintHash || ''
    ].join(':');

    return CryptoJS.HmacSHA256(payload, SIGNATURE_SECRET).toString(CryptoJS.enc.Hex);
}
