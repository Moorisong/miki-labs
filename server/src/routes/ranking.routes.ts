import { Router } from 'express';
import {
  getTopRanking,
  submitScore,
  getMyRanking
} from '../controllers/ranking.controller';
import { validateScoreSubmission, validatePagination } from '../middlewares/validate';

const router = Router();

// GET /ranking/top?limit=10
router.get('/top', validatePagination, getTopRanking);

// POST /ranking/submit
router.post('/submit', validateScoreSubmission, submitScore);

// GET /ranking/me
router.get('/me', getMyRanking);

export default router;
