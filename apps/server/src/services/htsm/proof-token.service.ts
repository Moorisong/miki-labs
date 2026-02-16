import crypto from 'crypto';
import { HTSM_CONFIG } from './constants';

/**
 * Proof Token 관리
 * - 메모리 Map 기반 (소규모 서비스용)
 * - TTL 10분, 1회용
 */
const tokenStore = new Map<string, number>();

/** Proof Token 발급 */
export function generateProofToken(): string {
    const token = crypto.randomUUID();
    tokenStore.set(token, Date.now() + HTSM_CONFIG.PROOF_TOKEN_TTL_MS);
    return token;
}

/** Proof Token 검증 (1회용 — 검증 후 삭제) */
export function verifyProofToken(token: string): boolean {
    const expiresAt = tokenStore.get(token);
    if (!expiresAt) return false;

    // 항상 삭제 (1회용)
    tokenStore.delete(token);

    // 만료 확인
    if (Date.now() > expiresAt) return false;

    return true;
}

/** 만료된 토큰 정리 (메모리 관리) */
function cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [token, expiresAt] of tokenStore.entries()) {
        if (now > expiresAt) {
            tokenStore.delete(token);
        }
    }
}

// 5분마다 만료 토큰 정리
setInterval(cleanupExpiredTokens, 5 * 60 * 1000);
