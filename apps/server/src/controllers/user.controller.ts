import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
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

    // 2. 진행 중인 퍼즐 기록들 조회
    const PuzzleProgress = getPuzzleProgressModel();
    const rawProgresses = await PuzzleProgress.find({ userId: user._id });

    // 각 퍼즐의 메타데이터 조회
    const completedPuzzleIds = rawResults.map(r => r.puzzleId.toString());
    const progressPuzzleIds = rawProgresses.map(p => p.puzzleId.toString());
    const allPuzzleIds = Array.from(new Set([...completedPuzzleIds, ...progressPuzzleIds]));
    
    const puzzles = await Puzzle.find({ _id: { $in: allPuzzleIds } });
    const puzzleMap = new Map(puzzles.map(p => [p._id.toString(), p]));

    // 3. 완주 히스토리 맵핑 및 각 기록의 동적 등수 계산
    const history = [];
    let bestRank: number | null = null;

    for (const result of rawResults) {
      const p = puzzleMap.get(result.puzzleId.toString());
      if (!p) continue;

      // 동적 랭킹 순위 계산
      let myRank = undefined;
      if (result.mode === 'ranked') {
        const allRankings = await PuzzleResult.aggregate([
          { 
            $match: { 
              puzzleId: new Types.ObjectId(result.puzzleId.toString()), 
              mode: 'ranked',
              difficulty: result.difficulty
            } 
          },
          {
            $group: {
              _id: '$userId',
              bestTime: { $min: '$completionTime' }
            }
          },
          { $sort: { bestTime: 1 } }
        ]);

        const myIndex = allRankings.findIndex(r => r._id.toString() === user._id.toString());
        if (myIndex !== -1) {
          myRank = myIndex + 1;
          if (bestRank === null || myRank < bestRank) {
            bestRank = myRank;
          }
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

    // 4. 진행 중(미완주)인 퍼즐 히스토리 추가
    for (const prog of rawProgresses) {
      const pIdStr = prog.puzzleId.toString();
      if (completedPuzzleIds.includes(pIdStr)) continue;

      const p = puzzleMap.get(pIdStr);
      if (!p) continue;

      history.push({
        puzzleId: prog.puzzleId,
        title: p.title,
        imageUrl: p.imageUrl,
        difficulty: 'beginner',
        completionTime: 0,
        savedAt: prog.updatedAt || prog.lastPlayedAt,
        completed: false,
        progress: prog.progress
      });
    }

    // 3. 통계 계산
    const completedPuzzleIdsSet = new Set(
      rawResults
        .filter(r => puzzleMap.has(r.puzzleId.toString()))
        .map(r => r.puzzleId.toString())
    );
    const totalCompleted = completedPuzzleIdsSet.size;

    // Beginner 모드의 최고 기록
    const beginnerResults = rawResults.filter(r => r.difficulty === 'beginner');
    const bestTimeBeginner = beginnerResults.length > 0
      ? Math.min(...beginnerResults.map(r => r.completionTime))
      : null;

    res.json({
      success: true,
      data: {
        profile: {
          nickname: user.nickname || user.name || '사용자',
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
