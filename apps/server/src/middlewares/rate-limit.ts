import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

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

});

// 랭킹 제출용 rate limiter - 닉네임 기반
// 같은 닉네임으로 1분에 최대 3회 제출 가능
export const nicknameSubmitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 3, // 최대 3회
  message: {
    success: false,
    error: '같은 닉네임으로 너무 많은 요청입니다. 1분 후에 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // 닉네임으로 rate limit 적용
    const nickname = req.body?.nickname;
    if (nickname && typeof nickname === 'string') {
      return `nickname:${nickname.toLowerCase().trim()}`;
    }
    // 닉네임이 없으면 IP로 fallback
    return (ipKeyGenerator as any)(req, res);
  }
});

// 랭킹 제출용 rate limiter - 유저 ID 기반 (카카오 ID 또는 tempUserId)
// 같은 유저 ID로 1분에 최대 3회 제출 가능
export const userIdSubmitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 3, // 최대 3회
  message: {
    success: false,
    error: '너무 많은 요청입니다. 1분 후에 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // 인증된 사용자 (카카오 로그인)
    const authenticatedUserId = (req as any).user?._id?.toString();
    if (authenticatedUserId) {
      return `userId:${authenticatedUserId}`;
    }
    // 게스트 사용자 (tempUserId)
    const tempUserId = req.body?.tempUserId;
    if (tempUserId && typeof tempUserId === 'string') {
      return `tempUserId:${tempUserId}`;
    }
    // fallback to IP
    return (ipKeyGenerator as any)(req, res);
  }
});
