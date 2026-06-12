/**
 * LocalStorage / SessionStorage 키 상수
 * 스토리지 접근 시 반드시 이 상수 사용
 */

export const STORAGE_KEY = {
  PUZZLE_BASKETS_PREFIX: 'puzzle-baskets-',
  PENDING_SYNC_PREFIX: 'pending_sync_',
} as const;

export type StorageKey = keyof typeof STORAGE_KEY;
