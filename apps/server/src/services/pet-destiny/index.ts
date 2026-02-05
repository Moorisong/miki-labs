import { Element } from './zodiac.service';
import { calculateElementFromDate, getCurrentYearElement, ELEMENT_INFO } from './element.service';
import {
    calculateCompatibility,
    calculateMindBarrier,
    calculateYearFortuneRelation
} from './compatibility.service';
import { generateSeed } from './seed.service';

// JSON 데이터 임포트
import personalityData from '../../../data/personality.json';
import healthData from '../../../data/health.json';
import mindData from '../../../data/mind.json';
import fortuneData from '../../../data/fortune.json';

// 메모리 캐시 (24시간 TTL)
const cache = new Map<string, { data: PetDestinyResult; expires: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24시간

export interface PetDestinyRequest {
    ownerBirth: string;
    petBirth: string;
    petType: 'cat' | 'dog' | 'other';
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
        element: Element;
        elementInfo: typeof ELEMENT_INFO[Element];
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

/**
 * 반려동물 운세 계산
 */
export function calculatePetDestiny(request: PetDestinyRequest): PetDestinyResult {
    const { ownerBirth, petBirth, petType } = request;

    // 캐시 확인
    const cacheKey = generateSeed(ownerBirth, petBirth, petType);
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
        return cached.data;
    }

    // 오행 계산
    const petElement = calculateElementFromDate(petBirth);
    const ownerElement = calculateElementFromDate(ownerBirth);

    // 궁합 계산
    const compatibilityResult = calculateCompatibility(petBirth, ownerBirth);

    // 성격 분석
    const personalityInfo = (personalityData as Record<Element, {
        mainTrait: string;
        subTraits: string[];
        description: string;
        emoji: string;
        color: string;
    }>)[petElement];

    // 건강 운 (Seed 기반 변형 적용)
    const healthRaw = (healthData as Record<Element, {
        level: string;
        score: number;
        advice: string;
        adviceVariants?: string[];
    }>)[petElement];

    // Seed 기반으로 건강 조언 변형 선택 (궁합 점수가 낮으면 변형 사용)
    let healthAdvice = healthRaw.advice;
    if (healthRaw.adviceVariants && healthRaw.adviceVariants.length > 0) {
        const seedNum = parseInt(cacheKey.substring(8, 16), 16);
        // 궁합 점수가 60 미만이면 변형 조언 사용
        if (compatibilityResult.score < 60) {
            const variantIndex = seedNum % healthRaw.adviceVariants.length;
            healthAdvice = healthRaw.adviceVariants[variantIndex];
        }
    }

    // 마음 경계 지수
    const mindResult = calculateMindBarrier(petBirth, ownerBirth);

    // 평생 운 흐름
    const lifetimeFlow = (fortuneData.lifetimeFlow as Record<Element, Array<{
        age: string;
        fortune: string;
        level: number;
    }>>)[petElement];

    // 올해 운세 (Seed 기반 변형 적용)
    const yearFortuneRaw = (fortuneData.yearFortune as Record<Element, {
        overall: string;
        overallVariants?: string[];
        love: string;
        health: string;
        wealth: string;
        lucky: string;
    }>)[petElement];

    const yearFortuneRelation = calculateYearFortuneRelation(petBirth);
    const yearFortuneLabelInfo = (fortuneData.yearFortuneLabels as Record<string, {
        label: string;
        emoji: string;
        description: string;
    }>)[yearFortuneRelation];

    // 올해 운세 변형 선택 (상극이면 변형 사용)
    let yearFortuneOverall = yearFortuneRaw.overall;
    if (yearFortuneRaw.overallVariants && yearFortuneRaw.overallVariants.length > 0) {
        if (yearFortuneRelation === '상극' || yearFortuneRelation === '중립') {
            const seedNum = parseInt(cacheKey.substring(16, 24), 16);
            const variantIndex = seedNum % yearFortuneRaw.overallVariants.length;
            yearFortuneOverall = yearFortuneRaw.overallVariants[variantIndex];
        }
    }

    // 결과 생성
    const petTypeName = petType === 'cat' ? '고양이' : petType === 'dog' ? '강아지' : '반려동물';

    const result: PetDestinyResult = {
        summary: `${petTypeName}와 집사의 궁합은 ${compatibilityResult.score}점! ${compatibilityResult.text}`,
        shareText: `우리 ${petTypeName}와 나의 궁합은 ${compatibilityResult.score}점! ${ELEMENT_INFO[petElement].emoji} ${petElement} 오행의 ${petTypeName}에요.`,
        compatibility: compatibilityResult.score,
        compatibilityLabel: compatibilityResult.label,
        personality: {
            mainTrait: personalityInfo.mainTrait,
            subTraits: personalityInfo.subTraits,
            description: personalityInfo.description,
            element: petElement,
            elementInfo: ELEMENT_INFO[petElement]
        },
        health: {
            level: healthRaw.level,
            score: healthRaw.score,
            advice: healthAdvice
        },
        mind: mindResult,
        lifetimeFlow,
        yearFortune: {
            overall: yearFortuneOverall,
            love: yearFortuneRaw.love,
            health: yearFortuneRaw.health,
            wealth: yearFortuneRaw.wealth,
            lucky: yearFortuneRaw.lucky,
            label: yearFortuneLabelInfo.label
        },
        yearFortuneLabel: `${yearFortuneLabelInfo.emoji} ${yearFortuneLabelInfo.label}`,
        petElement,
        ownerElement
    };

    // 캐시 저장
    cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL });

    return result;
}

// 캐시 정리 (메모리 관리)
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
        if (value.expires < now) {
            cache.delete(key);
        }
    }
}, 60 * 60 * 1000); // 1시간마다 정리

export { generateSeed } from './seed.service';
export { Element } from './zodiac.service';
