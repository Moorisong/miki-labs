export interface RankingEntry {
  rank: number;
  oderId: string;
  nickname: string;
  score: number;
  catches?: number;
  createdAt: string;
}

export interface SubmitScoreRequest {
  score: number;
  attempts: number;
  dollsCaught: number;
  tempUserId?: string; // MVP용 임시 ID
  nickname?: string;
  fingerprint?: {
    hash: string;
    userAgent: string;
    screenResolution?: string;
    timezone?: string;
    language?: string;
    platform?: string;
  };
  signature?: string;
  timestamp?: number;
  gameSessionToken?: string; // 게임 세션 토큰 (어뷰징 방지)
}

export interface GameSession {
  sessionToken: string;
  startTime: number;
  expiresAt: number;
}

export interface User {
  id: string;
  nickname: string;
  profileImage?: string;
  provider: 'kakao' | 'google';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
