import { useEffect, useRef } from 'react';
import { savePuzzleState } from '@/lib/puzzle-db';
import { saveProgress as saveProgressApi } from '@/lib/puzzle-api';

export function usePuzzleAutoSave(
  puzzleId: string,
  token: string | undefined,
  board: (number | null)[],
  trayPieces: number[],
  timerSeconds: number,
  difficulty: 'novice' | 'beginner' | 'expert',
  mode: 'solo' | 'ranked',
  isCompleted: boolean,
  startedAt: string | null,
  isPageLoading: boolean,
  totalPieces: number
) {
  const lastServerSaveTimeRef = useRef<number>(0);
  const serverSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestSaveDataRef = useRef({
    progress: 0,
    difficulty: 'novice' as 'novice' | 'beginner' | 'expert',
    mode: 'ranked' as 'solo' | 'ranked',
    timerSeconds: 0,
    board: [] as (number | null)[],
    trayPieces: [] as number[],
    startedAt: '',
    isCompleted: false,
  });

  // 최신 데이터 Ref 업데이트
  useEffect(() => {
    if (isPageLoading || board.length === 0) return;
    const correctCount = board.filter((cell, idx) => cell === idx).length;
    const progress = Math.round((correctCount / totalPieces) * 100);
    latestSaveDataRef.current = {
      progress,
      difficulty,
      mode,
      timerSeconds,
      board,
      trayPieces,
      startedAt: startedAt || new Date().toISOString(),
      isCompleted,
    };
  }, [board, timerSeconds, totalPieces, difficulty, mode, isCompleted, startedAt, isPageLoading]);

  // 언마운트(이탈) 시 즉시 저장 처리
  useEffect(() => {
    return () => {
      if (serverSaveTimeoutRef.current) {
        clearTimeout(serverSaveTimeoutRef.current);
      }
      
      const data = latestSaveDataRef.current;
      const pid = puzzleId;
      if (pid && data.board.length > 0 && !data.isCompleted) {
        const piecesData = data.board.map((pieceId, idx) => ({
          id: pieceId !== null ? pieceId : idx,
          correctX: 0,
          correctY: 0,
          currentX: 0,
          currentY: 0,
          width: 0,
          height: 0,
          locked: pieceId === idx,
        }));
        savePuzzleState(pid, {
          difficulty: data.difficulty,
          mode: data.mode,
          timerSeconds: data.timerSeconds,
          pieces: piecesData as any,
          board: data.board,
          trayPieces: data.trayPieces,
          progress: data.progress,
          completed: data.isCompleted,
          startedAt: data.startedAt,
        }, true);

        if (token) {
          saveProgressApi(pid, data.progress, token, {
            difficulty: data.difficulty,
            mode: data.mode,
            timerSeconds: data.timerSeconds,
            board: data.board,
            trayPieces: data.trayPieces,
            startedAt: data.startedAt,
            updatedAt: new Date().toISOString(),
          }).catch(console.error);
        }
      }
    };
  }, [puzzleId, token]);

  // 상태 변경 시마다 로컬 IndexedDB 및 서버 백업 자동 저장
  useEffect(() => {
    if (isPageLoading || !puzzleId || board.length === 0) return;

    const correctCount = board.filter((cell, idx) => cell === idx).length;
    const progress = Math.round((correctCount / totalPieces) * 100);

    const piecesData = board.map((pieceId, idx) => ({
      id: pieceId !== null ? pieceId : idx,
      correctX: 0,
      correctY: 0,
      currentX: 0,
      currentY: 0,
      width: 0,
      height: 0,
      locked: pieceId === idx,
    }));

    const saveStateData = {
      difficulty,
      mode,
      timerSeconds,
      pieces: piecesData as any,
      board,
      trayPieces,
      progress,
      completed: isCompleted,
      startedAt: startedAt || new Date().toISOString(),
    };

    savePuzzleState(puzzleId, saveStateData);

    if (token) {
      const saveToServer = async () => {
        if (!token || !puzzleId) return;
        const data = latestSaveDataRef.current;
        try {
          await saveProgressApi(puzzleId, data.progress, token, {
            difficulty: data.difficulty,
            mode: data.mode,
            timerSeconds: data.timerSeconds,
            board: data.board,
            trayPieces: data.trayPieces,
            startedAt: data.startedAt,
            updatedAt: new Date().toISOString(),
          });
        } catch (err) {
          console.error('Auto-save to server failed:', err);
        }
      };

      const THROTTLE_INTERVAL = 10000;
      const now = Date.now();
      const timeSinceLastSave = now - lastServerSaveTimeRef.current;

      if (timeSinceLastSave >= THROTTLE_INTERVAL) {
        if (serverSaveTimeoutRef.current) {
          clearTimeout(serverSaveTimeoutRef.current);
          serverSaveTimeoutRef.current = null;
        }
        lastServerSaveTimeRef.current = now;
        saveToServer();
      } else {
        if (!serverSaveTimeoutRef.current) {
          serverSaveTimeoutRef.current = setTimeout(() => {
            serverSaveTimeoutRef.current = null;
            lastServerSaveTimeRef.current = Date.now();
            saveToServer();
          }, THROTTLE_INTERVAL - timeSinceLastSave);
        }
      }
    }
  }, [board, timerSeconds, puzzleId, totalPieces, difficulty, mode, isCompleted, startedAt, isPageLoading, token]);
}
