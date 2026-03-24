import { Request, Response } from 'express';
import { nanoid } from 'nanoid';

import { getJohariTestModel } from '../models/johari-test.model';
import { getJohariAnswerModel } from '../models/johari-answer.model';
import { getHtsmStatsModel } from '../models/htsm-stats.model';
import { getUserModel } from '../models/user.model';
import { calculateJohari } from '../services/htsm/johari.service';
import { generateProofToken, verifyProofToken } from '../services/htsm/proof-token.service';
import {
    HTSM_KEYWORD_WHITELIST,
    HTSM_CONFIG,
    HTSM_ERRORS,
} from '../services/htsm/constants';
import { generateDescription } from '../services/htsm/utils/description-generator';

const SHARE_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

/**
 * 오늘 날짜(UTC 00:00) 구하기
 */
function getTodayDate(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * 통계 업데이트 (증가)
 */
async function incrementStats(testCount: number, answerCount: number) {
    try {
        const HtsmStats = getHtsmStatsModel();
        const today = getTodayDate();

        // 오늘 날짜 통계 업데이트 (없으면 생성)
        await HtsmStats.findOneAndUpdate(
            { date: today },
            {
                $inc: {
                    newTests: testCount,
                    newAnswers: answerCount,
                    totalTests: testCount, // 누적도 여기서 증가시킴 (나중에 전체 합산 방식 대신)
                    totalAnswers: answerCount
                }
            },
            { upsert: true, new: true }
        );

        // 전체 누적용 (date: 1970-01-01)
        await HtsmStats.findOneAndUpdate(
            { date: new Date(0) }, // 특수 키 (1970-01-01)
            {
                $inc: {
                    totalTests: testCount,
                    totalAnswers: answerCount
                }
            },
            { upsert: true }
        );

    } catch (e) {
        console.error('Failed to update stats:', e);
    }
}

/**
 * GET /api/htsm/proof-token
 * Proof Token 발급
 */
export async function getProofToken(req: Request, res: Response): Promise<void> {
    const token = generateProofToken();
    res.json({ success: true, data: { proofToken: token } });
}

/**
 * POST /api/htsm/tests
 * 테스트 생성
 */
export async function createTest(req: Request, res: Response): Promise<void> {
    try {
        const { selfKeywords, proofToken, fingerprintHash, userId, name } = req.body;

        // 1. Proof Token 검증
        if (!proofToken || typeof proofToken !== 'string') {
            res.status(403).json({ success: false, error: HTSM_ERRORS.INVALID_PROOF_TOKEN });
            return;
        }
        if (!verifyProofToken(proofToken)) {
            res.status(403).json({ success: false, error: HTSM_ERRORS.INVALID_PROOF_TOKEN });
            return;
        }

        // 2. Keywords 검증
        if (
            !Array.isArray(selfKeywords) ||
            selfKeywords.length < HTSM_CONFIG.MIN_KEYWORD_COUNT ||
            selfKeywords.length > HTSM_CONFIG.MAX_KEYWORD_COUNT
        ) {
            res.status(400).json({ success: false, error: HTSM_ERRORS.INVALID_KEYWORD_COUNT });
            return;
        }
        const allValid = selfKeywords.every(
            (kw: unknown) =>
                typeof kw === 'string' &&
                (HTSM_KEYWORD_WHITELIST as readonly string[]).includes(kw)
        );
        if (!allValid) {
            res.status(400).json({ success: false, error: HTSM_ERRORS.INVALID_KEYWORDS });
            return;
        }
        if (!userId || typeof userId !== 'string') {
            res.status(400).json({ success: false, error: '로그인이 필요합니다.' });
            return;
        }

        // 3.1 Name 검증 (필수)
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            res.status(400).json({ success: false, error: '이름을 입력해주세요.' });
            return;
        }
        if (name.length > 20) {
            res.status(400).json({ success: false, error: '이름은 20자 이내로 입력해주세요.' });
            return;
        }

        // 3.5 생성 제한 정책 (하루 5개)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 오늘 00:00:00

        const JohariTest = getJohariTestModel();
        const dailyCount = await JohariTest.countDocuments({
            userId,
            createdAt: { $gte: today }
        });

        if (dailyCount >= 5) {
            res.status(429).json({ success: false, error: '하루에 생성할 수 있는 테스트 개수(5개)를 초과했습니다.' });
            return;
        }

        // 4. ShareId 생성 & DB 저장
        const shareId = nanoid(HTSM_CONFIG.SHARE_ID_LENGTH);
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';

        const test = await JohariTest.create({
            shareId,
            selfKeywords,
            userId, // 카카오 ID 저장
            name: name.trim(), // 이름 저장
            creatorFingerprint: fingerprintHash, // 보조 저장
            createdIp: ip,
            createdUserAgent: userAgent,
        });

        // 통계 업데이트 (비동기 처리)
        incrementStats(1, 0).catch(console.error);

        console.log(`[HTSM] Test created: ${shareId} (fingerprint: ${fingerprintHash})`);
        res.status(201).json({ success: true, data: { shareId: test.shareId } });
    } catch (error) {
        console.error('[HTSM] Create test error:', error);
        res.status(500).json({ success: false, error: HTSM_ERRORS.INTERNAL_ERROR });
    }
}

