import { Schema, Types } from 'mongoose';
import { getHtsmConnection } from '../config/database';

export interface IJohariAnswer {
    testId: Types.ObjectId;
    keywords: string[];
    fingerprintHash: string;
    ip: string;
    userAgent: string;
    createdAt: Date;
}

const johariAnswerSchema = new Schema<IJohariAnswer>(
    {
        testId: {
            type: Schema.Types.ObjectId,
            ref: 'JohariTest',
            required: true,
            index: true,
        },
        keywords: {
            type: [String],
            required: true,
            validate: {
                validator: (v: string[]) => v.length >= 3 && v.length <= 5,
                message: 'keywords must contain 3 to 5 items',
            },
        },
        fingerprintHash: {
            type: String,
            required: true,
            index: true,
            maxlength: 200,
        },
        ip: {
            type: String,
            required: true,
        },
        userAgent: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// 복합 인덱스: 같은 테스트에서 같은 fingerprint 중복 방지
johariAnswerSchema.index({ testId: 1, fingerprintHash: 1 }, { unique: true });
// TTL: 30일 후 자동 삭제
johariAnswerSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

/** HTSM 전용 DB 커넥션에서 모델 반환 */
export const getJohariAnswerModel = () => {
    const conn = getHtsmConnection();
    return conn.models.JohariAnswer || conn.model<IJohariAnswer>('JohariAnswer', johariAnswerSchema);
};
