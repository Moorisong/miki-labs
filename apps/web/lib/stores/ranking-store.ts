import { create } from 'zustand';
import { RankingEntry, MyRanking } from '@/types/puzzle';
import { fetchCurrentRankings, fetchMyRanking } from '../puzzle-api';

export interface RankingState {
  rankings: RankingEntry[];
  myRanking: MyRanking | null;
  isLoading: boolean;

  fetchRankings: (puzzleId: string) => Promise<void>;
  fetchMyRanking: (puzzleId: string, token: string) => Promise<void>;
  resetRankings: () => void;
}

export const useRankingStore = create<RankingState>((set) => ({
  rankings: [],
  myRanking: null,
  isLoading: false,

  fetchRankings: async (puzzleId) => {
    set({ isLoading: true });
    try {
      const res = await fetchCurrentRankings(puzzleId);
      if (res.success && res.data) {
        set({ rankings: res.data });
      } else {
        set({ rankings: [] });
      }
    } catch (error) {
      console.error('Failed to fetch rankings:', error);
      set({ rankings: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyRanking: async (puzzleId, token) => {
    try {
      const res = await fetchMyRanking(puzzleId, token);
      if (res.success && res.data) {
        set({ myRanking: res.data });
      } else {
        set({ myRanking: null });
      }
    } catch (error) {
      console.error('Failed to fetch my ranking:', error);
      set({ myRanking: null });
    }
  },

  resetRankings: () => set({ rankings: [], myRanking: null, isLoading: false }),
}));
