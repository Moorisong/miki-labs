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
            classCode?: string;
            nickname: string;
            password: string;
        };

        if (!nickname || !password) {
            throw new AppError(400, 'ERROR_INVALID_INPUT: 닉네임과 비밀번호가 필요합니다.');
        }

        let student;

        if (classCode) {
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

            if (existingStudent) {
                // 기존 학생: 비밀번호 검증
                const isPasswordValid = await bcrypt.compare(password, existingStudent.passwordHash);
                if (!isPasswordValid) {
                    throw new AppError(401, 'ERROR_WRONG_PASSWORD: 비밀번호가 올바르지 않습니다.');
                }
                student = existingStudent;
            } else {
                // 신규 학생: 1인 1클래스 원칙 확인 (동일 닉네임/비번이 다른 클래스에 있는지)
                const sameNicknameStudents = await ChicorunStudentModel.find({
                    nickname: nickname.trim(),
                });

                for (const other of sameNicknameStudents) {
                    const match = await bcrypt.compare(password, other.passwordHash);
                    if (match) {
                        throw new AppError(400, `ERROR_ALREADY_JOINED: 이미 다른 클래스(${other.classCode})에 소속되어 있습니다. 해당 클래스 링크로 접속하세요.`);
                    }
                }

                // 가입 처리
                const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
                const newStudent = new ChicorunStudentModel({
                    classCode: upperClassCode,
                    nickname: nickname.trim(),
                    passwordHash,
                });
                student = await newStudent.save();
            }
        } else {
            // 클래스 코드 없이 닉네임/비번만으로 로그인 시도 (기존 학생 전용)
            const candidates = await ChicorunStudentModel.find({
                nickname: nickname.trim(),
            });

            if (candidates.length === 0) {
                throw new AppError(400, 'ERROR_CLASS_CODE_REQUIRED: 등록되지 않은 닉네임입니다. 오타를 확인하거나 전체 참여 링크로 접속하세요.');
            }

            const matches = [];
            for (const cand of candidates) {
                const isValid = await bcrypt.compare(password, cand.passwordHash);
                if (isValid) {
                    matches.push(cand);
                }
            }

            if (matches.length === 0) {
                throw new AppError(401, 'ERROR_WRONG_PASSWORD: 비밀번호가 올바르지 않습니다.');
            }

            if (matches.length > 1) {
                throw new AppError(400, 'ERROR_MULTIPLE_CLASSES: 여러 클래스에 등록되어 있습니다. 선생님이 공유해주신 전체 링크로 접속하세요.');
            }

            student = matches[0];
        }

        const secret = process.env.JWT_SECRET ?? 'chicorun-default-secret';
        const payload: ChicoStudentPayload = {
            studentId: (student._id as mongoose.Types.ObjectId).toString(),
            classCode: student.classCode,
            nickname: student.nickname,
        };

        const token = jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN });

        let className = '치코런 클래스';
        const classDocForName = await ChicorunClassModel.findOne({ classCode: student.classCode }).lean();
        if (classDocForName) {
            className = classDocForName.title;
        }

        res.json({
            success: true,
            data: {
                token,
                student: {
                    id: (student._id as mongoose.Types.ObjectId).toString(),
                    nickname: student.nickname,
                    classCode: student.classCode,
                    className,
                    progressIndex: student.progressIndex,
                    point: student.point,
                    badge: student.badge,
                    ownedItems: student.ownedItems,
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

        let className = '치코런 클래스';
        const classDocForName = await ChicorunClassModel.findOne({ classCode: studentDoc.classCode }).lean();
        if (classDocForName) {
            className = classDocForName.title;
        }

        res.json({
            success: true,
            data: {
                id: studentDoc._id.toString(),
                nickname: studentDoc.nickname,
                classCode: studentDoc.classCode,
                className,
                progressIndex: studentDoc.progressIndex,
                point: studentDoc.point,
                badge: studentDoc.badge,
                nicknameStyle: studentDoc.nicknameStyle,
                cardStyle: studentDoc.cardStyle,
                customize: studentDoc.customize,
                ownedItems: studentDoc.ownedItems,
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

// PATCH /api/chicorun/student/password
export const changeStudentPassword = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const student = req.chicoStudent;
        if (!student) {
            throw new AppError(401, 'ERROR_UNAUTHORIZED: 학생 인증이 필요합니다.');
        }

        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            throw new AppError(400, 'ERROR_INVALID_INPUT: 현재 비밀번호와 새 비밀번호가 필요합니다.');
        }

        if (newPassword.length < 4 || newPassword.length > 8) {
            throw new AppError(400, 'ERROR_INVALID_INPUT: 새 비밀번호는 4~8자리여야 합니다.');
        }

        const studentDoc = await ChicorunStudentModel.findById(student.studentId);
        if (!studentDoc) {
            throw new AppError(404, 'ERROR_STUDENT_NOT_FOUND: 학생 정보를 찾을 수 없습니다.');
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, studentDoc.passwordHash);
        if (!isPasswordValid) {
            throw new AppError(401, 'ERROR_WRONG_PASSWORD: 현재 비밀번호가 일치하지 않습니다.');
        }

        const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
        studentDoc.passwordHash = newPasswordHash;
        await studentDoc.save();

        res.json({ success: true, data: { message: '비밀번호가 성공적으로 변경되었습니다.' } });
    } catch (error) {
        next(error);
    }
};
// PATCH /api/chicorun/student/point
export const deductPoints = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const student = req.chicoStudent;
        if (!student) {
            throw new AppError(401, 'ERROR_UNAUTHORIZED: 학생 인증이 필요합니다.');
        }

        const { amount, itemId } = req.body;
        if (amount === undefined || typeof amount !== 'number' || amount < 0) {
            throw new AppError(400, 'ERROR_INVALID_INPUT: 차감할 포인트 금액이 올바르지 않습니다.');
        }

        const studentDoc = await ChicorunStudentModel.findById(student.studentId);
        if (!studentDoc) {
            throw new AppError(404, 'ERROR_STUDENT_NOT_FOUND: 학생 정보를 찾을 수 없습니다.');
        }

        if (studentDoc.point < amount) {
            throw new AppError(400, 'ERROR_INSUFFICIENT_POINTS: 포인트가 부족합니다.');
        }

        studentDoc.point -= amount;

        // If itemId is provided, add it to ownedItems (if not already there)
        if (itemId && !studentDoc.ownedItems.includes(itemId)) {
            studentDoc.ownedItems.push(itemId);
        }

        await studentDoc.save();

        res.json({
            success: true,
            data: {
                point: studentDoc.point,
                ownedItems: studentDoc.ownedItems
            }
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/chicorun/student/item/:itemId
export const removeOwnedItem = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const student = req.chicoStudent;
        const itemId = req.params.itemId;

        if (!student) {
            throw new AppError(401, 'ERROR_UNAUTHORIZED: 학생 인증이 필요합니다.');
        }

        const studentDoc = await ChicorunStudentModel.findById(student.studentId);
        if (!studentDoc) {
            throw new AppError(404, 'ERROR_STUDENT_NOT_FOUND: 학생 정보를 찾을 수 없습니다.');
        }

        studentDoc.ownedItems = studentDoc.ownedItems.filter(id => id !== itemId);
        await studentDoc.save();

        res.json({
            success: true,
            data: {
                ownedItems: studentDoc.ownedItems
            }
        });
    } catch (error) {
        next(error);
    }
};

