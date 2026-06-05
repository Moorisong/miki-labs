import { Request, Response, NextFunction } from 'express';
import { getPuzzleModel } from '../models/puzzle.model';
import { getPuzzleResultModel } from '../models/puzzle-result.model';
import { getPuzzleProgressModel } from '../models/puzzle-progress.model';

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
    
    // 현재 진행 중인 퍼즐(대회 퍼즐) 및 지난 주차 아카이브 퍼즐 목록 조회
    // 단, 올해(현재 연도)의 데이터만 조회하도록 필터링
    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));

    const puzzles = await Puzzle.find({
      startDate: { $gte: startOfYear, $lte: now }
    }).sort({ startDate: -1 });

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

/**
 * GET /api/puzzle/stats
 * 서비스 전체 통계 (누적 플레이 수 및 평균 완성률) 조회
 */
export const getServiceStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const PuzzleResult = getPuzzleResultModel();
    const Puzzle = getPuzzleModel();

    // 1. 완주된 기록 개수
    const completedCount = await PuzzleResult.countDocuments({ completed: true });

    // 2. 각 퍼즐 도큐먼트의 playCount 누적 합산으로 누적 플레이 수 계산
    const puzzles = await Puzzle.find({});
    let totalPlayCount = puzzles.reduce((sum, p) => sum + (p.playCount || 0), 0);

    // 데이터 불일치 및 예외 방지를 위해 최솟값을 완주 수로 보정
    if (totalPlayCount < completedCount) {
      totalPlayCount = completedCount;
    }

    // 3. 평균 완성률 = 완주 수 / 누적 플레이 수
    let completionRate = 0;
    if (totalPlayCount > 0) {
      completionRate = Math.round((completedCount / totalPlayCount) * 100);
    }

    res.json({
      success: true,
      data: {
        totalPlayCount,
        completionRate: `${completionRate}%`
      }
    });
  } catch (error) {
    next(error);
  }
};
