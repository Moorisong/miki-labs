import { WordModel, IWord, IMeaning } from '../models/word.model';

// ─── 타입 정의 ──────────────────────────────────────────────────────────────────

export interface WordRainProblem {
    wid: number;
    mid: number;
    ko: string;
    answers: string[];
    correctIndex: number;
}

export interface WordRainSession {
    problems: WordRainProblem[];
    totalCount: number;
    level: number;
}

interface SessionState {
    used: { wid: number; mid: number }[];
    recentWids: number[];
    prevMid: number | null;
}

// ─── 상수 ────────────────────────────────────────────────────────────────────────

const RECENT_WID_LIMIT = 10;
const WRONG_ANSWER_COUNT = 3;
const PROBLEMS_PER_GAME = 20;

const COMBO_MULTIPLIER: Record<number, number> = {
    1: 1,
    2: 1.2,
    3: 1.5,
    4: 1.5,
};
const COMBO_MULTIPLIER_MAX = 2;
const COMBO_MAX_THRESHOLD = 5;

const BASE_POINT = 10;
const SUCCESS_BASE_REWARD = 100;
const TIME_BONUS_MULTIPLIER = 2;
const COMBO_BONUS_MULTIPLIER = 5;
const PERFECT_BONUS = 50;
const BASE_TIME_LIMIT_SECONDS = 120;
const FREEZE_DURATION_MS = 3000;
const MAX_FREEZE_PER_GAME = 2;
const FREEZE_GRANT_SCORE_THRESHOLD = 50;

// ─── 유틸 ────────────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getComboMultiplier(combo: number): number {
    if (combo >= COMBO_MAX_THRESHOLD) return COMBO_MULTIPLIER_MAX;
    return COMBO_MULTIPLIER[combo] ?? 1;
}

// ─── 서비스 ──────────────────────────────────────────────────────────────────────

export class WordRainService {
    /**
     * 게임 시작: 문제 세트 생성
     * - level 기반 단어 조회
     * - 중복 방지 (wid+mid, recentWids, prevMid)
     * - 정답 1 + 오답 N 구성 후 셔플
     */
    static async generateProblems(level: number): Promise<WordRainSession> {
        const targetLevel = Math.max(1, Math.min(level, 100));

        // 해당 레벨 및 인접 레벨에서 단어 조회
        let words = await WordModel.find({
            level: { $gte: Math.max(1, targetLevel - 2), $lte: targetLevel + 2 },
        }).lean();

        // 해당 레벨 범위에 문제가 충분하지 않으면 전체 단어에서 fallback
        if (this.countAvailableMeanings(words) < PROBLEMS_PER_GAME) {
            words = await WordModel.find({}).lean();
        }

        if (words.length === 0) {
            throw new Error('ERROR_NO_WORDS: 사용 가능한 단어가 없습니다. 단어 시딩이 필요합니다.');
        }

        const session: SessionState = {
            used: [],
            recentWids: [],
            prevMid: null,
        };

        const problems: WordRainProblem[] = [];
        const maxProblems = PROBLEMS_PER_GAME;

        for (let i = 0; i < maxProblems; i++) {
            const problem = this.generateSingleProblem(words, session, false);
            if (!problem) break;
            problems.push(problem);
        }

        return {
            problems,
            totalCount: problems.length,
            level: targetLevel,
        };
    }

    /**
     * 단일 문제 생성 (중복 방지 적용)
     */
    private static generateSingleProblem(
        words: IWord[],
        session: SessionState,
        isFallback: boolean
    ): WordRainProblem | null {
        // 후보 필터링: used 제외, recentWids 제외
        const candidates: { word: IWord; meaning: IMeaning }[] = [];

        for (const word of words) {
            if (session.recentWids.includes(word.wid)) continue;

            for (const meaning of word.meanings) {
                const isUsed = session.used.some(
                    u => u.wid === word.wid && u.mid === meaning.mid
                );
                if (isUsed) continue;

                // 동일 mid 연속 방지
                if (session.prevMid !== null && meaning.mid === session.prevMid) continue;

                candidates.push({ word, meaning });
            }
        }

        if (candidates.length === 0) {
            if (!isFallback) {
                // 단어 풀이 작아 후보가 모두 소진된 경우, 사용 기록과 중복 제한을 초기화하고 재시도
                session.used = [];
                session.recentWids = [];
                session.prevMid = null;
                return this.generateSingleProblem(words, session, true);
            }
            return null;
        }

        // 랜덤 선택
        const selected = candidates[Math.floor(Math.random() * candidates.length)];
        const { word, meaning } = selected;

        // ko 중 랜덤 하나 선택 (문제 텍스트)
        const ko = meaning.ko[Math.floor(Math.random() * meaning.ko.length)];

        // 정답: en 중 랜덤 하나
        const correctAnswer = meaning.en[Math.floor(Math.random() * meaning.en.length)];

        // 오답 생성: 동일 레벨 다른 단어에서 영어 뜻 추출
        const wrongAnswers = this.generateWrongAnswers(
            words,
            word.wid,
            meaning.mid,
            correctAnswer
        );

        // 선택지 구성 및 셔플
        const allAnswers = [correctAnswer, ...wrongAnswers];
        const shuffledAnswers = shuffleArray(allAnswers);
        const correctIndex = shuffledAnswers.indexOf(correctAnswer);

        // 세션 상태 업데이트
        session.used.push({ wid: word.wid, mid: meaning.mid });
        session.recentWids.push(word.wid);
        if (session.recentWids.length > RECENT_WID_LIMIT) {
            session.recentWids.shift();
        }
        session.prevMid = meaning.mid;

        return {
            wid: word.wid,
            mid: meaning.mid,
            ko,
            answers: shuffledAnswers,
            correctIndex,
        };
    }

