export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface RankingEntry {
  rank: number;
  userId: string;
  nickname: string;
  score: number;
  createdAt: Date;
}

export interface SubmitScoreRequest {
  score: number;
  attempts: number;
  dollsCaught: number;
  tempUserId?: string; // MVP: temporary user ID for testing
}
