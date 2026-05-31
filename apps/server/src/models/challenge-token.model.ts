import { Schema, Document, Types } from 'mongoose';
import { getPuzzleConnection } from '../config/database';

export interface IChallengeToken extends Document {
  userId: Types.ObjectId;
  puzzleId: Types.ObjectId;
  token: string;
  issuedAt: Date;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const challengeTokenSchema = new Schema<IChallengeToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    puzzleId: { type: Schema.Types.ObjectId, ref: 'Puzzle', required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    issuedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// TTL 인덱스 설정: expiresAt 시점에 문서 자동 삭제
challengeTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/** 챌린지 시작 1회용 토큰 모델 반환 */
export const getChallengeTokenModel = () => {
  const conn = getPuzzleConnection();
  return conn.models.ChallengeToken || conn.model<IChallengeToken>('ChallengeToken', challengeTokenSchema);
};
