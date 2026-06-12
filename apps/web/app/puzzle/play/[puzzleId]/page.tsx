'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Timer, Eye } from 'lucide-react';
import Link from 'next/link';
import { usePuzzleStore } from '@/lib/stores/puzzle-store';
import PuzzleBoard from '@/components/puzzle/puzzle-board';
import PieceTray from '@/components/puzzle/piece-tray';
import FloatingToolbar from '@/components/puzzle/floating-toolbar';
import CompletionModal from '@/components/puzzle/completion-modal';
import CursorFollower from '@/components/puzzle/cursor-follower';
import KakaoAdfit, { ADFIT_SIZES, ADFIT_UNITS } from '@/components/ads/kakao-adfit';
import SyncChoiceModal from '@/components/puzzle/sync-choice-modal';
import { useOrientation } from '@/lib/hooks/use-orientation';
import LandscapePuzzleLayout from '@/components/puzzle/landscape/landscape-puzzle-layout';

import { usePuzzleSetup } from '../../hooks/use-puzzle-setup';
import { usePuzzleAutoSave } from '../../hooks/use-puzzle-autosave';
import { usePuzzleSubmit } from '../../hooks/use-puzzle-submit';

interface PlayPageProps {
  params: Promise<{ puzzleId: string }>;
}

export default function PlayPage({ params }: PlayPageProps) {
  const { puzzleId } = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.user?.kakaoId;

  const {
    activePuzzleId,
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
    selectTrayPiece,
    placePiece,
    pickUpPiece,
    swapPieces,
    shufflePieces,
    tickTimer,
  } = usePuzzleStore();

  const [zoom, setZoom] = useState(1.0);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    setZoom(1.0);
  }, [difficulty, puzzleId]);

  const { puzzle, isPageLoading, syncChoiceData, setSyncChoiceData, initializePuzzle, resumePuzzle } = usePuzzleSetup(puzzleId, token, status);

  usePuzzleAutoSave(
    puzzleId,
    token,
    board,
    trayPieces,
    timerSeconds,
    difficulty,
    mode,
    isCompleted,
    startedAt,
    isPageLoading,
    totalPieces
  );

  const {
    isSubmitting,
    isSaved,
    manualSaveStatus,
    submitError,
    myRanking,
    handleSaveManual,
    handleSaveRecord,
  } = usePuzzleSubmit(
    puzzleId,
    token,
    board,
    trayPieces,
    timerSeconds,
    difficulty,
    mode,
    isCompleted,
    startedAt,
    totalPieces,
    puzzle
  );

  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, tickTimer]);

  const gridSize = difficulty === 'novice' ? 6 : difficulty === 'beginner' ? 10 : 16;
  const correctCount = board.filter((cell, idx) => cell === idx).length;
  const progressPercent = Math.round((correctCount / totalPieces) * 100);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const handleCellClick = (slotIdx: number) => {
    if (isCompleted) return;

    const cellVal = board[slotIdx];
    if (cellVal !== null && cellVal === slotIdx) {
      return;
    }

    if (cellVal !== null) {
      if (selectedTrayPiece !== null) {
        swapPieces(slotIdx, selectedTrayPiece);
      } else {
        pickUpPiece(slotIdx);
      }
    } else if (selectedTrayPiece !== null) {
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

  const handleChooseKeepCurrent = async () => {
    if (!syncChoiceData || !token) return;
    const { localState } = syncChoiceData;
    const total = localState.difficulty === 'novice' ? 36 : localState.difficulty === 'expert' ? 256 : 100;

    initializePuzzle(puzzleId, puzzle!.imageUrl, localState.difficulty, localState.mode || 'ranked');
    resumePuzzle({
      difficulty: localState.difficulty,
      mode: localState.mode || 'ranked',
      timerSeconds: localState.timerSeconds,
      board: localState.board || Array(total).fill(null),
      trayPieces: localState.trayPieces || localState.pieces.map((p: any) => p.id),
      startedAt: new Date(Date.now() - localState.timerSeconds * 1000).toISOString(),
      completed: localState.completed,
    });

    setSyncChoiceData(null);
  };

  const handleChooseLoadServer = async () => {
    if (!syncChoiceData || !token) return;
    const { serverState } = syncChoiceData;
    const total = serverState.difficulty === 'novice' ? 36 : serverState.difficulty === 'expert' ? 256 : 100;
    const piecesData = serverState.board.map((pieceId: any, idx: number) => ({
      id: pieceId !== null ? pieceId : idx,
      correctX: 0,
      correctY: 0,
      currentX: 0,
      currentY: 0,
      width: 0,
      height: 0,
      locked: pieceId === idx,
    }));

    initializePuzzle(puzzleId, puzzle!.imageUrl, serverState.difficulty, serverState.mode || 'ranked');
    resumePuzzle({
      difficulty: serverState.difficulty,
      mode: serverState.mode || 'ranked',
      timerSeconds: serverState.timerSeconds,
      board: serverState.board || Array(total).fill(null),
      trayPieces: serverState.trayPieces || piecesData.map((p: any) => p.id),
      startedAt: new Date(Date.now() - serverState.timerSeconds * 1000).toISOString(),
      completed: false,
    });

    setSyncChoiceData(null);
  };

  const { isLandscape, isLargeScreen } = useOrientation();

  if (isPageLoading || !puzzle || activePuzzleId === null) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col gap-3 font-semibold select-none">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--puzzle-primary) var(--puzzle-primary) var(--puzzle-primary) transparent' }} />
        <span style={{ color: 'var(--puzzle-muted-foreground)' }}>캔버스 조각판을 세팅하는 중...</span>

        {syncChoiceData && (
          <SyncChoiceModal
            localProgress={syncChoiceData.localState.progress}
            localTimeFormatted={formatTime(syncChoiceData.localState.timerSeconds)}
            serverProgress={syncChoiceData.serverState.progress}
            serverTimeFormatted={formatTime(syncChoiceData.serverState.timerSeconds)}
            onChooseKeepCurrent={handleChooseKeepCurrent}
            onChooseLoadServer={handleChooseLoadServer}
          />
        )}
      </div>
    );
  }

  if (isLandscape) {
    return (
      <LandscapePuzzleLayout
        puzzle={puzzle}
        puzzleId={puzzleId}
        difficulty={difficulty}
        board={board}
        trayPieces={trayPieces}
        selectedTrayPiece={selectedTrayPiece}
        timerSeconds={timerSeconds}
        isCompleted={isCompleted}
        progressPercent={progressPercent}
        myRanking={myRanking}
        isLoggedIn={!!token}
        isSubmitting={isSubmitting}
        isSaved={isSaved}
        submitError={submitError}
        manualSaveStatus={manualSaveStatus}
        zoom={zoom}
        isLarge={isLargeScreen}
        formatTime={formatTime}
        onCellClick={handleCellClick}
        onPieceSelect={handlePieceSelect}
        onTrayClick={() => selectTrayPiece(null)}
        onShuffle={handleShuffle}
        onSaveManual={handleSaveManual}
        onSaveRecord={handleSaveRecord}
        onShare={handleShare}
        onGoHome={handleGoHome}
        onZoomIn={() => setZoom((z) => Math.min(2.2, z + 0.2))}
        onZoomOut={() => setZoom((z) => Math.max(0.6, z - 0.2))}
        selectTrayPiece={selectTrayPiece}
      />
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen select-none"
      style={{ backgroundColor: 'var(--puzzle-background)' }}
      onClick={() => {
        if (selectedTrayPiece !== null) {
          selectTrayPiece(null);
        }
      }}
    >
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
            {difficulty === 'novice' ? '초보 (36조각)' : difficulty === 'beginner' ? '일반 (100조각)' : '고수 (256조각)'} · 🏆 랭킹 도전
          </span>
        </div>

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

      <div 
        className="w-full flex-1 min-h-0 flex flex-col items-center justify-center p-4 relative overflow-hidden"
        onClick={() => {
          if (selectedTrayPiece !== null) {
            selectTrayPiece(null);
          }
        }}
      >
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
          difficulty={difficulty}
        />
      </div>

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
        />

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
          errorMessage={submitError}
        />
      )}

      <CursorFollower
        selectedPieceId={selectedTrayPiece}
        image={puzzle.imageUrl}
        gridSize={gridSize}
      />

      {syncChoiceData && (
        <SyncChoiceModal
          localProgress={syncChoiceData.localState.progress}
          localTimeFormatted={formatTime(syncChoiceData.localState.timerSeconds)}
          serverProgress={syncChoiceData.serverState.progress}
          serverTimeFormatted={formatTime(syncChoiceData.serverState.timerSeconds)}
          onChooseKeepCurrent={handleChooseKeepCurrent}
          onChooseLoadServer={handleChooseLoadServer}
        />
      )}
    </div>
  );
}
