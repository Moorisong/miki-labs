import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../types/api.types';
import { AppError } from '../middlewares/error-handler';
import { ChicorunStudentModel } from '../models/chicorun-student.model';
import { ChicorunClassModel } from '../models/chicorun-class.model';
import type { ChicoStudentPayload } from '../middlewares/chicorun-student-auth';

const BCRYPT_ROUNDS = 10;
const JWT_EXPIRES_IN = '7d';

// POST /api/chicorun/student/login
export const studentLogin = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const { classCode, nickname, password } = req.body as {
            classCode: string;
            nickname: string;
            password: string;
        };

        if (!classCode || !nickname || !password) {
            throw new AppError(400, 'ERROR_INVALID_INPUT: 클래스 코드, 닉네임, 비밀번호가 필요합니다.');
        }

        const upperClassCode = classCode.toUpperCase().trim();

        // 클래스 존재 확인
        const classDoc = await ChicorunClassModel.findOne({ classCode: upperClassCode }).lean();
        if (!classDoc) {
            throw new AppError(404, 'ERROR_CLASS_NOT_FOUND: 존재하지 않는 클래스 코드입니다.');
        }

        const existingStudent = await ChicorunStudentModel.findOne({
            classCode: upperClassCode,
            nickname: nickname.trim(),
        });

        let student;

        if (existingStudent) {
            // 기존 학생: 비밀번호 검증
            const isPasswordValid = await bcrypt.compare(password, existingStudent.passwordHash);
            if (!isPasswordValid) {
                throw new AppError(401, 'ERROR_WRONG_PASSWORD: 비밀번호가 올바르지 않습니다.');
            }
            student = existingStudent;
        } else {
            // 신규 학생: 가입 처리
            const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
            const newStudent = new ChicorunStudentModel({
                classCode: upperClassCode,
                nickname: nickname.trim(),
                passwordHash,
            });
            student = await newStudent.save();
        }

        const secret = process.env.JWT_SECRET ?? 'chicorun-default-secret';
        const payload: ChicoStudentPayload = {
            studentId: (student._id as mongoose.Types.ObjectId).toString(),
            classCode: student.classCode,
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
                    classCode: student.classCode,
                    progressIndex: student.progressIndex,
                    point: student.point,
                    badge: student.badge,
                    level: Math.floor(student.progressIndex / 10) + 1,
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
                classCode: studentDoc.classCode,
                progressIndex: studentDoc.progressIndex,
                point: studentDoc.point,
                badge: studentDoc.badge,
                nicknameStyle: studentDoc.nicknameStyle,
                cardStyle: studentDoc.cardStyle,
                customize: studentDoc.customize,
                level: Math.floor(studentDoc.progressIndex / 10) + 1,
            },
        });
    } catch (error) {
        next(error);
    }
};

// PATCH /api/chicorun/student/customize
export const updateCustomize = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const student = req.chicoStudent;
        if (!student) {
            throw new AppError(401, 'ERROR_UNAUTHORIZED: 학생 인증이 필요합니다.');
        }

        const { badge, nicknameStyle, cardStyle, customize } = req.body;

        const updatedStudent = await ChicorunStudentModel.findByIdAndUpdate(
            student.studentId,
            {
                $set: {
                    ...(badge !== undefined && { badge }),
                    ...(nicknameStyle !== undefined && { nicknameStyle }),
                    ...(cardStyle !== undefined && { cardStyle }),
                    ...(customize !== undefined && { customize }),
                },
            },
            { new: true }
        ).select('-passwordHash').lean();

        if (!updatedStudent) {
            throw new AppError(404, 'ERROR_STUDENT_NOT_FOUND: 학생 정보를 찾을 수 없습니다.');
        }

        res.json({
            success: true,
            data: {
                badge: updatedStudent.badge,
                nicknameStyle: updatedStudent.nicknameStyle,
                cardStyle: updatedStudent.cardStyle,
                customize: updatedStudent.customize,
            },
        });
    } catch (error) {
        next(error);
    }
};
