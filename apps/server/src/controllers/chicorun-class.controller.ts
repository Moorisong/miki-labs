import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { ApiResponse } from '../types/api.types';
import { AppError } from '../middlewares/error-handler';
import { ChicorunClassModel } from '../models/chicorun-class.model';
import { ChicorunStudentModel } from '../models/chicorun-student.model';

const BCRYPT_ROUNDS = 10;
const DEFAULT_RESET_PASSWORD = '0000';

function generateClassCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

async function generateUniqueClassCode(): Promise<string> {
    let code = generateClassCode();
    let exists = await ChicorunClassModel.findOne({ classCode: code }).lean();
    let attempts = 0;

    while (exists && attempts < 10) {
        code = generateClassCode();
        exists = await ChicorunClassModel.findOne({ classCode: code }).lean();
        attempts++;
    }

    if (exists) {
        throw new AppError(500, 'ERROR_SERVER: 클래스 코드 생성에 실패했습니다. 잠시 후 다시 시도하세요.');
    }

    return code;
}

// POST /api/chicorun/class
export const createClass = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const teacher = req.chicoTeacher;
        if (!teacher) {
            throw new AppError(401, 'ERROR_UNAUTHORIZED: 교사 인증이 필요합니다.');
        }

        const { title } = req.body as { title: string };

        if (!title || !title.trim()) {
            throw new AppError(400, 'ERROR_INVALID_INPUT: 클래스 이름이 필요합니다.');
        }

        const classCode = await generateUniqueClassCode();

        const newClass = await ChicorunClassModel.create({
            classCode,
            teacherId: teacher.teacherId,
            title: title.trim(),
        });

        res.status(201).json({
            success: true,
            data: {
                id: newClass._id.toString(),
                classCode: newClass.classCode,
                title: newClass.title,
                teacherId: newClass.teacherId.toString(),
                createdAt: newClass.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/chicorun/class
export const getMyClasses = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const teacher = req.chicoTeacher;
        if (!teacher) {
            throw new AppError(401, 'ERROR_UNAUTHORIZED: 교사 인증이 필요합니다.');
        }

        const classes = await ChicorunClassModel.find({ teacherId: teacher.teacherId })
            .sort({ createdAt: -1 })
            .lean();

        const classesWithCount = await Promise.all(
            classes.map(async cls => {
                const studentCount = await ChicorunStudentModel.countDocuments({ classCode: cls.classCode });
                return {
                    id: cls._id.toString(),
                    classCode: cls.classCode,
                    title: cls.title,
                    studentCount,
                    createdAt: cls.createdAt,
                };
            })
        );

        res.json({
            success: true,
            data: classesWithCount,
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/chicorun/class/:classCode/students
export const getClassStudents = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const teacher = req.chicoTeacher;
        if (!teacher) {
            throw new AppError(401, 'ERROR_UNAUTHORIZED: 교사 인증이 필요합니다.');
        }

        const classCode = String(req.params.classCode);
        const upperClassCode = classCode.toUpperCase();

        const classDoc = await ChicorunClassModel.findOne({
            classCode: upperClassCode,
            teacherId: teacher.teacherId,
        }).lean();

        if (!classDoc) {
            throw new AppError(403, 'ERROR_FORBIDDEN: 해당 클래스에 접근 권한이 없습니다.');
        }

        const students = await ChicorunStudentModel.find({ classCode: upperClassCode })
            .select('-passwordHash')
            .sort({ point: -1 })
            .lean();

        const studentsWithLevel = students.map(s => ({
            id: s._id.toString(),
            nickname: s.nickname,
            level: Math.floor(s.progressIndex / 10) + 1,
            point: s.point,
            badge: s.badge,
            nicknameStyle: s.nicknameStyle,
            cardStyle: s.cardStyle,
            customize: s.customize,
        }));

        res.json({
            success: true,
            data: studentsWithLevel,
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/chicorun/class/:classCode/reset-password
export const resetStudentPassword = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const teacher = req.chicoTeacher;
        if (!teacher) {
            throw new AppError(401, 'ERROR_UNAUTHORIZED: 교사 인증이 필요합니다.');
        }

        const classCode = String(req.params.classCode);
        const { studentId } = req.body as { studentId: string };
        const upperClassCode = classCode.toUpperCase();

        if (!studentId) {
            throw new AppError(400, 'ERROR_INVALID_INPUT: studentId가 필요합니다.');
        }

        const classDoc = await ChicorunClassModel.findOne({
            classCode: upperClassCode,
            teacherId: teacher.teacherId,
        }).lean();

        if (!classDoc) {
            throw new AppError(403, 'ERROR_FORBIDDEN: 해당 클래스에 접근 권한이 없습니다.');
        }

        const newPasswordHash = await bcrypt.hash(DEFAULT_RESET_PASSWORD, BCRYPT_ROUNDS);

        const updated = await ChicorunStudentModel.findOneAndUpdate(
            { _id: studentId, classCode: upperClassCode },
            { $set: { passwordHash: newPasswordHash } },
            { new: true }
        ).lean();

        if (!updated) {
            throw new AppError(404, 'ERROR_STUDENT_NOT_FOUND: 학생을 찾을 수 없습니다.');
        }

        res.json({
            success: true,
            data: { message: `${updated.nickname} 학생의 비밀번호가 "0000"으로 초기화되었습니다.` },
        });
    } catch (error) {
        next(error);
    }
};

// PATCH /api/chicorun/class/:classCode/students/:studentId/nickname
export const updateStudentNickname = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const teacher = req.chicoTeacher;
        if (!teacher) {
            throw new AppError(401, 'ERROR_UNAUTHORIZED: 교사 인증이 필요합니다.');
        }

        const classCode = String(req.params.classCode);
        const studentId = String(req.params.studentId);
        const { nickname } = req.body as { nickname: string };
        const upperClassCode = classCode.toUpperCase();

        if (!nickname || !nickname.trim()) {
            throw new AppError(400, 'ERROR_INVALID_INPUT: 새 닉네임이 필요합니다.');
        }

        const classDoc = await ChicorunClassModel.findOne({
            classCode: upperClassCode,
            teacherId: teacher.teacherId,
        }).lean();

        if (!classDoc) {
            throw new AppError(403, 'ERROR_FORBIDDEN: 해당 클래스에 접근 권한이 없습니다.');
        }

        const duplicateCheck = await ChicorunStudentModel.findOne({
            classCode: upperClassCode,
            nickname: nickname.trim(),
            _id: { $ne: studentId },
        }).lean();

        if (duplicateCheck) {
            throw new AppError(409, 'ERROR_DUPLICATE_NICKNAME: 이미 사용 중인 닉네임입니다.');
        }

        const updated = await ChicorunStudentModel.findOneAndUpdate(
            { _id: studentId, classCode: upperClassCode },
            { $set: { nickname: nickname.trim() } },
            { new: true }
        ).lean();

        if (!updated) {
            throw new AppError(404, 'ERROR_STUDENT_NOT_FOUND: 학생을 찾을 수 없습니다.');
        }

        res.json({
            success: true,
            data: { id: updated._id.toString(), nickname: updated.nickname },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/chicorun/class/:classCode/ranking
export const getClassRanking = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const classCode = String(req.params.classCode);
        const upperClassCode = classCode.toUpperCase();

        const students = await ChicorunStudentModel.find({ classCode: upperClassCode })
            .select('nickname point badge nicknameStyle cardStyle customize')
            .sort({ point: -1 })
            .lean();

        const ranking = students.map((s, index) => ({
            rank: index + 1,
            id: s._id.toString(),
            nickname: s.nickname,
            point: s.point,
            badge: s.badge,
            nicknameStyle: s.nicknameStyle,
            cardStyle: s.cardStyle,
            customize: s.customize,
        }));

        res.json({
            success: true,
            data: ranking,
        });
    } catch (error) {
        next(error);
    }
};
