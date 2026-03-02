import { Router } from 'express';
import authRoutes from './auth.routes';
import htsmRoutes from './htsm.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/htsm', htsmRoutes);

export default router;
