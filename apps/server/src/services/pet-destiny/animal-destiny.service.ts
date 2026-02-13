import animalDestinyData from '../../../data/animal_destiny.json';

interface Animal {
    id: string;
    name: string;
    emoji: string;
    introTemplates: string[];
    analysisTemplates: string[];
    guideTemplates: string[];
    keywords: string[];
}

export interface DailyAnimalResult {
    animalName: string;
    animalEmoji: string;
    description: string;
    keywords: string[];
}

/**
 * 시드 기반으로 오늘의 동물을 결정하고 문장을 조합합니다.
 * @param seed 해시 기반 시드 문자열
 * @returns 오늘의 동물 결과
 */
export function calculateDailyAnimal(seed: string): DailyAnimalResult {
    const animals = animalDestinyData.animals as Animal[];

    // 1. 시드를 숫자로 변환
    const seedNum = parseInt(seed.substring(0, 8), 16);

    // 2. 오늘의 동물 선택 (사용 가능한 동물 중 하나)
    // 실제 로직에서는 날짜를 섞어서 매일 다른 5개 중 하나를 고르게 할 수도 있음
    // 여기서는 간단히 전체 중 하나를 시드 기반으로 선택
    const animalIndex = seedNum % animals.length;
    const animal = animals[animalIndex];

    // 3. 템플릿 조합 (Intro, Analysis, Guide)
    // 각 카테고리별로 시드를 다르게 활용하여 문장 선택
    const getSentence = (arr: string[], offset: number) => {
        const idx = (seedNum + offset) % arr.length;
        return arr[idx];
    };

    const intro = getSentence(animal.introTemplates, 1);
    const analysis = getSentence(animal.analysisTemplates, 3);
    const guide = getSentence(animal.guideTemplates, 5);

    // 4. 문단 조합
    const description = `${intro}\n\n${analysis}\n\n${guide}`;

    return {
        animalName: animal.name,
        animalEmoji: animal.emoji,
        description,
        keywords: animal.keywords
    };
}
