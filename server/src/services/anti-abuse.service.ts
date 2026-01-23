/**
 * 랭킹 어뷰징 방지 서비스
 * 다중 계정, VPN 우회, 반복 제출 등을 탐지하고 차단합니다.
 */

import mongoose, { Types } from 'mongoose';
import { Fingerprint, IFingerprint } from '../models/fingerprint.model';
import { DailyScore, IDailyScore } from '../models/daily-score.model';
import { User, IUser } from '../models/user.model';
import { Score } from '../models/score.model';
import { isSimilarNickname, containsBannedPattern, normalizeNickname } from '../utils/nickname-similarity';

// 설정값
const CONFIG = {
    DAILY_SCORE_LIMIT: 10000,              // 하루 최대 획득 점수
    DAILY_SUBMISSION_LIMIT: 50,            // 하루 최대 제출 횟수
    NEW_USER_WAIT_MINUTES: 5,              // 신규 유저 랭킹 등록 대기 시간 (분)
    NICKNAME_SIMILARITY_THRESHOLD: 0.7,    // 닉네임 유사도 임계값
    MAX_ACCOUNTS_PER_FINGERPRINT: 2,       // 핑거프린트당 최대 계정 수
    SUSPICIOUS_SCORE_STREAK: 5,            // 연속 고득점 의심 기준
    SUSPICIOUS_SCORE_THRESHOLD: 1000,      // 고득점 기준
    MAX_SUSPICION_SCORE: 100,              // 최대 의심 점수
    BAN_SUSPICION_THRESHOLD: 80,           // 자동 차단 의심 점수 임계값
};

export interface FingerprintData {
    hash: string;
    userAgent: string;
    screenResolution?: string;
    timezone?: string;
    language?: string;
    platform?: string;
}

export interface AbuseCheckResult {
    allowed: boolean;
    reason?: string;
    suspicionScore?: number;
    warnings?: string[];
}

// 오늘 날짜 문자열 반환 (YYYY-MM-DD)
function getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * 핑거프린트 등록 또는 업데이트
 */
export async function registerFingerprint(
    userId: string,
    fingerprintData: FingerprintData,
    ipAddress: string
): Promise<IFingerprint> {
    if (mongoose.connection.readyState !== 1) {
        throw new Error('DB not connected');
    }

    const existing = await Fingerprint.findOne({
        hash: fingerprintData.hash,
        userId: new Types.ObjectId(userId)
    });

    if (existing) {
        // IP 주소 추가
        if (!existing.ipAddresses.includes(ipAddress)) {
            existing.ipAddresses.push(ipAddress);
            if (existing.ipAddresses.length > 20) {
                existing.ipAddresses = existing.ipAddresses.slice(-20); // 최근 20개만 유지
            }
        }
        return existing.save();
    }

    // 새 핑거프린트 생성
    const fingerprint = new Fingerprint({
        hash: fingerprintData.hash,
        userId: new Types.ObjectId(userId),
        userAgent: fingerprintData.userAgent,
        screenResolution: fingerprintData.screenResolution,
        timezone: fingerprintData.timezone,
        language: fingerprintData.language,
        platform: fingerprintData.platform,
        ipAddresses: [ipAddress]
    });

    return fingerprint.save();
}

/**
 * 핑거프린트 기반 다중 계정 체크
 */
export async function checkMultipleAccounts(fingerprintHash: string): Promise<AbuseCheckResult> {
    if (mongoose.connection.readyState !== 1) {
        return { allowed: true, warnings: ['DB not connected, skipping check'] };
    }

    // 같은 핑거프린트로 등록된 유저 수 확인
    const accountCount = await Fingerprint.countDocuments({ hash: fingerprintHash });

    if (accountCount > CONFIG.MAX_ACCOUNTS_PER_FINGERPRINT) {
        return {
            allowed: false,
            reason: '동일 기기에서 너무 많은 계정이 생성되었습니다.',
            suspicionScore: 50
        };
    }

    // 차단된 핑거프린트 확인
    const bannedFingerprint = await Fingerprint.findOne({
        hash: fingerprintHash,
        isBanned: true
    });

    if (bannedFingerprint) {
        return {
            allowed: false,
            reason: bannedFingerprint.banReason || '차단된 기기입니다.',
            suspicionScore: 100
        };
    }

    return { allowed: true };
}

/**
 * 일일 점수 상한 체크
 */
