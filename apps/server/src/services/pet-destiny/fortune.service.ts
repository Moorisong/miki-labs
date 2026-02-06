import { Element } from './zodiac.service';
import {
    calculateElementFromDate,
    getCurrentYearElement,
    ELEMENT_CYCLE,
    ELEMENT_INFO
} from './element.service';
import fortuneData from '../../../data/fortune.json';

interface YearFortuneResult {
    fullText: string;
    label: string;
    emoji: string;
    score: number;
}

/**
 * 올해 운세 계산
 * @param petBirth 반려동물 생년월일
 * @param seed 캐시용 시드값 (해시)
 * @returns 올해 운세 결과 (문장, 라벨, 이모지)
 */
export function calculateYearFortune(petBirth: string, seed: string): YearFortuneResult {
    const petElement = calculateElementFromDate(petBirth);
    const yearElement = getCurrentYearElement();

    // 오행 인덱스 (목0, 화1, 토2, 금3, 수4)
    const petIdx = ELEMENT_CYCLE.indexOf(petElement);
    const yearIdx = ELEMENT_CYCLE.indexOf(yearElement);

    // 관계 차이 계산 (Year 기준 Pet과의 거리)
    // 0: 같음
    // 1: Year -> Pet (생)
    // 2: Year -x Pet (극)
    // 3: Pet -x Year (극)
    // 4: Pet -> Year (생)
    const diff = (petIdx - yearIdx + 5) % 5;

    let baseScore = 0;
    let relationshipText = '';

    // 관계별 점수 및 텍스트 정의
    switch (diff) {
        case 0: // 동일
            baseScore = 1;
            relationshipText = `같은 ${yearElement}(${ELEMENT_INFO[yearElement].trait}) 기운이 서로 조화를 이룹니다`;
            break;
        case 1: // Year 생 Pet (인성: 나를 돕는 기운)
            baseScore = 2;
            relationshipText = `올해는 ${yearElement}(${ELEMENT_INFO[yearElement].trait}) 기운이 ${petElement} 기운을 돕습니다`;
            break;
        case 4: // Pet 생 Year (식상: 내가 돕는 기운)
            baseScore = 2;
            relationshipText = `${petElement} 기운이 ${yearElement}(${ELEMENT_INFO[yearElement].trait}) 기운과 부드럽게 이어집니다`;
            break;
        case 2: // Year 극 Pet (관성: 나를 극하는 기운)
            baseScore = -1;
            relationshipText = `올해는 ${yearElement}(${ELEMENT_INFO[yearElement].trait}) 기운이 ${petElement} 기운과 충돌할 수 있습니다`;
            break;
        case 3: // Pet 극 Year (재성: 내가 극하는 기운)
            baseScore = -1;
            relationshipText = `${petElement} 기운과 ${yearElement}(${ELEMENT_INFO[yearElement].trait}) 기운이 서로 부딪힙니다`;
            break;
    }

    // Seed 기반 가중치 적용 (-1, 0, +1)
    // seed 문자열의 해시값을 이용
    const seedNum = parseInt(seed.substring(0, 8), 16);
    const scoreAdjust = (seedNum % 3) - 1;

    const finalScore = baseScore + scoreAdjust;

    // 최종 라벨 결정
    // Labels: daegil, gil, normal, caution, bad
    let labelKey = 'normal';
    if (finalScore >= 3) labelKey = 'daegil';
    else if (finalScore >= 1) labelKey = 'gil';
    else if (finalScore === 0) labelKey = 'normal';
    else if (finalScore >= -2) labelKey = 'caution';
    else labelKey = 'bad';

    const labelData = (fortuneData.yearFortuneLabels as Record<string, {
        label: string;
        emoji: string;
        desc: string;
    }>)[labelKey];

    // 상세 설명 (fortune.json의 yearFortune.overall 사용)
    const yearFortuneRaw = (fortuneData.yearFortune as Record<Element, {
        overall: string,
        overallVariants?: string[]
    }>)[petElement];

    let detailText = yearFortuneRaw.overall;

    // 점수가 낮거나 높을 때, 또는 충돌 관계일 때 변형 텍스트 사용
    if (yearFortuneRaw.overallVariants && yearFortuneRaw.overallVariants.length > 0) {
        // 점수가 -1 이하(주의/흉), +3(대길), 또는 충돌 관계(baseScore -1)일 때 변형 텍스트 사용
        // 충돌 관계에서는 긍정적 메시지와 맞지 않으므로 항상 변형 사용
        if (finalScore <= -1 || finalScore >= 3 || baseScore <= -1) {
            const variantIdx = (seedNum % yearFortuneRaw.overallVariants.length);
            detailText = yearFortuneRaw.overallVariants[variantIdx];
        }
    }

    // 최종 문장 조합
    // 포맷: [레이블] [이모지] [이유]. [상세].
    const fullText = `${labelData.label} ${labelData.emoji} ${relationshipText}. ${detailText}`;

    return {
        fullText,
        label: labelData.label,
        emoji: labelData.emoji,
        score: finalScore
    };
}
