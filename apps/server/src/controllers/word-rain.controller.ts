import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/api.types';
import { AppError } from '../middlewares/error-handler';
import { ChicorunStudentModel } from '../models/chicorun-student.model';
import { WordRainService } from '../services/word-rain.service';

/**
 * POST /api/chicorun/word-rain/start
 * 게임 시작: 레벨 기반 문제 세트 생성
 */
export const startWordRain = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const student = req.chicoStudent;
        if (!student) {
            throw new AppError(401, 'ERROR_UNAUTHORIZED: 학생 인증이 필요합니다.');
        }

        const studentDoc = await ChicorunStudentModel.findById(
            student.studentId
        ).lean();
        if (!studentDoc) {
            throw new AppError(
                404,
                'ERROR_STUDENT_NOT_FOUND: 학생 정보를 찾을 수 없습니다.'
            );
        }

        const level = studentDoc.currentLevel || 1;
        const session = await WordRainService.generateProblems(level);
        const config = WordRainService.getGameConfig();

        res.json({
            success: true,
            data: {
                problems: session.problems,
                totalCount: session.totalCount,
                level: session.level,
                config,
                studentPoint: studentDoc.point,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/chicorun/word-rain/input
 * 단일 정답 제출: 실시간 점수 및 콤보 반환
 */
export const inputWordRain = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const student = req.chicoStudent;
        if (!student) {
            throw new AppError(401, 'ERROR_UNAUTHORIZED: 학생 인증이 필요합니다.');
        }

        const { wid, mid, selectedIndex, correctIndex, combo } = req.body as {
            wid: number;
            mid: number;
            selectedIndex: number;
            correctIndex: number;
            combo: number;
        };

        if (
            wid === undefined ||
            mid === undefined ||
            selectedIndex === undefined ||
            correctIndex === undefined
        ) {
            throw new AppError(
                400,
                'ERROR_INVALID_INPUT: wid, mid, selectedIndex, correctIndex가 필요합니다.'
            );
        }

        const isCorrect = selectedIndex === correctIndex;
        const newCombo = isCorrect ? (combo || 0) + 1 : 0;
        const earnedScore = isCorrect
            ? WordRainService.calculateScore(newCombo)
            : 0;

        res.json({
            success: true,
            data: {
                isCorrect,
                earnedScore,
                combo: newCombo,
                comboMultiplier: WordRainService.getComboMultiplier(newCombo),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/chicorun/word-rain/end
 * 게임 종료: 최종 보상 계산 및 포인트 적립
 */
export const endWordRain = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const student = req.chicoStudent;
        if (!student) {
            throw new AppError(401, 'ERROR_UNAUTHORIZED: 학생 인증이 필요합니다.');
        }

        const {
            isSuccess,
            clearTimeSeconds,
            maxCombo,
            totalProblems,
            correctCount,
            score,
        } = req.body as {
            isSuccess: boolean;
            clearTimeSeconds: number;
            maxCombo: number;
            totalProblems: number;
            correctCount: number;
            score: number;
        };

        if (
            isSuccess === undefined ||
            clearTimeSeconds === undefined ||
            maxCombo === undefined ||
            totalProblems === undefined ||
            correctCount === undefined
        ) {
            throw new AppError(
                400,
                'ERROR_INVALID_INPUT: 게임 결과 정보가 필요합니다.'
            );
        }

        const reward = WordRainService.calculateFinalReward(
            isSuccess,
            clearTimeSeconds,
            maxCombo,
            totalProblems,
            correctCount
        );

        // 포인트 적립
        if (reward.totalPoint > 0) {
            await ChicorunStudentModel.findByIdAndUpdate(student.studentId, {
                $inc: { point: reward.totalPoint },
            });
        }

        const updatedStudent = await ChicorunStudentModel.findById(
            student.studentId
        ).lean();

        res.json({
            success: true,
            data: {
                ...reward,
                newPoint: updatedStudent?.point ?? 0,
                gameScore: score,
            },
        });
    } catch (error) {
        next(error);
    }
};
