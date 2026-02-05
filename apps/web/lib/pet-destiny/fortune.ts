import { Element, ELEMENTS, PetDestinyResult } from './types';

/**
 * 생년월일로부터 오행 계산 (클라이언트 사이드 폴백용)
 */
export function calculateElement(birthDate: string): Element {
    const date = new Date(birthDate);
    const year = date.getFullYear();

    // 천간지지 기반 간단한 계산 (년도 끝자리)
    const yearMod = year % 10;

    if (yearMod === 0 || yearMod === 1) return '금';
    if (yearMod === 2 || yearMod === 3) return '수';
    if (yearMod === 4 || yearMod === 5) return '목';
    if (yearMod === 6 || yearMod === 7) return '화';
    return '토';
}

/**
 * 오행 상생상극 관계
 */
export function getElementRelation(element1: Element, element2: Element): {
    type: '상생' | '상극' | '같음' | '중립';
    score: number;
} {
    if (element1 === element2) {
        return { type: '같음', score: 85 };
    }

    const relations: Record<Element, { 상생: Element; 상극: Element }> = {
        '목': { 상생: '화', 상극: '토' },
        '화': { 상생: '토', 상극: '금' },
        '토': { 상생: '금', 상극: '수' },
        '금': { 상생: '수', 상극: '목' },
        '수': { 상생: '목', 상극: '화' },
    };

    if (relations[element1].상생 === element2) {
        return { type: '상생', score: 95 };
    }
    if (relations[element1].상극 === element2) {
        return { type: '상극', score: 60 };
    }

    return { type: '중립', score: 75 };
}

/**
 * 데이터 인코딩 (URL용)
 */
export function encodeResultData(data: {
    petType: string;
    petBirthDate: string;
    ownerBirthDate: string;
    petName: string;
    ownerName: string;
}): string {
    return btoa(encodeURIComponent(JSON.stringify(data)));
}

/**
 * 데이터 디코딩 (URL에서)
 */
export function decodeResultData(seed: string): {
    petType: string;
    petBirthDate: string;
    ownerBirthDate: string;
    petName: string;
    ownerName: string;
} | null {
    try {
        const decoded = decodeURIComponent(atob(decodeURIComponent(seed)));
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

/**
 * 나이 계산
 */
export function calculateAge(birthDate: string): string {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age >= 0 ? `(${age}살)` : '';
}

export { ELEMENTS };
