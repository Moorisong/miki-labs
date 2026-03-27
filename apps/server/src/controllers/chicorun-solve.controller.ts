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

        const { progressIndex } = studentDoc;
        const difficulty = req.query.difficulty as 'easy' | 'medium' | 'hard';
        const problem = await ChicorunProblemService.getQuestion(student.studentId, progressIndex, difficulty, studentDoc.achievedMaxLevel);

        res.json({
            success: true,
            data: {
                questionId: problem.id,
                seed: problem.seed,
                level: problem.level,
                achievedMaxLevel: studentDoc.achievedMaxLevel,
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
            studentDoc.progressIndex,
            difficulty as 'easy' | 'medium' | 'hard',
            studentDoc.achievedMaxLevel
        );

        // questionId 및 seed 검증 (무결성)
        if (problem.id !== questionId || problem.seed !== seed) {
            throw new AppError(400, 'ERROR_INVALID_QUESTION: 유효하지 않은 문제 정보입니다.');
        }

        const isCorrect = selectedIndex === problem.answer;

        // 1. 시도 횟수 및 난이도 기반 포인트 계산 (정답일 때만 사용)
        const attempts = studentDoc.currentQuestionAttempts || 1;
        let baseReward = 1;
        if (attempts === 1) baseReward = 5;
        else if (attempts === 2) baseReward = 3;
        else baseReward = 1;

        const { level: currentProblemLevel } = ChicorunProblemService.getLevelAndOrderIndex(studentDoc.progressIndex);
        const targetDifficulty = (difficulty as 'easy' | 'medium' | 'hard') || ChicorunProblemService.getRecommendedDifficulty(currentProblemLevel);
        const { factor } = ChicorunProblemService.getDifficultyPenalty(targetDifficulty, currentProblemLevel, studentDoc.achievedMaxLevel);
        const rewardPoints = Math.max(1, Math.floor(baseReward * factor));

        // 2. 새로운 통계 계산 (무조건 1회 시도로 간주)
        const newTotalCount = (studentDoc.currentLevelTotalCount || 0) + 1;

        if (isCorrect) {
            const newSolvedCount = (studentDoc.currentLevelSolvedCount || 0) + 1;
            const newCurrentStreak = (studentDoc.currentLevelCurrentStreak || 0) + 1;
            const newMaxStreak = Math.max(studentDoc.currentLevelMaxStreak || 0, newCurrentStreak);

            // 새로운 레벨 및 익덱스 계산
            const newProgressIndex = studentDoc.progressIndex + 1;
            const { level: nextLevel, orderIndex } = ChicorunProblemService.getLevelAndOrderIndex(newProgressIndex);

            const isLevelComplete = orderIndex === 1 && newProgressIndex > 0;
            const isFinalComplete = newProgressIndex >= 1500;

            let achievedMaxLevel = studentDoc.achievedMaxLevel;
            let finalUpdate: any = {
                $inc: { point: rewardPoints, progressIndex: (isFinalComplete ? 0 : 1) }, // 최대치 도달 시 더 이상 증가 안함
                $set: { currentQuestionAttempts: 1 }
            };

            // 만약 이미 완료된 상태에서 또 제출하면 증가시키지 않음
            if (studentDoc.progressIndex >= 1500) {
                finalUpdate.$inc.progressIndex = 0;
            }

            // 레벨 클리어 시 조건 검증 및 achievedMaxLevel 업데이트
            if (isLevelComplete) {
                // ... (생략된 기존 검증 로직 유지)
                const accuracyThreshold = currentProblemLevel > 70 ? 0.6 : 0.7;
                const accuracy = newSolvedCount / newTotalCount;
                const streakCondition = newMaxStreak >= 5;

                if (accuracy >= accuracyThreshold && streakCondition) {
                    achievedMaxLevel = Math.max(achievedMaxLevel, currentProblemLevel);
                }

                finalUpdate.$set = {
                    ...finalUpdate.$set,
                    currentLevelTotalCount: 0,
                    currentLevelSolvedCount: 0,
                    currentLevelMaxStreak: 0,
                    currentLevelCurrentStreak: 0,
                    currentLevel: nextLevel,
                    achievedMaxLevel
                };
            } else {
                finalUpdate.$set = {
                    ...finalUpdate.$set,
                    currentLevelTotalCount: newTotalCount,
                    currentLevelSolvedCount: newSolvedCount,
                    currentLevelCurrentStreak: newCurrentStreak,
                    currentLevelMaxStreak: newMaxStreak
                };
            }

            const updatedStudent = await ChicorunStudentModel.findByIdAndUpdate(
                student.studentId,
                finalUpdate,
                { new: true }
            );

            if (!updatedStudent) throw new AppError(500, 'ERROR_DB: 업데이트 실패');

            res.json({
                success: true,
                data: {
                    isCorrect: true,
                    explanation: problem.explanation,
                    newProgressIndex: updatedStudent.progressIndex,
                    newPoint: updatedStudent.point,
                    earnedPoints: rewardPoints,
                    level: (isFinalComplete ? 100 : nextLevel),
                    isLevelComplete,
                    isFinalComplete,
                },
            });
        } else {
            // 오답 처리: 시도 횟수 증가, 스트릭 초기화, 토탈 카운트 증가
            const updatedStudent = await ChicorunStudentModel.findByIdAndUpdate(student.studentId, {
                $inc: { currentQuestionAttempts: 1, currentLevelTotalCount: 1 },
                $set: { currentLevelCurrentStreak: 0 }
            }, { new: true });

            const { level } = ChicorunProblemService.getLevelAndOrderIndex(studentDoc.progressIndex);
            res.json({
                success: true,
                data: {
                    isCorrect: false,
                    explanation: problem.explanation,
                    correctIndex: problem.answer,
                    newProgressIndex: updatedStudent?.progressIndex || studentDoc.progressIndex,
                    newPoint: updatedStudent?.point || studentDoc.point,
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
            $set: {
                ...updateData,
                currentLevelTotalCount: 0,
                currentLevelSolvedCount: 0,
                currentLevelMaxStreak: 0,
                currentLevelCurrentStreak: 0,
            },
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
 * 10,000번 문제 도달 혹은 전체 초기화 시 사용 (progressIndex 0, currentLevel 1)
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
            $set: {
                progressIndex: 0,
                currentLevel: 1,
                currentQuestionAttempts: 1,
                currentLevelTotalCount: 0,
                currentLevelSolvedCount: 0,
                currentLevelMaxStreak: 0,
                currentLevelCurrentStreak: 0,
            },
        });

        res.json({
            success: true,
            data: { message: '진도가 초기화되었습니다. 포인트는 유지됩니다.' },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/chicorun/reset-achieved-level
 * 학생 본인이 기준 레벨(achievedMaxLevel)을 현재 레벨로 맞추고 통계 초기화
 */
export const resetAchievedLevel = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const student = req.chicoStudent;
        if (!student) {
            throw new AppError(401, 'ERROR_UNAUTHORIZED: 학생 인증이 필요합니다.');
        }

        const studentDoc = await ChicorunStudentModel.findById(student.studentId);
        if (!studentDoc) {
            throw new AppError(404, 'ERROR_STUDENT_NOT_FOUND: 학생 정보를 찾을 수 없습니다.');
        }

        await ChicorunStudentModel.findByIdAndUpdate(student.studentId, {
            $set: {
                achievedMaxLevel: studentDoc.currentLevel,
                currentLevelTotalCount: 0,
                currentLevelSolvedCount: 0,
                currentLevelMaxStreak: 0,
                currentLevelCurrentStreak: 0,
                progressIndex: ChicorunProblemService.getStartProgressIndexForLevel(studentDoc.currentLevel),
            },
        });

        res.json({
            success: true,
            data: { message: '기준 레벨이 현재 레벨로 초기화되었습니다.' },
        });
    } catch (error) {
        next(error);
    }
};
