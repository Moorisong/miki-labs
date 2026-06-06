'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import PuzzleBoard from '../puzzle-board';
import CompletionModal from '../completion-modal';
import CursorFollower from '../cursor-follower';

import LandscapeToolbar, { InteractionMode } from './landscape-toolbar';
import GuideImagePanel from './guide-image-panel';
import PuzzlePanelWrapper from './puzzle-panel-wrapper';
import LandscapeTrayPanel from './landscape-tray-panel';

import { Puzzle, MyRanking } from '@/types/puzzle';

interface Position {
  x: number;
  y: number;
}

interface LandscapeState {
  guidePosition: Position;
  guideSize: number;
  boardPosition: Position;
  boardSize: number;
  interactionMode: InteractionMode;
}

interface LandscapePuzzleLayoutProps {
  puzzle: Puzzle;
  puzzleId: string;
  difficulty: 'novice' | 'beginner' | 'expert';
  board: (number | null)[];
  trayPieces: number[];
  selectedTrayPiece: number | null;
  timerSeconds: number;
  isCompleted: boolean;
  progressPercent: number;
  myRanking: MyRanking | null;
  isLoggedIn: boolean;
  isSubmitting: boolean;
  isSaved: boolean;
  submitError: string | null;
  manualSaveStatus: 'idle' | 'saving' | 'saved';
  zoom: number;
  isLarge: boolean;
  formatTime: (s: number) => string;
  onCellClick: (slotIdx: number) => void;
  onPieceSelect: (pieceId: number) => void;
  onTrayClick: () => void;
  onShuffle: () => void;
  onSaveManual: () => void;
  onSaveRecord: () => void;
  onShare: () => void;
  onGoHome: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  selectTrayPiece: (id: number | null) => void;
}

const LANDSCAPE_STATE_KEY = 'puzzle-landscape-state-v2-';

function loadLandscapeState(puzzleId: string): Partial<LandscapeState> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LANDSCAPE_STATE_KEY + puzzleId);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function saveLandscapeState(puzzleId: string, state: LandscapeState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LANDSCAPE_STATE_KEY + puzzleId, JSON.stringify(state));
  } catch (e) {}
}

