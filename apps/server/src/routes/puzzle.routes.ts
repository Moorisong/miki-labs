import { Router } from 'express';
import { puzzleAuth } from '../middlewares/puzzle-auth';
import { verifyChallenge } from '../middlewares/verify-challenge';
import { getCurrentPuzzle, getArchivePuzzles, getPuzzleById } from '../controllers/puzzle.controller';
import { getCurrentRankings, getMyRanking, submitResult, startChallenge } from '../controllers/ranking.controller';
import { saveProgress, getMyProgress, clearProgress } from '../controllers/puzzle-progress.controller';
import { getMyProfile, deleteUserAccount } from '../controllers/user.controller';

const router = Router();

// 1. 퍼즐 관련 API (공개) - 정적 경로 먼저
router.get('/current', getCurrentPuzzle);
router.get('/archive', getArchivePuzzles);

// 2. 랭킹 관련 API (공개 / 인증)
router.get('/rankings/current', getCurrentRankings);
router.get('/rankings/me', puzzleAuth, getMyRanking);

// 3. 챌린지 및 결과 저장 API (인증 필요)
router.post('/challenge/start', puzzleAuth, startChallenge);
router.post('/results', puzzleAuth, verifyChallenge, submitResult);

// 4. 진행 상태 저장 및 조회 API (인증 필요)
router.post('/progress', puzzleAuth, saveProgress);
router.get('/progress', puzzleAuth, getMyProgress);
router.delete('/progress', puzzleAuth, clearProgress);

// 5. 사용자 관련 API (인증 필요)
router.get('/users/me', puzzleAuth, getMyProfile);
router.delete('/users/me', puzzleAuth, deleteUserAccount);

// 6. 퍼즐 단건 조회 (동적 경로 - 반드시 정적 경로들 아래에 위치)
router.get('/:id', getPuzzleById);

export default router;
