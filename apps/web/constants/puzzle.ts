export const API_PUZZLE = {
  CURRENT: '/puzzle/current',
  ARCHIVE: '/puzzle/archive',
  DETAILS: (id: string) => `/puzzle/${id}`,
  RANKINGS_CURRENT: '/puzzle/rankings/current',
  RANKINGS_ME: '/puzzle/rankings/me',
  CHALLENGE_START: '/puzzle/challenge/start',
  RESULTS: '/puzzle/results',
  PROGRESS: '/puzzle/progress',
} as const;

export const ROUTE_PUZZLE = {
  HOME: '/puzzle',
  PLAY: (id: string) => `/puzzle/play/${id}`,
  RANKING: '/puzzle/ranking',
  ARCHIVE: '/puzzle/archive',
  MYPAGE: '/puzzle/mypage',
} as const;

export const PUZZLE_CONFIG = {
  DEBOUNCE_TIME: 2000, // IndexedDB 및 서버 진행률 백업 딜레이 (2초)
  SNAP_DISTANCE: 20,    // 격자 자석 스냅 거리 (픽셀)
  ZOOM: {
    MIN: 0.5,
    MAX: 3.0,
  },
  MIN_TIME_LIMIT_SEC: 30, // 최소 완성 소요 시간 (치팅 차단 임계값)
} as const;
