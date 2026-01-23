import crypto from 'crypto';

// 실제 운영 환경에서는 환경 변수에서 가져와야 함
const SIGNATURE_SECRET = process.env.SIGNATURE_SECRET || 'v2_secure_plz_dont_hack_me_s3cret_k3y_9981';

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

/**
 * 점수 제출 데이터에 대한 서명을 생성합니다.
 * HMAC-SHA256 알고리즘 사용
 */
export function generateSignature(data: ScoreData): string {
    // 데이터 순서가 중요함: score, attempts, dollsCaught, timestamp, nickname, tempUserId, userId, fingerprintHash
    // 없는 값은 빈 문자열로 처리하여 일관성 유지
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

    return crypto
        .createHmac('sha256', SIGNATURE_SECRET)
        .update(payload)
        .digest('hex');
}

/**
 * 서명이 유효한지 검증합니다.
 */
export function verifySignature(data: ScoreData, signature: string): boolean {
    const expectedSignature = generateSignature(data);
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}
