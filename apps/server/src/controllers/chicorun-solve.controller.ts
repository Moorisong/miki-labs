import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/api.types';
import { AppError } from '../middlewares/error-handler';
import { ChicorunStudentModel } from '../models/chicorun-student.model';
import { ChicorunProblemService, LEVELS } from '../services/chicorun-problem.service';

/**
 * GET /api/chicorun/question
 * 현재 progressIndex 기반으로 문제 생성하여 반환
 */
export const getQuestion = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const student = req.chicoStudent;
        if (!student) {
            throw new AppError(401, 'ERROR_UNAUTHORIZED: 학생 인증이 필요합니다.');
        }

        const studentDoc = await ChicorunStudentModel.findById(student.studentId).lean();
        if (!studentDoc) {
            throw new AppError(404, 'ERROR_STUDENT_NOT_FOUND: 학생 정보를 찾을 수 없습니다.');
        }

        const { progressIndex, classCode } = studentDoc;
        const problem = ChicorunProblemService.generateQuestion(student.studentId, classCode, progressIndex);

        res.json({
            success: true,
            data: {
                questionId: problem.id,
                seed: problem.seed,
                type: problem.type,
                level: studentDoc.currentLevel,
                question: problem.question,
                options: problem.choices,
                progressIndex,
                point: studentDoc.point,
                questionNumber: (progressIndex % 100) + 1,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/chicorun/answer
 * 제출된 정답 검증 및 결과 처리
 */
export const submitAnswer = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const student = req.chicoStudent;
        if (!student) {
            throw new AppError(401, 'ERROR_UNAUTHORIZED: 학생 인증이 필요합니다.');
        }

        const { questionId, seed, selectedIndex } = req.body as {
            questionId: string;
            seed: string;
            selectedIndex: number;
        };

        if (!questionId || !seed || selectedIndex === undefined) {
            throw new AppError(400, 'ERROR_INVALID_INPUT: questionId, seed, selectedIndex가 필요합니다.');
        }

        const studentDoc = await ChicorunStudentModel.findById(student.studentId);
        if (!studentDoc) {
            throw new AppError(404, 'ERROR_STUDENT_NOT_FOUND: 학생 정보를 찾을 수 없습니다.');
        }

        // 서버에서 해당 progressIndex의 문제를 다시 생성하여 검증
        const problem = ChicorunProblemService.generateQuestion(
            student.studentId,
            studentDoc.classCode,
            studentDoc.progressIndex
        );

        // questionId 및 seed 검증 (무결성)
        if (problem.id !== questionId || problem.seed !== seed) {
            throw new AppError(400, 'ERROR_INVALID_QUESTION: 유효하지 않은 문제 정보입니다.');
        }

        const isCorrect = selectedIndex === problem.correctIndex;

        if (isCorrect) {
            // 정답 처리: progressIndex 및 point 증가
            const updatedStudent = await ChicorunStudentModel.findByIdAndUpdate(
                student.studentId,
                { $inc: { progressIndex: 1, point: 10 } },
                { new: true }
            ).lean();

            const newProgressIndex = updatedStudent?.progressIndex ?? 0;
            const isLevelComplete = newProgressIndex % 100 === 0 && newProgressIndex > 0;
            const isFinalComplete = newProgressIndex >= 10000;

            if (isLevelComplete && updatedStudent) {
                // 레벨 업그레이드
                await ChicorunStudentModel.findByIdAndUpdate(student.studentId, {
                    $set: { currentLevel: Math.floor(newProgressIndex / 100) + 1 }
                });
            }

            res.json({
                success: true,
                data: {
                    isCorrect: true,
                    explanation: problem.explanation,
                    newProgressIndex,
                    newPoint: updatedStudent?.point,
                    level: Math.floor(newProgressIndex / 100) + 1,
                    isLevelComplete,
                    isFinalComplete,
                },
            });
        } else {
            res.json({
                success: true,
                data: {
                    isCorrect: false,
                    explanation: problem.explanation,
                    correctIndex: problem.correctIndex,
                    newProgressIndex: studentDoc.progressIndex,
                    newPoint: studentDoc.point,
                    level: Math.floor(studentDoc.progressIndex / 100) + 1,
                    isLevelComplete: false,
                    isFinalComplete: false,
                },
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/chicorun/level
 * 레벨 선택 (beginner, intermediate, advanced)
 * 해당 레벨의 시작점으로 progressIndex 재매핑
 */
export const selectLevel = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const student = req.chicoStudent;
        if (!student) {
            throw new AppError(401, 'ERROR_UNAUTHORIZED: 학생 인증이 필요합니다.');
        }

        const { level, isInitial, adjustmentCount } = req.body as {
            level: number;
            isInitial?: boolean;
            adjustmentCount?: number;
        };

        if (level === undefined || level < 1 || level > 100) {
            throw new AppError(400, 'ERROR_INVALID_INPUT: 1에서 100 사이의 올바른 레벨을 선택해 주세요.');
        }

        // 해당 레벨의 시작 인덱스로 재매핑
        const newProgressIndex = (level - 1) * 100;

        const updateData: any = {
            currentLevel: level,
            progressIndex: newProgressIndex,
        };

        if (isInitial) {
            updateData.startLevel = level;
            updateData.adjustmentCount = 0;
        }

        if (adjustmentCount !== undefined) {
            updateData.adjustmentCount = adjustmentCount;
        }

        await ChicorunStudentModel.findByIdAndUpdate(student.studentId, {
            $set: updateData,
        });

        res.json({
            success: true,
            data: {
                message: `${level} 레벨로 변경되었습니다.`,
                newProgressIndex,
                currentLevel: level,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/chicorun/reset-progress
 * 10,000번 문제 도달 혹은 전체 초기화 시 사용
 */
export const resetProgress = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const student = req.chicoStudent;
        if (!student) {
            throw new AppError(401, 'ERROR_UNAUTHORIZED: 학생 인증이 필요합니다.');
        }

        await ChicorunStudentModel.findByIdAndUpdate(student.studentId, {
            $set: { progressIndex: 0, selectedLevel: 'beginner' },
        });

        res.json({
            success: true,
            data: { message: '진도가 초기화되었습니다. 포인트는 유지됩니다.' },
        });
    } catch (error) {
        next(error);
    }
};