/**
 * GET /api/htsm/my-test/:userId
 * 내 최근 테스트 조회
 */
export async function getMyTest(req: Request, res: Response): Promise<void> {
    try {
        const { userId } = req.params;

        if (!userId || typeof userId !== 'string') {
            res.status(400).json({ success: false, error: '유저 ID가 필요합니다.' });
            return;
        }

        const JohariTest = getJohariTestModel();
        // 가장 최근에 생성한 테스트 하나만 조회 (userId 기준)
        const test = await JohariTest.findOne({ userId })
            .sort({ createdAt: -1 });

        if (!test) {
            res.json({ success: true, data: { shareId: null } });
            return;
        }

        res.json({ success: true, data: { shareId: test.shareId } });
    } catch (error) {
        console.error('[HTSM] Get my test error:', error);
        res.status(500).json({ success: false, error: HTSM_ERRORS.INTERNAL_ERROR });
    }
}

/**
 * POST /api/htsm/answers
 * 친구 응답 제출
 */
export async function submitAnswer(req: Request, res: Response): Promise<void> {
    try {
        const { shareId, keywords, fingerprintHash, userId } = req.body;

        // 1. shareId 검증
        if (!shareId || typeof shareId !== 'string' || !SHARE_ID_REGEX.test(shareId)) {
            res.status(400).json({ success: false, error: HTSM_ERRORS.INVALID_SHARE_ID });
            return;
        }

        // 2. Keywords 검증
        if (
            !Array.isArray(keywords) ||
            keywords.length < HTSM_CONFIG.MIN_KEYWORD_COUNT ||
            keywords.length > HTSM_CONFIG.MAX_KEYWORD_COUNT
        ) {
            res.status(400).json({ success: false, error: HTSM_ERRORS.INVALID_KEYWORD_COUNT });
            return;
        }
        const allValid = keywords.every(
            (kw: unknown) =>
                typeof kw === 'string' &&
                (HTSM_KEYWORD_WHITELIST as readonly string[]).includes(kw)
        );
        if (!allValid) {
            res.status(400).json({ success: false, error: HTSM_ERRORS.INVALID_KEYWORDS });
            return;
        }

        // 3. Fingerprint 검증
        if (
            !fingerprintHash ||
            typeof fingerprintHash !== 'string' ||
            fingerprintHash.length > HTSM_CONFIG.MAX_FINGERPRINT_HASH_LENGTH
        ) {
            res.status(400).json({ success: false, error: HTSM_ERRORS.INVALID_FINGERPRINT });
            return;
        }

        // 4. Test 조회
        const JohariTest = getJohariTestModel();
        const test = await JohariTest.findOne({ shareId });
        if (!test) {
            res.status(404).json({ success: false, error: HTSM_ERRORS.TEST_NOT_FOUND });
            return;
        }
        if (test.isClosed) {
            res.status(403).json({ success: false, error: HTSM_ERRORS.TEST_CLOSED });
            return;
        }
        // 4.5 제작자 본인 여부 확인
        const isCreator = (userId && test.userId === userId) || (fingerprintHash && test.creatorFingerprint === fingerprintHash);
        if (isCreator) {
            res.status(403).json({ success: false, error: '본인의 테스트에는 답변을 남길 수 없습니다.' });
            return;
        }

        // 5. 중복 검사
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';

        const JohariAnswer = getJohariAnswerModel();



        // 5.2 Fingerprint 중복 검사 (DB Unique Index가 잡지만 명시적 처리)
        const existingAnswer = await JohariAnswer.findOne({
            testId: test._id,
            fingerprintHash
        });

        if (existingAnswer) {
            res.status(409).json({ success: false, error: '이미 참여하셨습니다 😊 친구 결과를 확인해 보세요!' });
            return;
        }
        try {
            await JohariAnswer.create({
                testId: test._id,
                keywords,
                fingerprintHash,
                ip,
                userAgent,
            });
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000) {
                res.status(409).json({ success: false, error: HTSM_ERRORS.DUPLICATE_ANSWER });
                return;
            }
            throw err;
        }

        // 6. answerCount 업데이트
        const updatedTest = await getJohariTestModel().findByIdAndUpdate(
            test._id,
            {
                $inc: { answerCount: 1 },
                ...(test.answerCount + 1 >= HTSM_CONFIG.MAX_ANSWERS_PER_TEST
                    ? { $set: { isClosed: true } }
                    : {}),
            },
            { new: true }
        );

        // 통계 업데이트
        incrementStats(0, 1).catch(console.error);

        console.log(`[HTSM] Answer submitted for test ${shareId} (count: ${updatedTest?.answerCount})`);
        res.json({
            success: true,
            data: { isClosed: updatedTest?.isClosed ?? false },
        });
    } catch (error) {
        console.error('[HTSM] Submit answer error:', error);
        res.status(500).json({ success: false, error: HTSM_ERRORS.INTERNAL_ERROR });
    }
}

