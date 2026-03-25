/**
 * 치코런 API 경로 상수
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const CHICORUN_API = {
    BASE: `${API_BASE}/api/chicorun`,
    STUDENT_LOGIN: `${API_BASE}/api/chicorun/student/login`,
    STUDENT_ME: `${API_BASE}/api/chicorun/student/me`,
    STUDENT_CUSTOMIZE: `${API_BASE}/api/chicorun/student/customize`,
    STUDENT_CHANGE_PASSWORD: `${API_BASE}/api/chicorun/student/password`,
    STUDENT_DEDUCT_POINT: `${API_BASE}/api/chicorun/student/point`,
    STUDENT_REMOVE_ITEM: (itemId: string) => `${API_BASE}/api/chicorun/student/item/${itemId}`,
    QUESTION: `${API_BASE}/api/chicorun/question`,
    ANSWER: `${API_BASE}/api/chicorun/answer`,
    LEVEL: `${API_BASE}/api/chicorun/level`,
    RESET_PROGRESS: `${API_BASE}/api/chicorun/reset-progress`,
    RESET_ACHIEVED_LEVEL: `${API_BASE}/api/chicorun/reset-achieved-level`,
    CLASS: `${API_BASE}/api/chicorun/class`,
    CLASS_STUDENTS: (classCode: string) => `${API_BASE}/api/chicorun/class/${classCode}/students`,
    CLASS_RANKING: (classCode: string) => `${API_BASE}/api/chicorun/class/${classCode}/ranking`,
    CLASS_RESET_PASSWORD: (classCode: string) =>
        `${API_BASE}/api/chicorun/class/${classCode}/reset-password`,
    CLASS_UPDATE_NICKNAME: (classCode: string, studentId: string) =>
        `${API_BASE}/api/chicorun/class/${classCode}/students/${studentId}/nickname`,
    CLASS_UPDATE_TITLE: (classCode: string) =>
        `${API_BASE}/api/chicorun/class/${classCode}/title`,
    TEACHER_LOGIN: `${API_BASE}/api/chicorun/teacher/login`,
} as const;

/**
 * 치코런 라우트 경로 상수
 */
export const CHICORUN_ROUTES = {
    LANDING: '/chicorun',
    JOIN: '/chicorun/join',
    LEARN: '/chicorun/learn',
    RANKING: '/chicorun/ranking',
    CUSTOMIZE: '/chicorun/customize',
    STORE: '/chicorun/store',
    TEACHER_DASHBOARD: '/chicorun/teacher/dashboard',
    TEACHER_STUDENT: (classId: string) => `/chicorun/teacher/student/${classId}`,
} as const;

/**
 * 치코런 스토리지 키 상수
 */
export const CHICORUN_STORAGE_KEY = {
    TOKEN: 'chicorun_student_token',
    STUDENT_INFO: 'chicorun_student_info',
    TEACHER_TOKEN: 'chicorun_teacher_token',
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
