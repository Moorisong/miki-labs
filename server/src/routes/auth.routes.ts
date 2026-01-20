import { Router } from 'express';
import { login, logout, getMe } from '../controllers/auth.controller';

const router = Router();

// POST /auth/login
router.post('/login', login);

// POST /auth/logout
router.post('/logout', logout);

// GET /auth/me
router.get('/me', getMe);

export default router;