    /**
     * 오답 생성: 같은 레벨 다른 단어에서 영어 뜻 추출
     */
    private static generateWrongAnswers(
        words: IWord[],
        excludeWid: number,
        excludeMid: number,
        correctAnswer: string
    ): string[] {
        const pool: string[] = [];

        for (const word of words) {
            for (const meaning of word.meanings) {
                if (word.wid === excludeWid && meaning.mid === excludeMid) continue;
                for (const en of meaning.en) {
                    if (en !== correctAnswer && !pool.includes(en)) {
                        pool.push(en);
                    }
                }
            }
        }

        const shuffled = shuffleArray(pool);
        return shuffled.slice(0, WRONG_ANSWER_COUNT);
    }

    /**
     * 사용 가능한 의미 수 계산
     */
    private static countAvailableMeanings(words: IWord[]): number {
        return words.reduce((acc, word) => acc + word.meanings.length, 0);
    }

    /**
     * 정답 검증
     */
    static validateAnswer(
        problem: WordRainProblem,
        selectedIndex: number
    ): boolean {
        return selectedIndex === problem.correctIndex;
    }

    /**
     * 콤보 배수 계산
     */
    static getComboMultiplier(combo: number): number {
        return getComboMultiplier(combo);
    }

    /**
     * 단일 정답 점수 계산 (콤보 반영)
     */
    static calculateScore(combo: number): number {
        const multiplier = getComboMultiplier(combo);
        return Math.floor(BASE_POINT * multiplier);
    }

    /**
     * 최종 보상 점수 계산 (게임 종료 시)
     */
    static calculateFinalReward(
        isSuccess: boolean,
        clearTimeSeconds: number,
        maxCombo: number,
        totalProblems: number,
        correctCount: number
    ): {
        totalPoint: number;
        baseReward: number;
        timeBonus: number;
        comboBonus: number;
        perfectBonus: number;
    } {
        if (!isSuccess) {
            return {
                totalPoint: 0,
                baseReward: 0,
                timeBonus: 0,
                comboBonus: 0,
                perfectBonus: 0,
            };
        }

        const baseReward = SUCCESS_BASE_REWARD;
        const timeBonus = Math.max(
            0,
            Math.floor((BASE_TIME_LIMIT_SECONDS - clearTimeSeconds) * TIME_BONUS_MULTIPLIER)
        );
        const comboBonus = maxCombo * COMBO_BONUS_MULTIPLIER;
        const perfectBonus =
            correctCount === totalProblems ? PERFECT_BONUS : 0;

        const totalPoint = baseReward + timeBonus + comboBonus + perfectBonus;

        return { totalPoint, baseReward, timeBonus, comboBonus, perfectBonus };
    }

    /**
     * 게임 설정 상수 반환 (프론트에서 사용)
     */
    static getGameConfig() {
        return {
            problemsPerGame: PROBLEMS_PER_GAME,
            freezeDurationMs: FREEZE_DURATION_MS,
            maxFreezePerGame: MAX_FREEZE_PER_GAME,
            freezeGrantScoreThreshold: FREEZE_GRANT_SCORE_THRESHOLD,
            baseTimeLimitSeconds: BASE_TIME_LIMIT_SECONDS,
            comboMultipliers: COMBO_MULTIPLIER,
            comboMaxThreshold: COMBO_MAX_THRESHOLD,
        };
    }
}
