import { Request, Response, NextFunction } from 'express';
import { getPuzzleProgressModel } from '../models/puzzle-progress.model';

/**
 * POST /api/puzzle/progress
 * 실시간 진행률 서버 저장 (이탈 대비 백업용)
 */
export const saveProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { puzzleId, progress, detailState } = req.body;
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, error: '인증이 필요합니다.' });
      return;
    }

    if (!puzzleId || progress === undefined) {
      res.status(400).json({ success: false, error: 'puzzleId와 progress 값이 누락되었습니다.' });
      return;
    }

    const PuzzleProgress = getPuzzleProgressModel();

    const updateData: any = {
      progress,
      lastPlayedAt: new Date()
    };

    if (detailState !== undefined) {
      updateData.detailState = detailState;
    }

    // upsert: { userId, puzzleId } 기준으로 진행 상황 저장/업데이트
    await PuzzleProgress.findOneAndUpdate(
      { userId: user._id, puzzleId },
      updateData,
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: '성공적으로 진행 상황이 동기화되었습니다.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/puzzle/progress
 * 내 특정 퍼즐 진행도 조회
 */
export const getMyProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { puzzleId } = req.query;
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, error: '인증이 필요합니다.' });
      return;
    }

    if (!puzzleId) {
      res.status(400).json({ success: false, error: 'puzzleId가 필요합니다.' });
      return;
    }

    const PuzzleProgress = getPuzzleProgressModel();
    const progressRecord = await PuzzleProgress.findOne({ userId: user._id, puzzleId });

    res.json({
      success: true,
      data: progressRecord 
        ? { progress: progressRecord.progress, detailState: progressRecord.detailState } 
        : null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/puzzle/progress
 * 내 모든 퍼즐 진행 상태 초기화
 */
export const clearProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, error: '인증이 필요합니다.' });
      return;
    }

    const PuzzleProgress = getPuzzleProgressModel();
    await PuzzleProgress.deleteMany({ userId: user._id });

    res.json({
      success: true,
      message: '성공적으로 모든 퍼즐 진행 상태가 초기화되었습니다.'
    });
  } catch (error) {
    next(error);
  }
};
