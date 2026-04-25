import mongoose, { Document, Schema } from 'mongoose';

export interface IWordRushUsedProblem {
    wid: number;
    mid: number;
    hintId: mongoose.Types.ObjectId;
}

export interface IChicorunWordRushSession extends Document {
    studentId: mongoose.Types.ObjectId;
    used: IWordRushUsedProblem[];
    expiresAt: Date;
}

const chicorunWordRushSessionSchema = new Schema<IChicorunWordRushSession>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'ChicorunStudent',
            required: true,
            index: true,
        },
        used: [
            {
                wid: { type: Number, required: true },
                mid: { type: Number, required: true },
                hintId: { type: Schema.Types.ObjectId, required: true },
            },
        ],
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: '0s' }, // TTL index
        },
    },
    {
        timestamps: true,
    }
);

export const ChicorunWordRushSessionModel = mongoose.models.ChicorunWordRushSession as mongoose.Model<IChicorunWordRushSession> ||
    mongoose.model<IChicorunWordRushSession>('ChicorunWordRushSession', chicorunWordRushSessionSchema);