/**
 * GET /api/htsm/result/:shareId
 * 결과 조회
 */
export async function getResult(req: Request, res: Response): Promise<void> {
    try {
        const shareId = req.params.shareId as string;

        if (!shareId || !SHARE_ID_REGEX.test(shareId)) {
            res.status(400).json({ success: false, error: HTSM_ERRORS.INVALID_SHARE_ID });
            return;
        }

        const JohariTest = getJohariTestModel();
        const test = await JohariTest.findOne({ shareId });
        if (!test) {
            res.status(404).json({ success: false, error: HTSM_ERRORS.TEST_NOT_FOUND });
            return;
        }

        const JohariAnswer = getJohariAnswerModel();
        const answers = await JohariAnswer.find({ testId: test._id });
        const friendAnswers = answers.map((a) => a.keywords);

        const johari = calculateJohari(test.selfKeywords, friendAnswers);

        // 결과 페이지용 추가 데이터 계산
        const totalFriends = HTSM_CONFIG.MIN_FRIENDS_FOR_RESULT;
        const participationPercent = Math.min(Math.round((test.answerCount / totalFriends) * 100), 100);
        const friendsNeeded = Math.max(0, totalFriends - test.answerCount);

        const cards = [
            {
                title: '개방된 자아',
                area: 'open',
                theme: 'green',
                keywords: johari.open.keywords,
                description: generateDescription('open', johari.open.keywords, shareId)
            },
            {
                title: '눈먼 자아',
                area: 'blind',
                theme: 'blue',
                keywords: johari.blind.keywords,
                description: generateDescription('blind', johari.blind.keywords, shareId)
            },
            {
                title: '숨겨진 자아',
                area: 'hidden',
                theme: 'purple',
                keywords: johari.hidden.keywords,
                description: generateDescription('hidden', johari.hidden.keywords, shareId)
            },
            {
                title: '미지의 자아',
                area: 'unknown',
                theme: 'cyan',
                keywords: test.answerCount === 0 ? [] : johari.unknown.keywords,
                description: generateDescription('unknown', test.answerCount === 0 ? [] : johari.unknown.keywords, shareId)
            }
        ];

        // 유저 정보 연동 (최신 닉네임 반영)
        let displayName = test.name;
        if (test.userId) {
            const user = await getUserModel().findOne({ providerId: test.userId });
            if (user && user.nickname) {
                displayName = user.nickname;
            }
        }

        console.log(`[HTSM] Result viewed for test ${shareId} (answers: ${answers.length})`);
        res.json({
            success: true,
            data: {
                name: displayName,
                answerCount: test.answerCount,
                isClosed: test.isClosed,
                johari,
                participationPercent,
                friendsNeeded,
                cards,
            },
        });
    } catch (error) {
        console.error('[HTSM] Get result error:', error);
        res.status(500).json({ success: false, error: HTSM_ERRORS.INTERNAL_ERROR });
    }
}

