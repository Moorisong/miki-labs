/**
 * 설정값 상수
 * 타임아웃, 제한값 등 매직 넘버 관리
 */

export const CONFIG = {
    // 게임 설정
    GAME: {
        MAX_ATTEMPTS: 5,
        DEFAULT_DOLL_COUNT: 25,
        RANKING_TOP_LIMIT: 10,
        RANKING_PAGE_SIZE: 10,
        RANKING_MAX_DISPLAY: 100,
    },

    // 시간 관련 (밀리초)
    TIMEOUT: {
        NICKNAME_CHANGE_DAYS: 30,
        COOLDOWN_HOURS: 1,
    },

    // 페이지네이션
    PAGINATION: {
        TOP_RANKINGS: 5,
        PAGE_SIZE: 10,
        MAX_PAGE_BUTTONS: 5,
    },
} as const;
