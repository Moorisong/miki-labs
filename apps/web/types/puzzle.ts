export interface Puzzle {
  _id: string;
  week: number;
  title: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  participantCount: number;
  archived: boolean;
}

export interface PuzzleResult {
  _id: string;
  userId: string;
  puzzleId: string;
  mode: 'solo' | 'ranked';
  difficulty: 'novice' | 'beginner' | 'expert';
  completionTime: number;
  challengeToken: string;
  startedAt: string;
  completedAt: string;
  savedAt: string;
  completed: boolean;
}

export interface PuzzleProgress {
  _id: string;
  userId: string;
  puzzleId: string;
  progress: number;
  lastPlayedAt: string;
}

export interface RankingEntry {
  rank: number;
  nickname: string;
  profileImage: string;
  completionTime: number;
  savedAt: string;
}

export interface MyRanking {
  myRank: number | null;
  nickname: string;
  completionTime: number | null;
  totalParticipants: number;
  topPercent: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
