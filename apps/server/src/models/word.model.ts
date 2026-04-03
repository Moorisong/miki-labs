import mongoose, { Document, Schema } from 'mongoose';

export interface IMeaning {
    mid: number;
    en: string[];
    ko: string[];
}

export interface IWord extends Document {
    wid: number;
    meanings: IMeaning[];
    level: number;
}

const meaningSchema = new Schema<IMeaning>(
    {
        mid: {
            type: Number,
            required: true,
        },
        en: {
            type: [String],
            required: true,
        },
        ko: {
            type: [String],
            required: true,
        },
    },
    { _id: false }
);

const wordSchema = new Schema<IWord>(
    {
        wid: {
            type: Number,
            required: true,
            unique: true,
            index: true,
        },
        meanings: {
            type: [meaningSchema],
            required: true,
            validate: [
                (val: IMeaning[]) => val.length >= 1,
                'At least one meaning is required',
            ],
        },
        level: {
            type: Number,
            required: true,
            index: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// wid + mid 기반 빠른 조회를 위한 인덱스
wordSchema.index({ level: 1, wid: 1 });

export const WordModel =
    (mongoose.models.Word as mongoose.Model<IWord>) ||
    mongoose.model<IWord>('Word', wordSchema);
