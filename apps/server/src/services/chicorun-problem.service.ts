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

    static getRecommendedDifficulty(level: number): 'easy' | 'medium' | 'hard' {
        if (level <= 30) return 'easy';
        if (level <= 70) return 'medium';
        return 'hard';
    }

    static getDifficultyPenalty(targetDifficulty: 'easy' | 'medium' | 'hard', level: number, achievedMaxLevel: number = 1): { factor: number; message?: string } {
        // 1. 레벨 차이에 따른 페널티 (기획안: -3레벨 이하: 50%, -6레벨 이하: 30% 수준)
        let levelFactor = 1.0;
        if (level < achievedMaxLevel - 6) levelFactor = 0.3;
        else if (level < achievedMaxLevel - 3) levelFactor = 0.5;

        // 2. 난이도 설정에 따른 페널티 (현재 구간보다 낮은 난이도 선택 시)
        const recommended = this.getRecommendedDifficulty(level);
        const weights = { easy: 1, medium: 2, hard: 3 };

        const diffScore = weights[recommended] - weights[targetDifficulty];

        let diffFactor = 1.0;
        if (diffScore === 1) diffFactor = 0.6;
        else if (diffScore === 2) diffFactor = 0.4;

        // 보수적으로 더 강력한 페널티 적용
        const factor = Math.min(levelFactor, diffFactor);

        if (factor >= 1.0) return { factor: 1.0 };

        const message = "이 난이도/레벨은 포인트가 적게 나와요.\n더 도전적인 문제를 풀어보세요!";
        return { factor, message };
    }

    /**
     * DB에서 해당 progressIndex 및 difficulty에 맞는 문제를 조회합니다.
     */
    static async getQuestion(
        studentId: string,
        progressIndex: number,
        difficulty?: 'easy' | 'medium' | 'hard',
        achievedMaxLevel: number = 1
    ): Promise<Problem> {
        const { level, orderIndex } = this.getLevelAndOrderIndex(progressIndex);
        const totalProblemsInLevel = level <= 30 ? 12 : level <= 70 ? 15 : 18;

        // 난이도가 없으면 레벨에 맞는 기본값 설정
        const targetDifficulty = difficulty || this.getRecommendedDifficulty(level);

        const { factor, message: penaltyMessage } = this.getDifficultyPenalty(targetDifficulty, level, achievedMaxLevel);

        const basePoint = 5;
        const adjustedPoint = Math.max(1, Math.floor(basePoint * factor));

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
                point: adjustedPoint,
                penaltyMessage,
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
            seed: this.generateSeed(studentId, progressIndex),
            progressIndex,
            questionNumber: orderIndex,
            point: adjustedPoint,
            penaltyMessage,
            totalProblemsInLevel
        };
    }
}

