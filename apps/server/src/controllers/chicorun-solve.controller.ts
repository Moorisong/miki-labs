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
        explanation: 'She는 3인칭 단수잖아! 동사에 뭔가를 더 붙여서 특별하게 만들어야 하는 거 알지? 😎 주인공이 혼자일 땐 동사도 외롭지 않게 챙겨주는 영어의 국룰을 떠올려봐! 폼 미쳤다 우리 주인공, 다시 한 번 도전 가보자고~! 🚀',
    },
    {
        templateId: 1,
        question: 'I ___ a book right now.',
        options: ['read', 'reading', 'am reading', 'reads'],
        correctIndex: 2,
        explanation: '"Right now" 폼 미쳤다! 롸잇나우는 지금 당장 하고 있다는 킹갓-신호인 거 R지? 😉 be동사 뒤에 어떤 모양을 세트로 붙여야 할지 고민해봐! 지금 공부하는 네 모습 완전 레전드니까 분명히 찾아낼 수 있음! 🔥',
    },
    {
        templateId: 2,
        question: 'They ___ pizza yesterday.',
        options: ['eat', 'ate', 'eaten', 'eating'],
        correctIndex: 1,
        explanation: '어제(yesterday) 먹은 건 이미 지나간 과거라구! 🍕 동사를 평소랑 다르게 과거의 흔적이 남는 모양으로 변신시켜줘야 해! eat의 과거형이 어떻게 생겼는지 기억나? 이 정도는 가볍게 통과하는 네 실력, 어쩔티비? ⏰',
    },
    {
        templateId: 3,
        question: 'He ___ never been to Paris.',
        options: ['is', 'has', 'have', 'was'],
        correctIndex: 1,
        explanation: '과거부터 지금까지의 인생 경험을 말할 땐 have나 has랑 p.p.를 조합해야 해! ✨ 주어가 He일 때는 둘 중에 뭘 골라야 어울릴까? 파리에 갔다온 네 모습 상상하면서 다시 한 번 폼 미치게 골라보자구! ✈️',
    },
    {
        templateId: 4,
        question: 'If I ___ rich, I would travel the world.',
        options: ['am', 'were', 'be', 'is'],
        correctIndex: 1,
        explanation: '가정법 과거는 현실엔 없지만 상상 속의 설레는 이야기라구! 💭 이럴 땐 주어가 누구든 동사 자리에 특정한 과거형을 쓰는 게 국룰인 거 알지? 상상만큼은 이미 억만장자 갓생 사는 중인 네 센스를 믿어봐! 🌍✨',
    },
    {
        templateId: 5,
        question: 'The cake ___ by my mom last night.',
        options: ['make', 'made', 'was made', 'making'],
        correctIndex: 2,
        explanation: "케이크가 스스로 뿅! 하고 만들어질 순 없잖아? 🎂 누군가에 의해 '어떻게 된' 상태인지 표현하려면 be동사랑 어떤 세트가 필요한지 생각해봐! 엄마의 정성이 들어간 맛있는 케이크 완성하는 법 ㄴㅇㄱ",
    },
    {
        templateId: 6,
        question: 'Can you tell me where ___ ?',
        options: ['is the bank', 'the bank is', 'the bank are', 'are the bank'],
        correctIndex: 1,
        explanation: '문장 안에 질문이 쏙 숨어들 때는 말하는 순서가 평소랑 똑같아지는 게 국룰! 🏦 질문이 아니라 그냥 말하는 것처럼 "누가 무엇을 하는지" 순서를 잘 떠올려봐! 길 찾기 마스터 등판 가보자고~! 📍',
    },
    {
        templateId: 7,
        question: 'I wish I ___ fly like a bird.',
        options: ['can', 'could', 'will', 'would'],
        correctIndex: 1,
        explanation: '하늘을 맘껏 날고 싶다면 "I wish" 뒤에 어떤 시제를 써야 할까? 🐦 현재의 불가능한 소망을 표현할 때 쓰는 동사의 모양을 잘 골라봐! 언젠가 네 꿈이 날개를 달 수 있게 내가 응원할게! 갓생 가보자고! ✨',
    },
    {
        templateId: 8,
        question: 'She is used to ___ early every morning.',
        options: ['wake', 'woke', 'waking', 'waken'],
        correctIndex: 2,
        explanation: '"be used to"라는 표현은 뒤에 어떤 모양이 오느냐에 따라 뜻이 완전 달라져! ⏰ "~에 익숙하다"라는 폼 미친 뜻을 만들려면 어떤 꼬리를 붙여야 할까? 이미 갓생 루틴 적응 완료한 네 모습 ㅇㅈ? 다시 골라봐! 🔥',
    },
    {
        templateId: 9,
        question: 'The more you practice, ___ you become.',
        options: ['the good', 'the better', 'better', 'more better'],
        correctIndex: 1,
        explanation: '하면 할수록 더 잘하게 되는 마법의 문장! 📈 "The" 뒤에 어떤 \'더 ~한\' 상태를 나타내는 말을 써야 할지 고민해봐! 매일매일 성장하는 네 실력 진짜 레전드 찍는 중임! 이 기세로 끝까지 가보자고~! 🚀',
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