export async function checkDailyScoreLimit(
    userId: string,
    scoreToAdd: number
): Promise<AbuseCheckResult> {
    if (mongoose.connection.readyState !== 1) {
        return { allowed: true, warnings: ['DB not connected, skipping check'] };
    }

    const today = getTodayDateString();

    let dailyScore = await DailyScore.findOne({
        userId: new Types.ObjectId(userId),
        date: today
    });

    if (!dailyScore) {
        // 첫 제출
        dailyScore = new DailyScore({
            userId: new Types.ObjectId(userId),
            date: today,
            totalScore: 0,
            submissionCount: 0
        });
    }

    const warnings: string[] = [];

    // 제출 횟수 체크
    if (dailyScore.submissionCount >= CONFIG.DAILY_SUBMISSION_LIMIT) {
        return {
            allowed: false,
            reason: `오늘 제출 횟수를 초과했습니다. (${CONFIG.DAILY_SUBMISSION_LIMIT}회)`,
            suspicionScore: 30
        };
    }

    // 점수 상한 체크
    const newTotal = dailyScore.totalScore + scoreToAdd;
    if (newTotal > CONFIG.DAILY_SCORE_LIMIT) {
        const remainingScore = CONFIG.DAILY_SCORE_LIMIT - dailyScore.totalScore;
        if (remainingScore <= 0) {
            return {
                allowed: false,
                reason: `오늘 획득 가능한 점수를 초과했습니다. (${CONFIG.DAILY_SCORE_LIMIT}점)`,
                suspicionScore: 20
            };
        }
        warnings.push(`오늘 남은 획득 가능 점수: ${remainingScore}점`);
    }

    return { allowed: true, warnings };
}

/**
 * 일일 점수 기록 업데이트
 */
export async function updateDailyScore(
    userId: string,
    scoreAdded: number
): Promise<void> {
    if (mongoose.connection.readyState !== 1) return;

    const today = getTodayDateString();

    await DailyScore.findOneAndUpdate(
        { userId: new Types.ObjectId(userId), date: today },
        {
            $inc: { totalScore: scoreAdded, submissionCount: 1 },
            $set: { lastSubmittedAt: new Date() }
        },
        { upsert: true }
    );
}

/**
 * 신규 유저 대기 시간 체크
 */
