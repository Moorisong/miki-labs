import { Request, Response, NextFunction } from 'express';
import { getUserModel } from '../models/user.model';

export const puzzleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: '로그인이 필요합니다.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ success: false, error: '로그인이 필요합니다.' });
      return;
    }

    // next-auth 기반 통합 세션을 지원하기 위해, 토큰은 사용자의 providerId (카카오 고유 ID)입니다.
    const User = getUserModel();
    const user = await User.findOne({ providerId: token });

    if (!user) {
      res.status(401).json({ success: false, error: '유효하지 않은 사용자 세션입니다.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
