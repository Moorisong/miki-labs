import { RankingEntry, SubmitScoreRequest, ApiResponse } from './types';

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
    return { success: false, error: '네트워크 오류' };
  }
};

export const rankingApi = {
  async getTopRanking(limit: number = 10): Promise<RankingEntry[]> {
    const response = await internalFetch<RankingEntry[]>(`/api/ranking/top?limit=${limit}`);
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  },

  async submitScore(data: Omit<SubmitScoreRequest, 'tempUserId' | 'nickname'>): Promise<{ success: boolean; error?: string; data?: { totalScore: number; totalAttempts: number; totalDollsCaught: number } }> {
    const response = await internalFetch<{ scoreId: string; totalScore: number; totalAttempts: number; totalDollsCaught: number }>('/api/ranking/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { success: response.success, error: response.error, data: response.data };
  },

  async getMyRanking(): Promise<RankingEntry | null> {
    // TODO: 추후 구현
    return null;
  },
};
