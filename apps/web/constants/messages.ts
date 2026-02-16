/**
 * 메시지 상수
 * 반복 사용되는 UI 텍스트 관리
 */

export const MESSAGES = {
    // 게임 관련
    GAME: {
        START: 'Game Start',
        RESTART: '다시 도전!',
        GAME_OVER: '게임 종료!',
        FINAL_SCORE: '최종 점수',
        COOLDOWN: '쿨타임 중...',
        REMAINING_ATTEMPTS: '남은 시도',
        LAST_CHANCE_WARNING: '마지막 기회예요! 성공하면 +1회!',
        SUCCESS_BONUS: '성공하면 +1회!',
    },

    // 로그인 관련
    AUTH: {
        LOGIN: '로그인',
        LOGOUT: '로그아웃',
        KAKAO_LOGIN: '카카오 로그인',
        WELCOME: '하루상자에 오신 것을 환영합니다',
        TERMS_NOTICE: '로그인 시 서비스 이용약관에 동의하게 됩니다',
        LOADING: '로딩 중...',
        NO_NICKNAME: '닉네임 미설정',
        LOGIN_PROMPT: '로그인 없이도 플레이할 수 있어요',
        LOGIN_BENEFIT: '로그인하면 기록을 랭킹에 저장할 수 있어요',
        LOGIN_CTA: '지금 로그인하고 랭킹에 도전하세요! →',
    },

    // 랭킹 관련
    RANKING: {
        TITLE: '랭킹',
        SUBTITLE: '전국 최고의 인형뽑기 마스터들을 확인하세요!',
        EMPTY: '아직 등록된 랭킹이 없습니다.',
        EMPTY_CTA: '첫 번째 랭킹의 주인공이 되어보세요!',
        VIEW_ALL: '전체 보기 →',
        PREV: '이전',
        NEXT: '다음',
    },

    // 테이블 헤더
    TABLE: {
        RANK: '순위',
        NICKNAME: '닉네임',
        SCORE: '점수',
        CATCHES: '성공',
        DATE: '날짜',
    },

    // CTA
    CTA: {
        START_NOW: '지금 바로 시작하기',
        CHALLENGE_NOW: '지금 바로 도전하세요!',
        FREE_PLAY: '무료로 즐기는 웹 인형뽑기, 당신의 실력을 보여주세요.',
        START_GAME: '게임 시작',
        PLAY_NOW: '지금 바로 플레이하세요!',
    },

    // 에러/네트워크
    ERROR: {
        NETWORK: '네트워크 오류',
        SCORE_SUBMIT_FAILED: '점수 저장에 실패했습니다.',
        API_GET_ERROR: 'API GET Error:',
        API_POST_ERROR: 'API POST Error:',
    },

    // 메타 정보
    META: {
        SITE_NAME: '하루상자',
        TITLE: '하루상자 | 리얼한 웹 인형뽑기 게임',
        DESCRIPTION: '리얼한 물리 엔진으로 즐기는 웹 인형뽑기 게임. 실제 인형뽑기의 손맛을 느껴보세요!',
        OG_DESCRIPTION: '리얼한 물리 엔진으로 즐기는 웹 인형뽑기 게임',
    },
} as const;

// 특징 목록 데이터
export const FEATURES = [
    {
        icon: '🎯',
        title: '리얼한 물리 엔진',
        description: '실제 인형뽑기처럼 정교한 물리 시뮬레이션으로 진짜 손맛을 느껴보세요.',
    },
    {
        icon: '🏆',
        title: '랭킹 시스템',
        description: '전국의 플레이어들과 점수를 겨루고 최고의 자리에 도전하세요.',
    },
    {
        icon: '🧸',
        title: '다양한 인형',
        description: '귀여운 동물부터 캐릭터까지, 다양한 인형들을 뽑아보세요.',
    },
] as const;

// 플레이 방법 데이터
export const HOW_TO_PLAY = [
    {
        step: 1,
        title: '시점 회전',
        description: 'PC에서는 마우스 드래그, 모바일에서는 터치 드래그로 시점을 회전하여 정확한 위치를 확인하세요.',
        icon: '🔄',
    },
    {
        step: 2,
        title: '위치 선정',
        description: '방향키 또는 화면 버튼으로 크레인을 원하는 위치로 이동시킵니다.',
        icon: '🕹️',
    },
    {
        step: 3,
        title: '크레인 하강',
        description: '하강 버튼을 누르면 크레인이 아래로 내려가 인형을 잡습니다.',
        icon: '⬇️',
    },
    {
        step: 4,
        title: '인형 획득',
        description: '인형을 성공적으로 잡아 출구까지 옮기면 점수를 획득합니다!',
        icon: '🎉',
    },
] as const;

// 네비게이션 링크
export const NAV_LINKS = [
    { href: '/claw', label: '인형뽑기' },
    { href: 'https://r-paper-web.haroo.site/', label: '롤링페이퍼' },
    { href: '/pet-destiny', label: '운명연구소' },
    { href: '/htsm', label: '자아탐험' },
] as const;

// 메달 이모지
export const MEDALS: Record<number, string> = {
    1: '🥇',
    2: '🥈',
    3: '🥉',
};
