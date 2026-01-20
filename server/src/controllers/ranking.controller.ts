import { Request, Response, NextFunction } from 'express';
import { ApiResponse, RankingEntry } from '../types/api.types';
import * as rankingService from '../services/ranking.service';
import { AppError } from '../middlewares/error-handler';

export const getTopRanking = async (
  req: Request,
  res: Response<ApiResponse<RankingEntry[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 100);
    const rankings = await rankingService.getTopRankings(limit);

    res.json({
      success: true,
      data: rankings
    });
  } catch (error) {
    next(error);
  }
};

export const submitScore = async (
  req: Request,
  res: Response<ApiResponse<{ scoreId: string }>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { score, attempts, dollsCaught, tempUserId, nickname } = req.body;

    // Check for authenticated user first
    let userId = req.user?._id?.toString();

    // If no authenticated user, handle guest flow
    if (!userId) {
      if (!tempUserId) {
        throw new AppError(400, 'User ID or Temp ID is required');
      }

      // Create or update guest user
      const guestName = nickname || `Guest-${tempUserId.slice(-4)}`;
      // Dynamic import to avoid circular dependency if any (though unlikely here, structure seems fine)
      const authService = await import('../services/auth.service');
      const guestUser = await authService.createGuestUser(guestName, tempUserId);
      userId = guestUser._id.toString();
    }

    const newScore = await rankingService.submitScore(
      userId,
      score,
      attempts,
      dollsCaught
    );

    res.json({
      success: true,
      data: { scoreId: newScore._id.toString() },
      message: 'Score submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getMyRanking = async (
  req: Request,
  res: Response<ApiResponse<RankingEntry | null>>,
  next: NextFunction
): Promise<void> => {
  try {
    // MVP: Get userId from query param or authenticated user
    const userId = req.user?._id?.toString() || (req.query.userId as string);

    if (!userId) {
      res.json({
        success: true,
        data: null,
        message: 'User ID required to get ranking'
      });
      return;
    }

    const ranking = await rankingService.getUserRanking(userId);

    if (!ranking) {
      res.json({
        success: true,
        data: null,
        message: 'No scores found for this user'
      });
      return;
    }

    res.json({
      success: true,
      data: ranking
    });
  } catch (error) {
    next(error);
  }
};
