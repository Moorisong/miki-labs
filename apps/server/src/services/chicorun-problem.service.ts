import crypto from 'crypto';

export type QuestionType =
    | 'sentence_choice'
    | 'word_order'
    | 'fill_blank'
    | 'translation'
    | 'transformation'
    | 'error_detection'
    | 'word_meaning';

export interface QuestionLevel {
    level: string;
    label: string;
    description: string;
    range: [number, number];
}

export const LEVELS: QuestionLevel[] = [
    {
        level: 'beginner',
        label: '초급',
        description: '기초 단어와 간단한 문장 (3~5단어, 현재형 중심)',
        range: [0, 2999],
    },
    {
        level: 'intermediate',
        label: '중급',
        description: '시제 활용 및 문장 확장 (5~8단어, 과거 포함)',
        range: [3000, 6999],
    },
    {
        level: 'advanced',
        label: '고급',
        description: '수능형 문장 및 복합 구조 (7~12단어, 응용/해석 중심)',
        range: [7000, 9999],
    },
];

const RATIOS = {
    beginner: {
        sentence_choice: 40,
        word_order: 35,
        fill_blank: 20,
        error_detection: 5,
        translation: 0,
        transformation: 0,
        word_meaning: 0,
    },
    intermediate: {
        sentence_choice: 15,
        word_order: 25,
        fill_blank: 25,
        translation: 20,
        transformation: 10,
        error_detection: 5,
        word_meaning: 0,
    },
    advanced: {
        sentence_choice: 5,
        word_order: 15,
        fill_blank: 20,
        translation: 35,
        transformation: 15,
        error_detection: 10,
        word_meaning: 0,
    },
};

const WORDS = {
    beginner: {
        subjects: ['I', 'You', 'He', 'She', 'They', 'A boy', 'A girl', 'The cat', 'My mom', 'My dad'],
        verbs: ['go', 'eat', 'play', 'study', 'make', 'run', 'sleep', 'like', 'see', 'want'],
        places: ['school', 'home', 'park', 'the zoo', 'the library', 'the room'],
        food: ['apples', 'pizza', 'rice', 'bread', 'milk', 'an egg'],
        time: ['morning', 'night', 'every day', 'now'],
        person: ['friends', 'teacher', 'a doctor', 'sister', 'brother'],
        adjective: ['happy', 'tired', 'fast', 'small', 'big', 'hungry'],
        object: ['homework', 'soccer', 'dinner', 'a book', 'a ball'],
    },
    intermediate: {
        subjects: ['My best friend', 'The students', 'Our teacher', 'Everyone', 'Nobody'],
        verbs: ['visited', 'finished', 'thought', 'bought', 'walked', 'learned', 'decided', 'started', 'stopped'],
        places: ['the grocery store', 'the museum', 'London', 'a restaurant', 'the beach'],
        food: ['delicious pasta', 'a sandwich', 'some fruit', 'spicy chicken', 'a cake'],
        time: ['yesterday', 'last week', 'two days ago', 'at that time'],
        person: ['the principal', 'my cousins', 'an actor', 'a chef'],
        adjective: ['expensive', 'difficult', 'important', 'surprised', 'excited'],
        object: ['the broken window', 'his old car', 'a beautiful song', 'this lesson'],
    },
    advanced: {
        subjects: ['Environmental impact', 'Technological advancement', 'Success in life', 'Continuous effort'],
        verbs: ['requires', 'influence', 'demonstrates', 'concluded', 'emphasized', 'transformed'],
        places: ['global markets', 'modern society', 'educational institutions', 'diverse cultures'],
        food: ['nutritional value', 'processed products', 'organic ingredients'],
        time: ['in the long run', 'for centuries', 'simultaneously'],
        person: ['philosophers', 'scientists', 'researchers', 'professionals'],
        adjective: ['inevitable', 'significant', 'sustainable', 'complicated', 'efficient'],
        object: ['the complexity of the issue', 'a new perspective', 'substantial evidence'],
    },
};

