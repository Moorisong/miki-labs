import { Router } from 'express';
import { chicorunStudentAuth } from '../middlewares/chicorun-student-auth';
import { getQuestion, submitAnswer, resetProgress, selectLevel, resetAchievedLevel } from '../controllers/chicorun-solve.controller';
import { studentLogin, getStudentMe, getGlobalRanking, changePassword } from '../controllers/chicorun-student.controller';
import { getFriends, getFriendRequests, searchFriendsByNickname, sendFriendRequest, respondToFriendRequest, removeFriend, cancelFriendRequest } from '../controllers/friend.controller';
import { startWordRain, inputWordRain, endWordRain } from '../controllers/word-rain.controller';
import { startWordRush, endWordRush } from '../controllers/word-rush.controller';

const router = Router();

// ─── 유저 인증 및 프로필 API ───────────────────────────────────────────────────
router.post('/student/login', studentLogin);
router.get('/student/me', chicorunStudentAuth, getStudentMe);
router.patch('/student/change-password', chicorunStudentAuth, changePassword);

// ─── 친구 시스템 API (auth 필요) ────────────────────────────────────────────────
router.get('/friends', chicorunStudentAuth, getFriends);
router.get('/friends/requests', chicorunStudentAuth, getFriendRequests);
router.get('/friends/search', chicorunStudentAuth, searchFriendsByNickname);
router.post('/friends/request', chicorunStudentAuth, sendFriendRequest);
router.post('/friends/respond', chicorunStudentAuth, respondToFriendRequest);
router.delete('/friends/:friendId', chicorunStudentAuth, removeFriend);
router.delete('/friends/request/:requestId', chicorunStudentAuth, cancelFriendRequest);

// ─── 학습 API (auth 필요) ────────────────────────────────────────────────────
router.get('/question', chicorunStudentAuth, getQuestion);
router.post('/answer', chicorunStudentAuth, submitAnswer);
router.post('/level', chicorunStudentAuth, selectLevel);
router.post('/reset-progress', chicorunStudentAuth, resetProgress);
router.post('/reset-achieved-level', chicorunStudentAuth, resetAchievedLevel);

// ─── Word Rain 게임 API (auth 필요) ──────────────────────────────────────────
router.post('/word-rain/start', chicorunStudentAuth, startWordRain);
router.post('/word-rain/input', chicorunStudentAuth, inputWordRain);
router.post('/word-rain/end', chicorunStudentAuth, endWordRain);

// ─── Word Rush 게임 API (auth 필요) ──────────────────────────────────────────
router.post('/word-rush/start', chicorunStudentAuth, startWordRush);
router.post('/word-rush/end', chicorunStudentAuth, endWordRush);

// ─── 공통 랭킹 (공개) ──────────────────────────────────────────────────────────
router.get('/ranking', getGlobalRanking);

export default router;
