/**
 * 메시지 상수
 * 반복 사용되는 UI 텍스트 관리
 */

export const MESSAGES = {
    // 로그인 관련
    AUTH: {
        LOGIN: '로그인',
        LOGOUT: '로그아웃',
        KAKAO_LOGIN: '카카오 로그인',
        WELCOME: '하루상자에 오신 것을 환영합니다',
        TERMS_NOTICE: '로그인 시 서비스 이용약관에 동의하게 됩니다',
        LOADING: '로딩 중...',
        NO_NICKNAME: '닉네임 미설정',
    },

    // CTA
    CTA: {
        START_NOW: '지금 바로 시작하기',
        CHALLENGE_NOW: '지금 바로 도전하세요!',
    },

    // 에러/네트워크
    ERROR: {
        NETWORK: '네트워크 오류',
        API_GET_ERROR: 'API GET Error:',
        API_POST_ERROR: 'API POST Error:',
    },

    // 메타 정보
    META: {
        SITE_NAME: '하루상자',
        TITLE: '하루상자 | 즐거움이 가득한 일일 콘텐츠 플랫폼',
        DESCRIPTION: '하루상자는 다양한 미니콘텐츠를 즐길 수 있는 웹 플랫폼입니다.',
        OG_DESCRIPTION: '하루상자는 다양한 미니콘텐츠를 즐길 수 있는 웹 플랫폼입니다.',
    },
} as const;

// 네비게이션 링크
export const NAV_LINKS = [
    { href: '/toby', label: 'TOBY', newTab: true },
    { href: '/htsm', label: '자아탐험' },
    { href: 'https://r-paper-web.haroo.site/', label: '롤링페이퍼', newTab: true },
] as const;

