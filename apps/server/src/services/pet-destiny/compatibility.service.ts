import { Element } from './zodiac.service';
import {
    calculateElementFromDate,
    getElementRelation,
    getCurrentYearElement,
    ELEMENT_INFO
} from './element.service';
import { generateSeed, getNumberBySeed } from './seed.service';
import compatibilityData from '../../../data/compatibility.json';

interface CompatibilityResult {
    score: number;
    label: string;
    emoji: string;
    text: string;
    petElement: Element;
    ownerElement: Element;
    relationType: '상생' | '상극' | '같음' | '중립';
}

interface MindBarrierResult {
    level: number;
    description: string;
}

/**
 * 궁합 점수 계산
 * @param petBirth 반려동물 생년월일
 * @param ownerBirth 집사 생년월일
 * @returns 궁합 결과
 */
export function calculateCompatibility(
    petBirth: string,
    ownerBirth: string
): CompatibilityResult {
    const petElement = calculateElementFromDate(petBirth);
    const ownerElement = calculateElementFromDate(ownerBirth);
    const relationType = getElementRelation(petElement, ownerElement);

    // Seed 생성 (결과 편향 개선용)
    const seed = generateSeed(ownerBirth, petBirth, 'compatibility');

    // 기본 점수
    const scores = compatibilityData.scores as Record<string, number>;
    let baseScore = scores[relationType] || 75;

    // Seed 기반 가중치 변동 (-5 ~ +5)
    const seedAdjust = getNumberBySeed(seed, -5, 5, 0);

    // 날짜 차이를 고려한 미세 조정
    const petDate = new Date(petBirth);
    const ownerDate = new Date(ownerBirth);
    const monthDiff = Math.abs(petDate.getMonth() - ownerDate.getMonth());
    const dayAdjust = (monthDiff % 3) * 2;

    // 최종 점수 계산 (0~100 범위)
    const score = Math.max(0, Math.min(100, baseScore + dayAdjust + seedAdjust));

    // 라벨 결정
    const labels = compatibilityData.labels as Record<string, {
        min: number;
        max: number;
        emoji: string;
        text: string;
    }>;

    let labelInfo = { emoji: '💗', text: '서로를 이해하는 시간이 필요해요!' };
    for (const [key, value] of Object.entries(labels)) {
        if (score >= value.min && score <= value.max) {
            labelInfo = { emoji: value.emoji, text: value.text };
            break;
        }
    }

    return {
        score,
        label: labelInfo.text,
        emoji: labelInfo.emoji,
        text: labelInfo.text,
        petElement,
        ownerElement,
        relationType
    };
}

/**
 * 마음 경계 지수 계산
 * @param petBirth 반려동물 생년월일
 * @param ownerBirth 집사 생년월일
 * @returns 마음 경계 지수 결과
 */
export function calculateMindBarrier(
    petBirth: string,
    ownerBirth: string
): MindBarrierResult {
    const petElement = calculateElementFromDate(petBirth);
    const ownerElement = calculateElementFromDate(ownerBirth);
    const relationType = getElementRelation(petElement, ownerElement);

    const scores = compatibilityData.scores as Record<string, number>;
    const baseLevel = 100 - (scores[relationType] || 75);

    const descriptions = compatibilityData.mindBarrierDescriptions as Array<{
        max: number;
        text: string;
    }>;

    let description = descriptions[descriptions.length - 1].text;
    for (const item of descriptions) {
        if (baseLevel <= item.max) {
            description = item.text;
            break;
        }
    }

    return {
        level: Math.max(5, baseLevel),
        description
    };
}

/**
 * 올해 운세 라벨 계산
 * @param petBirth 반려동물 생년월일
 * @returns 올해 운세 관계 타입
 */
export function calculateYearFortuneRelation(
    petBirth: string
): '상생' | '상극' | '같음' | '중립' {
    const petElement = calculateElementFromDate(petBirth);
    const yearElement = getCurrentYearElement();
    return getElementRelation(petElement, yearElement);
}
