/**
 * API 경로 상수
 * 모든 API 엔드포인트는 여기서 관리
 */

export const API = {
    // 랭킹 API
    RANKING: {
        TOP: (limit: number = 10) => `/api/ranking/top?limit=${limit}`,
        SUBMIT: '/api/ranking/submit',
    },
    // 사용자 API
    USER: {
        NICKNAME: '/api/user/nickname',
    },
} as const;

// 외부 API URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
