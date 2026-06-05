import { Schema, Document, Types } from 'mongoose';
import { getPuzzleConnection } from '../config/database';

export interface IPuzzleResult extends Document {
  userId: Types.ObjectId;
  puzzleId: Types.ObjectId;
  mode: 'solo' | 'ranked';
  difficulty: 'novice' | 'beginner' | 'expert';
  completionTime: number;
  challengeToken: string;
  startedAt: Date;
  completedAt: Date;
  savedAt: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const puzzleResultSchema = new Schema<IPuzzleResult>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    puzzleId: { type: Schema.Types.ObjectId, ref: 'Puzzle', required: true, index: true },
    mode: { type: String, enum: ['solo', 'ranked'], required: true },
    difficulty: { type: String, enum: ['novice', 'beginner', 'expert'], required: true },
    completionTime: { type: Number, required: true },
    challengeToken: { type: String, required: true },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date, required: true },
    savedAt: { type: Date, default: Date.now },
    completed: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// 랭킹 조회용 초고속 정렬 복합 인덱스
puzzleResultSchema.index({ puzzleId: 1, completionTime: 1, savedAt: 1 });
// 특정 유저의 특정 퍼즐 결과 유일화 방지는 하지 않음 (한 사람이 여러번 도전할 수도 있고, 최고기록만 필터할 수 있음)
// 하지만 "참여자 수"는 1인 1기록이므로 나중에 처리
puzzleResultSchema.index({ puzzleId: 1, userId: 1 });

/** 하루퍼즐 결과 모델 반환 */
export const getPuzzleResultModel = () => {
  const conn = getPuzzleConnection();
  return conn.models.PuzzleResult || conn.model<IPuzzleResult>('PuzzleResult', puzzleResultSchema);
};
