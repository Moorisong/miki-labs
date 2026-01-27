import { Router } from 'express';
import authRoutes from './auth.routes';
import rankingRoutes from './ranking.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/ranking', rankingRoutes);

export default router;
