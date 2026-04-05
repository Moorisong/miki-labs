import mongoose, { Document, Schema } from 'mongoose';

export interface IStickerPlacement {
    id: string;
    emoji: string;
    x: number;
    y: number;
    scale: number;
    rotate: number;
}

export interface ICustomizeData {
    stickers: IStickerPlacement[];
    frameId: string;
    badgeId: string;
    borderStyle: any;
    pointStyle: any;
    rankStyle: any;
    badgeStyle: any;
}

export interface INicknameStyle {
    color: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    fontSize?: number;
    x?: number;
    y?: number;
    rotate?: number;
    visible?: boolean;
}

export interface IChicorunStudent extends Document {
    nickname: string;
    passwordHash: string;
    progressIndex: number;
    point: number;
    currentLevel: number;
    achievedMaxLevel: number; // 학생이 도달한 최고 레벨 (페널티 계산 기준)
    currentLevelSolvedCount: number; // 현재 레벨에서 맞힌 문제 수
    currentLevelTotalCount: number;  // 현재 레벨에서 푼 전체 문제 수
    currentLevelMaxStreak: number;   // 현재 레벨에서의 최대 연속 정답 수
    currentLevelCurrentStreak: number; // 현재 연속 정답 수
    startLevel: number;
    adjustmentCount: number;
    currentQuestionAttempts: number; // 현재 문제 시도 횟수 (1부터 시작, 정답 시 1로 리셋)
    skillScore?: number; // 공통 게임 스킬스코어 (0~1000)
    friends: mongoose.Types.ObjectId[]; // 수락된 친구들의 _id 배열
    createdAt: Date;
    updatedAt: Date;
}

const chicorunStudentSchema = new Schema<IChicorunStudent>(
    {
        nickname: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        progressIndex: {
            type: Number,
            default: 0,
            min: 0,
        },
        point: {
            type: Number,
            default: 0,
            min: 0,
        },
        currentLevel: {
            type: Number,
            default: 1,
        },
        achievedMaxLevel: {
            type: Number,
            default: 1,
        },
        currentLevelSolvedCount: {
            type: Number,
            default: 0,
        },
        currentLevelTotalCount: {
            type: Number,
            default: 0,
        },
        currentLevelMaxStreak: {
            type: Number,
            default: 0,
        },
        currentLevelCurrentStreak: {
            type: Number,
            default: 0,
        },
        startLevel: {
            type: Number,
            default: 0,
        },
        adjustmentCount: {
            type: Number,
            default: 0,
        },
        currentQuestionAttempts: {
            type: Number,
            default: 1,
            min: 1,
        },
        skillScore: {
            type: Number,
            default: null,
        },
        friends: [{
            type: Schema.Types.ObjectId,
            ref: 'ChicorunStudent',
            default: [],
        }],
    },
    {
        timestamps: true,
    }
);

export const ChicorunStudentModel = mongoose.models.ChicorunStudent as mongoose.Model<IChicorunStudent> ||
    mongoose.model<IChicorunStudent>('ChicorunStudent', chicorunStudentSchema);
