import crypto from 'crypto';
import { ChicorunProblemModel, IChicorunProblem } from '../models/chicorun-problem.model';

export type QuestionType =
    | 'vocab'
    | 'basic_grammar'
    | 'simple_fact'
    | 'synonym'
    | 'context_vocab'
    | 'inference'
    | 'main_idea'
    | 'purpose'
    | 'connector'
    | 'summary'
    | 'long_inference'
    | 'attitude'
    | 'blank_grammar'
    | 'order_arrange'
    | 'comparison'
    | 'true_false'
    | 'integrated'
    | 'purpose_detailed';

export interface Problem extends Partial<IChicorunProblem> {
    id: string;
    level: number;
    difficulty: 'easy' | 'medium' | 'hard';
    passage: string;
    question: string;
    choices: [string, string, string, string];
    answer: number; // correctAnswerIndex mapping
    explanation: string;
    questionType: string;
    wordCount: number;
    seed?: string;
    progressIndex?: number;
    questionNumber?: number;
    point?: number;
    penaltyMessage?: string;
    orderIndex: number;
    totalProblemsInLevel: number;
}

export class ChicorunProblemService {
    /**
     * progressIndex로부터 (level, orderIndex)를 계산합니다.
     * 1-30: 12문제씩 (총 360)
     * 31-70: 15문제씩 (총 600)
     * 71-100: 18문제씩 (총 540)
     */
    static getLevelAndOrderIndex(progressIndex: number): { level: number; orderIndex: number } {
        if (progressIndex < 360) {
            return {
                level: Math.floor(progressIndex / 12) + 1,
                orderIndex: (progressIndex % 12) + 1,
            };
        } else if (progressIndex < 960) {
            const offset = progressIndex - 360;
            return {
                level: Math.floor(offset / 15) + 31,
                orderIndex: (offset % 15) + 1,
            };
        } else {
            const offset = Math.min(progressIndex - 960, 539); // 최대 1499까지
            return {
                level: Math.floor(offset / 18) + 71,
                orderIndex: (offset % 18) + 1,
            };
        }
    }

    /**
     * 특정 레벨의 시작 progressIndex를 반환합니다.
     */
    static getStartProgressIndexForLevel(level: number): number {
        if (level <= 30) {
            return (level - 1) * 12;
        } else if (level <= 70) {
            return 360 + (level - 31) * 15;
        } else {
            return 960 + (Math.min(level, 100) - 71) * 18;
        }
    }

    static generateSeed(studentId: string, classCode: string, progressIndex: number): string {
        const data = `${studentId}-${classCode}-${progressIndex}`;
        return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
    }

    /**
     * DB에서 해당 progressIndex 및 difficulty에 맞는 문제를 조회합니다.
     */
    static async getQuestion(
        studentId: string,
        classCode: string,
        progressIndex: number,
        difficulty?: 'easy' | 'medium' | 'hard'
    ): Promise<Problem> {
        const { level, orderIndex } = this.getLevelAndOrderIndex(progressIndex);
        const totalProblemsInLevel = level <= 30 ? 12 : level <= 70 ? 15 : 18;

        // 난이도가 없으면 레벨에 맞는 기본값 설정
        const targetDifficulty = difficulty || (level <= 30 ? 'easy' : level <= 70 ? 'medium' : 'hard');

        let problemDoc = await ChicorunProblemModel.findOne({
            level,
            orderIndex,
            difficulty: targetDifficulty
        }).lean();

        // 만약 해당 문제가 없으면 (시딩 안된 경우 등), 임시 데이터 반환
        if (!problemDoc) {
            return {
                id: `placeholder-${level}-${orderIndex}-${targetDifficulty}`,
                level,
                difficulty: targetDifficulty,
                orderIndex,
                passage: "문제가 준비 중입니다.",
                question: "조금만 기다려주세요!",
                choices: ["대기 1", "대기 2", "대기 3", "대기 4"],
                answer: 0,
                explanation: "새로운 문제가 곧 추가될 예정입니다! 🔥",
                questionType: 'vocab',
                wordCount: 5,
                seed: this.generateSeed(studentId, classCode, progressIndex),
                progressIndex,
                questionNumber: orderIndex,
                point: 10,
                totalProblemsInLevel
            };
        }

        return {
            id: problemDoc.problemId,
            level: problemDoc.level,
            difficulty: problemDoc.difficulty,
            orderIndex: problemDoc.orderIndex,
            passage: problemDoc.passage,
            question: problemDoc.question,
            choices: problemDoc.choices as [string, string, string, string],
            answer: problemDoc.correctAnswerIndex,
            explanation: problemDoc.explanation,
            questionType: problemDoc.questionType,
            wordCount: problemDoc.wordCount,
            seed: this.generateSeed(studentId, classCode, progressIndex),
            progressIndex,
            questionNumber: orderIndex,
            point: 10, // 기본 포인트
            totalProblemsInLevel
        };
    }
}

