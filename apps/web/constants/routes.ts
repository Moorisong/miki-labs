/**
 * 라우트 경로 상수
 * 2회 이상 사용되는 라우트 경로는 반드시 여기서 관리
 */

export const ROUTES = {
    HOME: '/',
    CLAW_HOME: '/claw',
    GAME: '/claw/game',
    RANKING: '/claw/ranking',
    LOGIN: '/login',
    MYPAGE: '/mypage',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
