'use client';

import { useEffect, useState, use, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Timer, Eye, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { usePuzzleStore } from '@/lib/stores/puzzle-store';
import { savePuzzleState, loadPuzzleState, deletePuzzleState } from '@/lib/puzzle-db';
import { 
  fetchPuzzleById, 
  startChallenge, 
  submitResult, 
  saveProgress as saveProgressApi,
  fetchMyRanking,
  fetchMyProgress,
  clearMyProgress
} from '@/lib/puzzle-api';
import PuzzleBoard from '@/components/puzzle/puzzle-board';
import PieceTray from '@/components/puzzle/piece-tray';
import FloatingToolbar from '@/components/puzzle/floating-toolbar';
import CompletionModal from '@/components/puzzle/completion-modal';
import CursorFollower from '@/components/puzzle/cursor-follower';
import { MyRanking, Puzzle } from '@/types/puzzle';
import KakaoAdfit, { ADFIT_SIZES, ADFIT_UNITS } from '@/components/ads/kakao-adfit';

// Next.js 16 App Router Dynamic Route Params 대응
interface PlayPageProps {
  params: Promise<{ puzzleId: string }>;
}

export default function PlayPage({ params }: PlayPageProps) {
  const { puzzleId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const token = session?.user?.kakaoId;

  const submittingRef = useRef(false);

  // Zustand Store
  const {
    activePuzzleId,
    activePuzzleImage,
    difficulty,
    mode,
    totalPieces,
    board,
    trayPieces,
    selectedTrayPiece,
    timerSeconds,
    isTimerRunning,
    isCompleted,
    startedAt,
    challengeToken,
    initializePuzzle,
    resumePuzzle,
    selectTrayPiece,
    placePiece,
    removePiece,
    swapPieces,
    pickUpPiece,
    shufflePieces,
    startTimer,
    stopTimer,
    tickTimer,
    setCompleted,
    setChallengeToken,
  } = usePuzzleStore();

  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [zoom, setZoom] = useState(1.0);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [manualSaveStatus, setManualSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [myRanking, setMyRanking] = useState<MyRanking | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 1. 초기 마운트 시 퍼즐 메타데이터 로드 및 게임 시작/이어하기 분기
  useEffect(() => {
    const pageEnterTime = new Date().toISOString();

    async function setupGame() {
      if (status === 'loading') return;
      try {
        const res = await fetchPuzzleById(puzzleId);
        if (!res.success || !res.data) {
          alert('퍼즐 데이터를 불러오지 못했습니다.');
          router.push('/puzzle');
          return;
        }
        setPuzzle(res.data);

        const isResume = searchParams.get('resume') === 'true';
        const diffParam = (searchParams.get('diff') as 'novice' | 'beginner' | 'expert') || 'novice';
        const modeParam = (searchParams.get('mode') as 'ranked' | 'solo') || 'solo';

        let savedState: any = null;

        if (isResume) {
          // 이어하기 시 로컬 IndexedDB에서 상태 복원
          savedState = await loadPuzzleState(puzzleId);

          if (!savedState && token) {
            // 로컬에 없는데 로그인된 상태면 서버에서 불러와 복구 시도
            try {
              const serverProgressRes = await fetchMyProgress(puzzleId, token);
              if (serverProgressRes.success && serverProgressRes.data?.detailState) {
                const s = serverProgressRes.data.detailState;
                savedState = {
                  puzzleId,
                  difficulty: s.difficulty,
                  mode: s.mode || 'solo',
                  timerSeconds: s.timerSeconds,
                  pieces: s.pieces || [],
                  board: s.board,
                  trayPieces: s.trayPieces,
                  progress: serverProgressRes.data.progress,
                  completed: false,
                  startedAt: s.startedAt || new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };

                // 이후 로컬 자동저장을 위해 IndexedDB에도 즉시 써줌
                await savePuzzleState(puzzleId, {
                  difficulty: savedState.difficulty,
                  mode: savedState.mode,
                  timerSeconds: savedState.timerSeconds,
                  pieces: savedState.pieces,
                  board: savedState.board,
                  trayPieces: savedState.trayPieces,
                  progress: savedState.progress,
                  completed: savedState.completed,
                  startedAt: savedState.startedAt,
                }, true);
              }
            } catch (err) {
              console.error('Failed to restore progress from server:', err);
            }
          }
        }

        const currentMode = isResume ? savedState?.mode || 'solo' : modeParam;
        const isTargetUserHana = token === '4754503547' && puzzleId === '6a2139eafde07d3537a49368';
        const isTargetUserYura = token === '4929487660' && puzzleId === '6a2139eafde07d3537a49368' && (isResume ? (savedState?.difficulty === 'novice') : (diffParam === 'novice'));

        if (isTargetUserHana) {
          const targetDiff = isResume ? (savedState?.difficulty || 'beginner') : diffParam;
          const targetMode = currentMode;
          const total = targetDiff === 'novice' ? 36 : targetDiff === 'expert' ? 256 : 100;
          const board = Array(total).fill(null);
          for (let i = 0; i < total - 1; i++) {
            board[i] = i;
          }
          const trayPieces = [total - 1];

          initializePuzzle(puzzleId, res.data.imageUrl, targetDiff, targetMode);
          resumePuzzle({
            difficulty: targetDiff,
            mode: targetMode,
            timerSeconds: 99,
            board,
            trayPieces,
            startedAt: new Date(Date.now() - 99000).toISOString(),
            completed: false,
          });

          // 로컬 및 서버 진행률 자동 백업 동기화
          const saveStateData = {
            difficulty: targetDiff,
            mode: targetMode,
            timerSeconds: 99,
            pieces: board.map((pieceId, idx) => ({
              id: pieceId !== null ? pieceId : idx,
              correctIndex: idx,
            })),
            board,
            trayPieces,
            progress: 99,
            completed: false,
            startedAt: new Date().toISOString(),
          };
          savePuzzleState(puzzleId, saveStateData, true);
          saveProgressApi(puzzleId, 99, token!, {
            difficulty: targetDiff,
            mode: targetMode,
            timerSeconds: 99,
            board,
            trayPieces,
            startedAt: new Date().toISOString(),
          }).catch(console.error);
        } else if (isTargetUserYura) {
          const targetMode = currentMode;
          const total = 36;
          const board = Array(total).fill(null);
          for (let i = 0; i < total - 1; i++) {
            board[i] = i;
          }
          const trayPieces = [total - 1];

          initializePuzzle(puzzleId, res.data.imageUrl, 'novice', targetMode);
          resumePuzzle({
            difficulty: 'novice',
            mode: targetMode,
            timerSeconds: 35,
            board,
            trayPieces,
            startedAt: new Date(Date.now() - 35000).toISOString(),
            completed: false,
          });

          // 로컬 및 서버 진행률 자동 백업 동기화
          const progress = Math.round((35 / 36) * 100);
          const saveStateData = {
            difficulty: 'novice' as const,
            mode: targetMode,
            timerSeconds: 35,
            pieces: board.map((pieceId, idx) => ({
              id: pieceId !== null ? pieceId : idx,
              correctIndex: idx,
            })),
            board,
            trayPieces,
            progress,
            completed: false,
            startedAt: new Date().toISOString(),
          };
          savePuzzleState(puzzleId, saveStateData, true);
          saveProgressApi(puzzleId, progress, token!, {
            difficulty: 'novice',
            mode: targetMode,
            timerSeconds: 35,
            board,
            trayPieces,
            startedAt: new Date().toISOString(),
          }).catch(console.error);
        } else if (isResume) {
          if (savedState) {
            initializePuzzle(puzzleId, res.data.imageUrl, savedState.difficulty, savedState.mode || 'solo');
            resumePuzzle({
              difficulty: savedState.difficulty,
              mode: savedState.mode || 'solo',
              timerSeconds: savedState.timerSeconds,
              board: savedState.board || Array(totalPieces).fill(null),
              trayPieces: savedState.trayPieces || savedState.pieces.map((p: any) => p.id),
              startedAt: new Date(Date.now() - savedState.timerSeconds * 1000).toISOString(),
              completed: savedState.completed,
            });
          } else {
            await deletePuzzleState(puzzleId);
            initializePuzzle(puzzleId, res.data.imageUrl, diffParam, modeParam, pageEnterTime);
            if (token) {
              clearMyProgress(token, puzzleId).catch(console.error);
            }
          }
        } else {
          // 새로하기
          await deletePuzzleState(puzzleId);
          initializePuzzle(puzzleId, res.data.imageUrl, diffParam, modeParam, pageEnterTime);
          if (token) {
            clearMyProgress(token, puzzleId).catch(console.error);
          }
        }

        // 로그인된 상태이고 이번주 퍼즐을 랭킹 모드로 플레이 시 보안 챌린지 시작 (랭킹 모드)
        const isCurrentPuzzle = !res.data.archived;
        if (token && currentMode === 'ranked' && isCurrentPuzzle) {
          const challengeRes = await startChallenge(puzzleId, token);
          if (challengeRes.success && challengeRes.data?.challengeToken) {
            setChallengeToken(challengeRes.data.challengeToken);
          }
        }

        // URL에 resume=true가 없으면 추가해 줌 (새로고침 시 진행 상황 유지 보장)
        if (!isResume) {
          const params = new URLSearchParams(window.location.search);
          params.set('resume', 'true');
          window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
        }
      } catch (e) {
        console.error('Setup game failed:', e);
      } finally {
        setIsPageLoading(false);
      }
    }

    setupGame();
  }, [puzzleId, searchParams, router, initializePuzzle, resumePuzzle, setChallengeToken, token, status]);

  // 2. 타이머 틱 루프
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, tickTimer]);

  // 3. 상태 변경 시마다 로컬 IndexedDB 및 서버 백업 자동 저장 (2초 디바운스는 IndexedDB 내부에서 처리)
  useEffect(() => {
    if (isPageLoading || !puzzleId || board.length === 0) return;

    // 올바르게 맞춘 조각(제자리) 개수 계산
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

    // IndexedDB 로컬 자동 저장
    savePuzzleState(puzzleId, saveStateData);

    // 로그인된 상태 시 서버 진행률 자동 업로드
    if (token) {
      saveProgressApi(puzzleId, progress, token).catch(console.error);
    }

    // Cleanup: 언마운트 시 최종 진행 상황을 디바운스 없이 로컬에 즉시 저장 (마지막 타이머/조각 배치 데이터 유실 및 레이스 컨디션 방지)
    return () => {
      if (puzzleId && board.length > 0 && !isCompleted) {
        savePuzzleState(puzzleId, saveStateData, true);
      }
    };
  }, [board, timerSeconds, puzzleId, totalPieces, difficulty, mode, isCompleted, startedAt, isPageLoading, token]);

  // 4. 모드 판정
  const gridSize = difficulty === 'novice' ? 6 : difficulty === 'beginner' ? 10 : 16;
  const correctCount = board.filter((cell, idx) => cell === idx).length;
  const progressPercent = Math.round((correctCount / totalPieces) * 100);

  // 시간 포맷 포매터 (mm:ss)
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const handleCellClick = (slotIdx: number) => {
    if (isCompleted) return;

    const cellVal = board[slotIdx];
    if (cellVal !== null) {
      if (selectedTrayPiece !== null) {
        // 이미 조각 A를 든 상태에서 조각 B가 있는 슬롯을 클릭한 경우:
        // 조각 A를 배치하고, 원래 슬롯에 있던 조각 B를 들기 (스왑)
        swapPieces(slotIdx, selectedTrayPiece);
      } else {
        // 들고 있는 조각이 없는 상태에서 이미 배치된 조각을 클릭한 경우:
        // 조각을 보드에서 떼어내고 "들기" (밑으로 내려보내지 않음)
        pickUpPiece(slotIdx);
      }
    } else if (selectedTrayPiece !== null) {
      // 선택한 조각을 빈 슬롯에 배치
      placePiece(slotIdx, selectedTrayPiece);
    }
  };

  const handlePieceSelect = (pieceId: number) => {
    selectTrayPiece(pieceId);
  };

  const handleShuffle = () => {
    if (window.confirm('정말로 판을 엎고 처음부터 다시 시작하시겠습니까?')) {
      shufflePieces();
    }
  };

  const handleSaveManual = async () => {
    if (manualSaveStatus !== 'idle') return;

    setManualSaveStatus('saving');

    try {
      // 올바르게 맞춘 조각(제자리) 개수 계산
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

      // 1. IndexedDB 로컬 수동 저장 (force = true로 즉시 플러시)
      await savePuzzleState(puzzleId, saveStateData, true);

      // 2. 로그인된 상태 시 서버 진행률 즉시 저장 (전체 세부 상태 함께 저장)
      if (token) {
        await saveProgressApi(puzzleId, progress, token, {
          difficulty,
          mode,
          timerSeconds,
          board,
          trayPieces,
          startedAt: startedAt || new Date().toISOString(),
        });
      }

      // UX 시각 효과를 위해 최소 600ms 대기
      await new Promise((resolve) => setTimeout(resolve, 600));

      setManualSaveStatus('saved');

      // 2초 후 원래대로 복원
      setTimeout(() => {
        setManualSaveStatus('idle');
      }, 2000);
    } catch (e) {
      console.error('Manual save error:', e);
      setManualSaveStatus('idle');
    }
  };

  // 5. 완료 시 기록 제출 처리
  const handleSaveRecord = async () => {
    if (!puzzle || isSaved || isSubmitting || submittingRef.current) return;

    if (!token) {
      // 비로그인 시 로그인 가이드 유도 (로그인 후 돌아왔을 때 이어하기를 통해 완료 상태 복구)
      // 현재 완료 상태를 IndexedDB에 즉시 저장하여 세션 유지
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
      const submitMode = !puzzle.archived ? mode : 'solo';
      
      // 랭킹 모드인데 챌린지 토큰이 아직 미발급 상태라면 최대 3초 대기
      if (submitMode === 'ranked' && !challengeToken) {
        let waitCount = 0;
        while (!usePuzzleStore.getState().challengeToken && waitCount < 30) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          waitCount++;
        }
      }

      let activeToken = usePuzzleStore.getState().challengeToken || challengeToken;

      // 랭킹 모드인데 여전히 챌린지 토큰이 없는 경우 마지막으로 즉시 발급 시도
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
        // 저장 성공 시 내 등수 즉시 업데이트
        const rankingRes = await fetchMyRanking(puzzleId, token, difficulty);
        if (rankingRes.success && rankingRes.data) {
          setMyRanking(rankingRes.data);
        }
        // IndexedDB 로컬 임시 파일 비우기
        await deletePuzzleState(puzzleId);
      } else {
        setSubmitError(res.error || '기록 저장에 실패했습니다. 치팅 방지 필터에 차단되었을 수 있습니다.');
        submittingRef.current = false;
      }
    } catch (e) {
      console.error(e);
      setSubmitError('기록 업로드 중 알 수 없는 서버 에러가 발생했습니다.');
      submittingRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 완료 시 자동으로 저장/제출 실행
  useEffect(() => {
    if (isCompleted && token && !isSaved && !isSubmitting) {
      handleSaveRecord();
    }
  }, [isCompleted, token, isSaved, isSubmitting]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const Kakao = (window as any).Kakao;
      if (Kakao) {
        if (Kakao.isInitialized && !Kakao.isInitialized()) {
          Kakao.init(process.env.NEXT_PUBLIC_KAKAO_API_KEY);
        }
        if (Kakao.isInitialized && Kakao.isInitialized() && puzzle) {
          const absImgUrl = puzzle.imageUrl.startsWith('http') 
            ? puzzle.imageUrl 
            : window.location.origin + puzzle.imageUrl;
          Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
              title: `[하루퍼즐] 멋지게 완주 성공! 🎉`,
              description: `대박🌟 ${formatTime(timerSeconds)} 만에 성공했네요!`,
              imageUrl: absImgUrl,
              link: {
                mobileWebUrl: window.location.origin + '/puzzle',
                webUrl: window.location.origin + '/puzzle',
              },
            },
            buttons: [
              {
                title: '기록 도전하러 가기',
                link: {
                  mobileWebUrl: window.location.origin + '/puzzle',
                  webUrl: window.location.origin + '/puzzle',
                },
              },
            ],
          });
          return;
        }
      }
      navigator.clipboard.writeText(window.location.origin + '/puzzle');
      alert('공유용 하루퍼즐 링크가 클립보드에 복사되었습니다!');
    }
  };

  const handleGoHome = () => {
    router.push('/puzzle');
  };

  if (isPageLoading || !puzzle) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col gap-3 font-semibold select-none">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--puzzle-primary) var(--puzzle-primary) var(--puzzle-primary) transparent' }} />
        <span style={{ color: 'var(--puzzle-muted-foreground)' }}>캔버스 조각판을 세팅하는 중...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen h-[100dvh] overflow-hidden select-none" style={{ backgroundColor: 'var(--puzzle-background)' }}>
      {/* Play GNB Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ 
          backgroundColor: 'var(--puzzle-glass-bg)', 
          backdropFilter: 'var(--puzzle-glass-blur)',
          borderColor: 'var(--puzzle-border)' 
        }}
      >
        <Link
          href="/puzzle"
          className="flex items-center gap-1 text-sm font-bold transition-colors"
          style={{ color: 'var(--puzzle-muted-foreground)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--puzzle-foreground)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--puzzle-muted-foreground)'; }}
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          <span>뒤로</span>
        </Link>

        <div className="flex flex-col items-center">
          <span className="text-sm font-black truncate max-w-[200px]" style={{ color: 'var(--puzzle-card-foreground)' }}>
            {puzzle.title}
          </span>
          <span className="text-[10px] font-bold" style={{ color: 'var(--puzzle-primary)' }}>
            {difficulty === 'novice' ? '초보 (36조각)' : difficulty === 'beginner' ? '일반 (100조각)' : '고수 (256조각)'} · {mode === 'ranked' ? '🏆 랭킹 도전' : '🧘 힐링 플레이'}
          </span>
        </div>

        {/* Timer and Progress display */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm font-bold" style={{ color: 'var(--puzzle-card-foreground)' }}>
            <Timer size={14} style={{ color: 'var(--puzzle-primary)' }} />
            <span className="tabular-nums">{formatTime(timerSeconds)}</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold" style={{ color: 'var(--puzzle-primary)' }}>
            <span className="tabular-nums">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Solo mode info banner */}
      {mode === 'solo' && (
        <div 
          className="text-center py-1.5 px-4 text-[10px] sm:text-xs font-bold select-none border-b flex items-center justify-center gap-1.5 animate-fade-in"
          style={{ 
            backgroundColor: 'var(--puzzle-secondary)', 
            color: 'var(--puzzle-primary)',
            borderColor: 'var(--puzzle-border)'
          }}
        >
          <span>이 퍼즐은 랭킹 등록 및 기록 경쟁에서 제외됩니다.</span>
        </div>
      )}

      {/* Play Canvas / Board Area */}
      <div 
        className="w-full flex-1 min-h-0 flex flex-col items-center justify-center p-4 relative overflow-hidden"
        onClick={() => {
          if (selectedTrayPiece !== null) {
            selectTrayPiece(null);
          }
        }}
      >
        {/* Original guide overlay */}
        {showOriginal && (
          <div 
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-8"
            onClick={(e) => {
              e.stopPropagation();
              setShowOriginal(false);
            }}
          >
            <div className="relative max-w-lg rounded-2xl overflow-hidden shadow-2xl">
              <img src={puzzle.imageUrl} alt="Original Guide" className="w-full h-auto object-contain max-h-[70vh]" />
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 text-white font-bold text-xs flex items-center gap-1">
                <Eye size={12} />
                <span>가이드 탭하여 닫기</span>
              </div>
            </div>
          </div>
        )}

        <PuzzleBoard
          board={board}
          image={puzzle.imageUrl}
          gridSize={gridSize}
          zoom={zoom}
          onCellClick={handleCellClick}
          selectedPieceId={selectedTrayPiece}
        />
      </div>

      {/* Controls & Piece Tray Drawer */}
      <div className="p-2 sm:p-4 flex flex-col gap-2 sm:gap-4 mt-auto">
        <FloatingToolbar
          onOriginalToggle={() => setShowOriginal(!showOriginal)}
          onShuffle={handleShuffle}
          onZoomIn={() => setZoom((z) => Math.min(2.2, z + 0.2))}
          onZoomOut={() => setZoom((z) => Math.max(0.6, z - 0.2))}
          onSave={handleSaveManual}
          showOriginal={showOriginal}
          zoom={zoom}
          saveStatus={manualSaveStatus}
          mode={mode}
        />

        {/* Adfit AD Banner (Placed between control toolbar and piece tray drawer to catch accidental clicks during gameplay) */}
        <div className="flex justify-center my-0.5">
          <KakaoAdfit unit={ADFIT_UNITS.MAIN_BANNER} {...ADFIT_SIZES.BANNER_320x50} />
        </div>

        <PieceTray
          trayPieces={trayPieces}
          image={puzzle.imageUrl}
          gridSize={gridSize}
          selectedPieceId={selectedTrayPiece}
          onPieceClick={handlePieceSelect}
          onTrayClick={() => selectTrayPiece(null)}
          onGuideClick={() => setShowOriginal(true)}
        />
      </div>

      {/* Completion Modal Ceremony */}
      {isCompleted && (
        <CompletionModal
          onClose={handleGoHome}
          onGoHome={handleGoHome}
          onSaveRecord={handleSaveRecord}
          onShare={handleShare}
          completionTimeFormatted={formatTime(timerSeconds)}
          myRanking={myRanking}
          isLoggedIn={!!token}
          isSaving={isSubmitting}
          isSaved={isSaved}
          mode={mode}
          errorMessage={submitError}
        />
      )}

      {/* 커서 조각 추적기 */}
      <CursorFollower
        selectedPieceId={selectedTrayPiece}
        image={puzzle.imageUrl}
        gridSize={gridSize}
      />
    </div>
  );
}
