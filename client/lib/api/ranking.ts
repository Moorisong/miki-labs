import type { RankingEntry, SubmitScoreRequest, ApiResponse, GameSession } from './types';

import { API, MESSAGES } from '@/constants';

// 현재 활성 게임 세션 저장
let currentGameSession: GameSession | null = null;

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

  /**
   * 게임 시작 시 호출 - 서버에서 게임 세션 토큰 발급
   * 이 토큰 없이는 점수 제출 불가
   */
  async startGameSession(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await internalFetch<GameSession>(API.GAME.SESSION, {
        method: 'POST',
      });

      if (response.success && response.data) {
        currentGameSession = response.data;
        return { success: true };
      }

      return { success: false, error: response.error || '게임 세션 생성 실패' };
    } catch (e) {
      console.error('Failed to start game session:', e);
      return { success: false, error: '게임 세션 생성 중 오류' };
    }
  },

  /**
   * 현재 게임 세션이 유효한지 확인
   */
  hasValidSession(): boolean {
    if (!currentGameSession) return false;
    return currentGameSession.expiresAt > Date.now();
  },

  /**
   * 현재 게임 세션 토큰 반환
   */
  getSessionToken(): string | null {
    if (!currentGameSession) return null;
    if (currentGameSession.expiresAt <= Date.now()) {
      currentGameSession = null;
      return null;
    }
    return currentGameSession.sessionToken;
  },

  /**
   * 게임 세션 초기화 (게임 종료 또는 제출 후)
   */
  clearSession(): void {
    currentGameSession = null;
  },

  async submitScore(
    data: Omit<SubmitScoreRequest, 'fingerprint' | 'signature' | 'timestamp' | 'gameSessionToken'>
  ): Promise<SubmitResult> {
    try {
      // 게임 세션 토큰 확인
      const gameSessionToken = this.getSessionToken();
      if (!gameSessionToken) {
        return { success: false, error: '유효한 게임 세션이 없습니다. 게임을 다시 시작해주세요.' };
      }

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
          signature,
          gameSessionToken, // 게임 세션 토큰 포함
        }),
      });

      // 제출 후 세션 소비됨 - 클리어
      if (response.success) {
        this.clearSession();
      }

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

