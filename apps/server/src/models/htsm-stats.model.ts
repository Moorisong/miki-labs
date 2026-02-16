import { Schema } from 'mongoose';
import { getHtsmConnection } from '../config/database';

export interface IHtsmStats {
    date: Date;
    newTests: number;
    newAnswers: number;
    totalTests: number;
    totalAnswers: number;
}

const htsmStatsSchema = new Schema<IHtsmStats>(
    {
        date: { type: Date, required: true, unique: true },
        newTests: { type: Number, default: 0 },
        newAnswers: { type: Number, default: 0 },
        totalTests: { type: Number, default: 0 },
        totalAnswers: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

/** HTSM 통계 모델 */
export const getHtsmStatsModel = () => {
    const conn = getHtsmConnection();
    return conn.models.HtsmStats || conn.model<IHtsmStats>('HtsmStats', htsmStatsSchema);
};
