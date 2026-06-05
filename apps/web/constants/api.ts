/**
 * API 경로 상수
 * 모든 API 엔드포인트는 여기서 관리
 */

export const API = {
} as const;


// 외부 API URL
export const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      return `http://${host}:3000`;
    }
    return 'http://localhost:3000';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

export const API_BASE_URL = getApiBaseUrl();