interface VerbRule {
    type: 'transitive' | 'intransitive';
    structure: string;
    validObjects: string[];
    preposition?: string;
}

const VERB_RULES: Record<string, VerbRule> = {
    make: {
        type: 'transitive',
        structure: '{subject} {verb} {object}',
        validObjects: ['a cake', 'food', 'a plan', 'a decision', 'homework'],
    },
    eat: {
        type: 'transitive',
        structure: '{subject} {verb} {object}',
        validObjects: ['an apple', 'pizza', 'rice', 'bread'],
    },
    play: {
        type: 'transitive',
        structure: '{subject} {verb} {object}',
        validObjects: ['soccer', 'basketball', 'the game', 'the piano'],
    },
    see: {
        type: 'transitive',
        structure: '{subject} {verb} {object}',
        validObjects: ['a movie', 'a dog', 'a friend', 'a teacher'],
    },
    go: {
        type: 'intransitive',
        structure: '{subject} {verb} {object}',
        preposition: 'to',
        validObjects: ['school', 'home', 'the park', 'the store'],
    },
    study: {
        type: 'transitive',
        structure: '{subject} {verb} {object}',
        validObjects: ['English', 'math', 'science', 'history'],
    },
    visit: {
        type: 'transitive',
        structure: '{subject} {verb} {object}',
        validObjects: ['the museum', 'London', 'a restaurant', 'the beach'],
    },
    finish: {
        type: 'transitive',
        structure: '{subject} {verb} {object}',
        validObjects: ['the work', 'the lesson', 'dinner', 'homework'],
    },
};

