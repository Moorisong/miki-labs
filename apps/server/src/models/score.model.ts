import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IScore extends Document {
  userId: Types.ObjectId;
  score: number;
  attempts: number;
  dollsCaught: number;
  createdAt: Date;
}

const scoreSchema = new Schema<IScore>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    score: {
      type: Number,
      required: true,
      index: true
    },
    attempts: {
      type: Number,
      required: true
    },
    dollsCaught: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for ranking optimization
scoreSchema.index({ score: -1, createdAt: 1 });

export const Score = mongoose.model<IScore>('Score', scoreSchema);
