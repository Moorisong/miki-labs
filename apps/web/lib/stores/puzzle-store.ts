import { create } from 'zustand';

export interface PuzzlePiece {
  id: number;
  correctIndex: number;
}

export interface PuzzleState {
  // 상태
  activePuzzleId: string | null;
  activePuzzleImage: string | null;
  difficulty: 'beginner' | 'expert';
  mode: 'ranked' | 'solo';
  totalPieces: number;
  board: (number | null)[];
  trayPieces: number[];
  selectedTrayPiece: number | null;
  timerSeconds: number;
  isTimerRunning: boolean;
  isCompleted: boolean;
  startedAt: string | null;
  challengeToken: string | null;

  // 액션
  initializePuzzle: (puzzleId: string, imgUrl: string, diff: 'beginner' | 'expert', mode: 'ranked' | 'solo') => void;
  resumePuzzle: (state: {
    difficulty: 'beginner' | 'expert';
    mode: 'ranked' | 'solo';
    timerSeconds: number;
    board: (number | null)[];
    trayPieces: number[];
    startedAt: string;
    completed: boolean;
  }) => void;
  selectTrayPiece: (pieceId: number | null) => void;
  placePiece: (slotIndex: number, pieceId: number) => void;
  removePiece: (slotIndex: number) => void;
  swapPieces: (slotIndex: number, pieceId: number) => void;
  pickUpPiece: (slotIndex: number) => void;
  shufflePieces: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  tickTimer: () => void;
  setCompleted: (completed: boolean) => void;
  setChallengeToken: (token: string | null) => void;
  resetPuzzle: () => void;
}

