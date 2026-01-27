/**
 * LocalStorage / SessionStorage 키 상수
 * 스토리지 접근 시 반드시 이 상수 사용
 */

export const STORAGE_KEY = {
    // SessionStorage
    PENDING_RANKING_SCORE: 'pendingRankingScore',
    GAME_SESSION_DATA: 'gameSessionData',

    // LocalStorage - 게임 시도 관련
    GAME_ATTEMPTS: 'gameAttempts',
    GAME_ATTEMPTS_COOLDOWN_END: 'gameAttemptsCooldownEnd',
    TUTORIAL_SEEN: 'claw_tutorial_seen',
} as const;

export type StorageKey = keyof typeof STORAGE_KEY;
