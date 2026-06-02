import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { createTest, submitAnswer, getResult } from '../controllers/u-know.controller';
import { createMongoStore } from '../utils/rate-limit.store';

const router = Router();

// --- Rate Limiters (서브에이전트 문서 스펙 기반) ---

/** 생성 API: IP당 5회/10분 */
const createTenMinuteLimiter = rateLimit({
  store: createMongoStore('rate-limits', 10 * 60 * 1000),
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => `create-10min::${req.ip}`,
  message: {
    success: false,
    error: '테스트 생성 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
});

/** 생성 API: IP당 20회/시간 */
const createHourLimiter = rateLimit({
  store: createMongoStore('rate-limits', 60 * 60 * 1000),
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => `create-1hour::${req.ip}`,
  message: {
    success: false,
    error: '테스트 생성 한도를 초과했습니다. 1시간 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
});

/** 답변 API: IP당 15회/분 */
const submitMinuteLimiter = rateLimit({
  store: createMongoStore('rate-limits', 60 * 1000),
  windowMs: 60 * 1000,
  max: 15,
  keyGenerator: (req) => `submit-1min::${req.ip}`,
  message: {
    success: false,
    error: '답변 제출 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
});

/** 결과 조회: IP당 60회/분 */
const viewLimiter = rateLimit({
  store: createMongoStore('rate-limits', 60 * 1000),
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator: (req) => `view-1min::${req.ip}`,
  message: {
    success: false,
    error: '조회 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
});

// --- Routes ---
router.post('/create', createTenMinuteLimiter, createHourLimiter, createTest);
router.post('/submit', submitMinuteLimiter, submitAnswer);
router.get('/result/:token', viewLimiter, getResult);

export default router;
