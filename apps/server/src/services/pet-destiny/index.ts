import { Element } from './zodiac.service';
import { calculateElementFromDate, getCurrentYearElement, ELEMENT_INFO } from './element.service';
import {
    calculateCompatibility,
    calculateMindBarrier
} from './compatibility.service';
import { calculateYearFortune } from './fortune.service';
import { generateSeed } from './seed.service';

// JSON 데이터 임포트
import personalityData from '../../../data/personality.json';
import personalityDetailData from '../../../data/personality_detail.json'; // Import new data
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
    petName?: string;
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

    // 상세 성격 분석 생성 (New Logic)
    const petName = request.petName || (petType === 'cat' ? '고양이' : petType === 'dog' ? '강아지' : '반려동물');
    const detailTemplates = (personalityDetailData as Record<string, {
        intro: string[];
        body_positive: string[];
        body_habit: string[];
        relation_owner: string[];
        outro: string[];
    }>)[petElement];

    // Seed를 이용하여 각 카테고리에서 문장 선택
    const seedNum = parseInt(cacheKey.substring(0, 8), 16);
    const getSentence = (arr: string[], shift: number) => arr[(seedNum >> shift) % arr.length];

    const descriptionParts = [
        getSentence(detailTemplates.intro, 0),
        getSentence(detailTemplates.body_positive, 2),
        getSentence(detailTemplates.body_habit, 4),
        getSentence(detailTemplates.relation_owner, 6),
        getSentence(detailTemplates.outro, 8)
    ];

    const detailedDescription = descriptionParts.join(' ').replace(/{name}/g, petName);

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
        // ... (existing code for health advice selection)
        const variantIndex = seedNum % healthRaw.adviceVariants.length;
        if (compatibilityResult.score < 60) {
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

    // 올해 운세 (New Logic)
    const yearFortuneRaw = (fortuneData.yearFortune as Record<Element, {
        overall: string;
        love: string;
        health: string;
        wealth: string;
        lucky: string;
    }>)[petElement];

    const yearFortuneResult = calculateYearFortune(petBirth, cacheKey);

    // 결과 생성
    const petTypeName = petType === 'cat' ? '고양이' : petType === 'dog' ? '강아지' : '반려동물';

    const result: PetDestinyResult = {
        summary: `${petTypeName}와 집사의 궁합은 ${compatibilityResult.score}점! ${compatibilityResult.text}`,
        shareText: `우리 ${petTypeName}의 2026년 운세: ${yearFortuneResult.fullText}`,
        compatibility: compatibilityResult.score,
        compatibilityLabel: compatibilityResult.label,
        personality: {
            mainTrait: personalityInfo.mainTrait,
            subTraits: personalityInfo.subTraits,
            description: personalityInfo.description,
            detailedDescription, // Add generated detailed description
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
            overall: yearFortuneResult.fullText,
            love: yearFortuneRaw.love,
            health: yearFortuneRaw.health,
            wealth: yearFortuneRaw.wealth,
            lucky: yearFortuneRaw.lucky,
            label: yearFortuneResult.label
        },
        yearFortuneLabel: `${yearFortuneResult.emoji} ${yearFortuneResult.label}`,
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
