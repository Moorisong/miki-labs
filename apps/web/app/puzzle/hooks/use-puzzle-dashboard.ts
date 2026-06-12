import { useState, useEffect } from 'react';
import { useRankingStore } from '@/lib/stores/ranking-store';
import { fetchCurrentPuzzle, fetchArchivePuzzles, fetchServiceStats, fetchMyProgress, fetchMyProfile } from '@/lib/puzzle-api';
import { loadPuzzleState } from '@/lib/puzzle-db';
import { Puzzle } from '@/types/puzzle';

export function usePuzzleDashboard(token?: string | null) {
  const { rankings, isLoading: isRankingLoading, fetchRankings } = useRankingStore();
  
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [totalPuzzles, setTotalPuzzles] = useState(0);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [savedProgress, setSavedProgress] = useState(0);
  const [savedDifficulty, setSavedDifficulty] = useState<'novice' | 'beginner' | 'expert' | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [completedDifficulty, setCompletedDifficulty] = useState<'novice' | 'beginner' | 'expert' | null>(null);
  const [completedDifficulties, setCompletedDifficulties] = useState<('novice' | 'beginner' | 'expert')[]>([]);
  const [previewDiff, setPreviewDiff] = useState<'novice' | 'beginner' | 'expert'>('novice');
  const [isPuzzleLoading, setIsPuzzleLoading] = useState(true);
  const [serviceStats, setServiceStats] = useState<{ totalPlayCount: number; completionRate: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchCurrentPuzzle();
        if (res.success && res.data) {
          setCurrentPuzzle(res.data);
          const savedState = await loadPuzzleState(res.data._id);
          if (savedState && !savedState.completed) {
            setHasSavedGame(true);
            setSavedProgress(savedState.progress);
            setSavedDifficulty(savedState.difficulty);
          }
        }

        const archiveRes = await fetchArchivePuzzles();
        if (archiveRes.success && archiveRes.data) {
          setTotalPuzzles(archiveRes.data.length);
        }

        const statsRes = await fetchServiceStats();
        if (statsRes.success && statsRes.data) {
          setServiceStats(statsRes.data);
        }
      } catch (e) {
        console.error('Failed to load puzzle data:', e);
      } finally {
        setIsPuzzleLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!currentPuzzle || !token) return;
    const puzzleId = currentPuzzle._id;

    async function syncUserStatus() {
      try {
        const serverProgressRes = await fetchMyProgress(puzzleId, token as string);
        if (serverProgressRes.success) {
          if (!serverProgressRes.data) {
            const localState = await loadPuzzleState(puzzleId);
            if (localState) {
              const { deletePuzzleState } = await import('@/lib/puzzle-db');
              await deletePuzzleState(puzzleId);
              setHasSavedGame(false);
              setSavedProgress(0);
              setSavedDifficulty(null);
            }
          } else {
            const serverProgress = serverProgressRes.data.progress;
            const diff = serverProgressRes.data.detailState?.difficulty || 'beginner';
            
            if (serverProgress < 100) {
              const localState = await loadPuzzleState(puzzleId);
              const localProgress = localState ? localState.progress : -1;
              
              if (serverProgress !== localProgress || !localState) {
                setHasSavedGame(true);
                setSavedProgress(serverProgress);
                setSavedDifficulty(diff);
                
                if (serverProgressRes.data.detailState) {
                  const s = serverProgressRes.data.detailState;
                  const { savePuzzleState } = await import('@/lib/puzzle-db');
                  await savePuzzleState(puzzleId, {
                    difficulty: s.difficulty,
                    mode: s.mode || 'ranked',
                    timerSeconds: s.timerSeconds || 0,
                    pieces: s.pieces || [],
                    board: s.board,
                    trayPieces: s.trayPieces,
                    progress: serverProgress,
                    completed: false,
                    startedAt: s.startedAt || new Date().toISOString(),
                  }, true);
                }
              } else {
                setHasSavedGame(true);
                setSavedProgress(localProgress);
                setSavedDifficulty(localState.difficulty);
              }
            }
          }
        }

        const profileRes = await fetchMyProfile(token as string);
        if (profileRes.success && profileRes.data) {
          const completedHistories = profileRes.data.history.filter(
            (h: any) => h.puzzleId === puzzleId && h.completed
          );
          
          if (completedHistories.length > 0) {
            setHasCompleted(true);
            const diffs = completedHistories.map((h: any) => h.difficulty);
            setCompletedDifficulties(diffs);
            setCompletedDifficulty(completedHistories[completedHistories.length - 1].difficulty);
            
            try {
              const savedState = await loadPuzzleState(puzzleId);
              if (savedState) {
                const savedTime = savedState.updatedAt ? new Date(savedState.updatedAt).getTime() : 0;
                const lastCompletedTime = Math.max(...completedHistories.map((h: any) => new Date(h.savedAt || 0).getTime()));
                
                if (savedTime <= lastCompletedTime) {
                  const { deletePuzzleState } = await import('@/lib/puzzle-db');
                  await deletePuzzleState(puzzleId);
                  setHasSavedGame(false);
                }
              }
            } catch (err) {
              console.error('Failed to clear local puzzle state after sync:', err);
            }
          } else {
            setHasCompleted(false);
            setCompletedDifficulties([]);
            setCompletedDifficulty(null);
          }
        }
      } catch (e) {
        console.error('Failed to sync user puzzle status:', e);
      }
    }

    syncUserStatus();
  }, [currentPuzzle, token]);

  useEffect(() => {
    if (currentPuzzle) {
      fetchRankings(currentPuzzle._id, previewDiff);
    }
  }, [currentPuzzle, previewDiff, fetchRankings]);

  return {
    rankings,
    isRankingLoading,
    currentPuzzle,
    totalPuzzles,
    hasSavedGame,
    savedProgress,
    savedDifficulty,
    hasCompleted,
    completedDifficulty,
    completedDifficulties,
    previewDiff,
    setPreviewDiff,
    isPuzzleLoading,
    serviceStats,
  };
}
