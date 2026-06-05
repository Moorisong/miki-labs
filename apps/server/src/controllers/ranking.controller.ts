import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { getPuzzleResultModel } from '../models/puzzle-result.model';
import { getPuzzleModel } from '../models/puzzle.model';
import { getUserModel } from '../models/user.model';
import { getChallengeTokenModel } from '../models/challenge-token.model';
import { getPuzzleProgressModel } from '../models/puzzle-progress.model';
import crypto from 'crypto';

/**
 * GET /api/puzzle/rankings/current
 * 현재 주간 퍼즐의 전체 랭킹 조회 (Top 100)
 */
export const getCurrentRankings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { puzzleId, difficulty = 'beginner' } = req.query;

    if (!puzzleId) {
      res.status(400).json({ success: false, error: 'puzzleId가 필요합니다.' });
      return;
    }

    const PuzzleResult = getPuzzleResultModel();
    const User = getUserModel();

    // 각 사용자별 최고 기록만 1개씩 추출하기 위해 Aggregation 활용
    const rawRankings = await PuzzleResult.aggregate([
      { 
        $match: { 
          puzzleId: new Types.ObjectId(puzzleId as string), 
          mode: 'ranked',
          difficulty
        } 
      },
      {
        $group: {
          _id: '$userId',
          bestTime: { $min: '$completionTime' },
          savedAt: { $first: '$savedAt' }
        }
      },
      { $sort: { bestTime: 1, savedAt: 1 } },
      { $limit: 100 }
    ]);

    // 사용자 정보와 병합
    const userIds = rawRankings.map(r => r._id);
    const users = await User.find({ _id: { $in: userIds } });
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    const data = rawRankings.map((item, index) => {
      const u = userMap.get(item._id.toString());
      return {
        rank: index + 1,
        nickname: u?.nickname || u?.name || '익명 사용자',
        profileImage: u?.profileImage || '',
        completionTime: item.bestTime,
        savedAt: item.savedAt
      };
    });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/puzzle/rankings/me
 * 내 최고 기록 및 현재 랭킹 순위 조회
 */
export const getMyRanking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { puzzleId, difficulty = 'beginner' } = req.query;
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, error: '인증이 필요합니다.' });
      return;
    }

    if (!puzzleId) {
      res.status(400).json({ success: false, error: 'puzzleId가 필요합니다.' });
      return;
    }

    const PuzzleResult = getPuzzleResultModel();

    // 전체 사용자의 최고 기록 랭킹 집계
    const allRankings = await PuzzleResult.aggregate([
      { 
        $match: { 
          puzzleId: new Types.ObjectId(puzzleId as string), 
          mode: 'ranked',
          difficulty
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

    const totalParticipants = allRankings.length;
    if (totalParticipants === 0) {
      res.json({
        success: true,
        data: null
      });
      return;
    }

    // 내 순위 찾기
    const myIndex = allRankings.findIndex(r => r._id.toString() === user._id.toString());

    if (myIndex === -1) {
      // 랭킹 기록이 없음
      res.json({
        success: true,
        data: {
          myRank: null,
          nickname: user.nickname || user.name || '익명 사용자',
          completionTime: null,
          totalParticipants,
          topPercent: null
        }
      });
      return;
    }

    const myRank = myIndex + 1;
    const topPercent = Math.round((myRank / totalParticipants) * 10000) / 100; // 소수점 둘째자리

    res.json({
      success: true,
      data: {
        myRank,
        nickname: user.nickname || user.name || '익명 사용자',
        completionTime: allRankings[myIndex].bestTime,
        totalParticipants,
        topPercent
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/puzzle/results
 * 최종 완료 랭킹 기록 저장 (치팅 검증 미들웨어 통과 후 진입)
 */
export const submitResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { puzzleId, mode, difficulty, challengeToken, startedAt, completedAt, completionTime } = req.body;
    const user = req.user!;

    const PuzzleResult = getPuzzleResultModel();
    const Puzzle = getPuzzleModel();

    // 1. 이미 완료한 기록이 있는지 확인 (참여자 수 중복 카운트 방지)
    const priorResult = await PuzzleResult.findOne({
      puzzleId,
      userId: user._id,
      completed: true
    });

    // 1.5. 동일한 시작 시간과 완성 소요 시간을 가진 기록이 이미 있는지 확인 (중복 전송 방지)
    const duplicateResult = await PuzzleResult.findOne({
      userId: user._id,
      puzzleId,
      startedAt: new Date(startedAt),
      completionTime,
      completed: true
    });

    if (duplicateResult) {
      res.status(200).json({
        success: true,
        message: '이미 저장된 기록입니다.',
        data: {
          resultId: duplicateResult._id,
          completionTime: duplicateResult.completionTime,
          savedAt: duplicateResult.savedAt
        }
      });
      return;
    }

    // 2. 결과 생성 및 저장
    const newResult = await PuzzleResult.create({
      userId: user._id,
      puzzleId,
      mode,
      difficulty,
      challengeToken,
      startedAt: new Date(startedAt),
      completedAt: new Date(completedAt),
      completionTime,
      savedAt: new Date(),
      completed: true
    });

    // 2.5. 실시간 진행도 데이터는 더 이상 필요 없으므로 DB에서 제거
    await getPuzzleProgressModel().deleteOne({ userId: user._id, puzzleId });

    // 3. 최초 완성인 경우 퍼즐 참여자 수 (participantCount) 1 증가
    if (!priorResult) {
      await Puzzle.findByIdAndUpdate(puzzleId, { $inc: { participantCount: 1 } });
    }

    res.status(201).json({
      success: true,
      message: '성공적으로 퍼즐 기록이 검증 및 저장되었습니다.',
      data: {
        resultId: newResult._id,
        completionTime: newResult.completionTime,
        savedAt: newResult.savedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/puzzle/challenge/start
 * 챌린지 시작 토큰 발급
 */
export const startChallenge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { puzzleId } = req.body;
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, error: '인증이 필요합니다.' });
      return;
    }

    if (!puzzleId) {
      res.status(400).json({ success: false, error: 'puzzleId가 필요합니다.' });
      return;
    }

    const ChallengeToken = getChallengeTokenModel();
    const token = crypto.randomUUID(); // Node.js v19+ built-in or polyfill

    // 7일 만료 시간 설정
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await ChallengeToken.create({
      userId: user._id,
      puzzleId,
      token,
      issuedAt: new Date(),
      expiresAt,
      used: false
    });

    res.status(201).json({
      success: true,
      data: {
        challengeToken: token
      }
    });
  } catch (error) {
    next(error);
  }
};
