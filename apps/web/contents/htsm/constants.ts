/**
 * HTSM 콘텐츠 전용 상수
 * Johari Window 키워드 및 설정값
 */

/** 카테고리별 키워드 분류 */
export type KeywordCategory = {
    id: string;
    emoji: string;
    gradientClass: string;
    keywords: readonly string[];
};

export const HTSM_KEYWORD_CATEGORIES: readonly KeywordCategory[] = [
    {
        id: 'positiveTraits',
        emoji: '✨',
        gradientClass: 'categoryPositive',
        keywords: [
            'Creative', 'Funny', 'Kind', 'Energetic', 'Thoughtful',
            'Organized', 'Adventurous', 'Loyal', 'Confident', 'Empathetic',
            'Ambitious', 'Calm', 'Optimistic', 'Reliable', 'Friendly',
        ],
    },
    {
        id: 'boldPersonality',
        emoji: '🔥',
        gradientClass: 'categoryBold',
        keywords: [
            'Stubborn', 'Impulsive', 'Overthinking', 'Moody', 'Blunt',
            'Perfectionist', 'Competitive', 'People-pleaser', 'Sarcastic', 'Forgetful',
            'Talkative', 'Expressive', 'Opinionated', 'Chill', 'Direct',
        ],
    },
    {
        id: 'innerSelf',
        emoji: '🌙',
        gradientClass: 'categoryInner',
        keywords: [
            'Lazy', 'Procrastinator', 'Messy', 'Sensitive', 'Shy',
            'Secretive', 'Rebellious', 'Emotional', 'Introverted', 'Extroverted',
            'Dreamer', 'Realist', 'Sentimental', 'Indecisive', 'Homebody',
        ],
    },
    {
        id: 'vibes',
        emoji: '⚡',
        gradientClass: 'categoryVibes',
        keywords: [
            'Night-owl', 'Clumsy', 'Free-spirited', 'Weirdly-lucky', 'Coffee-dependent',
            'Always-hungry', 'Sociable', 'Chic', 'Early-bird', 'Foodie',
            'Gamer', 'Geek', 'Gym-rat', 'Bookworm', 'Stylish',
        ],
    },
] as const;

/** 모든 키워드의 플랫 배열 (하위 호환성 유지) */
export const HTSM_KEYWORDS = HTSM_KEYWORD_CATEGORIES.flatMap(
    (cat) => [...cat.keywords]
);

export const HTSM_CONFIG = {
    MIN_KEYWORD_SELECTION: 3,
    MAX_KEYWORD_SELECTION: 5,
    MIN_FRIENDS_FOR_RESULT: 10,
    MAX_FRIENDS: 10,
} as const;

export const HTSM_STORAGE_KEY = {
    SELF_SELECTION: 'htsm_self_selection',
    SHARE_ID: 'htsm_share_id',
    FRIEND_ANSWERS: 'htsm_friend_answers',
} as const;

export const HTSM_MESSAGES = {
    KEYWORD_LIMIT: `최대 ${HTSM_CONFIG.MAX_KEYWORD_SELECTION}개까지 선택할 수 있어요.`,
    SUBMIT_SUCCESS: '감사합니다! 답변이 제출되었어요.',
    COPY_SUCCESS: '링크가 복사되었어요!',
    SHARE_TEXT: '내가 보는 나 vs 남들이 보는 나! 친구들이 생각하는 내 이미지는?',
    SHARE_TITLE: '나의 조하리의 창',
} as const;