export async function checkNewUserWaitTime(userId: string): Promise<AbuseCheckResult> {
    if (mongoose.connection.readyState !== 1) {
        return { allowed: true, warnings: ['DB not connected, skipping check'] };
    }

    const user = await User.findById(userId);
    if (!user) {
        return { allowed: false, reason: '유저를 찾을 수 없습니다.' };
    }

    const createdAt = new Date(user.createdAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    if (diffMinutes < CONFIG.NEW_USER_WAIT_MINUTES) {
        const remainingMinutes = Math.ceil(CONFIG.NEW_USER_WAIT_MINUTES - diffMinutes);
        return {
            allowed: false,
            reason: `신규 가입 후 ${CONFIG.NEW_USER_WAIT_MINUTES}분이 지나야 랭킹에 등록할 수 있습니다. (${remainingMinutes}분 남음)`,
            suspicionScore: 0
        };
    }

    return { allowed: true };
}

/**
 * 닉네임 유사도 체크 (다른 랭킹 유저와 비교)
 */
export async function checkNicknameSimilarity(
    nickname: string,
    currentUserId: string
): Promise<AbuseCheckResult> {
    if (mongoose.connection.readyState !== 1) {
        return { allowed: true, warnings: ['DB not connected, skipping check'] };
    }

    // 금지어 체크
    if (containsBannedPattern(nickname)) {
        return {
            allowed: false,
            reason: '사용할 수 없는 닉네임입니다.',
            suspicionScore: 100
        };
    }

    // 상위 100위 유저들의 닉네임과 비교
    const topScores = await Score.find()
        .sort({ score: -1 })
        .limit(100)
        .populate('userId', 'nickname')
        .lean();

    const warnings: string[] = [];
    let maxSimilarity = 0;

    for (const score of topScores) {
        const scoreUser = score.userId as unknown as { _id: Types.ObjectId; nickname: string };
        if (!scoreUser || scoreUser._id.toString() === currentUserId) continue;

        if (isSimilarNickname(nickname, scoreUser.nickname, CONFIG.NICKNAME_SIMILARITY_THRESHOLD)) {
            const similarity = normalizeNickname(nickname) === normalizeNickname(scoreUser.nickname);
            if (similarity) {
                return {
                    allowed: false,
                    reason: `닉네임이 '${scoreUser.nickname}'과 너무 유사합니다. 다른 닉네임을 사용해주세요.`,
                    suspicionScore: 40
                };
            }
            maxSimilarity = Math.max(maxSimilarity, CONFIG.NICKNAME_SIMILARITY_THRESHOLD);
            warnings.push(`'${scoreUser.nickname}'과 유사한 닉네임 감지`);
        }
    }

    return { allowed: true, warnings };
}

/**
 * 비정상 점수 패턴 감지 (연속 고득점)
 */
export async function checkScorePattern(
    userId: string,
    newScore: number
): Promise<AbuseCheckResult> {
    if (mongoose.connection.readyState !== 1) {
        return { allowed: true, warnings: ['DB not connected, skipping check'] };
    }

    // 최근 제출 기록 확인
    const recentScores = await Score.find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .limit(CONFIG.SUSPICIOUS_SCORE_STREAK)
        .lean();

    if (recentScores.length < CONFIG.SUSPICIOUS_SCORE_STREAK - 1) {
        return { allowed: true };
    }

    // 연속 고득점 체크
    const allHighScores = recentScores.every(
        s => s.score >= CONFIG.SUSPICIOUS_SCORE_THRESHOLD
    ) && newScore >= CONFIG.SUSPICIOUS_SCORE_THRESHOLD;

    if (allHighScores) {
        // 의심 점수 증가
        await Fingerprint.updateMany(
            { userId: new Types.ObjectId(userId) },
            { $inc: { suspicionScore: 10 } }
        );

        return {
            allowed: true, // 일단 허용하되 경고
            warnings: ['연속 고득점이 감지되었습니다. 모니터링 중입니다.'],
            suspicionScore: 30
        };
    }

    return { allowed: true };
}

/**
 * 종합 어뷰징 체크 (모든 체크 실행)
 */
export async function performFullAbuseCheck(
    userId: string,
    nickname: string,
    score: number,
    fingerprintData?: FingerprintData,
    ipAddress?: string
): Promise<AbuseCheckResult> {
    const allWarnings: string[] = [];
    let totalSuspicionScore = 0;

    // 1. 신규 유저 대기 시간 체크
    const newUserCheck = await checkNewUserWaitTime(userId);
    if (!newUserCheck.allowed) {
        return newUserCheck;
    }

    // 2. 핑거프린트 체크 (데이터가 있으면)
    if (fingerprintData && ipAddress) {
        await registerFingerprint(userId, fingerprintData, ipAddress);

        const multiAccountCheck = await checkMultipleAccounts(fingerprintData.hash);
        if (!multiAccountCheck.allowed) {
            return multiAccountCheck;
        }
        totalSuspicionScore += multiAccountCheck.suspicionScore || 0;
    }

    // 3. 일일 점수 상한 체크
    const dailyLimitCheck = await checkDailyScoreLimit(userId, score);
    if (!dailyLimitCheck.allowed) {
        return dailyLimitCheck;
    }
    if (dailyLimitCheck.warnings) {
        allWarnings.push(...dailyLimitCheck.warnings);
    }

    // 4. 닉네임 유사도 체크
    const nicknameCheck = await checkNicknameSimilarity(nickname, userId);
    if (!nicknameCheck.allowed) {
        return nicknameCheck;
    }
    if (nicknameCheck.warnings) {
        allWarnings.push(...nicknameCheck.warnings);
    }
    totalSuspicionScore += nicknameCheck.suspicionScore || 0;

    // 5. 점수 패턴 체크
    const patternCheck = await checkScorePattern(userId, score);
    if (patternCheck.warnings) {
        allWarnings.push(...patternCheck.warnings);
    }
    totalSuspicionScore += patternCheck.suspicionScore || 0;

    // 의심 점수가 임계값 초과하면 차단
    if (totalSuspicionScore >= CONFIG.BAN_SUSPICION_THRESHOLD) {
        // 자동 차단 처리
        if (fingerprintData) {
            await Fingerprint.updateOne(
                { hash: fingerprintData.hash },
                {
                    $set: {
                        isBanned: true,
                        banReason: '비정상 활동이 감지되어 자동 차단되었습니다.',
                        suspicionScore: 100
                    }
                }
            );
        }

        return {
            allowed: false,
            reason: '비정상 활동이 감지되었습니다. 관리자에게 문의해주세요.',
            suspicionScore: totalSuspicionScore
        };
    }

    return {
        allowed: true,
        warnings: allWarnings.length > 0 ? allWarnings : undefined,
        suspicionScore: totalSuspicionScore
    };
}

/**
 * 수동 차단/차단 해제
 */
export async function banFingerprint(
    fingerprintHash: string,
    reason: string
): Promise<void> {
    await Fingerprint.updateMany(
        { hash: fingerprintHash },
        { $set: { isBanned: true, banReason: reason, suspicionScore: 100 } }
    );
}

export async function unbanFingerprint(fingerprintHash: string): Promise<void> {
    await Fingerprint.updateMany(
        { hash: fingerprintHash },
        { $set: { isBanned: false, banReason: undefined, suspicionScore: 0 } }
    );
}

/**
 * 의심스러운 유저 목록 조회
 */
export async function getSuspiciousUsers(limit: number = 20): Promise<IFingerprint[]> {
    return Fingerprint.find({ suspicionScore: { $gt: 30 } })
        .sort({ suspicionScore: -1 })
        .limit(limit)
        .populate('userId', 'nickname')
        .lean();
}

export { CONFIG as ABUSE_CONFIG };
