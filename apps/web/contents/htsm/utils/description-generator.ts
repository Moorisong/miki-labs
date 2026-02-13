export const OPEN_SELF_INTRO = [
    "이 영역은 당신이 스스로 인식하는 모습과 주변 사람들이 느끼는 이미지가 비교적 일치하는 부분입니다.",
    "이 영역은 당신의 외부 이미지와 자기 인식이 자연스럽게 겹치는 성향을 보여줍니다."
];

export const BLIND_SELF_INTRO = [
    "이 영역은 주변 사람들이 더 강하게 인식하고 있을 가능성이 높은 당신의 모습입니다.",
    "이 영역은 타인의 시선에서 발견되는 당신의 특징을 보여줍니다."
];

export const HIDDEN_SELF_INTRO = [
    "이 영역은 당신이 비교적 신중하게 드러내는 내면의 성향과 관련되어 있습니다.",
    "이 영역은 가까운 사람들에게만 보일 가능성이 높은 당신의 모습입니다."
];

export const UNKNOWN_SELF_INTRO = [
    "이 영역은 아직 충분히 드러나지 않았을 수 있는 잠재적인 성향을 의미합니다.",
    "이 영역은 새로운 환경에서 나타날 수 있는 가능성을 보여줍니다."
];

export const SOCIAL_TEMPLATES = [
    "이러한 특성은 인간관계 속에서 안정감과 신뢰를 형성하는 데 긍정적으로 작용할 가능성이 큽니다.",
    "주변 사람들은 이러한 모습에서 일관성과 매력을 동시에 느낄 수 있습니다.",
    "이 성향은 협업이나 관계 형성 과정에서 자연스럽게 드러날 가능성이 높습니다."
];

export const ENDING_TEMPLATES = [
    "전반적으로 이는 당신의 성격 인상에 중요한 기반을 형성하는 요소라고 볼 수 있습니다.",
    "이러한 특징은 앞으로 다양한 상황에서 의미 있는 강점으로 작용할 수 있습니다.",
    "이 요소들은 당신의 전반적인 이미지 형성에 지속적으로 영향을 줄 수 있습니다."
];

// Helper to conjugate adjective/noun to "And" form (e.g. 친절한 -> 친절하고)
function conjugateToAnd(word: string): string {
    const lastChar = word.charAt(word.length - 1);

    // 1. Adjectives ending in '한' -> '하고' (친절한 -> 친절하고)
    if (word.endsWith('한')) {
        return word.slice(0, -1) + '하고';
    }
    // 2. Adjectives ending in '인' -> '이고' (창의적인 -> 창의적이고)
    if (word.endsWith('인')) {
        return word.slice(0, -1) + '이고';
    }
    // 3. Adjectives ending in '있는' -> '있고' (재미있는 -> 재미있고)
    if (word.endsWith('있는')) {
        return word.slice(0, -2) + '있고';
    }
    // 4. Adjectives ending in '운' -> '롭고' (지혜로운 -> 지혜롭고) - '운' might be tricky if not '로운'
    if (word.endsWith('로운')) {
        return word.slice(0, -2) + '롭고';
    }
    if (word.endsWith('운')) {
        return word.slice(0, -1) + '웁고'; // 고마운 -> 고맙고 (irregular), strictly '웁고' is ok approx
    }
    // 5. Adjectives ending in '은' -> '고' (수줍음 많은 -> 수줍음 많고)
    if (word.endsWith('은')) {
        return word.slice(0, -1) + '고';
    }
    // 6. Adjectives ending in '는' -> '고' (즐기는 -> 즐기고)
    if (word.endsWith('는')) {
        return word.slice(0, -1) + '고';
    }

    // 7. Nouns or others: Add '이고'
    // Simple check for batchim?
    const charCode = lastChar.charCodeAt(0);
    const hasBatchim = (charCode - 44032) % 28 !== 0;

    if (hasBatchim) {
        return word + '이고';
    } else {
        return word + '이고'; // or '고' if vowel ending? usually '이고' works for nouns in this context "몽상가이고"
    }
}

// Helper to conjugate adjective/noun to "Modifier" form if needed, but usually input is already modifier.
// But output needs to be "Noun Modifying Form"?
// The template uses "{k1}하고 {k2}한 모습".
// k2 should stay as is (e.g. "책임감 있는").
// k3 in 2nd sentence: "여기에 {k3}한 성향이".
// If k3 is "몽상가" (Noun), then "여기에 몽상가한 성향"? No. "몽상가적인 성향" or "몽상가 같은 성향".
// We need to handle nouns for the final position.

function conjugateToModifier(word: string): string {
    // If it's already an adjective (starts with noun but ends with modifier like '한', '인', '는', '운', '은'), keep it.
    if (word.endsWith('한') || word.endsWith('인') || word.endsWith('는') || word.endsWith('운') || word.endsWith('은')) {
        return word;
    }
    // If it's a noun
    return word + '인'; // 몽상가 -> 몽상가인, 헬창 -> 헬창인
}


export function generateDescription(
    area: 'open' | 'blind' | 'hidden' | 'unknown',
    keywords: string[] // LOCALIZED keywords (Korean strings)
): string {
    if (!keywords || keywords.length === 0) return '';

    // 1. Select Intro
    let introTemplates = OPEN_SELF_INTRO;
    if (area === 'blind') introTemplates = BLIND_SELF_INTRO;
    if (area === 'hidden') introTemplates = HIDDEN_SELF_INTRO;
    if (area === 'unknown') introTemplates = UNKNOWN_SELF_INTRO;

    const intro = introTemplates[Math.floor(Math.random() * introTemplates.length)];

    // 2. Keyword Sentence
    let keywordSentence = '';
    const k1 = keywords[0]; // Most dominant?
    const k2 = keywords.length > 1 ? keywords[1] : '';
    const k3 = keywords.length > 2 ? keywords[2] : '';

    if (k1 && k2) {
        // "특히 {k1}하고 {k2}한 모습이 당신의 인상을 형성하는 핵심 요소로 작용합니다."
        const k1Conj = conjugateToAnd(k1);
        const k2Mod = conjugateToModifier(k2);
        keywordSentence = `특히 ${k1Conj} ${k2Mod} 모습이 당신의 인상을 형성하는 핵심 요소로 작용합니다.`;

        if (k3) {
            // "여기에 {k3}한 성향이 더해지면서 독특한 이미지가 만들어집니다."
            const k3Mod = conjugateToModifier(k3);
            keywordSentence += ` 여기에 ${k3Mod} 성향이 더해지면서 독특한 이미지가 만들어집니다.`;
        }
    } else if (k1) {
        // Only 1 keyword
        const k1Mod = conjugateToModifier(k1);
        keywordSentence = `특히 ${k1Mod} 모습이 당신의 가장 두드러진 특징으로 보입니다.`;
    }

    // 3. Social Sentence
    const social = SOCIAL_TEMPLATES[Math.floor(Math.random() * SOCIAL_TEMPLATES.length)];

    // 4. Ending Sentence
    const ending = ENDING_TEMPLATES[Math.floor(Math.random() * ENDING_TEMPLATES.length)];

    return `${intro} ${keywordSentence} ${social} ${ending}`;
}
