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
}

export interface IChicorunStudent extends Document {
    classCode: string;
    nickname: string;
    passwordHash: string;
    progressIndex: number;
    point: number;
    badge: string;
    nicknameStyle: INicknameStyle;
    cardStyle: string;
    customize: ICustomizeData;
    ownedItems: string[];
    currentLevel: number;
    achievedMaxLevel: number; // 학생이 도달한 최고 레벨 (페널티 계산 기준)
    currentLevelSolvedCount: number; // 현재 레벨에서 맞힌 문제 수
    currentLevelTotalCount: number;  // 현재 레벨에서 푼 전체 문제 수
    currentLevelMaxStreak: number;   // 현재 레벨에서의 최대 연속 정답 수
    currentLevelCurrentStreak: number; // 현재 연속 정답 수
    startLevel: number;
    adjustmentCount: number;
    currentQuestionAttempts: number; // 현재 문제 시도 횟수 (1부터 시작, 정답 시 1로 리셋)
    createdAt: Date;
    updatedAt: Date;
}

const stickerPlacementSchema = new Schema<IStickerPlacement>(
    {
        id: { type: String, required: true },
        emoji: { type: String, required: true },
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        scale: { type: Number, default: 1 },
        rotate: { type: Number, default: 0 },
    },
    { _id: false }
);

const nicknameStyleSchema = new Schema<INicknameStyle>(
    {
        color: { type: String, default: '#ffffff' },
        bold: { type: Boolean, default: false },
        italic: { type: Boolean, default: false },
        underline: { type: Boolean, default: false },
        fontSize: { type: Number, default: 16 },
        x: { type: Number, default: 120 },
        y: { type: Number, default: 25 },
        rotate: { type: Number, default: 0 },
    },
    { _id: false }
);

const chicorunStudentSchema = new Schema<IChicorunStudent>(
    {
        classCode: {
            type: String,
            required: true,
            index: true,
            uppercase: true,
            trim: true,
        },
        nickname: {
            type: String,
            required: true,
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
        badge: {
            type: String,
            default: '🎯',
        },
        nicknameStyle: {
            type: nicknameStyleSchema,
            default: () => ({ color: '#ffffff', bold: false, italic: false, underline: false, rotate: 0 }),
        },
        cardStyle: {
            type: String,
            default: 'linear-gradient(135deg, #60a5fa, #06b6d4)',
        },
        customize: {
            stickers: { type: [stickerPlacementSchema], default: [] },
            frameId: { type: String, default: 'default' },
            badgeId: { type: String, default: 'default' },
            borderStyle: { type: Schema.Types.Mixed, default: () => ({ color: '#ffffff', width: 0, style: 'solid', radius: 16 }) },
            pointStyle: { type: Schema.Types.Mixed, default: () => ({ color: '#f97316', background: 'transparent', borderWidth: 0, borderColor: '#ffffff', fontSize: 16, x: 580, y: 20 }) },
            rankStyle: { type: Schema.Types.Mixed, default: () => ({ color: '#94a3b8', fontSize: 20, x: 24, y: 20 }) },
            badgeStyle: { type: Schema.Types.Mixed, default: () => ({ fontSize: 24, x: 80, y: 20 }) },
        },
        ownedItems: {
            type: [String],
            default: ['bg-white', 'border-solid'],
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
    },
    {
        timestamps: true,
    }
);

// 같은 클래스 내 닉네임 unique 인덱스
chicorunStudentSchema.index({ classCode: 1, nickname: 1 }, { unique: true });

export const ChicorunStudentModel = mongoose.models.ChicorunStudent as mongoose.Model<IChicorunStudent> ||
    mongoose.model<IChicorunStudent>('ChicorunStudent', chicorunStudentSchema);
