import { Request, Response, NextFunction } from 'express';
import { getPuzzleProgressModel } from '../models/puzzle-progress.model';

/**
 * POST /api/puzzle/progress
 * 실시간 진행률 서버 저장 (이탈 대비 백업용)
 */
export const saveProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { puzzleId, progress } = req.body;
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

    // upsert: { userId, puzzleId } 기준으로 진행 상황 저장/업데이트
    await PuzzleProgress.findOneAndUpdate(
      { userId: user._id, puzzleId },
      { 
        progress,
        lastPlayedAt: new Date()
      },
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
      data: progressRecord ? { progress: progressRecord.progress } : null
    });
  } catch (error) {
    next(error);
  }
};
