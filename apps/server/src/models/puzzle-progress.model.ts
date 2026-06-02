import { Schema, Document, Types } from 'mongoose';
import { getPuzzleConnection } from '../config/database';

export interface IPuzzleProgress extends Document {
  userId: Types.ObjectId;
  puzzleId: Types.ObjectId;
  progress: number;
  lastPlayedAt: Date;
  detailState?: any;
  createdAt: Date;
  updatedAt: Date;
}

const puzzleProgressSchema = new Schema<IPuzzleProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    puzzleId: { type: Schema.Types.ObjectId, ref: 'Puzzle', required: true },
    progress: { type: Number, required: true, min: 0, max: 100 },
    lastPlayedAt: { type: Date, default: Date.now },
    detailState: { type: Schema.Types.Mixed, required: false },
  },
  {
    timestamps: true,
  }
);

// 사용자별 퍼즐별 1개의 진행도만 유지하도록 유니크 복합 인덱스 지정
puzzleProgressSchema.index({ userId: 1, puzzleId: 1 }, { unique: true });

/** 하루퍼즐 실시간 진행률 모델 반환 */
export const getPuzzleProgressModel = () => {
  const conn = getPuzzleConnection();
  return conn.models.PuzzleProgress || conn.model<IPuzzleProgress>('PuzzleProgress', puzzleProgressSchema);
};
