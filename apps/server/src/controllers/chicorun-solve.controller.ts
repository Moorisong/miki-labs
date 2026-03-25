import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/api.types';
import { AppError } from '../middlewares/error-handler';
import { ChicorunStudentModel } from '../models/chicorun-student.model';
import { ChicorunProblemService } from '../services/chicorun-problem.service';

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
        const difficulty = req.query.difficulty as 'easy' | 'medium' | 'hard';
        const problem = await ChicorunProblemService.getQuestion(student.studentId, classCode, progressIndex, difficulty, studentDoc.maxLevel);

        res.json({
            success: true,
            data: {
                questionId: problem.id,
                seed: problem.seed,
                level: problem.level,
                difficulty: problem.difficulty,
                passage: problem.passage,
                question: problem.question,
                options: problem.choices,
                explanation: problem.explanation,
                questionType: problem.questionType,
                wordCount: problem.wordCount,
                progressIndex,
                point: studentDoc.point,
                questionPoint: problem.point,
                penaltyMessage: problem.penaltyMessage,
                questionNumber: problem.questionNumber,
                totalProblemsInLevel: problem.totalProblemsInLevel,
                currentQuestionAttempts: studentDoc.currentQuestionAttempts || 1,
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

        const { questionId, seed, selectedIndex, difficulty } = req.body as {
            questionId: string;
            seed: string;
            selectedIndex: number;
            difficulty?: string;
        };

        if (!questionId || !seed || selectedIndex === undefined) {
            throw new AppError(400, 'ERROR_INVALID_INPUT: questionId, seed, selectedIndex가 필요합니다.');
        }

        const studentDoc = await ChicorunStudentModel.findById(student.studentId);
        if (!studentDoc) {
            throw new AppError(404, 'ERROR_STUDENT_NOT_FOUND: 학생 정보를 찾을 수 없습니다.');
        }

        // 서버에서 해당 progressIndex의 문제를 다시 조회하여 검증
        const problem = await ChicorunProblemService.getQuestion(
            student.studentId,
            studentDoc.classCode,
            studentDoc.progressIndex,
            difficulty as 'easy' | 'medium' | 'hard',
            studentDoc.maxLevel
        );

        // questionId 및 seed 검증 (무결성)
        if (problem.id !== questionId || problem.seed !== seed) {
            throw new AppError(400, 'ERROR_INVALID_QUESTION: 유효하지 않은 문제 정보입니다.');
        }

        const isCorrect = selectedIndex === problem.answer;

        if (isCorrect) {
            // 시도 횟수별 기본 포인트 (1회: 5P, 2회: 3P, 3회 이상: 1P)
            const attempts = studentDoc.currentQuestionAttempts || 1;
            let baseReward = 1;
            if (attempts === 1) baseReward = 5;
            else if (attempts === 2) baseReward = 3;
            else baseReward = 1;

            // 난이도 페널티 적용
            const { level: problemLevel } = ChicorunProblemService.getLevelAndOrderIndex(studentDoc.progressIndex);

            // difficulty가 없으면 기본 추천 난이도로 간주 (사실상 factor 1.0)
            const targetDifficulty = (difficulty as 'easy' | 'medium' | 'hard') || ChicorunProblemService.getRecommendedDifficulty(problemLevel);
            const { factor } = ChicorunProblemService.getDifficultyPenalty(targetDifficulty, problemLevel, studentDoc.maxLevel);

            // 최종 보상 (최소 1P 보장)
            const rewardPoints = Math.max(1, Math.floor(baseReward * factor));

            // 새로운 레벨 계산
            const tempProgressIndex = studentDoc.progressIndex + 1;
            const { level: nextLevel } = ChicorunProblemService.getLevelAndOrderIndex(tempProgressIndex);

            // 정답 처리: progressIndex 및 point 증가, currentQuestionAttempts 초기화, maxLevel 갱신
            const updatedStudent = await ChicorunStudentModel.findByIdAndUpdate(
                student.studentId,
                {
                    $inc: { progressIndex: 1, point: rewardPoints },
                    $set: { currentQuestionAttempts: 1, currentLevel: nextLevel },
                    $max: { maxLevel: nextLevel }
                },
                { new: true }
            );

            if (!updatedStudent) throw new AppError(500, 'ERROR_DB: 업데이트 실패');

            const newProgressIndex = updatedStudent.progressIndex;
            const { level: newLevel, orderIndex } = ChicorunProblemService.getLevelAndOrderIndex(newProgressIndex);

            const isLevelComplete = orderIndex === 1 && newProgressIndex > 0;
            const isFinalComplete = newProgressIndex >= 1500;

            if (isLevelComplete) {
                await ChicorunStudentModel.findByIdAndUpdate(student.studentId, {
                    $set: { currentLevel: newLevel }
                });
            }

            res.json({
                success: true,
                data: {
                    isCorrect: true,
                    explanation: problem.explanation,
                    newProgressIndex,
                    newPoint: updatedStudent.point,
                    earnedPoints: rewardPoints,
                    level: newLevel,
                    isLevelComplete,
                    isFinalComplete,
                },
            });
        } else {
            // 오답 처리: 시도 횟수 증가
            await ChicorunStudentModel.findByIdAndUpdate(student.studentId, {
                $inc: { currentQuestionAttempts: 1 }
            });

            const { level } = ChicorunProblemService.getLevelAndOrderIndex(studentDoc.progressIndex);
            res.json({
                success: true,
                data: {
                    isCorrect: false,
                    explanation: problem.explanation,
                    correctIndex: problem.answer,
                    newProgressIndex: studentDoc.progressIndex,
                    newPoint: studentDoc.point,
                    level: level,
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
        const newProgressIndex = ChicorunProblemService.getStartProgressIndexForLevel(level);

        const updateData: any = {
            currentLevel: level,
            progressIndex: newProgressIndex,
            currentQuestionAttempts: 1,
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
            $set: { progressIndex: 0, currentLevel: 1, currentQuestionAttempts: 1 },
        });

        res.json({
            success: true,
            data: { message: '진도가 초기화되었습니다. 포인트는 유지됩니다.' },
        });
    } catch (error) {
        next(error);
    }
};
