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
  res: Response<ApiResponse<{ scoreId: string; warnings?: string[] }>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { score, attempts, dollsCaught, tempUserId, nickname, fingerprint } = req.body;

    // Check for authenticated user first
    let userId = req.user?._id?.toString();

    // If no authenticated user, handle guest flow
    if (!userId) {
      if (!tempUserId) {
        throw new AppError(400, 'User ID or Temp ID is required');
      }

      // Create or update guest user
      const guestName = nickname || `Guest-${tempUserId.slice(-4)}`;
      const authService = await import('../services/auth.service');
      const guestUser = await authService.createGuestUser(guestName, tempUserId);
      userId = guestUser._id.toString();
    }

    // Get IP address
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || 'unknown';

    // Anti-abuse check
    const antiAbuseService = await import('../services/anti-abuse.service');
    const abuseCheck = await antiAbuseService.performFullAbuseCheck(
      userId,
      nickname,
      score,
      fingerprint, // Client should send this object { hash, userAgent, ... }
      ipAddress
    );

    if (!abuseCheck.allowed) {
      // Return 403 Forbidden with specific reason
      res.status(403).json({
        success: false,
        message: abuseCheck.reason || 'Score submission rejected due to suspicious activity.',
        data: null
      } as any); // Type assertion needed because ApiResponse structure might differ slightly
      return;
    }

    const newScore = await rankingService.submitScore(
      userId,
      score,
      attempts,
      dollsCaught
    );

    // Update daily score stats
    await antiAbuseService.updateDailyScore(userId, score);

    res.json({
      success: true,
      data: { scoreId: newScore._id.toString(), warnings: abuseCheck.warnings },
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
