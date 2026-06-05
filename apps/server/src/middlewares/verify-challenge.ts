import { Request, Response, NextFunction } from 'express';
import { getChallengeTokenModel } from '../models/challenge-token.model';
import { getPuzzleModel } from '../models/puzzle.model';
import { getPuzzleResultModel } from '../models/puzzle-result.model';

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

    // 1.5. 중복 전송 방지: 이미 동일한 기록이 성공적으로 저장되어 있는지 먼저 확인
    const PuzzleResult = getPuzzleResultModel();
    const duplicateResult = await PuzzleResult.findOne({
      userId: user._id,
      puzzleId,
      startedAt: new Date(startedAt),
      completionTime,
      completed: true
    });

    if (duplicateResult) {
      // 이미 저장된 기록이 있다면 더 이상의 검증(챌린지 토큰 등) 없이 통과시킴
      next();
      return;
    }

    // 2. Challenge Token 유효성 검증
    if (mode === 'ranked') {
      const ChallengeToken = getChallengeTokenModel();
      
      // 1회성 토큰을 원자적으로 찾아서 사용 상태(used = true)로 만듦 (Race Condition 방지)
      const tokenRecord = await ChallengeToken.findOneAndUpdate(
        { 
          token: challengeToken,
          userId: user._id,
          puzzleId,
          used: false,
          expiresAt: { $gt: new Date() }
        },
        { $set: { used: true } },
        { new: true }
      );

      if (!tokenRecord) {
        res.status(403).json({ 
          success: false, 
          error: '유효하지 않거나, 만료되었거나, 이미 사용된 챌린지 토큰입니다.' 
        });
        return;
      }
    }

    // 3. 플레이 경과 시간 무결성 검증
    if (mode === 'ranked') {
      const startMs = new Date(startedAt).getTime();
      const completeMs = new Date(completedAt).getTime();

      if (isNaN(startMs) || isNaN(completeMs)) {
        res.status(400).json({ success: false, error: '유효하지 않은 시간 포맷입니다.' });
        return;
      }

      const calculatedDurationSeconds = Math.round((completeMs - startMs) / 1000);

      // 실제 흘러간 현실 시간(calculatedDurationSeconds)이 게임 상 기록된 퍼즐 타이머 시간(completionTime)보다 5초 이상 짧다면, 
      // 클라이언트 측에서 타이머 속도를 임의로 가속했거나 조작한 치팅임.
      // (단, 유저가 중간에 일시정지하거나 탭을 내려두는 등 현실 시간이 더 길어진 경우는 정상적인 플레이 패턴이므로 허용함)
      if (calculatedDurationSeconds < completionTime - 5) {
        res.status(400).json({ 
          success: false, 
          error: `플레이 시간 무결성 검증 실패 (현실 시간: ${calculatedDurationSeconds}초 / 타이머 시간: ${completionTime}초)` 
        });
        return;
      }
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
      if (difficulty !== 'novice' && difficulty !== 'beginner' && difficulty !== 'expert') {
        res.status(400).json({ success: false, error: '공식 랭킹 경쟁은 Novice(36조각), Beginner(100조각) 또는 Expert(256조각) 난이도만 지원합니다.' });
        return;
      }
      if (!isActive || puzzle.archived) {
        res.status(400).json({ success: false, error: '활성화 기간이 만료된 퍼즐은 랭킹 등록이 불가능합니다.' });
        return;
      }

      // 5.5. 이미 이 난이도로 랭킹 기록이 등록되어 있는지 확인
      const PuzzleResult = getPuzzleResultModel();
      const existingRankedResult = await PuzzleResult.findOne({
        puzzleId,
        userId: user._id,
        difficulty,
        mode: 'ranked',
        completed: true
      });

      if (existingRankedResult) {
        res.status(400).json({ success: false, error: '이 난이도는 이미 랭킹 등록이 완료되었습니다.' });
        return;
      }
    }

    // 검증 성공! 다음 컨트롤러로 진행
    next();
  } catch (error) {
    next(error);
  }
};