/**
 * GET /api/htsm/tests/:shareId
 * 테스트 정보 조회
 */
export async function getTestInfo(req: Request, res: Response): Promise<void> {
    try {
        const shareId = req.params.shareId as string;
        const userId = req.query.userId as string | undefined;
        const fingerprintHash = req.query.fp as string | undefined;

        if (!shareId || !SHARE_ID_REGEX.test(shareId)) {
            res.status(400).json({ success: false, error: HTSM_ERRORS.INVALID_SHARE_ID });
            return;
        }

        const JohariTest = getJohariTestModel();
        const test = await JohariTest.findOne({ shareId });
        if (!test) {
            res.status(404).json({ success: false, error: HTSM_ERRORS.TEST_NOT_FOUND });
            return;
        }

        const isCreator = (userId && test.userId === userId) || (fingerprintHash && test.creatorFingerprint === fingerprintHash);

        // 유저 정보 연동 (최신 닉네임 반영)
        let displayName = test.name;
        if (test.userId) {
            const user = await getUserModel().findOne({ providerId: test.userId });
            if (user && user.nickname) {
                displayName = user.nickname;
            }
        }

        console.log(`[HTSM] Test info viewed for ${shareId} (isCreator: ${isCreator})`);
        res.json({
            success: true,
            data: {
                name: displayName,
                answerCount: test.answerCount,
                isClosed: test.isClosed,
                isCreator,
            },
        });
    } catch (error) {
        console.error('[HTSM] Get test info error:', error);
        res.status(500).json({ success: false, error: HTSM_ERRORS.INTERNAL_ERROR });
    }
}

/**
 * GET /api/htsm/stats
 * 전체 통계 조회
 */
export async function getStats(req: Request, res: Response): Promise<void> {
    try {
        const HtsmStats = getHtsmStatsModel();

        // 전체 누적 통계 조회 (Date(0) 사용)
        let globalStats = await HtsmStats.findOne({ date: new Date(0) });

        if (!globalStats) {
            // 초기 데이터가 없으면 현재 DB 기준으로 생성
            const JohariTest = getJohariTestModel();
            const currentTotal = await JohariTest.countDocuments();

            // 기존 데이터의 총 답변 수는 aggregate로 계산
            const answerStats = await JohariTest.aggregate([
                { $group: { _id: null, totalAnswers: { $sum: '$answerCount' } } }
            ]);
            const currentTotalAnswers = answerStats.length > 0 ? answerStats[0].totalAnswers : 0;

            globalStats = await HtsmStats.create({
                date: new Date(0),
                totalTests: currentTotal,
                totalAnswers: currentTotalAnswers,
            });
        }

        const totalCreated = globalStats.totalTests;
        const totalAnswers = globalStats.totalAnswers;

        // 평균 친구 수 계산 (전체 답변 / 전체 테스트)
        const avgFriends = totalCreated > 0
            ? Math.round((totalAnswers / totalCreated) * 10) / 10
            : 0;

        res.json({
            success: true,
            data: {
                totalCreated,
                avgFriends,
            },
        });
    } catch (error) {
        console.error('[HTSM] Get stats error:', error);
        res.status(500).json({ success: false, error: HTSM_ERRORS.INTERNAL_ERROR });
    }
}
