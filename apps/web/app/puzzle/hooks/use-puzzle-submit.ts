import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { usePuzzleStore } from '@/lib/stores/puzzle-store';
import { savePuzzleState, deletePuzzleState } from '@/lib/puzzle-db';
import { saveProgress as saveProgressApi, submitResult, fetchMyRanking, startChallenge } from '@/lib/puzzle-api';
import { MyRanking } from '@/types/puzzle';

export function usePuzzleSubmit(
  puzzleId: string,
  token: string | undefined,
  board: (number | null)[],
  trayPieces: number[],
  timerSeconds: number,
  difficulty: 'novice' | 'beginner' | 'expert',
  mode: 'solo' | 'ranked',
  isCompleted: boolean,
  startedAt: string | null,
  totalPieces: number,
  puzzle: any
) {
  const router = useRouter();
  const submittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [manualSaveStatus, setManualSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [myRanking, setMyRanking] = useState<MyRanking | null>(null);

  const { challengeToken, setChallengeToken } = usePuzzleStore();

  const handleSaveManual = async () => {
    if (manualSaveStatus !== 'idle') return;

    if (!token) {
      try {
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
        await savePuzzleState(puzzleId, {
          difficulty,
          mode,
          timerSeconds,
          pieces: piecesData as any,
          board,
          trayPieces,
          progress,
          completed: isCompleted,
          startedAt: startedAt || new Date().toISOString(),
        }, true);
        sessionStorage.setItem(`pending_sync_${puzzleId}`, 'true');
      } catch (err) {
        console.error('Failed to save state before login redirect:', err);
      }
      const params = new URLSearchParams(window.location.search);
      params.set('resume', 'true');
      const callback = encodeURIComponent(`${window.location.pathname}?${params.toString()}`);
      router.push(`/login?callbackUrl=${callback}`);
      return;
    }

    setManualSaveStatus('saving');

    try {
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

      await savePuzzleState(puzzleId, saveStateData, true);

      if (token) {
        const res = await saveProgressApi(puzzleId, progress, token, {
          difficulty,
          mode,
          timerSeconds,
          board,
          trayPieces,
          startedAt: startedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        
        if (res.status === 401) {
          await signOut({ redirect: false });
          const params = new URLSearchParams(window.location.search);
          params.set('resume', 'true');
          const callback = encodeURIComponent(`${window.location.pathname}?${params.toString()}`);
          router.push(`/login?callbackUrl=${callback}`);
          return;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 600));
      setManualSaveStatus('saved');
      setTimeout(() => {
        setManualSaveStatus('idle');
      }, 2000);
    } catch (e) {
      console.error('Manual save error:', e);
      setManualSaveStatus('idle');
    }
  };

  const handleSaveRecord = async () => {
    if (!puzzle || isSaved || isSubmitting || submittingRef.current) return;

    if (!token) {
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
      
      try {
        await savePuzzleState(puzzleId, {
          difficulty,
          mode,
          timerSeconds,
          pieces: piecesData as any,
          board,
          trayPieces,
          progress,
          completed: true,
          startedAt: startedAt || new Date().toISOString(),
        }, true);
      } catch (err) {
        console.error('Failed to save state before login redirect:', err);
      }

      const params = new URLSearchParams(window.location.search);
      params.set('resume', 'true');
      const callback = encodeURIComponent(`${window.location.pathname}?${params.toString()}`);
      router.push(`/login?callbackUrl=${callback}`);
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const submitMode = 'ranked';
      
      if (submitMode === 'ranked' && !challengeToken) {
        let waitCount = 0;
        while (!usePuzzleStore.getState().challengeToken && waitCount < 30) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          waitCount++;
        }
      }

      let activeToken = usePuzzleStore.getState().challengeToken || challengeToken;

      if (submitMode === 'ranked' && !activeToken) {
        try {
          const challengeRes = await startChallenge(puzzleId, token);
          if (challengeRes.success && challengeRes.data?.challengeToken) {
            activeToken = challengeRes.data.challengeToken;
            setChallengeToken(activeToken);
          }
        } catch (err) {
          console.error('Failed to issue challenge token dynamically at completion:', err);
        }
      }

      if (!activeToken) {
        activeToken = 'no-challenge-token';
      }
      
      const res = await submitResult({
        puzzleId,
        mode: submitMode,
        difficulty,
        challengeToken: activeToken,
        startedAt: startedAt || new Date().toISOString(),
        completedAt: new Date().toISOString(),
        completionTime: timerSeconds,
      }, token);

      if (res.success) {
        setIsSaved(true);
        setSubmitError(null);
        const rankingRes = await fetchMyRanking(puzzleId, token, difficulty);
        if (rankingRes.success && rankingRes.data) {
          setMyRanking(rankingRes.data);
        }
        await deletePuzzleState(puzzleId);
      } else {
        setSubmitError(res.error || '기록 저장에 실패했습니다. 치팅 방지 필터에 차단되었을 수 있습니다.');
        // submittingRef를 false로 되돌리지 않아 useEffect에 의한 자동 재시도를 차단
        // (1회용 챌린지 토큰이 이미 소비된 상태에서 재시도하면 동일 에러 무한 반복)
      }
    } catch (e) {
      console.error(e);
      setSubmitError('기록 업로드 중 알 수 없는 서버 에러가 발생했습니다.');
      // 동일 이유로 자동 재시도 차단
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isCompleted && token && !isSaved && !submittingRef.current) {
      handleSaveRecord();
    }
  }, [isCompleted, token, isSaved]);
  // isSubmitting을 의존성에서 제거: 제출 실패 시 isSubmitting이 false로 돌아가면서
  // useEffect가 재실행되어 무한 루프(저장중↔에러 깜빡임)를 유발하던 버그 수정

  return {
    isSubmitting,
    isSaved,
    manualSaveStatus,
    submitError,
    myRanking,
    handleSaveManual,
    handleSaveRecord,
  };
}
