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
    const { score, attempts, dollsCaught, tempUserId, nickname, fingerprint, signature, timestamp } = req.body;

    // 0. 데이터 무결성 검증 (HMAC Signature Check)
    // 봇/스크립트 공격 방지용
    if (!signature || !timestamp) {
      throw new AppError(400, 'Invalid request format (Missing signature)');
    }

    // 타임스탬프 유효성 검사 (5분 이내 요청만 허용 - Replay Attack 방지)
    const now = Date.now();
    if (Math.abs(now - timestamp) > 5 * 60 * 1000) {
      throw new AppError(403, 'Request expired');
    }

    // Check for authenticated user first
    let userId = req.user?._id?.toString();

    // 서명 검증 (업데이트됨: 식별자 포함)
    const { verifySignature } = await import('../utils/signature');
    const isValidSignature = verifySignature(
      {
        score,
        attempts,
        dollsCaught,
        timestamp,
        nickname,
        tempUserId,
        userId, // 로그인한 경우 ID 포함
        fingerprintHash: fingerprint?.hash
      },
      signature
    );

    if (!isValidSignature) {
      throw new AppError(403, 'Invalid signature');
    }

    // 1. 비로그인 유저 차단 (기획서 준수 + 봇 공격 방지)
    if (!userId) {
      // 더 이상 게스트 유저를 자동 생성하지 않음 -> 공격 원천 차단
      throw new AppError(401, '랭킹 등록을 위해서는 로그인이 필요합니다.');
    }

    // Get IP address
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || 'unknown';

    // Anti-abuse check
    const antiAbuseService = await import('../services/anti-abuse.service');
    const abuseCheck = await antiAbuseService.performFullAbuseCheck(
      userId,
      nickname,
      score,
      fingerprint,
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
