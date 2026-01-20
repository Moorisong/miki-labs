import mongoose, { Types } from 'mongoose';
import { Score, IScore } from '../models/score.model';
import { RankingEntry } from '../types/api.types';

interface PopulatedScore {
  _id: Types.ObjectId;
  userId: {
    _id: Types.ObjectId;
    nickname: string;
  };
  score: number;
  attempts: number;
  dollsCaught: number;
  createdAt: Date;
}

export const getTopRankings = async (limit: number): Promise<RankingEntry[]> => {
  if (mongoose.connection.readyState !== 1) {
    console.warn('DB not connected, returning mock rankings');
    return Array(5).fill(null).map((_, i) => ({
      rank: i + 1,
      userId: `mock-user-${i}`,
      nickname: ['ClawMaster', '인형킹', 'GamerPro', '뽑기달인', 'LuckyOne'][i],
      score: 15000 - (i * 1000),
      createdAt: new Date()
    }));
  }

  const scores = await Score.find()
    .sort({ score: -1, createdAt: 1 })
    .limit(limit)
    .populate('userId', 'nickname')
    .lean<PopulatedScore[]>();

  return scores.map((s, index) => ({
    rank: index + 1,
    userId: s.userId?._id?.toString() || 'unknown',
    nickname: s.userId?.nickname || 'Unknown',
    score: s.score,
    createdAt: s.createdAt
  }));
};

export const submitScore = async (
  userId: string,
  score: number,
  attempts: number,
  dollsCaught: number
): Promise<IScore> => {
  if (mongoose.connection.readyState !== 1) {
    console.warn('DB not connected, returning mock score');
    return {
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(userId.length === 24 ? userId : undefined),
      score,
      attempts,
      dollsCaught,
      createdAt: new Date(),
      updatedAt: new Date()
    } as unknown as IScore;
  }

  const newScore = new Score({
    userId: new Types.ObjectId(userId),
    score,
    attempts,
    dollsCaught
  });

  return newScore.save();
};

export const getUserRanking = async (userId: string): Promise<RankingEntry | null> => {
  if (mongoose.connection.readyState !== 1) {
    return {
      rank: 42,
      userId: userId,
      nickname: 'MockUser',
      score: 12345,
      createdAt: new Date()
    };
  }

  // Get user's best score
  const userBestScore = await Score.findOne({ userId: new Types.ObjectId(userId) })
    .sort({ score: -1 })
    .populate('userId', 'nickname')
    .lean<PopulatedScore>();

  if (!userBestScore) {
    return null;
  }

  // Count how many scores are higher
  const higherScoresCount = await Score.countDocuments({
    score: { $gt: userBestScore.score }
  });

  return {
    rank: higherScoresCount + 1,
    userId: userBestScore.userId?._id?.toString() || 'unknown',
    nickname: userBestScore.userId?.nickname || 'Unknown',
    score: userBestScore.score,
    createdAt: userBestScore.createdAt
  };
};

export const getUserScoreHistory = async (
  userId: string,
  limit: number = 10
): Promise<IScore[]> => {
  return Score.find({ userId: new Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};
