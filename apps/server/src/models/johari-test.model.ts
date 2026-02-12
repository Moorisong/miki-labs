import { Schema } from 'mongoose';
import { getHtsmConnection } from '../config/database';

export interface IJohariTest {
    shareId: string;
    selfKeywords: string[];
    answerCount: number;
    isClosed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const johariTestSchema = new Schema<IJohariTest>(
    {
        shareId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        selfKeywords: {
            type: [String],
            required: true,
            validate: {
                validator: (v: string[]) => v.length === 3,
                message: 'selfKeywords must contain exactly 3 items',
            },
        },
        answerCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        isClosed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// TTL: 30일 후 자동 삭제
johariTestSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

/** HTSM 전용 DB 커넥션에서 모델 반환 */
export const getJohariTestModel = () => {
    const conn = getHtsmConnection();
    return conn.models.JohariTest || conn.model<IJohariTest>('JohariTest', johariTestSchema);
};
