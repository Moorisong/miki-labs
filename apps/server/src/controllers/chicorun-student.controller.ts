import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../types/api.types';
import { AppError } from '../middlewares/error-handler';
import { ChicorunStudentModel } from '../models/chicorun-student.model';
import type { ChicoStudentPayload } from '../middlewares/chicorun-student-auth';
import mongoose from 'mongoose';

const BCRYPT_ROUNDS = 10;
const JWT_EXPIRES_IN = '7d';

// POST /api/chicorun/student/login
export const studentLogin = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const { nickname, password } = req.body as {
            nickname: string;
            password: string;
        };

        if (!nickname || !password) {
            throw new AppError(400, 'ERROR_INVALID_INPUT: 닉네임과 비밀번호가 필요합니다.');
        }

        let student = await ChicorunStudentModel.findOne({
            nickname: nickname.trim(),
        });

        if (student) {
            // 기존 학생: 비밀번호 검증
            const isPasswordValid = await bcrypt.compare(password, student.passwordHash);
            if (!isPasswordValid) {
                throw new AppError(401, 'ERROR_WRONG_PASSWORD: 비밀번호가 올바르지 않습니다.');
            }
        } else {
            // 가입 처리
            const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
            const newStudent = new ChicorunStudentModel({
                nickname: nickname.trim(),
                passwordHash,
            });
            student = await newStudent.save();
        }

        const secret = process.env.JWT_SECRET ?? 'chicorun-default-secret';
        const payload: ChicoStudentPayload = {
            studentId: (student._id as mongoose.Types.ObjectId).toString(),
            nickname: student.nickname,
        };

        const token = jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN });

        res.json({
            success: true,
            data: {
                token,
                student: {
                    id: (student._id as mongoose.Types.ObjectId).toString(),
                    nickname: student.nickname,
                    progressIndex: student.progressIndex,
                    point: student.point,
                    currentLevel: student.currentLevel,
                    achievedMaxLevel: student.achievedMaxLevel,
                    startLevel: student.startLevel,
                    adjustmentCount: student.adjustmentCount,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/chicorun/student/me
export const getStudentMe = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const student = req.chicoStudent;
        if (!student) {
            throw new AppError(401, 'ERROR_UNAUTHORIZED: 학생 인증이 필요합니다.');
        }

        const studentDoc = await ChicorunStudentModel.findById(student.studentId)
            .select('-passwordHash')
            .lean();

        if (!studentDoc) {
            throw new AppError(404, 'ERROR_STUDENT_NOT_FOUND: 학생 정보를 찾을 수 없습니다.');
        }

        res.json({
            success: true,
            data: {
                id: studentDoc._id.toString(),
                nickname: studentDoc.nickname,
                progressIndex: studentDoc.progressIndex,
                point: studentDoc.point,
                currentLevel: studentDoc.currentLevel,
                achievedMaxLevel: studentDoc.achievedMaxLevel,
                startLevel: studentDoc.startLevel,
                adjustmentCount: studentDoc.adjustmentCount,
            },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/chicorun/ranking
export const getGlobalRanking = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const students = await ChicorunStudentModel.find()
            .select('nickname point currentLevel')
            .sort({ point: -1 })
            .limit(30)
            .lean();

        const ranking = students.map((s, index) => ({
            rank: index + 1,
            id: s._id.toString(),
            nickname: s.nickname,
            point: s.point,
            level: s.currentLevel,
        }));

        res.json({
            success: true,
            data: {
                ranking,
                className: '치코런 통합 랭킹',
            },
        });
    } catch (error) {
        next(error);
    }
};

// PATCH /api/chicorun/student/change-password
export const changePassword = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const studentId = req.chicoStudent?.studentId;
        const { currentPassword, newPassword } = req.body as {
            currentPassword: string;
            newPassword: string;
        };

        if (!studentId || !currentPassword || !newPassword) {
            throw new AppError(400, 'ERROR_INVALID_INPUT: 필요한 모든 정보를 입력해주세요.');
        }

        const student = await ChicorunStudentModel.findById(studentId);
        if (!student) {
            throw new AppError(404, 'ERROR_STUDENT_NOT_FOUND: 정보를 찾을 수 없습니다.');
        }

        // 기존 비밀번호 확인
        const isPasswordValid = await bcrypt.compare(currentPassword, student.passwordHash);
        if (!isPasswordValid) {
            throw new AppError(401, 'ERROR_WRONG_PASSWORD: 현재 비밀번호가 올바르지 않습니다.');
        }

        // 새 비밀번호 해싱 및 저장
        student.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
        await student.save();

        res.json({
            success: true,
            message: '비밀번호가 성공적으로 변경되었습니다.',
        });
    } catch (error) {
        next(error);
    }
};
