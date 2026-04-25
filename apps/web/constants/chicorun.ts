/**
 * 치코런 API 경로 상수
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const CHICORUN_API = {
    BASE: `${API_BASE}/api/chicorun`,
    STUDENT_LOGIN: `${API_BASE}/api/chicorun/student/login`,
    STUDENT_ME: `${API_BASE}/api/chicorun/student/me`,
    STUDENT_CHANGE_PASSWORD: `${API_BASE}/api/chicorun/student/change-password`,
    QUESTION: `${API_BASE}/api/chicorun/question`,
    ANSWER: `${API_BASE}/api/chicorun/answer`,
    LEVEL: `${API_BASE}/api/chicorun/level`,
    RESET_PROGRESS: `${API_BASE}/api/chicorun/reset-progress`,
    RESET_ACHIEVED_LEVEL: `${API_BASE}/api/chicorun/reset-achieved-level`,
    RANKING: `${API_BASE}/api/chicorun/ranking`,
    FRIENDS: `${API_BASE}/api/chicorun/friends`,
    FRIEND_REQUESTS: `${API_BASE}/api/chicorun/friends/requests`,
    FRIEND_SEARCH: `${API_BASE}/api/chicorun/friends/search`,
    FRIEND_REQUEST: `${API_BASE}/api/chicorun/friends/request`,
    FRIEND_RESPOND: `${API_BASE}/api/chicorun/friends/respond`,
    // Word Rain 게임 API
    WORD_RAIN_START: `${API_BASE}/api/chicorun/word-rain/start`,
    WORD_RAIN_INPUT: `${API_BASE}/api/chicorun/word-rain/input`,
    WORD_RAIN_END: `${API_BASE}/api/chicorun/word-rain/end`,
    // Word Rush 게임 API
    WORD_RUSH_START: `${API_BASE}/api/chicorun/word-rush/start`,
    WORD_RUSH_END: `${API_BASE}/api/chicorun/word-rush/end`,
} as const;

/**
 * 치코런 라우트 경로 상수
 */
export const CHICORUN_ROUTES = {
    LANDING: '/chicorun',
    JOIN: '/chicorun/join',
    LEARN: '/chicorun/learn',
    RANKING: '/chicorun/ranking',
    GAME: '/chicorun/game',
    GAME_WORD_RAIN: '/chicorun/game/word-rain',
    GAME_WORD_RUSH: '/chicorun/game/word-rush',
} as const;

/**
 * 치코런 스토리지 키 상수
 */
export const CHICORUN_STORAGE_KEY = {
    TOKEN: 'chicorun_user_token',
    USER_INFO: 'chicorun_user_info',
} as const;

/**
 * 치코런 에러 코드 상수
 */
export const CHICORUN_ERROR = {
    UNAUTHORIZED: 'ERROR_UNAUTHORIZED',
    INVALID_TOKEN: 'ERROR_INVALID_TOKEN',
    STUDENT_NOT_FOUND: 'ERROR_STUDENT_NOT_FOUND',
    CLASS_NOT_FOUND: 'ERROR_CLASS_NOT_FOUND',
    WRONG_PASSWORD: 'ERROR_WRONG_PASSWORD',
    INVALID_INPUT: 'ERROR_INVALID_INPUT',
    INVALID_QUESTION: 'ERROR_INVALID_QUESTION',
    FORBIDDEN: 'ERROR_FORBIDDEN',
    DUPLICATE_NICKNAME: 'ERROR_DUPLICATE_NICKNAME',
} as const;

/**
 * 치코런 게임 설정 상수
 */
export const CHICORUN_CONFIG = {
    MAX_LEVEL: 100,
    QUESTIONS_PER_LEVEL: 100,
    POINT_PER_CORRECT: 10,
    COMBO_THRESHOLDS: [3, 5, 10] as const,
    COMBO_BONUS_POINT: 20, // 10연속 퍼펙트 시 추가 포인트
} as const;
