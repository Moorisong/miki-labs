import { Router } from 'express';
import {
  getTopRanking,
  submitScore,
  getMyRanking
} from '../controllers/ranking.controller';
import { validateScoreSubmission, validatePagination } from '../middlewares/validate';
import { rankingSubmitLimiter } from '../middlewares/rate-limit';

const router = Router();

// GET /ranking/top?limit=10
router.get('/top', validatePagination, getTopRanking);

// POST /ranking/submit - IP 기반 rate limit 적용 (1분에 3회)
router.post('/submit', rankingSubmitLimiter, validateScoreSubmission, submitScore);

// GET /ranking/me
router.get('/me', getMyRanking);

export default router;
