import crypto from 'crypto';

// 실제 운영 환경에서는 환경 변수에서 가져와야 함
const SIGNATURE_SECRET = process.env.SIGNATURE_SECRET || 'claw-addict-super-secret-key-2024';

export interface ScoreData {
    score: number;
    attempts: number;
    dollsCaught: number;
    timestamp: number;
}

/**
 * 점수 제출 데이터에 대한 서명을 생성합니다.
 * HMAC-SHA256 알고리즘 사용
 */
export function generateSignature(data: ScoreData): string {
    // 데이터 순서가 중요함: score, attempts, dollsCaught, timestamp
    const payload = `${data.score}:${data.attempts}:${data.dollsCaught}:${data.timestamp}`;
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
