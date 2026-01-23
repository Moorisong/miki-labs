import rateLimit from 'express-rate-limit';

// 랭킹 제출용 rate limiter - IP 기반
// 1분에 최대 3회 제출 가능
export const rankingSubmitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 3, // 최대 3회
  message: {
    success: false,
    error: '너무 많은 요청입니다. 1분 후에 다시 시도해주세요.'
  },
  standardHeaders: true, // RateLimit-* 헤더 포함
  legacyHeaders: false, // X-RateLimit-* 헤더 제외
  keyGenerator: (req) => {
    // X-Forwarded-For 헤더 또는 IP 사용
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || 'unknown';
  }
});
