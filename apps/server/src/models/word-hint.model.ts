import mongoose, { Document, Schema } from 'mongoose';

export interface IWordHint extends Document {
    wid: number;
    mid: number;
    hint: string;
    difficulty?: number;
}

const wordHintSchema = new Schema<IWordHint>(
    {
        wid: {
            type: Number,
            required: true,
            index: true,
        },
        mid: {
            type: Number,
            required: true,
        },
        hint: {
            type: String,
            required: true,
        },
        difficulty: {
            type: Number,
            default: 1,
        },
    },
    {
        timestamps: true,
    }
);

wordHintSchema.index({ wid: 1, mid: 1 });

export const WordHintModel =
    mongoose.models.WordHint as mongoose.Model<IWordHint> ||
    mongoose.model<IWordHint>('WordHint', wordHintSchema);
