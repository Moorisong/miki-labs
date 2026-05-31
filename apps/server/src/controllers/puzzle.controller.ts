import { Request, Response, NextFunction } from 'express';
import { getPuzzleModel } from '../models/puzzle.model';

/**
 * GET /api/puzzle/current
 * 현재 활성화된 주간 퍼즐 조회
 */
export const getCurrentPuzzle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const Puzzle = getPuzzleModel();
    const now = new Date();

    // 현재 기간 내에 있고 아카이브되지 않은 퍼즐 탐색
    let puzzle = await Puzzle.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now },
      archived: false,
    });

    // 만약 해당하는 퍼즐이 없다면, 가장 최근 등록된 아카이브 안 된 퍼즐 반환
    if (!puzzle) {
      puzzle = await Puzzle.findOne({ archived: false }).sort({ week: -1 });
    }

    // 만약 그것도 없다면, 그냥 가장 최근 퍼즐 반환
    if (!puzzle) {
      puzzle = await Puzzle.findOne().sort({ week: -1 });
    }

    if (!puzzle) {
      res.status(404).json({ success: false, error: '활성화된 주간 퍼즐이 존재하지 않습니다.' });
      return;
    }

    res.json({
      success: true,
      data: puzzle,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/puzzle/archive
 * 지난 주차 아카이브 퍼즐 목록 조회
 */
export const getArchivePuzzles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const Puzzle = getPuzzleModel();
    
    // archived가 true이거나 현재 활성 기간이 지난 퍼즐들을 주차 역순으로 조회
    const now = new Date();
    const puzzles = await Puzzle.find({
      $or: [
        { archived: true },
        { endDate: { $lt: now } }
      ]
    }).sort({ week: -1 });

    res.json({
      success: true,
      data: puzzles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/puzzle/:id
 * 특정 퍼즐 상세 조회
 */
export const getPuzzleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const Puzzle = getPuzzleModel();
    const puzzle = await Puzzle.findById(id);

    if (!puzzle) {
      res.status(404).json({ success: false, error: '퍼즐을 찾을 수 없습니다.' });
      return;
    }

    res.json({
      success: true,
      data: puzzle,
    });
  } catch (error) {
    next(error);
  }
};