// 피셔-예이츠 셔플 헬퍼
const shuffle = (array: number[]): number[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const usePuzzleStore = create<PuzzleState>((set, get) => ({
  // 초기 상태
  activePuzzleId: null,
  activePuzzleImage: null,
  difficulty: 'beginner',
  mode: 'solo',
  totalPieces: 100,
  board: [],
  trayPieces: [],
  selectedTrayPiece: null,
  timerSeconds: 0,
  isTimerRunning: false,
  isCompleted: false,
  startedAt: null,
  challengeToken: null,

  initializePuzzle: (puzzleId, imgUrl, diff, mode) => {
    const total = diff === 'beginner' ? 100 : 256;
    const pieces = Array.from({ length: total }, (_, i) => i);
    const shuffledTray = shuffle(pieces);

    set({
      activePuzzleId: puzzleId,
      activePuzzleImage: imgUrl,
      difficulty: diff,
      mode: mode,
      totalPieces: total,
      board: Array(total).fill(null),
      trayPieces: shuffledTray,
      selectedTrayPiece: null,
      timerSeconds: 0,
      isTimerRunning: true, // 초기화 후 바로 타이머 가동
      isCompleted: false,
      startedAt: new Date().toISOString(),
      challengeToken: null,
    });
  },

  resumePuzzle: (savedState) => {
    const total = savedState.difficulty === 'beginner' ? 100 : 256;
    set({
      difficulty: savedState.difficulty,
      mode: savedState.mode,
      totalPieces: total,
      timerSeconds: savedState.timerSeconds,
      board: savedState.board,
      trayPieces: savedState.trayPieces,
      startedAt: savedState.startedAt,
      isCompleted: savedState.completed,
      isTimerRunning: !savedState.completed,
      selectedTrayPiece: null,
    });
  },

  selectTrayPiece: (pieceId) => {
    set((state) => {
      const currentSelected = state.selectedTrayPiece;
      const nextTray = [...state.trayPieces];

      // 만약 현재 들고 있던 조각이 있고, 그 조각이 트레이에 없는 상태라면 (보드에서 가져온 경우)
      // 새로운 조각을 선택하거나 해제할 때 기존 조각을 트레이로 돌려보냄
      if (currentSelected !== null && !state.trayPieces.includes(currentSelected)) {
        nextTray.push(currentSelected);
      }

      const isDeselect = currentSelected === pieceId;
      return {
        trayPieces: nextTray,
        selectedTrayPiece: isDeselect ? null : pieceId,
      };
    });
  },

  placePiece: (slotIndex, pieceId) => {
    set((state) => {
      const nextBoard = [...state.board];
      const prevPieceInSlot = nextBoard[slotIndex];

      // 슬롯에 기존 조각이 있었다면 트레이로 돌려보냄
      let nextTray = [...state.trayPieces];
      if (prevPieceInSlot !== null) {
        nextTray.push(prevPieceInSlot);
      }

      // 새 조각을 보드에 배치하고 트레이에서 제거
      nextBoard[slotIndex] = pieceId;
      nextTray = nextTray.filter((id) => id !== pieceId);

      // 전체가 알맞은 슬롯에 끼워졌는지 검증 (id와 slotIndex 매칭)
      const isComplete = nextBoard.every((val, idx) => val === idx);

      return {
        board: nextBoard,
        trayPieces: nextTray,
        selectedTrayPiece: null,
        isCompleted: isComplete,
        isTimerRunning: isComplete ? false : state.isTimerRunning,
      };
    });
  },

  removePiece: (slotIndex) => {
    set((state) => {
      const nextBoard = [...state.board];
      const pieceId = nextBoard[slotIndex];

      if (pieceId === null) return {};

      const nextTray = [...state.trayPieces, pieceId];
      nextBoard[slotIndex] = null;

      return {
        board: nextBoard,
        trayPieces: nextTray,
        selectedTrayPiece: null,
      };
    });
  },

  swapPieces: (slotIndex, pieceId) => {
    set((state) => {
      const nextBoard = [...state.board];
      const prevPieceInSlot = nextBoard[slotIndex];

      // 만약 들고 있던 조각이 트레이에 있었다면 트레이에서 제거
      const nextTray = state.trayPieces.filter((id) => id !== pieceId);

      // 새 조각을 보드에 배치
      nextBoard[slotIndex] = pieceId;

      // 전체 완료 여부 검증
      const isComplete = nextBoard.every((val, idx) => val === idx);

      return {
        board: nextBoard,
        trayPieces: nextTray,
        selectedTrayPiece: prevPieceInSlot, // 원래 있던 조각을 이제 들게 됨
        isCompleted: isComplete,
        isTimerRunning: isComplete ? false : state.isTimerRunning,
      };
    });
  },

  pickUpPiece: (slotIndex) => {
    set((state) => {
      const nextBoard = [...state.board];
      const pieceId = nextBoard[slotIndex];

      if (pieceId === null) return {};

      nextBoard[slotIndex] = null;

      return {
        board: nextBoard,
        selectedTrayPiece: pieceId,
      };
    });
  },

  shufflePieces: () => {
    set((state) => {
      const total = state.totalPieces;
      const allPieces = Array.from({ length: total }, (_, i) => i);
      const shuffled = shuffle(allPieces);

      return {
        board: Array(total).fill(null),
        trayPieces: shuffled,
        selectedTrayPiece: null,
        isCompleted: false,
      };
    });
  },

  startTimer: () => set({ isTimerRunning: true }),
  stopTimer: () => set({ isTimerRunning: false }),
  tickTimer: () => set((state) => ({ 
    timerSeconds: state.isTimerRunning ? state.timerSeconds + 1 : state.timerSeconds 
  })),

  setCompleted: (completed) => set({ isCompleted: completed, isTimerRunning: !completed }),
  setChallengeToken: (token) => set({ challengeToken: token }),

  resetPuzzle: () => set({
    activePuzzleId: null,
    activePuzzleImage: null,
    difficulty: 'beginner',
    mode: 'solo',
    board: [],
    trayPieces: [],
    selectedTrayPiece: null,
    timerSeconds: 0,
    isTimerRunning: false,
    isCompleted: false,
    startedAt: null,
    challengeToken: null,
  }),
}));
