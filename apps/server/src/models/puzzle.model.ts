import { Schema, Document } from 'mongoose';
import { getPuzzleConnection } from '../config/database';

export interface IPuzzle extends Document {
  week: number;
  title: string;
  imageUrl: string;
  startDate: Date;
  endDate: Date;
  participantCount: number;
  playCount: number;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const puzzleSchema = new Schema<IPuzzle>(
  {
    week: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    participantCount: { type: Number, default: 0 },
    playCount: { type: Number, default: 0 },
    archived: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

/** 하루퍼즐 모델 반환 */
export const getPuzzleModel = () => {
  const conn = getPuzzleConnection();
  return conn.models.Puzzle || conn.model<IPuzzle>('Puzzle', puzzleSchema);
};
