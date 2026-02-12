import { HTSM_KEYWORD_WHITELIST, HTSM_CONFIG } from './constants';

/**
 * Johari Window 4사분면 계산 결과
 */
export interface JohariResult {
    open: { percent: number; keywords: string[] };
    blind: { percent: number; keywords: string[] };
    hidden: { percent: number; keywords: string[] };
    unknown: { percent: number; keywords: string[] };
}

/**
 * 친구 응답들로부터 키워드 빈도수를 계산
 */
function countKeywordFrequency(answers: string[][]): Map<string, number> {
    const frequencyMap = new Map<string, number>();
    for (const answer of answers) {
        for (const keyword of answer) {
            frequencyMap.set(keyword, (frequencyMap.get(keyword) || 0) + 1);
        }
    }
    return frequencyMap;
}

/**
 * 빈도순으로 상위 N개 키워드 추출
 */
function getTopKeywords(keywords: string[], frequencyMap: Map<string, number>, maxCount: number): string[] {
    return keywords
        .sort((a, b) => (frequencyMap.get(b) || 0) - (frequencyMap.get(a) || 0))
        .slice(0, maxCount);
}

/**
 * Johari Window 계산
 *
 * - Open: Self ∩ Friend (나도 알고, 남도 앎)
 * - Blind: Friend - Self (나는 모르는데, 남은 앎)
 * - Hidden: Self - Friend (나만 알고, 남은 모름)
 * - Unknown: 전체 키워드 풀 - (Self ∪ Friend) (나도 모르고, 남도 모름)
 */
export function calculateJohari(
    selfKeywords: string[],
    friendAnswers: string[][]
): JohariResult {
    const frequencyMap = countKeywordFrequency(friendAnswers);

    // 친구들이 선택한 모든 고유 키워드
    const friendKeywordSet = new Set<string>();
    for (const answer of friendAnswers) {
        for (const keyword of answer) {
            friendKeywordSet.add(keyword);
        }
    }
    const selfSet = new Set(selfKeywords);

    // 4사분면 분류
    const openKeywords: string[] = [];
    const blindKeywords: string[] = [];
    const hiddenKeywords: string[] = [];
    const unknownKeywords: string[] = [];

    for (const keyword of HTSM_KEYWORD_WHITELIST) {
        const inSelf = selfSet.has(keyword);
        const inFriend = friendKeywordSet.has(keyword);

        if (inSelf && inFriend) {
            openKeywords.push(keyword);
        } else if (!inSelf && inFriend) {
            blindKeywords.push(keyword);
        } else if (inSelf && !inFriend) {
            hiddenKeywords.push(keyword);
        } else {
            unknownKeywords.push(keyword);
        }
    }

    // 총 카운트 (분모)
    const totalCount = openKeywords.length + blindKeywords.length + hiddenKeywords.length + unknownKeywords.length;

    const calcPercent = (count: number): number => {
        if (totalCount === 0) return 0;
        return Math.round((count / totalCount) * 100);
    };

    const maxDisplay = HTSM_CONFIG.MAX_KEYWORD_COUNT;

    return {
        open: {
            percent: calcPercent(openKeywords.length),
            keywords: getTopKeywords(openKeywords, frequencyMap, maxDisplay),
        },
        blind: {
            percent: calcPercent(blindKeywords.length),
            keywords: getTopKeywords(blindKeywords, frequencyMap, maxDisplay),
        },
        hidden: {
            percent: calcPercent(hiddenKeywords.length),
            keywords: getTopKeywords(hiddenKeywords, frequencyMap, maxDisplay),
        },
        unknown: {
            percent: calcPercent(unknownKeywords.length),
            keywords: getTopKeywords(unknownKeywords, frequencyMap, maxDisplay),
        },
    };
}
