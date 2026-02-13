import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
    getProofToken,
    createTest,
    submitAnswer,
    getResult,
    getTestInfo,
    getMyTest,
    getStats,
} from '../controllers/htsm.controller';

const router = Router();

// Rate Limiters (02_backend_agent.md 스펙 기반)

/** 테스트 생성: IP당 5회/분 */
const createIpLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: {
        success: false,
        error: '테스트 생성 요청이 너무 많습니다. 1분 후 다시 시도해주세요.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/** 테스트 생성: IP당 30회/시간 */
const createHourLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 30,
    message: {
        success: false,
        error: '테스트 생성 한도를 초과했습니다. 1시간 후 다시 시도해주세요.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/** 응답 제출: IP당 10회/분 */
const answerIpLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        success: false,
        error: '응답 제출 요청이 너무 많습니다. 1분 후 다시 시도해주세요.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/** 응답 제출: ShareId당 3회/분 */
const answerShareIdLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 3,
    keyGenerator: (req) => req.body.shareId || req.ip, // Fallback to IP if shareId missing
    message: {
        success: false,
        error: '해당 테스트에 대한 응답 제출이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/** 결과 조회: IP당 60회/분 */
const viewLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: {
        success: false,
        error: '조회 요청이 너무 많습니다. 1분 후 다시 시도해주세요.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Routes
router.get('/proof-token', getProofToken);
router.post('/tests', createIpLimiter, createHourLimiter, createTest);
router.post('/answers', answerIpLimiter, answerShareIdLimiter, submitAnswer);
router.get('/result/:shareId', viewLimiter, getResult);
router.get('/tests/:shareId', viewLimiter, getTestInfo);
router.get('/my-test/:fingerprintHash', viewLimiter, getMyTest);
router.get('/stats', getStats);

export default router;
