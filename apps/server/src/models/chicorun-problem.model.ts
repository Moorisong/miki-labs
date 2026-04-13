import mongoose, { Document, Schema } from 'mongoose';

export interface IChicorunProblem extends Document {
    problemId: string;           // UUID 또는 level-orderIndex
    level: number;               // 1~100
    difficulty: 'easy' | 'medium' | 'hard';
    orderIndex: number;          // 같은 레벨 내 순서 (1부터 시작)
    passage: string;             // 지문
    question: string;            // 문제 stem
    choices: [string, string, string, string]; // 정확히 4개
    correctAnswerIndex: number;   // 0, 1, 2, 3
    explanation: string;         // 오답 시에만 사용 (MZ 말투)
    questionType: string;        // vocab, basic_grammar 등
    wordCount: number;
    topic: string;               // 지문 주제 (nature, daily_life, science 등)
    source: 'manual' | 'template'; // 문제 출처
    tags: string[];              // 세부 분류 태그
    createdAt: Date;
}

const chicorunProblemSchema = new Schema<IChicorunProblem>(
    {
        problemId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        level: {
            type: Number,
            required: true,
            index: true,
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            required: true,
        },
        orderIndex: {
            type: Number,
            required: true,
        },
        passage: {
            type: String,
            required: true,
        },
        question: {
            type: String,
            required: true,
        },
        choices: {
            type: [String],
            required: true,
            validate: [
                (val: string[]) => val.length === 4,
                'Choices must have exactly 4 items',
            ],
        },
        correctAnswerIndex: {
            type: Number,
            required: true,
            min: 0,
            max: 3,
        },
        explanation: {
            type: String,
            required: true,
        },
        questionType: {
            type: String,
            required: true,
        },
        wordCount: {
            type: Number,
            required: true,
        },
        topic: {
            type: String,
            required: true,
            default: 'general',
        },
        source: {
            type: String,
            enum: ['manual', 'template'],
            required: true,
            default: 'template',
        },
        tags: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// 레벨 내 순서 조회 최적화 (난이도별 고유값 부여)
chicorunProblemSchema.index({ level: 1, orderIndex: 1, difficulty: 1 }, { unique: true });

export const ChicorunProblemModel = mongoose.models.ChicorunProblem as mongoose.Model<IChicorunProblem> ||
    mongoose.model<IChicorunProblem>('ChicorunProblem', chicorunProblemSchema);
