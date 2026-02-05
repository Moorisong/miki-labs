// 타입 정의
export type Element = '목' | '화' | '토' | '금' | '수';

// 띠 순서: 쥐 소 호랑이 토끼 용 뱀 말 양 원숭이 닭 개 돼지
export const ZODIAC_ANIMALS = [
    '쥐', '소', '호랑이', '토끼', '용', '뱀',
    '말', '양', '원숭이', '닭', '개', '돼지'
] as const;

// 천간 순서: 갑 을 병 정 무 기 경 신 임 계
export const HEAVENLY_STEMS = [
    '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'
] as const;

export type ZodiacAnimal = typeof ZODIAC_ANIMALS[number];
export type HeavenlyStem = typeof HEAVENLY_STEMS[number];

/**
 * 연도로부터 띠 계산
 * @param year 연도 (YYYY)
 * @returns 띠 이름
 */
export function calculateZodiac(year: number): ZodiacAnimal {
    // animalIndex = (year - 4) % 12
    const index = ((year - 4) % 12 + 12) % 12;
    return ZODIAC_ANIMALS[index];
}

/**
 * 연도로부터 천간 계산
 * @param year 연도 (YYYY)
 * @returns 천간
 */
export function calculateHeavenlyStem(year: number): HeavenlyStem {
    // stemIndex = (year - 4) % 10
    const index = ((year - 4) % 10 + 10) % 10;
    return HEAVENLY_STEMS[index];
}
