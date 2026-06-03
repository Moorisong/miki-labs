import { Request, Response, NextFunction } from 'express';
import { getChallengeTokenModel } from '../models/challenge-token.model';
import { getPuzzleModel } from '../models/puzzle.model';

export const verifyChallenge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { puzzleId, mode, difficulty, challengeToken, startedAt, completedAt, completionTime } = req.body;
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, error: '인증 정보가 존재하지 않습니다.' });
      return;
    }

    // 1. 필수 파라미터 체크
    if (!puzzleId || !mode || !difficulty || !challengeToken || !startedAt || !completedAt || completionTime === undefined) {
      res.status(400).json({ success: false, error: '검증을 위한 필수 파라미터가 누락되었습니다.' });
      return;
    }

    // 2. Challenge Token 유효성 검증
    if (mode === 'ranked') {
      const ChallengeToken = getChallengeTokenModel();
      const tokenRecord = await ChallengeToken.findOne({ token: challengeToken });

      if (!tokenRecord) {
        res.status(403).json({ success: false, error: '유효하지 않은 챌린지 토큰입니다.' });
        return;
      }

      if (tokenRecord.used) {
        res.status(403).json({ success: false, error: '이미 사용된 챌린지 토큰입니다.' });
        return;
      }

      if (new Date(tokenRecord.expiresAt).getTime() < Date.now()) {
        res.status(403).json({ success: false, error: '만료된 챌린지 토큰입니다.' });
        return;
      }

      if (tokenRecord.userId.toString() !== user._id.toString() || tokenRecord.puzzleId.toString() !== puzzleId) {
        res.status(403).json({ success: false, error: '토큰 발급 정보가 사용자와 일치하지 않습니다.' });
        return;
      }

      // 1회성 토큰 폐기 처리 (used = true)
      tokenRecord.used = true;
      await tokenRecord.save();
    }

    // 3. 플레이 경과 시간 무결성 검증
    const startMs = new Date(startedAt).getTime();
    const completeMs = new Date(completedAt).getTime();
    const calculatedDurationSeconds = Math.round((completeMs - startMs) / 1000);
    const timeDiff = Math.abs(calculatedDurationSeconds - completionTime);

    if (timeDiff > 5) { // 5초 오차까지는 관용 (네트워크 딜레이 등)
      res.status(400).json({ 
        success: false, 
        error: `플레이 시간 무결성 검증 실패 (오차: ${timeDiff}초)` 
      });
      return;
    }

    // 4. 비정상 기록 자동 필터링 (30초 미만 스피드핵 차단)
    if (completionTime < 30) {
      res.status(400).json({ 
        success: false, 
        error: '비정상적으로 빠른 기록입니다. 치팅 시도로 의심되어 거부되었습니다.' 
      });
      return;
    }

    // 5. 난이도 및 활성화 상태 검증
    const Puzzle = getPuzzleModel();
    const puzzle = await Puzzle.findById(puzzleId);

    if (!puzzle) {
      res.status(404).json({ success: false, error: '존재하지 않는 퍼즐입니다.' });
      return;
    }

    const now = new Date();
    const isActive = now >= new Date(puzzle.startDate) && now <= new Date(puzzle.endDate);

    if (mode === 'ranked') {
      if (difficulty !== 'beginner' && difficulty !== 'expert') {
        res.status(400).json({ success: false, error: '공식 랭킹 경쟁은 Beginner(100조각) 또는 Expert(256조각) 난이도만 지원합니다.' });
        return;
      }
      if (!isActive || puzzle.archived) {
        res.status(400).json({ success: false, error: '활성화 기간이 만료된 퍼즐은 랭킹 등록이 불가능합니다.' });
        return;
      }
    }

    // 검증 성공! 다음 컨트롤러로 진행
    next();
  } catch (error) {
    next(error);
  }
};
