import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
    getProofToken,
    createTest,
    submitAnswer,
    getResult,
} from '../controllers/htsm.controller';

const router = Router();

// Rate Limiters (02_backend_agent.md 스펙 기반)

/** 테스트 생성: IP당 5회/분 */
const createLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: {
        success: false,
        error: '테스트 생성 요청이 너무 많습니다. 1분 후 다시 시도해주세요.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/** 응답 제출: IP당 10회/분 */
const answerLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        success: false,
        error: '응답 제출 요청이 너무 많습니다. 1분 후 다시 시도해주세요.',
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
router.post('/tests', createLimiter, createTest);
router.post('/answers', answerLimiter, submitAnswer);
router.get('/result/:shareId', viewLimiter, getResult);

export default router;
