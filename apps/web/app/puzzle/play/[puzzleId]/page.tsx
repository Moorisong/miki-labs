'use client';

import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Timer, Percent, Eye, HelpCircle } from 'lucide-react';
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
import { MyRanking, Puzzle } from '@/types/puzzle';

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

  // 1. 초기 마운트 시 퍼즐 메타데이터 로드 및 게임 시작/이어하기 분기
  useEffect(() => {
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

        if (isResume) {
          // 이어하기 시 로컬 IndexedDB에서 상태 복원
          const saved = await loadPuzzleState(puzzleId);
          if (saved) {
            initializePuzzle(puzzleId, res.data.imageUrl, saved.difficulty);
            resumePuzzle({
              difficulty: saved.difficulty,
              timerSeconds: saved.timerSeconds,
              board: saved.board || Array(totalPieces).fill(null),
              trayPieces: saved.trayPieces || saved.pieces.map((p: any) => p.id),
              startedAt: saved.startedAt,
              completed: saved.completed,
            });
          } else {
            initializePuzzle(puzzleId, res.data.imageUrl, diffParam);
          }
        } else {
          // 새로하기
          initializePuzzle(puzzleId, res.data.imageUrl, diffParam);
        }

        // 로그인된 상태이고 이번주 퍼즐을 Beginner 난이도로 플레이 시 보안 챌린지 시작 (랭킹 모드)
        const isCurrentPuzzle = !res.data.archived;
        if (token && diffParam === 'beginner' && isCurrentPuzzle) {
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

    // 조각 배치 현황 계산
    const placedCount = board.filter((cell) => cell !== null).length;
    const progress = Math.round((placedCount / totalPieces) * 100);

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

    // IndexedDB 로컬 자동 저장
    savePuzzleState(puzzleId, {
      difficulty,
      timerSeconds,
      pieces: piecesData as any,
      board,
      trayPieces,
      progress,
      completed: isCompleted,
      startedAt: startedAt || new Date().toISOString(),
    });

    // 로그인된 상태 시 서버 진행률 자동 업로드
    if (token) {
      saveProgressApi(puzzleId, progress, token).catch(console.error);
    }
  }, [board, timerSeconds, puzzleId, totalPieces, difficulty, isCompleted, startedAt, isPageLoading, token]);

  // 4. 모드 판정
  const gridSize = difficulty === 'beginner' ? 10 : 16;
  const placedCount = board.filter((cell) => cell !== null).length;
  const progressPercent = Math.round((placedCount / totalPieces) * 100);

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
      // 슬롯 클릭 시 이미 조각이 배치되어 있으면 빼내기
      removePiece(slotIdx);
    } else if (selectedTrayPiece !== null) {
      // 선택한 트레이 조각을 클릭한 슬롯에 배치
      placePiece(slotIdx, selectedTrayPiece);
    }
  };

  const handlePieceSelect = (pieceId: number) => {
    selectTrayPiece(pieceId);
  };

  const handleShuffle = () => {
    if (window.confirm('정말로 판을 엎고 처음부터 조각을 다시 섞으시겠습니까? 🧘')) {
      shufflePieces();
    }
  };

  const handleSaveManual = async () => {
    // 수동 저장 트리거 시 알림
    alert('게임 진행상황이 로컬 디스크 및 클라우드 서버에 안전하게 자동 저장되었습니다. 💾');
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
      const mode = !puzzle.archived && difficulty === 'beginner' ? 'ranked' : 'solo';
      
      const res = await submitResult({
        puzzleId,
        mode,
        difficulty,
        challengeToken: challengeToken || 'no-challenge-token',
        startedAt: startedAt || new Date().toISOString(),
        completedAt: new Date().toISOString(),
        completionTime: timerSeconds,
      }, token);

      if (res.success) {
        setIsSaved(true);
        // 저장 성공 시 내 등수 즉시 업데이트
        const rankingRes = await fetchMyRanking(puzzleId, token);
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
      if (Kakao && Kakao.isInitialized && Kakao.isInitialized() && puzzle) {
        Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: `🧩 하루퍼즐 완주 성공! - ${puzzle.title}`,
            description: `와우! 제가 ${formatTime(timerSeconds)}만에 퍼즐을 완주했어요! 랭킹에 도전해 보세요!`,
            imageUrl: puzzle.imageUrl,
            link: {
              mobileWebUrl: window.location.origin + '/puzzle',
              webUrl: window.location.origin + '/puzzle',
            },
          },
          buttons: [
            {
              title: '나도 도전하기',
              link: {
                mobileWebUrl: window.location.origin + '/puzzle',
                webUrl: window.location.origin + '/puzzle',
              },
            },
          ],
        });
        return;
      }
      navigator.clipboard.writeText(window.location.origin + '/puzzle');
      alert('공유용 하루퍼즐 링크가 성공적으로 클립보드에 복사되었습니다! 💙');
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
    <div className="flex flex-col min-h-screen select-none" style={{ backgroundColor: 'var(--puzzle-background)' }}>
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
            {difficulty === 'beginner' ? 'Beginner (100조각 · 🏆)' : 'Expert (256조각 · 🧘)'}
          </span>
        </div>

        {/* Timer and Progress display */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm font-bold" style={{ color: 'var(--puzzle-card-foreground)' }}>
            <Timer size={14} style={{ color: 'var(--puzzle-primary)' }} />
            <span className="tabular-nums">{formatTime(timerSeconds)}</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold" style={{ color: 'var(--puzzle-primary)' }}>
            <Percent size={14} />
            <span className="tabular-nums">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Play Canvas / Board Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
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
      <div className="p-4 flex flex-col gap-4 mt-auto">
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
        />
      )}
    </div>
  );
}
