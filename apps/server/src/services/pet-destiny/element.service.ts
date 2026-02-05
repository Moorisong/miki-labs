import { Element, HeavenlyStem, calculateHeavenlyStem } from './zodiac.service';

// 천간 → 오행 변환 매핑
const STEM_TO_ELEMENT: Record<HeavenlyStem, Element> = {
    '갑': '목', '을': '목',
    '병': '화', '정': '화',
    '무': '토', '기': '토',
    '경': '금', '신': '금',
    '임': '수', '계': '수'
};

// 오행 정보
export const ELEMENT_INFO: Record<Element, {
    emoji: string;
    color: string;
    season: string;
    trait: string;
}> = {
    '목': { emoji: '🌳', color: '#10b981', season: '봄', trait: '성장' },
    '화': { emoji: '🔥', color: '#ef4444', season: '여름', trait: '열정' },
    '토': { emoji: '🏔️', color: '#f59e0b', season: '환절기', trait: '안정' },
    '금': { emoji: '⚡', color: '#f3f4f6', season: '가을', trait: '강인함' },
    '수': { emoji: '💧', color: '#3b82f6', season: '겨울', trait: '지혜' }
};

// 오행 순환 순서 (상생 관계)
export const ELEMENT_CYCLE: Element[] = ['목', '화', '토', '금', '수'];

/**
 * 천간으로부터 오행 계산
 * @param stem 천간
 * @returns 오행
 */
export function stemToElement(stem: HeavenlyStem): Element {
    return STEM_TO_ELEMENT[stem];
}

/**
 * 연도로부터 오행 계산
 * @param year 연도 (YYYY)
 * @returns 오행
 */
export function calculateElement(year: number): Element {
    const stem = calculateHeavenlyStem(year);
    return stemToElement(stem);
}

/**
 * 생년월일 문자열로부터 오행 계산
 * @param birthDate 생년월일 (YYYY-MM-DD)
 * @returns 오행
 */
export function calculateElementFromDate(birthDate: string): Element {
    const year = new Date(birthDate).getFullYear();
    return calculateElement(year);
}

/**
 * 두 오행의 관계 계산
 * @param element1 첫 번째 오행
 * @param element2 두 번째 오행
 * @returns 관계 타입
 */
export function getElementRelation(
    element1: Element,
    element2: Element
): '상생' | '상극' | '같음' | '중립' {
    if (element1 === element2) return '같음';

    const idx1 = ELEMENT_CYCLE.indexOf(element1);
    const idx2 = ELEMENT_CYCLE.indexOf(element2);

    // 상생: element1이 element2를 생성 (순환 순서에서 다음)
    if ((idx1 + 1) % 5 === idx2) return '상생';

    // 상극: element1이 element2를 극함 (2칸 건너뛴 관계)
    if ((idx1 + 2) % 5 === idx2) return '상극';

    return '중립';
}

/**
 * 올해 오행 계산
 * @returns 올해의 오행
 */
export function getCurrentYearElement(): Element {
    const currentYear = new Date().getFullYear();
    return calculateElement(currentYear);
}
