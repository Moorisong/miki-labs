/**
 * 토스트 메시지 상수
 * 실패/성공 알림에 사용되는 짧은 메시지
 */

export const TOAST_MESSAGES = {
    // 네트워크/API 실패
    NETWORK: {
        NICKNAME_FAILED: '닉네임 설정 실패',
        CONNECTION_ERROR: '연결이 불안정해요',
        SERVER_ERROR: '서버 오류가 발생했어요',
    },

    // 일반 에러
    ERROR: {
        UNKNOWN: '오류가 발생했어요',
    },
} as const;

// 토스트 타입별 지속 시간 (ms)
export const TOAST_DURATION = {
    SHORT: 2500,
    NORMAL: 4000,
    LONG: 6000,
} as const;
