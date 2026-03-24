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
        subjects: ['The environmental impact', 'Technological advancement', 'Success in life', 'Continuous effort'],
        verbs: ['requires', 'influence', 'demonstrates', 'concluded', 'have emphasized', 'has transformed'],
        places: ['global markets', 'modern society', 'educational institutions', 'diverse cultures'],
        food: ['nutritional value', 'processed products', 'organic ingredients'],
        time: ['in the long run', 'for centuries', 'simultaneously'],
        person: ['philosophers', 'scientists', 'researchers', 'professionals'],
        adjective: ['inevitable', 'significant', 'sustainable', 'complicated', 'efficient'],
        object: ['the complexity of the issue', 'a new perspective', 'substantial evidence'],
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

export class ChicorunProblemService {
    static getLevelByProgressIndex(progressIndex: number): 'beginner' | 'intermediate' | 'advanced' {
        if (progressIndex < 3000) return 'beginner';
        if (progressIndex < 7000) return 'intermediate';
        return 'advanced';
    }

    static getTypeByIndex(progressIndex: number): QuestionType {
        const level = this.getLevelByProgressIndex(progressIndex);
        const levelRatios = RATIOS[level];
        const typePool: QuestionType[] = [];
        Object.entries(levelRatios).forEach(([type, ratio]) => {
            for (let i = 0; i < ratio; i++) {
                typePool.push(type as QuestionType);
            }
        });
        const blockIndex = Math.floor(progressIndex / 100);
        const offsetInBlock = progressIndex % 100;
        const prng = new DeterministicPRNG(`type-sequence-${level}-${blockIndex}`);
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

    static generateQuestion(studentId: string, classCode: string, progressIndex: number) {
        const seed = this.generateSeed(studentId, classCode, progressIndex);
        const type = this.getTypeByIndex(progressIndex);
        const level = this.getLevelByProgressIndex(progressIndex);
        const prng = new DeterministicPRNG(seed);

        const wordPool = { ...WORDS.beginner };
        if (level === 'intermediate' || level === 'advanced') {
            if (level === 'intermediate') {
                Object.keys(wordPool).forEach((key) => {
                    (wordPool as any)[key] = [...(wordPool as any)[key], ...((WORDS.intermediate as any)[key] || [])];
                });
            } else if (level === 'advanced') {
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
                if (v.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(v[v.length - 2])) return v.slice(0, -1) + 'ied';
                if (v.endsWith('e')) return v + 'd';
                return v + 'ed';
            }
            if (isThirdPersonSingular(s)) {
                if (v === 'go') return 'goes';
                if (v === 'do') return 'does';
                if (v === 'study') return 'studies';
                if (v.endsWith('sh') || v.endsWith('ch')) return v + 'es';
                return v + 's';
            }
            return v;
        };

        const getPrep = (v: string, p: string) => {
            if (v === 'go' || v === 'went' || v === 'goes') return 'to';
            if (v === 'visit' || v === 'visited') return '';
            if (p === 'home' && (v === 'go' || v === 'went' || v === 'goes')) return '';
            return 'at';
        };

        let question = '';
        let correctAnswer = '';
        let choices: string[] = [];
        let explanation = '';

        const subj = prng.pickOne(wordPool.subjects);
        const verb = prng.pickOne(wordPool.verbs);
        const place = prng.pickOne(wordPool.places);
        const food = prng.pickOne(wordPool.food);
        const adj = prng.pickOne(wordPool.adjective);
        const obj = prng.pickOne(wordPool.object);

        const prep = getPrep(verb, place);
        const conjVerb = conjugate(verb, subj);

        switch (type) {
            case 'sentence_choice':
                question = `다음 정보를 사용하여 올바른 영어 문장을 고르세요:\n[${subj}, ${verb}, ${place}]`;
                correctAnswer = prep ? `${subj} ${conjVerb} ${prep} ${place}.` : `${subj} ${conjVerb} ${place}.`;
                choices = [
                    correctAnswer,
                    `${subj} ${verb === conjVerb ? (isThirdPersonSingular(subj) ? verb : verb + 's') : verb} ${prep} ${place}.`,
                    `${subj} is ${conjVerb} ${prep} ${place}.`,
                    `${subj} ${conjVerb} with ${place}.`,
                ];
                explanation = isThirdPersonSingular(subj)
                    ? `주어가 '${subj}'면 동사에 s 붙이는 거 국룰 R지?\n'${conjVerb}'로 가보자고!`
                    : `주어가 '${subj}'면 동사는 그냥 원형 '${verb}' 가야지.\n억지로 s 붙이면 킹받음 주의!`;
                break;
            case 'word_order':
                const wordList = prep ? [subj, conjVerb, prep, place] : [subj, conjVerb, place];
                question = `주어진 단어를 올바른 순서로 배열하세요:\n(${wordList.join(', ')})`;
                correctAnswer = wordList.join(' ');
                choices = [
                    correctAnswer,
                    `${subj} ${prep} ${conjVerb} ${place}`.trim().replace('  ', ' '),
                    `${conjVerb} ${subj} ${prep} ${place}`.trim().replace('  ', ' '),
                    `${place} ${conjVerb} ${prep} ${subj}`.trim().replace('  ', ' '),
                ];
                explanation = '영어는 [주어 + 동사] 순서가 근본인 거 고전임.\n순서 꼬이면 가독성 탈락이야!';
                break;
            case 'fill_blank':
                question = `빈칸에 들어갈 알맞은 단어를 고르세요:\n"${subj} ___ ${prep} ${place}."`.replace('  ', ' ');
                correctAnswer = conjVerb;
                choices = [
                    correctAnswer,
                    isThirdPersonSingular(subj) ? verb : verb + 's',
                    verb + 'ing',
                    'to ' + verb,
                ];
                explanation = `주어가 '${subj}'는데 '${conjVerb}' 안 쓰고 뭐함?\n수일치 맞추는 게 진짜 실력임 ㄹㅇ.`;
                break;
            case 'translation':
                const koreanVerb = verb === 'go' ? '간다' : verb === 'eat' ? '먹는다' : verb === 'study' ? '공부한다' : '한다';
                question = `다음 문장을 영어로 번역하세요:\n"${subj}${subj === 'I' || subj === 'You' ? '는' : '은'} ${place}에서 ${koreanVerb}."`;
                correctAnswer = prep ? `${subj} ${conjVerb} ${prep} ${place}.` : `${subj} ${conjVerb} ${place}.`;
                choices = [
                    correctAnswer,
                    `${subj} ${verb === conjVerb ? (isThirdPersonSingular(subj) ? verb : verb + 's') : verb} ${prep} ${place}.`,
                    `${subj} is ${conjVerb} ${prep} ${place}.`,
                    `${subj} are ${verb} ${prep} ${place}.`,
                ];
                explanation = "번역할 때 주어랑 동사 '깔맞춤' 안 하면 촌스러움.\n수일치 신경 써서 폼 올려보자!";
                break;
            case 'transformation':
                question = `다음 문장을 과거형으로 바꾸세요:\n"${subj} ${conjVerb} ${prep} ${place}."`.replace('  ', ' ');
                const pastVerb = conjugate(verb, subj, 'past');
                correctAnswer = prep ? `${subj} ${pastVerb} ${prep} ${place}.` : `${subj} ${pastVerb} ${place}.`;
                choices = [
                    correctAnswer,
                    `${subj} ${conjVerb} ${prep} ${place}.`,
                    `${subj} will ${verb} ${prep} ${place}.`,
                    `${subj} is ${verb} ${prep} ${place}.`,
                ];
                explanation = `'${verb}'가 과거로 가면 '${pastVerb}'로 폼 바뀜.\n시제 틀리면 시공간 오그라듦 ㄷㄷ.`;
                break;
            case 'error_detection':
                const wrongVerb = isThirdPersonSingular(subj) ? verb : verb + 's';
                const wrongSentence = prep ? `${subj} ${wrongVerb} ${prep} ${place}.` : `${subj} ${wrongVerb} ${place}.`;
                question = `다음 문장에서 틀린 부분을 고르세요:\n"${wrongSentence}"`;
                correctAnswer = `'${wrongVerb}'를 '${conjVerb}'로 바꿔야 함`;
                choices = [
                    correctAnswer,
                    `'${subj}'를 'They'로 바꿔야 함`,
                    `'${prep || place}'를 'there'로 바꿔야 함`,
                    '이 문장 폼 미쳤음(이상 없음)',
                ];
                explanation = "실력을 보여줘! 주어랑 동사가 안 맞는 게 딱 걸림.\n수일치 오류는 진짜 참을 수 없지.";
                break;
            default:
                question = `단어의 알맞은 뜻을 고르세요:\n'${verb}'`;
                correctAnswer = verb === 'go' ? '가다' : verb === 'eat' ? '먹다' : verb === 'study' ? '공부하다' : '활동하다';
                choices = [correctAnswer, '잠자다', '행복하다', '어렵다'];
                explanation = "이거 모르면 진짜 에바임.\n기본 단어니까 머릿속에 박제해두자!";
        }

        const finalChoices = prng.shuffle(choices);
        const correctIndex = finalChoices.indexOf(correctAnswer);

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