export default function LandscapePuzzleLayout({
  puzzle,
  puzzleId,
  difficulty,
  board,
  trayPieces,
  selectedTrayPiece,
  timerSeconds,
  isCompleted,
  progressPercent,
  myRanking,
  isLoggedIn,
  isSubmitting,
  isSaved,
  submitError,
  manualSaveStatus,
  zoom,
  isLarge,
  formatTime,
  onCellClick,
  onPieceSelect,
  onTrayClick,
  onShuffle,
  onSaveManual,
  onSaveRecord,
  onShare,
  onGoHome,
  onZoomIn,
  onZoomOut,
  selectTrayPiece,
}: LandscapePuzzleLayoutProps) {
  const router = useRouter();
  const canvasAreaRef = useRef<HTMLDivElement>(null);

  // ── 가로모드 레이아웃 상태 ──
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('play');
  const [guidePosition, setGuidePosition] = useState<Position>({ x: 0, y: 0 });
  const [guideSize, setGuideSize] = useState<number>(320);
  const [boardPosition, setBoardPosition] = useState<Position>({ x: 0, y: 0 });
  const [boardSize, setBoardSize] = useState<number>(320);

  // 캔버스 영역 크기 → Guide / Puzzle 초기 크기 계산
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // 초기 배치 계산 여부
  const initializedRef = useRef(false);

  // ── 캔버스 영역 크기 측정 ──
  useEffect(() => {
    const measure = () => {
      if (!canvasAreaRef.current) return;
      const rect = canvasAreaRef.current.getBoundingClientRect();
      setCanvasSize({ width: rect.width, height: rect.height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (canvasAreaRef.current) observer.observe(canvasAreaRef.current);
    return () => observer.disconnect();
  }, []);

  // ── LocalStorage에서 이전 landscapeState 복원 ──
  useEffect(() => {
    if (initializedRef.current || canvasSize.width === 0) return;
    const saved = loadLandscapeState(puzzleId);

    if (saved && saved.guidePosition && (saved.guidePosition.x !== 0 || saved.guidePosition.y !== 0)) {
      if (saved.guidePosition) setGuidePosition(saved.guidePosition);
      if (saved.guideSize !== undefined) setGuideSize(saved.guideSize);
      if (saved.boardPosition) setBoardPosition(saved.boardPosition);
      if (saved.boardSize !== undefined) setBoardSize(saved.boardSize);
      if (saved.interactionMode) setInteractionMode(saved.interactionMode);
    } else {
      // 초기 배치: Guide와 Puzzle을 나란히 배치 (크기 일치 & 세로 정렬)
      const trayWidth = isLarge ? 360 : 250; // 확장된 보관함 폭에 맞게 차감 크기 상향 조정
      const availableWidth = canvasSize.width - trayWidth;
      const panelGap = 32; // 가로 간격
      
      // 세로 높이 한계치 측정 (헤더 여백 제외, 최소 48px 이상의 안전 상하 마진 확보)
      const maxAllowedHeight = Math.max(160, canvasSize.height - 80);

      // 1. 가로폭 기준 크기 (가로 가용 영역의 절반)
      const widthBasedSize = Math.floor((availableWidth - panelGap * 3) / 2);

      // 2. 가로/세로 중 제약을 더 강하게 받는 쪽에 맞춰 동일 크기(1:1 비율) 배정
      const defaultPanelSize = Math.max(160, Math.min(400, widthBasedSize, maxAllowedHeight));

      // 세로 중앙 정렬을 위한 Y 좌표 구하기 (패널 크기에 맞춰 안전하게 계산)
      const topY = Math.max(20, Math.floor((canvasSize.height - defaultPanelSize) / 2));

      // 가이드 이미지 X 좌표 계산 (충분한 간격을 두어 나란히)
      const guideX = Math.floor((availableWidth - (defaultPanelSize * 2 + panelGap)) / 2) - 16;
      const boardX = guideX + defaultPanelSize + panelGap + 32; // 보드를 오른쪽으로 조금 더 밀어줌

      const newGuidePos = { x: Math.max(16, guideX), y: topY };
      const newBoardPos = { x: Math.max(16 + defaultPanelSize + panelGap, boardX), y: topY };

      setGuidePosition(newGuidePos);
      setGuideSize(defaultPanelSize);
      setBoardPosition(newBoardPos);
      setBoardSize(defaultPanelSize);
    }
    // 렌더 한 사이클 딜레이하여 state가 실제로 DOM 및 localStorage에 쓰이기 전에 initialized가 완료되도록 보장
    setTimeout(() => {
      initializedRef.current = true;
    }, 100);
  }, [canvasSize, puzzleId, isLarge]);

  // ── landscapeState 저장 (변경 시마다) ──
  useEffect(() => {
    if (!initializedRef.current) return;
    // 임시 {0,0} 좌표가 localStorage에 덮어씌워지지 않도록 방어
    if (guidePosition.x === 0 && guidePosition.y === 0) return;
    saveLandscapeState(puzzleId, {
      guidePosition,
      guideSize,
      boardPosition,
      boardSize,
      interactionMode,
    });
  }, [guidePosition, guideSize, boardPosition, boardSize, interactionMode, puzzleId]);

  // ── 이동 모드 변경 시 선택된 조각 해제 ──
  const handleModeChange = useCallback(
    (mode: InteractionMode) => {
      setInteractionMode(mode);
      if (mode === 'move' && selectedTrayPiece !== null) {
        selectTrayPiece(null);
      }
    },
    [selectedTrayPiece, selectTrayPiece]
  );

  // ── 보드 클릭 (플레이 모드에서만) ──
  const handleCellClickGuarded = useCallback(
    (slotIdx: number) => {
      if (interactionMode !== 'play') return;
      onCellClick(slotIdx);
    },
    [interactionMode, onCellClick]
  );

  // ── 조각 선택 (플레이 모드에서만) ──
  const handlePieceSelectGuarded = useCallback(
    (pieceId: number) => {
      if (interactionMode !== 'play') return;
      onPieceSelect(pieceId);
    },
    [interactionMode, onPieceSelect]
  );

  const difficultyLabel =
    difficulty === 'novice' ? '초보 (36조각)' : difficulty === 'beginner' ? '일반 (100조각)' : '고수 (256조각)';
  const gridSize = difficulty === 'novice' ? 6 : difficulty === 'beginner' ? 10 : 16;

  // boardSize에 비례하는 PuzzleBoard용 동적 zoom 계산
  const baseBoardInnerSize = gridSize * 40;
  const calculatedZoom = boardSize / baseBoardInnerSize;

  return (
    <div
      className="flex flex-col h-screen h-[100dvh] overflow-hidden select-none"
      style={{ backgroundColor: '#f3f4f6' }}
      onClick={() => {
        if (selectedTrayPiece !== null && interactionMode === 'play') {
          selectTrayPiece(null);
        }
      }}
    >
      {/* ── 상단 툴바 ── */}
      <LandscapeToolbar
        interactionMode={interactionMode}
        onModeChange={handleModeChange}
        zoom={calculatedZoom}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onShuffle={onShuffle}
        onSave={onSaveManual}
        saveStatus={manualSaveStatus}
        timerFormatted={formatTime(timerSeconds)}
        progressPercent={progressPercent}
        puzzleTitle={puzzle.title}
        difficulty={difficultyLabel}
      />

      {/* ── 뒤로가기 링크 (작은 영역) ── */}
      <div
        className="flex items-center px-4 py-1.5 border-b flex-shrink-0"
        style={{
          borderColor: 'rgba(0, 0, 0, 0.08)',
          backgroundColor: '#e5e7eb',
        }}
      >
        <Link
          href="/puzzle"
          className="flex items-center gap-1 text-xs font-semibold transition-colors text-black/60 hover:text-black"
        >
          <ArrowLeft size={13} strokeWidth={2.5} />
          <span>뒤로가기</span>
        </Link>

        {/* 이동 모드 안내 배지 */}
        {interactionMode === 'move' && (
          <span
            className="ml-3 px-2 py-0.5 rounded-full text-[9px] font-semibold animate-pulse bg-blue-500/10 text-blue-600"
          >
            📦 이동 모드 활성 — 마우스 드래그로 각 패널의 위치와 크기를 자유롭게 배치해보세요.
          </span>
        )}
      </div>

      {/* ── 메인 영역: [Guide | Puzzle Canvas] + [Tray] ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* 왼쪽 + 가운데: 자유 캔버스 영역 (Guide + Puzzle이 자유롭게 위치) */}
        <div
          ref={canvasAreaRef}
          className="relative flex-1 min-w-0 overflow-hidden select-none"
          style={{ touchAction: 'none' }} // 모바일/태블릿 터치 시 브라우저 스크롤 제스처 차단
          onClick={(e) => {
            if (selectedTrayPiece !== null && interactionMode === 'play') {
              selectTrayPiece(null);
            }
          }}
        >
          {canvasSize.width > 0 && (
            <>
              {/* Guide Image Panel */}
              <GuideImagePanel
                imageUrl={puzzle.imageUrl}
                initialSize={boardSize}
                isDraggable={interactionMode === 'move'}
                defaultPosition={guidePosition}
                defaultSize={guideSize}
                onPositionChange={setGuidePosition}
                onSizeChange={setGuideSize}
              />

              {/* Puzzle Panel Wrapper (기존 PuzzleBoard 래핑) */}
              <PuzzlePanelWrapper
                isDraggable={interactionMode === 'move'}
                position={boardPosition}
                onPositionChange={setBoardPosition}
                size={boardSize}
                onSizeChange={setBoardSize}
              >
                <div
                  className="w-full h-full border rounded-xl overflow-hidden transition-all duration-300"
                  style={{
                    borderColor: interactionMode === 'move' ? '#4f8ef7' : 'rgba(0, 0, 0, 0.08)',
                    backgroundColor: '#ffffff',
                    boxShadow: interactionMode === 'move'
                      ? '0 0 0 1px #4f8ef7, 0 8px 30px rgba(0,0,0,0.15)'
                      : '0 4px 24px rgba(0, 0, 0, 0.06)',
                    pointerEvents: interactionMode === 'move' ? 'none' : 'auto',
                    touchAction: 'none', // 모바일/태블릿 터치 이동 시 브라우저 스크롤 제스처 완전 차단
                  }}
                >
                  <div 
                    className="w-full h-full overflow-auto flex items-center justify-center p-2 scrollbar-hide"
                    style={{ touchAction: 'none' }}
                  >
                    <PuzzleBoard
                      board={board}
                      image={puzzle.imageUrl}
                      gridSize={gridSize}
                      zoom={calculatedZoom}
                      onCellClick={handleCellClickGuarded}
                      selectedPieceId={selectedTrayPiece}
                      difficulty={difficulty}
                    />
                  </div>
                </div>
              </PuzzlePanelWrapper>
            </>
          )}
        </div>

        {/* 오른쪽: 고정 조각 보관함 */}
        <LandscapeTrayPanel
          trayPieces={trayPieces}
          image={puzzle.imageUrl}
          gridSize={gridSize}
          selectedPieceId={selectedTrayPiece}
          onPieceClick={handlePieceSelectGuarded}
          onTrayClick={onTrayClick}
          isLarge={isLarge}
        />
      </div>

      {/* ── 완료 모달 ── */}
      {isCompleted && (
        <CompletionModal
          onClose={onGoHome}
          onGoHome={onGoHome}
          onSaveRecord={onSaveRecord}
          onShare={onShare}
          completionTimeFormatted={formatTime(timerSeconds)}
          myRanking={myRanking}
          isLoggedIn={isLoggedIn}
          isSaving={isSubmitting}
          isSaved={isSaved}
          errorMessage={submitError}
        />
      )}

      {/* ── 커서 조각 추적기 (플레이 모드에서만) ── */}
      {interactionMode === 'play' && (
        <CursorFollower
          selectedPieceId={selectedTrayPiece}
          image={puzzle.imageUrl}
          gridSize={gridSize}
        />
      )}
    </div>
  );
}

