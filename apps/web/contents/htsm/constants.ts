/**
 * HTSM 콘텐츠 전용 상수
 * Johari Window 키워드 및 설정값
 */

export const HTSM_KEYWORDS = [
    'Creative',
    'Funny',
    'Kind',
    'Energetic',
    'Thoughtful',
    'Organized',
    'Adventurous',
    'Loyal',
    'Confident',
    'Empathetic',
    'Ambitious',
    'Calm',
    'Spontaneous',
    'Patient',
    'Optimistic',
    'Analytical',
    'Supportive',
    'Curious',
    'Reliable',
    'Friendly',
    'Independent',
    'Cheerful',
    'Humble',
    'Bold',
    'Caring',
    'Wise',
    'Playful',
    'Focused',
    'Honest',
    'Generous',
    'Passionate',
    'Practical',
    'Imaginative',
    'Determined',
    'Open-minded',
    'Compassionate',
    'Resilient',
    'Charismatic',
    'Gentle',
    'Articulate',
] as const;

export const HTSM_CONFIG = {
    MIN_KEYWORD_SELECTION: 3,
    MAX_KEYWORD_SELECTION: 5,
    MIN_FRIENDS_FOR_RESULT: 3,
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
    SHARE_TEXT: 'Help me discover how you see me! Pick 3 words that describe me.',
    SHARE_TITLE: 'How do you see me?',
} as const;
