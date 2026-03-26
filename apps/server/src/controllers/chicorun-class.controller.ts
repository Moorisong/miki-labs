import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { ApiResponse } from '../types/api.types';
import { AppError } from '../middlewares/error-handler';
import { ChicorunClassModel } from '../models/chicorun-class.model';
import { ChicorunStudentModel } from '../models/chicorun-student.model';
import { getUserModel } from '../models/user.model';
import jwt from 'jsonwebtoken';

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

        const classDoc = await ChicorunClassModel.findOne({ classCode: upperClassCode }).lean();

        res.json({
            success: true,
            data: {
                ranking,
                className: classDoc ? classDoc.title : '치코런 클래스',
            },
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/chicorun/teacher/login
export const loginTeacher = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const { teacherId, name, signature } = req.body;

        if (!teacherId || !name) {
            throw new AppError(400, 'ERROR_INVALID_INPUT: teacherId와 name이 필요합니다.');
        }

        // MVP: 환경변수에 설정된 SIGNATURE_SECRET으로 요청 검증 (클라이언트-서버 간 신뢰)
        const expectedSignature = process.env.SIGNATURE_SECRET;
        if (signature !== expectedSignature) {
            throw new AppError(401, 'ERROR_UNAUTHORIZED: 유효하지 않은 요청 서명입니다.');
        }

        // providerId(kakaoId)로 실제 유저를 찾아 MongoDB ObjectId(._id)를 가져옴
        const UserModel = getUserModel();
        const user = await UserModel.findOne({ providerId: teacherId }).lean();

        if (!user) {
            throw new AppError(404, 'ERROR_USER_NOT_FOUND: 해당 교사를 찾을 수 없습니다.');
        }

        const secret = process.env.JWT_SECRET || 'chicorun-default-secret';
        const payload = { teacherId: user._id.toString(), name: user.nickname || user.name || name };
        const token = jwt.sign(payload, secret, { expiresIn: '7d' });

        res.json({
            success: true,
            data: { token },
        });
    } catch (error) {
        next(error);
    }
};

// PATCH /api/chicorun/class/:classCode/title
export const updateClassTitle = async (
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
        const { title } = req.body as { title: string };

        if (!title || !title.trim()) {
            throw new AppError(400, 'ERROR_INVALID_INPUT: 새 클래스 이름이 필요합니다.');
        }

        const updatedClass = await ChicorunClassModel.findOneAndUpdate(
            { classCode: upperClassCode, teacherId: teacher.teacherId },
            { $set: { title: title.trim() } },
            { new: true }
        ).lean();

        if (!updatedClass) {
            throw new AppError(404, 'ERROR_CLASS_NOT_FOUND: 클래스를 찾을 수 없거나 접근 권한이 없습니다.');
        }

        res.json({
            success: true,
            data: { id: updatedClass._id.toString(), title: updatedClass.title },
        });
    } catch (error) {
        next(error);
    }
};
// DELETE /api/chicorun/class/:classCode/students/:studentId
export const deleteStudent = async (
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
        const upperClassCode = classCode.toUpperCase();

        const classDoc = await ChicorunClassModel.findOne({
            classCode: upperClassCode,
            teacherId: teacher.teacherId,
        }).lean();

        if (!classDoc) {
            throw new AppError(403, 'ERROR_FORBIDDEN: 해당 클래스에 접근 권한이 없습니다.');
        }

        const deleted = await ChicorunStudentModel.findOneAndDelete({
            _id: studentId,
            classCode: upperClassCode,
        });

        if (!deleted) {
            throw new AppError(404, 'ERROR_STUDENT_NOT_FOUND: 학생을 찾을 수 없습니다.');
        }

        res.json({
            success: true,
            data: { message: `${deleted.nickname} 학생의 정보와 기록이 모두 삭제되었습니다.` },
        });
    } catch (error) {
        next(error);
    }
};
// DELETE /api/chicorun/class/:classCode
export const deleteClass = async (
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

        const deletedClass = await ChicorunClassModel.findOneAndDelete({
            classCode: upperClassCode,
            teacherId: teacher.teacherId,
        });

        if (!deletedClass) {
            throw new AppError(404, 'ERROR_CLASS_NOT_FOUND: 클래스를 찾을 수 없거나 접근 권한이 없습니다.');
        }

        // 해당 클래스의 모든 학생 정보 및 기록 삭제
        await ChicorunStudentModel.deleteMany({ classCode: upperClassCode });

        res.json({
            success: true,
            data: { message: `"${deletedClass.title}" 클래스와 모든 관련 정보가 삭제되었습니다.` },
        });
    } catch (error) {
        next(error);
    }
};
