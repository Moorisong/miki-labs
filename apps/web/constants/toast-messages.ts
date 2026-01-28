/**
 * 토스트 메시지 상수
 * 실패/성공 알림에 사용되는 짧은 메시지
 */

export const TOAST_MESSAGES = {
    // 잡기 실패 - 방향별 피드백 (이 방향으로 더 갔어야 함)
    GRAB_MISS: {
        LEFT: '조금 더 왼쪽으로 갔어야했어요! 👈',
        RIGHT: '조금 더 오른쪽으로 갔어야했어요! 👉',
        FORWARD: '조금 더 앞으로 갔어야했어요! ⬇️',
        BACKWARD: '조금 더 뒤로 갔어야했어요! ⬆️',
        TOO_FAR: '인형이 손 닿지 않는 곳에.. 🫠',
    },

    // 그립 실패 (올라가다 떨어짐)
    GRIP_FAIL: {
        ALMOST: '거의 다 잡았는데! 😭',
        SLIPPED: '아슬아슬하게 빠져버렸어요 💨',
        DROPPED: '미끄러졌어요 🫗',
    },

    // 기타 실패
    GAME: {
        NO_DOLL: '인형이 없었어요 🫥',
        TIMEOUT: '인형이 구멍에 못 들어갔어요 😰',
    },

    // 네트워크/API 실패
    NETWORK: {
        SCORE_SUBMIT_FAILED: '저장 실패! 다시 시도해보세요',
        NICKNAME_FAILED: '닉네임 설정 실패',
        CONNECTION_ERROR: '연결이 불안정해요',
        SERVER_ERROR: '서버 오류가 발생했어요',
    },

    // 일반 에러
    ERROR: {
        UNKNOWN: '오류가 발생했어요',
    },
} as const;

// 실패 이유 타입
export type FailReason =
    | { type: 'grab_miss'; direction: 'left' | 'right' | 'forward' | 'backward' | 'too_far' }
    | { type: 'grip_fail'; accuracy: number }
    | { type: 'no_doll' }
    | { type: 'timeout' };

// 실패 이유 -> 토스트 메시지 변환
export function getFailMessage(reason: FailReason): string {
    switch (reason.type) {
        case 'grab_miss':
            const directionMap = {
                left: TOAST_MESSAGES.GRAB_MISS.LEFT,
                right: TOAST_MESSAGES.GRAB_MISS.RIGHT,
                forward: TOAST_MESSAGES.GRAB_MISS.FORWARD,
                backward: TOAST_MESSAGES.GRAB_MISS.BACKWARD,
                too_far: TOAST_MESSAGES.GRAB_MISS.TOO_FAR,
            };
            return directionMap[reason.direction];

        case 'grip_fail':
            if (reason.accuracy >= 0.85) return TOAST_MESSAGES.GRIP_FAIL.ALMOST;
            if (reason.accuracy >= 0.65) return TOAST_MESSAGES.GRIP_FAIL.SLIPPED;
            return TOAST_MESSAGES.GRIP_FAIL.DROPPED;

        case 'no_doll':
            return TOAST_MESSAGES.GAME.NO_DOLL;

        case 'timeout':
            return TOAST_MESSAGES.GAME.TIMEOUT;

        default:
            return TOAST_MESSAGES.ERROR.UNKNOWN;
    }
}

// 토스트 타입별 지속 시간 (ms)
export const TOAST_DURATION = {
    SHORT: 2500,
    NORMAL: 4000,
    LONG: 6000,
} as const;
