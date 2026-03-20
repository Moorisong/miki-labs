import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error-handler';
import { ApiResponse } from '../types/api.types';

export interface ChicoTeacherPayload {
    teacherId: string;
    name: string;
}

declare global {
    namespace Express {
        interface Request {
            chicoTeacher?: ChicoTeacherPayload;
        }
    }
}

export const chicorunTeacherAuth = (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError(401, 'ERROR_UNAUTHORIZED: 교사 인증 토큰이 없습니다.');
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'chicorun-default-secret';

        const payload = jwt.verify(token, secret) as ChicoTeacherPayload;

        if (!payload.teacherId || !payload.name) {
            throw new AppError(401, 'ERROR_INVALID_TOKEN: 유효하지 않은 교사 토큰입니다.');
        }

        // 기존의 numeric numeric ID(예: 4708331286) 등이 teacherId에 들어있는 "구버전" 토큰을 필터링하여 
        // 클라이언트에서 재발급 로직을 타게 만듭니다.
        if (!/^[0-9a-fA-F]{24}$/.test(payload.teacherId)) {
            throw new AppError(401, 'ERROR_INVALID_TOKEN: 구형 토큰입니다. 다시 로드하여 인증을 갱신하세요.');
        }

        req.chicoTeacher = payload;
        next();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
            return;
        }
        next(new AppError(401, 'ERROR_INVALID_TOKEN: 교사 토큰 검증에 실패했습니다.'));
    }
};
