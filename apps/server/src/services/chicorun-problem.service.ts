import crypto from 'crypto';

export type QuestionType =
    | 'vocab'
    | 'grammar'
    | 'fact'
    | 'inference'
    | 'mainIdea'
    | 'purpose'
    | 'attitude'
    | 'blank'
    | 'order'
    | 'comparison';

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

export interface Problem {
    id: string;
    level: number;
    difficulty: 'easy' | 'medium' | 'hard';
    passage: string;
    question: string;
    choices: string[];
    answer: number;
    explanation: string;
    questionType: QuestionType;
    wordCount: number;
    seed?: string;
    progressIndex?: number;
    questionNumber?: number;
    point?: number;
    penaltyMessage?: string;
}

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
    static getLevelByProgressIndex(progressIndex: number): number {
        return Math.floor(progressIndex / 100) + 1;
    }

    static getLevelLabel(progressIndex: number): 'beginner' | 'intermediate' | 'advanced' {
        const level = this.getLevelByProgressIndex(progressIndex);
        if (level <= 30) return 'beginner';
        if (level <= 70) return 'intermediate';
        return 'advanced';
    }

    static generateSeed(studentId: string, classCode: string, progressIndex: number): string {
        const data = `${studentId}-${classCode}-${progressIndex}`;
        return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
    }

    static generateMockProblem(currentLevel: number, difficulty: string): Problem {
        const prng = new DeterministicPRNG(`mock-${currentLevel}-${difficulty}`);

        // 난이도별 출제 범위 결정
        let targetLevel = currentLevel;
        if (difficulty === 'easy') {
            targetLevel = prng.nextInt(Math.max(1, currentLevel - 10), Math.min(100, currentLevel + 5));
        } else if (difficulty === 'medium') {
            targetLevel = prng.nextInt(Math.max(1, currentLevel - 5), Math.min(100, currentLevel + 10));
        } else if (difficulty === 'hard') {
            targetLevel = prng.nextInt(currentLevel, Math.min(100, currentLevel + 20));
        }

        // 포인트 페널티 계산
        let basePoint = 10;
        let penaltyMessage = undefined;
        const levelDiff = currentLevel - targetLevel;

        if (levelDiff >= 6) {
            basePoint = 2; // 0P~3P 중 2P
            penaltyMessage = "이 난이도는 포인트가 적게 나와요. 더 도전적인 문제를 풀어보세요!";
        } else if (levelDiff >= 3) {
            basePoint = 5; // 50%
            penaltyMessage = "이 난이도는 포인트가 절반만 지급됩니다.";
        }

        const actualDifficulty: 'easy' | 'medium' | 'hard' =
            targetLevel > 70 ? 'hard' : targetLevel > 30 ? 'medium' : 'easy';

        let passage = '';
        let wordCount = 0;
        let questionType: QuestionType = 'fact';
        let question = '';
        let choices: string[] = [];
        let answer = 0;
        let explanation = '';

        if (actualDifficulty === 'easy') {
            const subjects = ['The cat', 'A small bird', 'My teacher', 'Yesterday', 'Summer vacation'];
            const verbs = ['is sleeping', 'was singing', 'explained the rules', 'started well', 'is very hot'];
            passage = `${prng.pickOne(subjects)} ${prng.pickOne(verbs)}.`;
            wordCount = passage.split(' ').length;
            questionType = prng.pickOne(['vocab', 'grammar', 'fact']);
            question = '지문의 주인공은 누구인가요?';
            choices = ['The cat', 'A dog', 'The teacher', 'A bird'];
            answer = 0;
            explanation = '지문에서 첫 번째 단어를 잘 찾아봐! 아주 쉬운 문제야 🚀';
        } else if (actualDifficulty === 'medium') {
            passage = `Modern technology has changed our lives in many ways. People can communicate with each other easily through social media. However, some scientists are worried about the negative effects of using smartphones too much. They say that it can hurt our eyes and make us feel lonely. We need to find a balance between using technology and spending time with our family.`;
            wordCount = passage.split(' ').length;
            questionType = prng.pickOne(['inference', 'mainIdea', 'purpose', 'vocab']);
            question = '이 지문의 핵심 주제로 가장 적절한 것은?';
            choices = [
                'The history of social media',
                'Negative effects of excessive smartphone use',
                'Benefits of modern communication',
                'How to repair smartphones',
            ];
            answer = 1;
            explanation = '지문 후반부에 "worried about negative effects" 부분을 잘 읽어봐! 🤔';
        } else {
            passage = `Quantum entanglement is a phenomenon in quantum mechanics where particles become interconnected such that the state of one particle cannot be described independently of the other. This complex relationship remains even if they are separated by vast distances. Einstein famously referred to this as "spooky action at a distance." Recent experiments have confirmed that this occurs instantaneously, challenging our classic understanding of space and time. Furthermore, the development of quantum computers relies heavily on this principle to perform calculations at speeds impossible for classical machines. While the theoretical implications are still being debated among physicists, the practical applications in encryption and communication technology are beginning to emerge, promising a revolution in the digital era.`;
            wordCount = passage.split(' ').length;
            questionType = prng.pickOne(['blank', 'order', 'comparison', 'attitude']);
            question = 'Which of the following is NOT mentioned about quantum entanglement?';
            choices = [
                'It involves particles being interconnected regardless of distance.',
                'Einstein was skeptical of this phenomenon initially.',
                'It is used to speed up classical computer repairs.',
                'It has potential applications in digital encryption.',
            ];
            answer = 2;
            explanation = '수능에서 자주 나오는 함축/불일치 유형입니다. 지문 속 "classical machines"와 "quantum computers"의 관계를 명확히 구분하세요! 👑';
        }

        return {
            id: crypto.createHash('sha256').update(`${targetLevel}-${difficulty}-${passage}`).digest('hex').substring(0, 16),
            level: targetLevel,
            difficulty: difficulty as any,
            passage,
            question,
            choices,
            answer,
            explanation,
            questionType,
            wordCount,
            point: basePoint,
            penaltyMessage
        };
    }

    static generateQuestion(studentId: string, classCode: string, progressIndex: number, selectedDifficulty?: string): Problem {
        const currentLevel = this.getLevelByProgressIndex(progressIndex);
        const difficulty = selectedDifficulty || (currentLevel <= 30 ? 'easy' : currentLevel <= 70 ? 'medium' : 'hard');

        const problem = this.generateMockProblem(currentLevel, difficulty);

        return {
            ...problem,
            seed: this.generateSeed(studentId, classCode, progressIndex),
            progressIndex,
            questionNumber: (progressIndex % 100) + 1,
        };
    }
}
