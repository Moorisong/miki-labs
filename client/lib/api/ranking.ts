import { apiClient } from './client';
import { RankingEntry, SubmitScoreRequest } from './types';

export const rankingApi = {
  async getTopRanking(limit: number = 10): Promise<RankingEntry[]> {
    const response = await apiClient.get<RankingEntry[]>(`/ranking/top?limit=${limit}`);
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  },

  async submitScore(data: SubmitScoreRequest): Promise<boolean> {
    const response = await apiClient.post('/ranking/submit', data);
    return response.success;
  },

  async getMyRanking(): Promise<RankingEntry | null> {
    const response = await apiClient.get<RankingEntry>('/ranking/me');
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  },
};
