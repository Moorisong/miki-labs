import mongoose, { Document, Schema } from 'mongoose';

export interface IChicorunWordRushLegend extends Document {
    studentId: mongoose.Types.ObjectId;
    score: number;
    correctCount: number;
    achievedAt: Date;
}

const chicorunWordRushLegendSchema = new Schema<IChicorunWordRushLegend>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'ChicorunStudent',
            required: true,
        },
        score: {
            type: Number,
            required: true,
            min: 0,
        },
        correctCount: {
            type: Number,
            required: true,
            min: 0,
        },
        achievedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// 단일 레전드만 관리하므로 콜렉션에 하나의 문서만 존재하게 됨
export const ChicorunWordRushLegendModel = mongoose.models.ChicorunWordRushLegend as mongoose.Model<IChicorunWordRushLegend> ||
    mongoose.model<IChicorunWordRushLegend>('ChicorunWordRushLegend', chicorunWordRushLegendSchema);
