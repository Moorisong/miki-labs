import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { ApiResponse } from '../types/api.types';
import { AppError } from '../middlewares/error-handler';
import { ChicorunStudentModel } from '../models/chicorun-student.model';

// ─── 문제 템플릿 데이터 (10개 기본 형태 × 10레벨 그룹 = 100레벨) ────────────────
interface QuestionTemplate {
    templateId: number;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

const QUESTION_TEMPLATES: QuestionTemplate[] = [
    {
        templateId: 0,
        question: 'She ___ to school every day.',
        options: ['go', 'goes', 'going', 'went'],
        correctIndex: 1,
        explanation: '3인칭 단수 주어(She)에는 동사에 -s를 붙여요! 👍',
    },
    {
        templateId: 1,
        question: 'I ___ a book right now.',
        options: ['read', 'reading', 'am reading', 'reads'],
        correctIndex: 2,
        explanation: '"right now"는 현재진행형 신호! be동사 + -ing 형태를 써요. 🎯',
    },
    {
        templateId: 2,
        question: 'They ___ pizza yesterday.',
        options: ['eat', 'ate', 'eaten', 'eating'],
        correctIndex: 1,
        explanation: '"yesterday"는 과거 신호! eat의 과거형은 ate예요. ⏰',
    },
    {
        templateId: 3,
        question: 'He ___ never been to Paris.',
        options: ['is', 'has', 'have', 'was'],
        correctIndex: 1,
        explanation: '현재완료(have/has + p.p.)! 3인칭 단수엔 has를 써요. ✈️',
    },
    {
        templateId: 4,
        question: 'If I ___ rich, I would travel the world.',
        options: ['am', 'were', 'be', 'is'],
        correctIndex: 1,
        explanation: '가정법 과거! if절에는 were를 써요. (주어와 상관없이) 💭',
    },
    {
        templateId: 5,
        question: 'The cake ___ by my mom last night.',
        options: ['make', 'made', 'was made', 'making'],
        correctIndex: 2,
        explanation: '수동태(be + p.p.)! 케이크가 "만들어진" 것이라 was made예요. 🎂',
    },
    {
        templateId: 6,
        question: 'Can you tell me where ___ ?',
        options: ['is the bank', 'the bank is', 'the bank are', 'are the bank'],
        correctIndex: 1,
        explanation: '간접의문문에서는 어순이 평서문과 같아요! (주어 + 동사) 🏦',
    },
    {
        templateId: 7,
        question: 'I wish I ___ fly like a bird.',
        options: ['can', 'could', 'will', 'would'],
        correctIndex: 1,
        explanation: '"I wish" 다음에는 과거형(could)을 써서 현재의 소망을 표현해요! 🐦',
    },
    {
        templateId: 8,
        question: 'She is used to ___ early every morning.',
        options: ['wake', 'woke', 'waking', 'waken'],
        correctIndex: 2,
        explanation: '"be used to"는 "~에 익숙하다"! to 뒤에는 동명사(-ing)가 와요. ⏰',
    },
    {
        templateId: 9,
        question: 'The more you practice, ___ you become.',
        options: ['the good', 'the better', 'better', 'more better'],
        correctIndex: 1,
        explanation: '"The 비교급, the 비교급" 구문! 더 많이 할수록 더 좋아져요. 📈',
    },
];

// 레벨별 변형 접두사 (10가지)
const LEVEL_PREFIXES = [
    '[기초] ', '[초급] ', '[중급Ⅰ] ', '[중급Ⅱ] ', '[고급Ⅰ] ',
    '[고급Ⅱ] ', '[심화Ⅰ] ', '[심화Ⅱ] ', '[마스터Ⅰ] ', '[마스터Ⅱ] ',
];

const HMAC_SECRET = process.env.CHICORUN_HMAC_SECRET ?? 'chicorun-hmac-key';

function generateQuestionId(progressIndex: number, seed: string): string {
    const payload = `${progressIndex}:${seed}`;
    return crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex');
}

function verifyQuestionId(progressIndex: number, seed: string, questionId: string): boolean {
    const expected = generateQuestionId(progressIndex, seed);
    if (expected.length !== questionId.length) return false;
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(questionId, 'hex'));
}

function getQuestionByProgressIndex(progressIndex: number): QuestionTemplate {
    const templateId = progressIndex % QUESTION_TEMPLATES.length;
    const levelGroup = Math.floor(progressIndex / QUESTION_TEMPLATES.length);
    const template = QUESTION_TEMPLATES[templateId];
    const prefix = LEVEL_PREFIXES[levelGroup % LEVEL_PREFIXES.length];

    return {
        ...template,
        question: prefix + template.question,
    };
}

// GET /api/chicorun/question
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
        const level = Math.floor(progressIndex / 10) + 1;
        const questionNumber = (progressIndex % 10) + 1;

        const seed = crypto.randomBytes(8).toString('hex');
        const questionId = generateQuestionId(progressIndex, seed);
        const template = getQuestionByProgressIndex(progressIndex);

        res.json({
            success: true,
            data: {
                questionId,
                seed,
                question: template.question,
                options: template.options,
                level,
                questionNumber,
                progressIndex,
                point: studentDoc.point,
            },
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/chicorun/answer
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

        // questionId와 seed 무결성 검증
        const isValid = verifyQuestionId(studentDoc.progressIndex, seed, questionId);
        if (!isValid) {
            throw new AppError(400, 'ERROR_INVALID_QUESTION: 유효하지 않은 문제 정보입니다.');
        }

        const template = getQuestionByProgressIndex(studentDoc.progressIndex);
        const isCorrect = selectedIndex === template.correctIndex;

        if (isCorrect) {
            // 원자적(Atomic) 업데이트: $inc으로 progressIndex + 1, point + 10
            const updatedStudent = await ChicorunStudentModel.findByIdAndUpdate(
                student.studentId,
                { $inc: { progressIndex: 1, point: 10 } },
                { new: true }
            ).lean();

            const newProgressIndex = updatedStudent?.progressIndex ?? studentDoc.progressIndex + 1;
            const newPoint = updatedStudent?.point ?? studentDoc.point + 10;
            const isLevelComplete = newProgressIndex % 10 === 0 && newProgressIndex > 0;
            const isFinalComplete = newProgressIndex >= 100;

            res.json({
                success: true,
                data: {
                    isCorrect: true,
                    explanation: template.explanation,
                    newProgressIndex,
                    newPoint,
                    isLevelComplete,
                    isFinalComplete,
                    level: Math.floor(newProgressIndex / 10) + 1,
                },
            });
        } else {
            res.json({
                success: true,
                data: {
                    isCorrect: false,
                    explanation: template.explanation,
                    correctIndex: template.correctIndex,
                    newProgressIndex: studentDoc.progressIndex,
                    newPoint: studentDoc.point,
                    isLevelComplete: false,
                    isFinalComplete: false,
                    level: Math.floor(studentDoc.progressIndex / 10) + 1,
                },
            });
        }
    } catch (error) {
        next(error);
    }
};

// POST /api/chicorun/reset-progress (100레벨 달성 후 재시작)
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
            $set: { progressIndex: 0 },
            // point는 유지
        });

        res.json({
            success: true,
            data: { message: '진도가 초기화되었습니다. 포인트는 유지됩니다.' },
        });
    } catch (error) {
        next(error);
    }
};
