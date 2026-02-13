import { Schema } from 'mongoose';
import { getHtsmConnection } from '../config/database';

export interface IJohariTest {
    shareId: string;
    selfKeywords: string[];
    answerCount: number;
    isClosed: boolean;
    creatorFingerprint?: string; // 생성자 식별용 (DB 조회)
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
                validator: (v: string[]) => v.length >= 3 && v.length <= 5,
                message: 'selfKeywords must contain 3 to 5 items',
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
        creatorFingerprint: {
            type: String,
            index: true, // 빠른 조회를 위해 인덱스 추가
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
