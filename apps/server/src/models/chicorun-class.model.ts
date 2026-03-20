import mongoose, { Document, Schema } from 'mongoose';

export interface IChicorunClass extends Document {
    classCode: string;
    teacherId: mongoose.Types.ObjectId;
    title: string;
    createdAt: Date;
    updatedAt: Date;
}

const chicorunClassSchema = new Schema<IChicorunClass>(
    {
        classCode: {
            type: String,
            required: true,
            unique: true,
            index: true,
            uppercase: true,
            trim: true,
        },
        teacherId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export const ChicorunClassModel = mongoose.models.ChicorunClass as mongoose.Model<IChicorunClass> ||
    mongoose.model<IChicorunClass>('ChicorunClass', chicorunClassSchema);
