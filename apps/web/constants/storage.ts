/**
 * LocalStorage / SessionStorage 키 상수
 * 스토리지 접근 시 반드시 이 상수 사용
 */

export const STORAGE_KEY = {
} as const;

export type StorageKey = keyof typeof STORAGE_KEY;
