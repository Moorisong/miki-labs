import { Router, Request, Response, NextFunction } from 'express';
import { calculatePetDestinyHandler } from '../controllers/pet-destiny.controller';

const router = Router();

// Rate Limit 상태 (IP 기준 분당 10회)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate Limit 미들웨어
function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1분
    const maxRequests = 10;

    const record = rateLimitMap.get(ip);

    if (!record || record.resetTime < now) {
        // 새로운 윈도우 시작
        rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
        return next();
    }

    if (record.count >= maxRequests) {
        return res.status(429).json({
            success: false,
            error: {
                code: 'RATE_LIMITED',
                message: '요청 제한을 초과했습니다. 1분 후 다시 시도해주세요.'
            }
        });
    }

    record.count++;
    return next();
}

// Rate Limit 정리 (메모리 관리)
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap.entries()) {
        if (record.resetTime < now) {
            rateLimitMap.delete(ip);
        }
    }
}, 60 * 1000);

// POST /api/pet-destiny
router.post('/', rateLimitMiddleware, calculatePetDestinyHandler);

export default router;
