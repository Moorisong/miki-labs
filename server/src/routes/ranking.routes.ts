import { Router } from 'express';
import {
  getTopRanking,
  submitScore,
  getMyRanking
} from '../controllers/ranking.controller';
import { validateScoreSubmission, validatePagination } from '../middlewares/validate';
import { rankingSubmitLimiter, nicknameSubmitLimiter } from '../middlewares/rate-limit';

const router = Router();

// GET /ranking/top?limit=10
router.get('/top', validatePagination, getTopRanking);

// POST /ranking/submit - IP + 닉네임 기반 rate limit 적용 (각각 1분에 3회)
router.post('/submit', rankingSubmitLimiter, nicknameSubmitLimiter, validateScoreSubmission, submitScore);

// GET /ranking/me
router.get('/me', getMyRanking);

export default router;
