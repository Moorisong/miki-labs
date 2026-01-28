import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFingerprint extends Document {
    hash: string;                    // 브라우저 핑거프린트 해시
    userId: Types.ObjectId;          // 연결된 유저
    userAgent: string;               // User-Agent 문자열
    screenResolution?: string;       // 화면 해상도
    timezone?: string;               // 타임존
    language?: string;               // 브라우저 언어
    platform?: string;               // OS 플랫폼
    ipAddresses: string[];           // 사용한 IP 주소 목록
    isBanned: boolean;               // 차단 여부
    banReason?: string;              // 차단 사유
    suspicionScore: number;          // 의심 점수 (0-100)
    createdAt: Date;
    updatedAt: Date;
}

const fingerprintSchema = new Schema<IFingerprint>(
    {
        hash: {
            type: String,
            required: true,
            index: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        userAgent: {
            type: String,
            required: true
        },
        screenResolution: String,
        timezone: String,
        language: String,
        platform: String,
        ipAddresses: {
            type: [String],
            default: []
        },
        isBanned: {
            type: Boolean,
            default: false
        },
        banReason: String,
        suspicionScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    },
    {
        timestamps: true
    }
);

// 복합 인덱스
fingerprintSchema.index({ hash: 1, userId: 1 });
fingerprintSchema.index({ isBanned: 1 });

export const Fingerprint = mongoose.model<IFingerprint>('Fingerprint', fingerprintSchema);
