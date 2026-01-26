import type { RankingEntry, SubmitScoreRequest, ApiResponse, GameSession } from './types';

import { API, MESSAGES, STORAGE_KEY } from '@/constants';

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
        // localStorage에 백업 (새로고침/로그인 등 페이지 이동 대응)
        try {
          localStorage.setItem(STORAGE_KEY.GAME_SESSION_DATA, JSON.stringify(currentGameSession));
          console.log('[rankingApi] Game session saved to localStorage');
        } catch (e) {
          console.warn('Failed to save session to storage', e);
        }
        return { success: true };
      }

      return { success: false, error: response.error || '게임 세션 생성 실패' };
    } catch (e) {
      console.error('Failed to start game session:', e);
      return { success: false, error: '게임 세션 생성 중 오류' };
    }
  },

  /**
   * 저장된 게임 세션 복구 (페이지 로드 시)
   */
  restoreSession(): void {
    try {
      if (typeof window === 'undefined') return;

      const data = localStorage.getItem(STORAGE_KEY.GAME_SESSION_DATA);
      if (data) {
        const session: GameSession = JSON.parse(data);
        if (session.expiresAt > Date.now()) {
          currentGameSession = session;
          console.log('[rankingApi] Session restored from localStorage');
        } else {
          console.warn('[rankingApi] Stored session expired');
          this.clearSession();
        }
      }
    } catch (e) {
      console.error("Failed to restore session", e);
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
   * 현재 게임 세션 및 토큰 확인 로직
   */
  getSessionToken(): string | null {
    // 메모리에 없으면 스토리지에서 복구 시도 (JIT)
    if (!currentGameSession && typeof window !== 'undefined') {
      this.restoreSession();
    }

    if (!currentGameSession) {
      console.warn('[rankingApi] No current game session found');
      return null;
    }

    if (currentGameSession.expiresAt <= Date.now()) {
      console.warn('[rankingApi] Game session expired at:', new Date(currentGameSession.expiresAt).toLocaleString());
      this.clearSession(); // 만료된 세션 정리 (스토리지 포함)
      return null;
    }
    return currentGameSession.sessionToken;
  },

  /**
   * 게임 세션 초기화 (게임 종료 또는 제출 후)
   */
  clearSession(): void {
    console.log('[rankingApi] Clearing game session');
    currentGameSession = null;
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY.GAME_SESSION_DATA);
        console.log('[rankingApi] Session removed from localStorage');
      }
    } catch (e) {
      // ignore
    }
  },

  async submitScore(
    data: Omit<SubmitScoreRequest, 'fingerprint' | 'signature' | 'timestamp' | 'gameSessionToken'>
  ): Promise<SubmitResult> {
    try {
      console.log('[rankingApi] Submitting score...', data.score);
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

