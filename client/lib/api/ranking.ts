import type { RankingEntry, SubmitScoreRequest, ApiResponse } from './types';

import { API, MESSAGES } from '@/constants';

// 클라이언트 내부 API 사용 (NextAuth 세션 활용)
const internalFetch = async <T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('API 요청 실패:', error);
    return { success: false, error: MESSAGES.ERROR.NETWORK };
  }
};

interface SubmitScoreResponse {
  scoreId: string;
  totalScore: number;
  totalAttempts: number;
  totalDollsCaught: number;
}

interface SubmitResult {
  success: boolean;
  error?: string;
  data?: {
    totalScore: number;
    totalAttempts: number;
    totalDollsCaught: number;
  };
}

export const rankingApi = {
  async getTopRanking(limit: number = 10): Promise<RankingEntry[]> {
    const response = await internalFetch<RankingEntry[]>(API.RANKING.TOP(limit));
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  },

  async submitScore(
    data: Omit<SubmitScoreRequest, 'tempUserId' | 'nickname' | 'fingerprint'>
  ): Promise<SubmitResult> {
    try {
      const { getFingerprintData } = await import('@/lib/utils/fingerprint');
      const fingerprint = await getFingerprintData();

      const response = await internalFetch<SubmitScoreResponse>(API.RANKING.SUBMIT, {
        method: 'POST',
        body: JSON.stringify({ ...data, fingerprint }),
      });
      return { success: response.success, error: response.error, data: response.data };
    } catch (e) {
      console.error('Failed to get fingerprint or submit score:', e);
      // Fallback submission without fingerprint if something goes wrong with FP collection
      const response = await internalFetch<SubmitScoreResponse>(API.RANKING.SUBMIT, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return { success: response.success, error: response.error, data: response.data };
    }
  },

  async getMyRanking(): Promise<RankingEntry | null> {
    // TODO: 추후 구현
    return null;
  },
};

