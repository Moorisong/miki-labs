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
    data: Omit<SubmitScoreRequest, 'fingerprint' | 'signature' | 'timestamp'>
  ): Promise<SubmitResult> {
    try {
      const { getFingerprintData } = await import('@/lib/utils/fingerprint');
      const { generateSignature } = await import('@/lib/utils/signature');

      const fingerprint = await getFingerprintData();
      const timestamp = Date.now();

      // 서명 생성 (닉네임, 유저ID 포함)
      const signature = generateSignature({
        score: data.score,
        attempts: data.attempts,
        dollsCaught: data.dollsCaught,
        timestamp,
        nickname: data.nickname,
        tempUserId: data.tempUserId,
        fingerprintHash: fingerprint.hash
      });

      const response = await internalFetch<SubmitScoreResponse>(API.RANKING.SUBMIT, {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          fingerprint,
          timestamp,
          signature
        }),
      });
      return { success: response.success, error: response.error, data: response.data };
    } catch (e) {
      console.error('Failed to get fingerprint or submit score:', e);
      // Fallback
      return { success: false, error: 'Failed to submit score' };
    }
  },

  async getMyRanking(): Promise<RankingEntry | null> {
    // TODO: 추후 구현
    return null;
  },
};

