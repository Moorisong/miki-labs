'use client';

import { useEffect, useState, use } from 'react';
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
  fetchMyRanking
} from '@/lib/puzzle-api';
import PuzzleBoard from '@/components/puzzle/puzzle-board';
import PieceTray from '@/components/puzzle/piece-tray';
import FloatingToolbar from '@/components/puzzle/floating-toolbar';
import CompletionModal from '@/components/puzzle/completion-modal';
import CursorFollower from '@/components/puzzle/cursor-follower';
import { MyRanking, Puzzle } from '@/types/puzzle';
import { useToast } from '@/lib/hooks/use-toast';
import Toast from '@/components/ui/toast';

// Next.js 16 App Router Dynamic Route Params 대응
interface PlayPageProps {
  params: Promise<{ puzzleId: string }>;
}

export default function PlayPage({ params }: PlayPageProps) {
  const { puzzleId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const token = session?.user?.kakaoId;

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
  const [myRanking, setMyRanking] = useState<MyRanking | null>(null);
  const { toast: toastState, showToast, hideToast } = useToast();

  // 1. 초기 마운트 시 퍼즐 메타데이터 로드 및 게임 시작/이어하기 분기
  useEffect(() => {
    const pageEnterTime = new Date().toISOString();

    async function setupGame() {
      try {
        const res = await fetchPuzzleById(puzzleId);
        if (!res.success || !res.data) {
          alert('퍼즐 데이터를 불러오지 못했습니다.');
          router.push('/puzzle');
          return;
        }
        setPuzzle(res.data);

        const isResume = searchParams.get('resume') === 'true';
        const diffParam = (searchParams.get('diff') as 'beginner' | 'expert') || 'beginner';
        const modeParam = (searchParams.get('mode') as 'ranked' | 'solo') || 'solo';

        if (isResume) {
          // 이어하기 시 로컬 IndexedDB에서 상태 복원
          const saved = await loadPuzzleState(puzzleId);
          if (saved) {
            initializePuzzle(puzzleId, res.data.imageUrl, saved.difficulty, saved.mode || 'solo');
            resumePuzzle({
              difficulty: saved.difficulty,
              mode: saved.mode || 'solo',
              timerSeconds: saved.timerSeconds,
              board: saved.board || Array(totalPieces).fill(null),
              trayPieces: saved.trayPieces || saved.pieces.map((p: any) => p.id),
              startedAt: saved.startedAt,
              completed: saved.completed,
            });
          } else {
            initializePuzzle(puzzleId, res.data.imageUrl, diffParam, modeParam, pageEnterTime);
          }
        } else {
          // 새로하기
          initializePuzzle(puzzleId, res.data.imageUrl, diffParam, modeParam, pageEnterTime);
        }

        // 로그인된 상태이고 이번주 퍼즐을 랭킹 모드로 플레이 시 보안 챌린지 시작 (랭킹 모드)
        const isCurrentPuzzle = !res.data.archived;
        const currentMode = isResume ? (await loadPuzzleState(puzzleId))?.mode || 'solo' : modeParam;
        if (token && currentMode === 'ranked' && isCurrentPuzzle) {
          const challengeRes = await startChallenge(puzzleId, token);
          if (challengeRes.success && challengeRes.data?.challengeToken) {
            setChallengeToken(challengeRes.data.challengeToken);
          }
        }
      } catch (e) {
        console.error('Setup game failed:', e);
      } finally {
        setIsPageLoading(false);
      }
    }

    setupGame();
  }, [puzzleId, searchParams, router, initializePuzzle, resumePuzzle, setChallengeToken, token]);

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
  const gridSize = difficulty === 'beginner' ? 10 : 16;
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
    // 수동 저장 트리거 시 알림
    alert('게임 진행상황이 로컬 디스크 및 클라우드 서버에 안전하게 자동 저장되었습니다.');
  };

  // 5. 완료 시 기록 제출 처리
  const handleSaveRecord = async () => {
    if (!puzzle || isSaved || isSubmitting) return;

    if (!token) {
      // 비로그인 시 로그인 가이드 유도
      const callback = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`/login?callbackUrl=${callback}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const submitMode = !puzzle.archived ? mode : 'solo';
      
      const res = await submitResult({
        puzzleId,
        mode: submitMode,
        difficulty,
        challengeToken: challengeToken || 'no-challenge-token',
        startedAt: startedAt || new Date().toISOString(),
        completedAt: new Date().toISOString(),
        completionTime: timerSeconds,
      }, token);

      if (res.success) {
        setIsSaved(true);
        // 저장 성공 시 내 등수 즉시 업데이트
        const rankingRes = await fetchMyRanking(puzzleId, token, difficulty);
        if (rankingRes.success && rankingRes.data) {
          setMyRanking(rankingRes.data);
        }
        // IndexedDB 로컬 임시 파일 비우기
        await deletePuzzleState(puzzleId);
      } else {
        alert(res.error || '기록 저장에 실패했습니다. 치팅 방지 필터에 차단되었을 수 있습니다.');
      }
    } catch (e) {
      console.error(e);
      alert('기록 업로드 중 알 수 없는 서버 에러가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              title: `🧩 [오퍼완] 하루퍼즐 완주! 기록 폼 미쳤다;;`,
              description: `단 ${formatTime(timerSeconds)}만에 갓벽하게 조각 맞춰버림 😎 뇌지컬 디톡스 완. 내 기록 이길 수 있으면 드루와! 👊`,
              imageUrl: absImgUrl,
              link: {
                mobileWebUrl: window.location.origin + '/puzzle',
                webUrl: window.location.origin + '/puzzle',
              },
            },
            buttons: [
              {
                title: '나보다 빨리 맞추기 ㄱㄱ',
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
      showToast('공유용 하루퍼즐 링크가 성공적으로 클립보드에 복사되었습니다!', 'success');
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
            {difficulty === 'beginner' ? 'Beginner (100조각)' : 'Expert (256조각)'} · {mode === 'ranked' ? '🏆 랭킹 도전' : '🧘 힐링 플레이'}
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
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Original guide overlay */}
        {showOriginal && (
          <div 
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm p-8"
            onClick={() => setShowOriginal(false)}
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
        />

        <PieceTray
          trayPieces={trayPieces}
          image={puzzle.imageUrl}
          gridSize={gridSize}
          selectedPieceId={selectedTrayPiece}
          onPieceClick={handlePieceSelect}
        />
      </div>

      {/* Completion Modal Ceremony */}
      {isCompleted && (
        <CompletionModal
          onClose={() => setCompleted(false)}
          onGoHome={handleGoHome}
          onSaveRecord={handleSaveRecord}
          onShare={handleShare}
          completionTimeFormatted={formatTime(timerSeconds)}
          myRanking={myRanking}
          isLoggedIn={!!token}
          isSaving={isSubmitting}
          isSaved={isSaved}
          mode={mode}
        />
      )}

      {/* 커서 조각 추적기 */}
      <CursorFollower
        selectedPieceId={selectedTrayPiece}
        image={puzzle.imageUrl}
        gridSize={gridSize}
      />

      {/* Toast Notification */}
      <Toast toast={toastState} onHide={hideToast} />
    </div>
  );
}
