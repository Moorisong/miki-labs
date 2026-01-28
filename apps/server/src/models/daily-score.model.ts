import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IDailyScore extends Document {
    userId: Types.ObjectId;
    date: string;                    // YYYY-MM-DD 형식
    totalScore: number;              // 당일 총 획득 점수
    submissionCount: number;         // 당일 제출 횟수
    lastSubmittedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const dailyScoreSchema = new Schema<IDailyScore>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        date: {
            type: String,
            required: true
        },
        totalScore: {
            type: Number,
            default: 0
        },
        submissionCount: {
            type: Number,
            default: 0
        },
        lastSubmittedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// 유저별 날짜별 고유 인덱스
dailyScoreSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyScore = mongoose.model<IDailyScore>('DailyScore', dailyScoreSchema);
