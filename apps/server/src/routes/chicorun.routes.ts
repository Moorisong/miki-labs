import { Router } from 'express';
import { chicorunStudentAuth } from '../middlewares/chicorun-student-auth';
import { getQuestion, submitAnswer, resetProgress, selectLevel, resetAchievedLevel } from '../controllers/chicorun-solve.controller';
import { studentLogin, getStudentMe, getGlobalRanking, changePassword } from '../controllers/chicorun-student.controller';

const router = Router();

// ─── 유저 인증 및 프로필 API ───────────────────────────────────────────────────
router.post('/student/login', studentLogin);
router.get('/student/me', chicorunStudentAuth, getStudentMe);
router.patch('/student/change-password', chicorunStudentAuth, changePassword);

// ─── 학습 API (auth 필요) ────────────────────────────────────────────────────
router.get('/question', chicorunStudentAuth, getQuestion);
router.post('/answer', chicorunStudentAuth, submitAnswer);
router.post('/level', chicorunStudentAuth, selectLevel);
router.post('/reset-progress', chicorunStudentAuth, resetProgress);
router.post('/reset-achieved-level', chicorunStudentAuth, resetAchievedLevel);

// ─── 공통 랭킹 (공개) ──────────────────────────────────────────────────────────
router.get('/ranking', getGlobalRanking);

export default router;
