import { Request, Response } from 'express';
import { nanoid } from 'nanoid';

import { getJohariTestModel } from '../models/johari-test.model';
import { getJohariAnswerModel } from '../models/johari-answer.model';
import { calculateJohari } from '../services/htsm/johari.service';
import { generateProofToken, verifyProofToken } from '../services/htsm/proof-token.service';
import {
    HTSM_KEYWORD_WHITELIST,
    HTSM_CONFIG,
    HTSM_ERRORS,
} from '../services/htsm/constants';

const SHARE_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

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
        const { selfKeywords, proofToken, fingerprintHash } = req.body;

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

        // 3. Fingerprint 검증 (선택적일 수도 있지만, 기능 구현을 위해 필요)
        if (fingerprintHash && typeof fingerprintHash !== 'string') {
            res.status(400).json({ success: false, error: HTSM_ERRORS.INVALID_FINGERPRINT });
            return;
        }

        // 4. ShareId 생성 & DB 저장
        const shareId = nanoid(HTSM_CONFIG.SHARE_ID_LENGTH);
        const JohariTest = getJohariTestModel();
        const test = await JohariTest.create({
            shareId,
            selfKeywords,
            creatorFingerprint: fingerprintHash,
        });

        console.log(`[HTSM] Test created: ${shareId} (fingerprint: ${fingerprintHash})`);
        res.status(201).json({ success: true, data: { shareId: test.shareId } });
    } catch (error) {
        console.error('[HTSM] Create test error:', error);
        res.status(500).json({ success: false, error: HTSM_ERRORS.INTERNAL_ERROR });
    }
}

/**
 * GET /api/htsm/my-test/:fingerprintHash
 * 내 최근 테스트 조회
 */
export async function getMyTest(req: Request, res: Response): Promise<void> {
    try {
        const { fingerprintHash } = req.params;

        if (!fingerprintHash || typeof fingerprintHash !== 'string') {
            res.status(400).json({ success: false, error: HTSM_ERRORS.INVALID_FINGERPRINT });
            return;
        }

        const JohariTest = getJohariTestModel();
        // 가장 최근에 생성한 테스트 하나만 조회
        const test = await JohariTest.findOne({ creatorFingerprint: fingerprintHash })
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
        const { shareId, keywords, fingerprintHash } = req.body;

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

        // 5. 중복 검사 (fingerprint + testId 복합 유니크 인덱스가 처리)
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';

        const JohariAnswer = getJohariAnswerModel();
        try {
            await JohariAnswer.create({
                testId: test._id,
                keywords,
                fingerprintHash,
                ip,
                userAgent,
            });
        } catch (err: unknown) {
            // MongoDB duplicate key error (E11000)
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

        // 1. shareId 검증
        if (!shareId || !SHARE_ID_REGEX.test(shareId)) {
            res.status(400).json({ success: false, error: HTSM_ERRORS.INVALID_SHARE_ID });
            return;
        }

        // 2. Test 조회
        const JohariTest = getJohariTestModel();
        const test = await JohariTest.findOne({ shareId });
        if (!test) {
            res.status(404).json({ success: false, error: HTSM_ERRORS.TEST_NOT_FOUND });
            return;
        }

        // 3. Answers 조회
        const JohariAnswer = getJohariAnswerModel();
        const answers = await JohariAnswer.find({ testId: test._id });
        const friendAnswers = answers.map((a) => a.keywords);

        // 4. Johari 계산
        const johari = calculateJohari(test.selfKeywords, friendAnswers);

        console.log(`[HTSM] Result viewed for test ${shareId} (answers: ${answers.length})`);
        res.json({
            success: true,
            data: {
                answerCount: test.answerCount,
                isClosed: test.isClosed,
                johari,
            },
        });
    } catch (error) {
        console.error('[HTSM] Get result error:', error);
        res.status(500).json({ success: false, error: HTSM_ERRORS.INTERNAL_ERROR });
    }
}

/**
 * GET /api/htsm/tests/:shareId
 * 테스트 정보 조회 (참여 가능 여부 확인용)
 */
export async function getTestInfo(req: Request, res: Response): Promise<void> {
    try {
        const shareId = req.params.shareId as string;

        // 1. shareId 검증
        if (!shareId || !SHARE_ID_REGEX.test(shareId)) {
            res.status(400).json({ success: false, error: HTSM_ERRORS.INVALID_SHARE_ID });
            return;
        }

        // 2. Test 조회
        const JohariTest = getJohariTestModel();
        const test = await JohariTest.findOne({ shareId });
        if (!test) {
            res.status(404).json({ success: false, error: HTSM_ERRORS.TEST_NOT_FOUND });
            return;
        }

        console.log(`[HTSM] Test info viewed for ${shareId}`);
        res.json({
            success: true,
            data: {
                answerCount: test.answerCount,
                isClosed: test.isClosed,
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
        const JohariTest = getJohariTestModel();

        // 1. 전체 생성 수 (현실적인 느낌을 위해 기본값 10,000에서 시작하거나 그대로 노출)
        // 여기서는 실제 숫자를 가져옴
        const totalCreated = await JohariTest.countDocuments();

        // 2. 평균 참여 수
        const stats = await JohariTest.aggregate([
            {
                $group: {
                    _id: null,
                    avgAnswers: { $avg: '$answerCount' },
                },
            },
        ]);

        const avgFriends = stats.length > 0 ? Math.round((stats[0].avgAnswers || 0) * 10) / 10 : 0;

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