class DeterministicPRNG {
    private seed: number;
    constructor(seedString: string) {
        let h = 0;
        for (let i = 0; i < seedString.length; i++) {
            h = (Math.imul(31, h) + seedString.charCodeAt(i)) | 0;
        }
        this.seed = h;
    }
    next() {
        let t = (this.seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    nextInt(min: number, max: number) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
    pickOne<T>(arr: T[]): T {
        return arr[this.nextInt(0, arr.length - 1)];
    }
    shuffle<T>(arr: T[]): T[] {
        const result = [...arr];
        for (let i = result.length - 1; i > 0; i--) {
            const j = this.nextInt(0, i);
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
}

const UNCOUNTABLE_NOUNS = ['history', 'water', 'information', 'advice', 'homework', 'bread', 'rice', 'milk', 'music', 'science', 'math'];
const SAFE_NOUNS = ['apple', 'book', 'dog', 'cake', 'pizza', 'sandwich', 'ball', 'piano', 'movie'];

export class ChicorunProblemService {
    static getLevelByProgressIndex(progressIndex: number): number {
        return Math.floor(progressIndex / 100) + 1;
    }

    static getLevelLabel(progressIndex: number): 'beginner' | 'intermediate' | 'advanced' {
        const level = this.getLevelByProgressIndex(progressIndex);
        if (level <= 30) return 'beginner';
        if (level <= 70) return 'intermediate';
        return 'advanced';
    }

    static getTypeByIndex(progressIndex: number): QuestionType {
        const label = this.getLevelLabel(progressIndex);
        const levelRatios = RATIOS[label] as Record<string, number>;
        const typePool: QuestionType[] = [];
        Object.entries(levelRatios).forEach(([type, ratio]) => {
            for (let i = 0; i < ratio; i++) {
                typePool.push(type as QuestionType);
            }
        });
        const blockIndex = Math.floor(progressIndex / 100);
        const offsetInBlock = progressIndex % 100;
        const prng = new DeterministicPRNG(`type-sequence-${label}-${blockIndex}`);
        let sequence = prng.shuffle(typePool);
        for (let i = 2; i < sequence.length; i++) {
            if (sequence[i] === sequence[i - 1] && sequence[i] === sequence[i - 2]) {
                if (i + 1 < sequence.length) {
                    [sequence[i], sequence[i + 1]] = [sequence[i + 1], sequence[i]];
                }
            }
        }
        return sequence[offsetInBlock] || 'sentence_choice';
    }

    static generateSeed(studentId: string, classCode: string, progressIndex: number): string {
        const data = `${studentId}-${classCode}-${progressIndex}`;
        return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
    }

    static generateQuestion(studentId: string, classCode: string, progressIndex: number): any {
        const seed = this.generateSeed(studentId, classCode, progressIndex);
        const type = this.getTypeByIndex(progressIndex);
        const level = this.getLevelByProgressIndex(progressIndex);
        const label = this.getLevelLabel(progressIndex);
        const prng = new DeterministicPRNG(seed);

        const wordPool = { ...WORDS.beginner };
        if (label === 'intermediate' || label === 'advanced') {
            if (label === 'intermediate') {
                Object.keys(wordPool).forEach((key) => {
                    (wordPool as any)[key] = [...(wordPool as any)[key], ...((WORDS.intermediate as any)[key] || [])];
                });
            } else if (label === 'advanced') {
                Object.keys(wordPool).forEach((key) => {
                    (wordPool as any)[key] = [
                        ...(wordPool as any)[key],
                        ...((WORDS.intermediate as any)[key] || []),
                        ...((WORDS.advanced as any)[key] || [])
                    ];
                });
            }
        }

        const isThirdPersonSingular = (s: string) =>
            ['He', 'She', 'A boy', 'A girl', 'The cat', 'My mom', 'My dad', 'Our teacher', 'Everyone', 'Nobody', 'Technological advancement', 'Success in life', 'Continuous effort'].includes(s);

        const conjugate = (v: string, s: string, tense: 'present' | 'past' = 'present') => {
            if (tense === 'past') {
                if (v === 'go') return 'went';
                if (v === 'eat') return 'ate';
                if (v === 'see') return 'saw';
                if (v === 'make') return 'made';
                if (v === 'buy') return 'bought';
                if (v === 'think') return 'thought';
                if (v === 'visit') return 'visited';
                if (v === 'finish') return 'finished';
                if (v.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(v[v.length - 2])) return v.slice(0, -1) + 'ied';
                if (v.endsWith('e')) return v + 'd';
                return v + 'ed';
            }
            if (isThirdPersonSingular(s)) {
                if (v === 'go') return 'goes';
                if (v === 'do') return 'does';
                if (v === 'study') return 'studies';
                if (v === 'finish') return 'finishes';
                if (v.endsWith('sh') || v.endsWith('ch')) return v + 'es';
                return v + 's';
            }
            return v;
        };

        const fillTemplate = (template: string, s: string, v: string, o: string, prep?: string) => {
            let space = prep ? ' ' : '';
            if (o === 'home' && v.match(/^go|went|goes$/)) {
                prep = '';
                space = '';
            }
            const processedVerb = prep ? `${v}${space}${prep}` : v;
            return template
                .replace('{subject}', s)
                .replace('{verb}', processedVerb)
                .replace('{object}', o) + '.';
        };

        let question = '';
        let correctAnswer = '';
        let choices: string[] = [];
        let explanation = '';

        // 1. Verb 선택 (동적 풀 사용)
        const availableVerbs = Object.keys(VERB_RULES).filter(v => wordPool.verbs.map(wv => wv.replace(/ed$|s$|es$/, '')).includes(v));
        const verbKey = prng.pickOne(availableVerbs.length > 0 ? availableVerbs : ['make', 'eat', 'go']);
        const rule = VERB_RULES[verbKey];

        // 2. Subject & Object 선택
        const subj = prng.pickOne(wordPool.subjects);
        const obj = prng.pickOne(rule.validObjects);

        // 3. 정답 생성
        const conjVerb = conjugate(verbKey, subj);
        correctAnswer = fillTemplate(rule.structure, subj, conjVerb, obj, rule.preposition);

        const createDistractor = (type: 'sv_error' | 'tense_error' | 'structure_error' | 'article_error') => {
            switch (type) {
                case 'sv_error':
                    const wrongV = isThirdPersonSingular(subj) ? verbKey : conjugate(verbKey, 'He');
                    return fillTemplate(rule.structure, subj, wrongV, obj, rule.preposition);
                case 'tense_error':
                    const wrongTense = label === 'beginner' ? conjugate(verbKey, subj, 'past') : verbKey;
                    if (wrongTense === conjVerb) return fillTemplate(rule.structure, subj, `will ${verbKey}`, obj, rule.preposition);
                    return fillTemplate(rule.structure, subj, wrongTense, obj, rule.preposition);
                case 'structure_error':
                    return fillTemplate(rule.structure, subj, `is ${conjVerb}`, obj, rule.preposition);
                case 'article_error':
                    const baseObj = obj.replace(/^(a|an|the) /, '');
                    if (UNCOUNTABLE_NOUNS.some(un => baseObj.includes(un))) {
                        // Uncountable nouns should NOT have article distractors to avoid ambiguity
                        return fillTemplate(rule.structure, subj, conjugate(verbKey, subj, 'past'), obj, rule.preposition);
                    }
                    if (baseObj === obj) return fillTemplate(rule.structure, subj, conjVerb, `the ${obj}`, rule.preposition);
                    return fillTemplate(rule.structure, subj, conjVerb, baseObj, rule.preposition);
            }
        };

        const hasAmbiguity = (ans: string, otherChoices: string[]) => {
            // Check for present simple vs present continuous
            const isContinuous = (s: string) => s.includes(' is ') || s.includes(' am ') || s.includes(' are ');
            const hasContinuous = isContinuous(ans) || otherChoices.some(isContinuous);
            const hasSimple = !isContinuous(ans) || otherChoices.some(c => !isContinuous(c));

            // If we have both types for the SAME verb/subject/object, it's risky
            // For now, let's keep it simple: if the sentences are grammatically valid but too similar, reject.
            return false; // Placeholder for more complex checks
        };

        switch (type) {
            case 'sentence_choice':
                question = `주어진 정보를 바탕으로 올바른 문장을 고르세요:\n[${subj}, ${verbKey}, ${obj.replace(/^(a|an|the) /, '')}]`;
                choices = [
                    correctAnswer,
                    createDistractor('sv_error'),
                    createDistractor('structure_error'),
                    createDistractor('article_error'),
                ];
                explanation = isThirdPersonSingular(subj)
                    ? `주어가 '${subj}'면 동사가 어떻게 변해야 자연스러울까? s/es 붙는지 확인해봐! 🚀`
                    : `주어가 '${subj}'면 동사는 원래 어떤 형태여야 할까? 불필요하게 s가 붙어있진 않은지 정독해봐!`;
                break;

            case 'word_order':
                const prep = (obj === 'home' && verbKey === 'go') ? '' : rule.preposition;
                const correctWordList = [subj, conjVerb, prep, obj].filter(Boolean).map(w => w?.split(' ')).flat();
                const shuffledWordList = prng.shuffle([...correctWordList]);
                question = `단어를 올바른 순서로 배열하세요:\n(${shuffledWordList.join(', ')})`;
                correctAnswer = correctWordList.join(' ');
                choices = [
                    correctAnswer,
                    prng.shuffle([...correctWordList]).join(' '),
                    prng.shuffle([...correctWordList]).join(' '),
                    prng.shuffle([...correctWordList]).join(' '),
                ];
                // Ensure unique choices
                choices = Array.from(new Set(choices));
                while (choices.length < 4) {
                    choices.push(prng.shuffle([...correctWordList]).join(' '));
                    choices = Array.from(new Set(choices));
                }
                explanation = '영어 문장은 [주어 + 동사 + 목적어] 순서가 근본임!\n순서가 꼬이면 의미 전달이 어려울 수 있어. 다시 한 번 배열해볼까?';
                break;

            case 'fill_blank':
                const displayObj = (obj === 'home' && verbKey === 'go') ? 'home' : (rule.preposition ? `${rule.preposition} ${obj}` : obj);
                question = `빈칸에 들어갈 알맞은 단어를 고르세요:\n"${subj} ___ ${displayObj}."`;
                correctAnswer = conjVerb;
                choices = [
                    correctAnswer,
                    isThirdPersonSingular(subj) ? verbKey : conjugate(verbKey, 'He'),
                    verbKey + 'ing',
                    'to ' + verbKey,
                ];
                explanation = `주어 '${subj}'에 어울리는 동사 모양을 찾아보자! 힌트는 수일치야. 🧐`;
                break;

            case 'translation':
                const koreanVerb = verbKey === 'go' ? '간다' : verbKey === 'eat' ? '먹는다' : verbKey === 'play' ? '한다' : '본다';
                const koreanObj = obj.includes('apple') ? '사과를' : obj.includes('pizza') ? '피자를' : obj.includes('school') ? '학교에' : '그것을';
                question = `다음 문장을 영어로 번역하세요:\n"${subj}${subj === 'I' || subj === 'You' ? '는' : '은'} ${koreanObj} ${koreanVerb}."`;
                choices = [
                    correctAnswer,
                    createDistractor('sv_error'),
                    createDistractor('tense_error'),
                    createDistractor('structure_error'),
                ];
                explanation = "번역할 땐 주어와 동사 '깔맞춤'이 생명이야! 주어의 인칭에 맞춰 동사가 변해야 하는지 잘 생각해봐.";
                break;

            default:
                // Fallback to sentence choice for other types for now
                question = `다음 정보를 사용하여 올바른 영어 문장을 고르세요:\n[${subj}, ${verbKey}, ${obj}]`;
                choices = [correctAnswer, createDistractor('sv_error'), createDistractor('structure_error'), createDistractor('article_error')];
                explanation = '항상 주어와 동사의 관계(수일치)를 생각하며 문장을 완성해봐! 정답엔 이유가 있어 🌱';
        }

        // 최종 검증
        const uniqueChoices = Array.from(new Set(choices));

        // 복수 정답 위험성 정밀 체크
        const hasConflict = (ch: string[]) => {
            // "She is runs" vs "She runs" 등 시제 혼동 방지 (이미 distractor에서 처리 중이지만 한 번 더 확인)
            // 불가산 명사의 관사 유무가 섞여있는지 확인
            const uncountablePatterns = UNCOUNTABLE_NOUNS.some(un => {
                const withThe = `the ${un}`;
                return ch.some(c => c.includes(withThe)) && ch.some(c => c.includes(un) && !c.includes(withThe));
            });
            if (uncountablePatterns) return true;

            // 시제 혼용 (is running vs runs)
            const continuousCount = ch.filter(c => c.includes(' is ') || c.includes(' am ') || c.includes(' are ')).length;
            if (continuousCount > 0 && continuousCount < ch.length && type === 'sentence_choice') {
                // 한 문제에 진행형과 일반형이 섞여있는데 시제 전환 문제가 아니면 위험
                return true;
            }
            return false;
        };

        if (uniqueChoices.length < 4 || uniqueChoices.includes(undefined as any) || hasConflict(uniqueChoices)) {
            return this.generateQuestion(studentId, classCode, progressIndex + 7); // Skip and try again
        }

        const finalChoices = prng.shuffle(uniqueChoices.slice(0, 4));
        const correctIndex = finalChoices.indexOf(correctAnswer);

        if (correctIndex === -1) {
            return this.generateQuestion(studentId, classCode, progressIndex + 1);
        }

        return {
            id: crypto.createHmac('sha256', process.env.CHICORUN_HMAC_SECRET || 'secret').update(`${progressIndex}:${seed}`).digest('hex'),
            seed,
            type,
            level,
            question,
            choices: finalChoices,
            correctIndex,
            explanation,
        };
    }
}
