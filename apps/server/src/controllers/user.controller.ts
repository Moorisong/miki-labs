import { Request, Response, NextFunction } from 'express';
import { getPuzzleResultModel } from '../models/puzzle-result.model';
import { getPuzzleProgressModel } from '../models/puzzle-progress.model';
import { getPuzzleModel } from '../models/puzzle.model';
import { getChallengeTokenModel } from '../models/challenge-token.model';
import { getUserModel } from '../models/user.model';

/**
 * GET /api/puzzle/users/me
 * 내 프로필 통계 및 퍼즐 완주 히스토리 조회
 */
export const getMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: '인증이 필요합니다.' });
      return;
    }

    const PuzzleResult = getPuzzleResultModel();
    const Puzzle = getPuzzleModel();

    // 1. 완주한 퍼즐 기록들 조회
    const rawResults = await PuzzleResult.find({ userId: user._id, completed: true }).sort({ savedAt: -1 });

    // 각 완주 퍼즐의 메타데이터 조회
    const puzzleIds = rawResults.map(r => r.puzzleId);
    const puzzles = await Puzzle.find({ _id: { $in: puzzleIds } });
    const puzzleMap = new Map(puzzles.map(p => [p._id.toString(), p]));

    // 2. 완주 히스토리 맵핑 및 각 기록의 동적 등수 계산
    const history = [];
    let bestRank: number | null = null;

    for (const result of rawResults) {
      const p = puzzleMap.get(result.puzzleId.toString());
      if (!p) continue;

      // 동적 랭킹 순위 계산 (나보다 빠른 사람 수 + 1)
      let myRank = undefined;
      if (result.mode === 'ranked' && result.difficulty === 'beginner') {
        const betterCount = await PuzzleResult.countDocuments({
          puzzleId: result.puzzleId,
          mode: 'ranked',
          difficulty: 'beginner',
          completionTime: { $lt: result.completionTime }
        });
        myRank = betterCount + 1;

        if (bestRank === null || myRank < bestRank) {
          bestRank = myRank;
        }
      }

      history.push({
        puzzleId: result.puzzleId,
        title: p.title,
        imageUrl: p.imageUrl,
        difficulty: result.difficulty,
        completionTime: result.completionTime,
        savedAt: result.savedAt,
        completed: result.completed,
        myRank
      });
    }

    // 3. 통계 계산
    const totalCompleted = history.length;

    // Beginner 모드의 최고 기록
    const beginnerResults = rawResults.filter(r => r.difficulty === 'beginner');
    const bestTimeBeginner = beginnerResults.length > 0
      ? Math.min(...beginnerResults.map(r => r.completionTime))
      : null;

    res.json({
      success: true,
      data: {
        profile: {
          nickname: user.nickname,
          profileImage: user.profileImage,
          createdAt: user.createdAt
        },
        statistics: {
          totalCompleted,
          bestTimeBeginner,
          bestRank
        },
        history
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/puzzle/users/me
 * 회원 탈퇴 (CASCADE 일괄 삭제)
 */
export const deleteUserAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: '인증이 필요합니다.' });
      return;
    }

    const userId = user._id;

    // 1. 진행 상황 일괄 삭제
    await getPuzzleProgressModel().deleteMany({ userId });

    // 2. 완주 결과 일괄 삭제
    await getPuzzleResultModel().deleteMany({ userId });

    // 3. 챌린지 토큰 일괄 삭제
    await getChallengeTokenModel().deleteMany({ userId });

    // 4. 유저 도큐먼트 삭제
    await getUserModel().deleteOne({ _id: userId });

    res.json({
      success: true,
      message: '회원 탈퇴 및 모든 활동 내역이 안전하게 영구 삭제되었습니다.'
    });
  } catch (error) {
    next(error);
  }
};
