import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/api.types';
import { AppError } from '../middlewares/error-handler';
import { ChicorunStudentModel } from '../models/chicorun-student.model';
import { ChicorunWordRushSessionModel } from '../models/chicorun-word-rush-session.model';
import { ChicorunWordRushLegendModel } from '../models/chicorun-word-rush-legend.model';
import { WordRushService } from '../services/word-rush.service';

/**
 * POST /api/chicorun/word-rush/start
 * 게임 시작
 */
export const startWordRush = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
        const student = req.chicoStudent;
        if (!student) throw new AppError(401, 'ERROR_UNAUTHORIZED');

        const studentDoc = await ChicorunStudentModel.findById(student.studentId).lean();
        if (!studentDoc) throw new AppError(404, 'ERROR_STUDENT_NOT_FOUND');

        // 세션에서 사용 기록 가져오기
        const session = await ChicorunWordRushSessionModel.findOne({ studentId: student.studentId }).lean();
        const usedProblems = session ? session.used : [];

        // 문제 30개 생성
        const gameData = await WordRushService.generateProblems(studentDoc.currentLevel || 1, usedProblems);

        res.json({
            success: true,
            data: gameData,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/chicorun/word-rush/end
 * 게임 종료
 */
export const endWordRush = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
        const student = req.chicoStudent;
        if (!student) throw new AppError(401, 'ERROR_UNAUTHORIZED');

        const { correctCount, maxCombo, clearTimeSeconds, usedProblems } = req.body;

        if (correctCount === undefined || maxCombo === undefined || clearTimeSeconds === undefined) {
            throw new AppError(400, 'ERROR_INVALID_INPUT: 결과 데이터 누락');
        }

        // 보상 계산 (rankPoint, coin 분리)
        const { rankPoint, coin } = WordRushService.calculateFinalReward(correctCount, maxCombo, clearTimeSeconds);

        // 업데이트
        const updatedStudent = await ChicorunStudentModel.findByIdAndUpdate(
            student.studentId,
            { $inc: { rankPoint: rankPoint, coin: coin } },
            { new: true }
        ).lean();

        // 세션 업데이트 (사용했던 문제 기록하여 중복 방지 - TTL 1시간)
        if (usedProblems && Array.isArray(usedProblems)) {
            await ChicorunWordRushSessionModel.findOneAndUpdate(
                { studentId: student.studentId },
                {
                    $push: { used: { $each: usedProblems } },
                    $set: { expiresAt: new Date(Date.now() + 60 * 60 * 1000) }
                },
                { upsert: true }
            );
        }

        // 레전드 기록 갱신 여부 체크
        const currentLegend = await ChicorunWordRushLegendModel.findOne().sort({ score: -1 }).lean();
        let isNewLegend = false;

        if (!currentLegend || rankPoint > currentLegend.score) {
            await ChicorunWordRushLegendModel.create({
                studentId: student.studentId,
                score: rankPoint,
                correctCount,
            });
            isNewLegend = true;
        }

        res.json({
            success: true,
            data: {
                earnedRankPoint: rankPoint,
                earnedCoin: coin,
                totalRankPoint: updatedStudent?.rankPoint,
                totalCoin: updatedStudent?.coin,
                isNewLegend,
            },
        });
    } catch (error) {
        next(error);
    }
};
