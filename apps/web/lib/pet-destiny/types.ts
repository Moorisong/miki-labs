// 오행 (Five Elements)
export type Element = '목' | '화' | '토' | '금' | '수';

export interface ElementInfo {
    name: Element;
    color: string;
    emoji: string;
    season: string;
    trait: string;
}

export const ELEMENTS: Record<Element, ElementInfo> = {
    '목': { name: '목', color: '#10b981', emoji: '🌳', season: '봄', trait: '성장' },
    '화': { name: '화', color: '#ef4444', emoji: '🔥', season: '여름', trait: '열정' },
    '토': { name: '토', color: '#f59e0b', emoji: '🏔️', season: '환절기', trait: '안정' },
    '금': { name: '금', color: '#f3f4f6', emoji: '⚡', season: '가을', trait: '강인함' },
    '수': { name: '수', color: '#3b82f6', emoji: '💧', season: '겨울', trait: '지혜' },
};

// API 요청 타입
export interface PetDestinyRequest {
    ownerBirth: string;
    petBirth: string;
    petType: 'cat' | 'dog' | 'other';
}

// API 응답 타입
export interface PetDestinyResponse {
    success: boolean;
    data?: PetDestinyResult;
    error?: {
        code: string;
        message: string;
    };
}

export interface PetDestinyResult {
    summary: string;
    shareText: string;
    compatibility: number;
    compatibilityLabel: string;
    personality: {
        mainTrait: string;
        subTraits: string[];
        description: string;
        detailedDescription: string;
        element: Element;
        elementInfo: ElementInfo;
    };
    health: {
        level: string;
        score: number;
        advice: string;
    };
    mind: {
        level: number;
        description: string;
    };
    lifetimeFlow: Array<{ age: string; fortune: string; level: number }>;
    yearFortune: {
        overall: string;
        love: string;
        health: string;
        wealth: string;
        lucky: string;
        label: string;
    };
    yearFortuneLabel: string;
    petElement: Element;
    ownerElement: Element;
}

// 입력 폼 데이터 타입
export interface InputFormData {
    petType: string;
    otherPetType: string;
    petBirthDate: string;
    ownerBirthDate: string;
    petName: string;
    ownerName: string;
}
