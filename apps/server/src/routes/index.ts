import { Router } from 'express';
import authRoutes from './auth.routes';
import rankingRoutes from './ranking.routes';
import petDestinyRoutes from './pet-destiny.routes';
import htsmRoutes from './htsm.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/ranking', rankingRoutes);
router.use('/pet-destiny', petDestinyRoutes);
router.use('/htsm', htsmRoutes);

export default router;
