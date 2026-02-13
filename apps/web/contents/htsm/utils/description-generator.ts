// HTSM Result Description Generator
// Follows the "조하리 창 결과 텍스트 개선 기획서 (최종)" guide.

const TEMPLATES = {
    open: {
        praise: ["사람들이 당신을 일상 속에서 마주할 때 느끼는 분위기는 꽤나 긍정적이고 안정적인 것 같아요."],
        but: ["하지만 당신의 ${k1Mod} 모습 뒤에는 생각보다 본인만의 기준이나 루틴이 꽤나 확고하게 자리 잡고 있네요."],
        sting: ["남들에겐 항상 여유로워 보이지만, 실은 익숙한 환경을 벗어나는 걸 조금 귀찮아하거나 변화에 보수적인 편일 때도 있어요."],
        closing: ["이런 모습마저 당신을 더 예측 가능한 사람으로 만들어주는 인간적인 모습이라 더욱 신뢰가 갑니다."]
    },
    blind: {
        praise: ["당신이 미처 몰랐을 수도 있지만, 사람들은 당신에게서 ${k1Mod} 매력을 꽤나 인상 깊게 발견한 것 같아요."],
        but: ["의외로 주변 시선에는 당신이 스스로 인식하는 것보다 ${k2Mod} 면모가 더 선명하게 비춰지고 있습니다."],
        sting: ["가끔은 본인도 모르게 상대방의 기분을 살피느라 에너지를 많이 쓰거나, 은근히 고집이 강한 편이라는 의견도 있어요."],
        closing: ["내가 몰랐던 나의 조각들을 발견하는 이런 순간이 당신을 더욱 입체적인 사람으로 만들어줄 겁니다."]
    },
    hidden: {
        praise: ["겉으로 보이는 당신의 모습은 꽤나 ${k1Mod} 느낌으로 주변에 잘 스며들어 있는 것 같아 보여요."],
        but: ["하지만 실제 속마음은 사람들이 생각하는 것보다 훨씬 더 ${k2Mod} 성향을 강하게 품고 계신 듯합니다."],
        sting: ["사실은 속으로 타인을 냉철하게 판단하거나, 혼자만의 시간이 부족하면 쉽게 예민해지는 편이라는 걸 가까운 사람만 알 것 같아요."],
        closing: ["이런 반전이야말로 당신을 알면 알수록 궁금하게 만드는 진짜 매력이지 않을까 싶네요."]
    },
    unknown: {
        praise: ["당신의 내면에는 앞으로 더 멋지게 발휘될 수 있는 ${k1Mod} 능력이 아직 잠잠히 숨어 있는 것 같아요."],
        but: ["동시에 아직은 드러나지 않은 ${k2Mod} 기운들이 적절한 계기를 만나면 발휘될 가능성이 높아 보입니다."],
        sting: ["지금은 새로운 시도를 하는 게 조금 조심스럽거나 쉽게 움직이지 않는 편일 수도 있지만, 그건 곧 잠재력이 터지기 전의 충전 상태 같아요."],
        closing: ["시간이 흘러 당신이 보여줄 새로운 모습들이 어떤 멋진 변화를 만들어낼지 벌써부터 기대가 됩니다."]
    }
};

function conjugateToModifier(word: string): string {
    if (!word) return '';
    // For Korean
    if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(word)) {
        if (word.endsWith('한') || word.endsWith('인') || word.endsWith('는') || word.endsWith('운') || word.endsWith('은')) {
            return word;
        }
        return word + '인';
    }
    return word;
}

export function generateDescription(
    area: 'open' | 'blind' | 'hidden' | 'unknown',
    keywords: string[]
): string {
    if (!keywords || keywords.length === 0) return '';

    const templates = TEMPLATES[area];
    const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    const uniqueKeywords = Array.from(new Set(keywords));
    const k1 = uniqueKeywords[0];
    const k2 = uniqueKeywords.length > 1 ? uniqueKeywords[1] : (uniqueKeywords.length > 0 ? uniqueKeywords[0] : '');

    const k1Mod = conjugateToModifier(k1);
    const k2Mod = conjugateToModifier(k2);

    // 1단계: 칭찬 (Praise)
    const s1 = getRandom(templates.praise).replace('${k1Mod}', k1Mod);

    // 2단계: 반전 (BUT)
    const s2 = getRandom(templates.but).replace('${k1Mod}', k1Mod).replace('${k2Mod}', k2Mod);

    // 3단계: 찔림 (Sting)
    const s3 = getRandom(templates.sting);

    // 4단계: 마무리 (Human Closing)
    const s4 = getRandom(templates.closing);

    return `${s1} ${s2} ${s3} ${s4}`;
}
