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
        } else if (progressIndex < 1500) {
            const offset = progressIndex - 960;
            return {
                level: Math.floor(offset / 18) + 71,
                orderIndex: (offset % 18) + 1,
            };
        } else {
            // 1500번 이상 (종료 상태)
            return { level: 100, orderIndex: 19 };
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

    static generateSeed(studentId: string, progressIndex: number): string {
        const data = `${studentId}-${progressIndex}`;
        return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
    }

    /**
     * DB에서 해당 progressIndex에 맞는 문제를 조회합니다.
     */
    static async getQuestion(
        studentId: string,
        progressIndex: number,
    ): Promise<Problem> {
        const { level, orderIndex } = this.getLevelAndOrderIndex(progressIndex);
        const totalProblemsInLevel = level <= 30 ? 12 : level <= 70 ? 15 : 18;

        const basePoint = 5;

        let problemDoc = await ChicorunProblemModel.findOne({
            level,
            orderIndex,
        }).lean();

        // 만약 해당 문제가 없으면 (시딩 안된 경우 등), 임시 데이터 반환
        if (!problemDoc) {
            return {
                id: `placeholder-${level}-${orderIndex}`,
                level,
                orderIndex,
                passage: "새로운 문제가 곧 추가될 예정입니다. 🔥",
                question: `[Lv.${level} - ${orderIndex}번] 문제가 준비 중입니다.`,
                choices: ["잠시만 기다려주세요", "다른 문제 풀기", "복습하러 가기", "대기 중"],
                answer: 0,
                explanation: `${level}레벨 ${orderIndex}번 문제가 아직 준비되지 않았어요! 조금만 기다려주세요.`,
                questionType: 'vocab',
                wordCount: 5,
                seed: this.generateSeed(studentId, progressIndex),
                progressIndex,
                questionNumber: orderIndex,
                point: basePoint,
                totalProblemsInLevel
            };
        }

        return {
            id: problemDoc.problemId,
            level: problemDoc.level,
            orderIndex: problemDoc.orderIndex,
            passage: problemDoc.passage,
            question: problemDoc.question,
            choices: problemDoc.choices as [string, string, string, string],
            answer: problemDoc.correctAnswerIndex,
            explanation: problemDoc.explanation,
            questionType: problemDoc.questionType,
            wordCount: problemDoc.wordCount,
            seed: this.generateSeed(studentId, progressIndex),
            progressIndex,
            questionNumber: orderIndex,
            point: basePoint,
            totalProblemsInLevel
        };
    }
}

