import crypto from 'crypto';

/**
 * 입력값으로부터 결정적 시드 생성
 * @param ownerBirth 집사 생년월일
 * @param petBirth 반려동물 생년월일
 * @param petType 동물 종류
 * @returns 해시 기반 시드
 */
export function generateSeed(
    ownerBirth: string,
    petBirth: string,
    petType: string
): string {
    const input = `${ownerBirth}|${petBirth}|${petType}`;
    return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * 시드를 기반으로 배열에서 항목 선택
 * @param seed 시드 문자열
 * @param items 선택할 배열
 * @param offset 오프셋 (같은 시드에서 다른 선택을 위해)
 * @returns 선택된 항목
 */
export function selectBySeed<T>(
    seed: string,
    items: T[],
    offset: number = 0
): T {
    // 시드의 일부를 숫자로 변환
    const seedNum = parseInt(seed.substring(offset, offset + 8), 16);
    const index = seedNum % items.length;
    return items[index];
}

/**
 * 시드를 기반으로 범위 내 숫자 생성
 * @param seed 시드 문자열
 * @param min 최소값
 * @param max 최대값
 * @param offset 오프셋
 * @returns 범위 내 숫자
 */
export function getNumberBySeed(
    seed: string,
    min: number,
    max: number,
    offset: number = 0
): number {
    const seedNum = parseInt(seed.substring(offset, offset + 8), 16);
    return min + (seedNum % (max - min + 1));
}
