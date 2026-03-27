import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error-handler';
import { ApiResponse } from '../types/api.types';

export interface ChicoStudentPayload {
    studentId: string;
    nickname: string;
}

declare global {
    namespace Express {
        interface Request {
            chicoStudent?: ChicoStudentPayload;
        }
    }
}

export const chicorunStudentAuth = (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError(401, 'ERROR_UNAUTHORIZED: 인증 토큰이 없습니다.');
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'chicorun-default-secret';

        const payload = jwt.verify(token, secret) as ChicoStudentPayload;

        if (!payload.studentId || !payload.nickname) {
            throw new AppError(401, 'ERROR_INVALID_TOKEN: 유효하지 않은 토큰입니다.');
        }

        req.chicoStudent = payload;
        next();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
            return;
        }
        next(new AppError(401, 'ERROR_INVALID_TOKEN: 토큰 검증에 실패했습니다.'));
    }
};
