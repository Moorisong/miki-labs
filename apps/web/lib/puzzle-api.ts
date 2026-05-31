import { ApiResponse, Puzzle, RankingEntry, MyRanking } from '@/types/puzzle';
import { API_PUZZLE } from '@/constants/puzzle';
import { API_BASE_URL } from '@/constants';

const getHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export async function fetchCurrentPuzzle(): Promise<ApiResponse<Puzzle>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api${API_PUZZLE.CURRENT}`);
    return await res.json();
  } catch (error) {
    console.error('fetchCurrentPuzzle error:', error);
    return { success: false, error: '네트워크 오류가 발생했습니다.' };
  }
}

export async function fetchArchivePuzzles(): Promise<ApiResponse<Puzzle[]>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api${API_PUZZLE.ARCHIVE}`);
    return await res.json();
  } catch (error) {
    console.error('fetchArchivePuzzles error:', error);
    return { success: false, error: '네트워크 오류가 발생했습니다.' };
  }
}

export async function fetchPuzzleById(id: string): Promise<ApiResponse<Puzzle>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api${API_PUZZLE.DETAILS(id)}`);
    return await res.json();
  } catch (error) {
    console.error('fetchPuzzleById error:', error);
    return { success: false, error: '네트워크 오류가 발생했습니다.' };
  }
}

export async function fetchCurrentRankings(puzzleId: string): Promise<ApiResponse<RankingEntry[]>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api${API_PUZZLE.RANKINGS_CURRENT}?puzzleId=${puzzleId}`);
    return await res.json();
  } catch (error) {
    console.error('fetchCurrentRankings error:', error);
    return { success: false, error: '네트워크 오류가 발생했습니다.' };
  }
}

export async function fetchMyRanking(puzzleId: string, token: string): Promise<ApiResponse<MyRanking>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api${API_PUZZLE.RANKINGS_ME}?puzzleId=${puzzleId}`, {
      headers: getHeaders(token),
    });
    return await res.json();
  } catch (error) {
    console.error('fetchMyRanking error:', error);
    return { success: false, error: '네트워크 오류가 발생했습니다.' };
  }
}

export async function startChallenge(puzzleId: string, token: string): Promise<ApiResponse<{ challengeToken: string }>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api${API_PUZZLE.CHALLENGE_START}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ puzzleId }),
    });
    return await res.json();
  } catch (error) {
    console.error('startChallenge error:', error);
    return { success: false, error: '네트워크 오류가 발생했습니다.' };
  }
}

export async function submitResult(
  data: {
    puzzleId: string;
    mode: 'solo' | 'ranked';
    difficulty: 'beginner' | 'expert';
    challengeToken: string;
    startedAt: string;
    completedAt: string;
    completionTime: number;
  },
  token: string
): Promise<ApiResponse<{ resultId: string; completionTime: number; savedAt: string }>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api${API_PUZZLE.RESULTS}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error('submitResult error:', error);
    return { success: false, error: '네트워크 오류가 발생했습니다.' };
  }
}

export async function saveProgress(
  puzzleId: string,
  progress: number,
  token: string
): Promise<ApiResponse<void>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api${API_PUZZLE.PROGRESS}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ puzzleId, progress }),
    });
    return await res.json();
  } catch (error) {
    console.error('saveProgress error:', error);
    return { success: false, error: '네트워크 오류가 발생했습니다.' };
  }
}

export async function fetchMyProgress(
  puzzleId: string,
  token: string
): Promise<ApiResponse<{ progress: number } | null>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api${API_PUZZLE.PROGRESS}?puzzleId=${puzzleId}`, {
      headers: getHeaders(token),
    });
    return await res.json();
  } catch (error) {
    console.error('fetchMyProgress error:', error);
    return { success: false, error: '네트워크 오류가 발생했습니다.' };
  }
}

export async function fetchMyProfile(
  token: string
): Promise<ApiResponse<{
  profile: { nickname: string; profileImage?: string; createdAt: string };
  statistics: { totalCompleted: number; bestTimeBeginner: number | null; bestRank: number | null };
  history: { puzzleId: string; title: string; imageUrl: string; difficulty: 'beginner' | 'expert'; completionTime: number; savedAt: string; completed: boolean; myRank?: number }[];
}>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/puzzle/users/me`, {
      headers: getHeaders(token),
    });
    return await res.json();
  } catch (error) {
    console.error('fetchMyProfile error:', error);
    return { success: false, error: '네트워크 오류가 발생했습니다.' };
  }
}

export async function deleteMyAccount(token: string): Promise<ApiResponse<void>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/puzzle/users/me`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return await res.json();
  } catch (error) {
    console.error('deleteMyAccount error:', error);
    return { success: false, error: '네트워크 오류가 발생했습니다.' };
  }
}
