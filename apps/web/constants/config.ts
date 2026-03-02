/**
 * 설정값 상수
 * 타임아웃, 제한값 등 매직 넘버 관리
 */

export const CONFIG = {
    // 시간 관련 (일)
    TIMEOUT: {
        NICKNAME_CHANGE_DAYS: 30,
    },

    // 광고 설정
    AD: {
        FALLBACK_TIMEOUT_MS: 2500,
        MIN_HEIGHT_PX: 200,
        Z_INDEX: 1,
    },
} as const;
