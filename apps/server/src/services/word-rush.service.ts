import { WordModel, IWord } from '../models/word.model';
import { WordHintModel } from '../models/word-hint.model';
import mongoose from 'mongoose';

export interface WordRushProblem {
    qid: number;
    wid: number;
    mid: number;
    hintId: mongoose.Types.ObjectId;
    hint: string;
    answers: string[]; // meaning.en 배열 (정답 검증용)
}

export interface WordRushSessionResult {
    problems: WordRushProblem[];
    totalCount: number;
    level: number;
}

const PROBLEMS_PER_GAME = 30; // 스펙상 최대 30문제
const BASE_POINT = 10;
const REWARD_MULTIPLIER = 1.2; // 콤보 보너스 배수 등 조정용
const QID_WORD_RUSH = 3;

export class WordRushService {
    /**
     * 문제 생성: 중복 검사 로직(session data)을 포함하여 30개 문제 가져옴
     */
    static async generateProblems(level: number, usedProblems: { wid: number; mid: number }[]): Promise<WordRushSessionResult> {
        const targetLevel = Math.max(1, Math.min(level, 100));

        // 레벨 주변 단어 풀
        let words = await WordModel.find({
            level: { $gte: Math.max(1, targetLevel - 2), $lte: targetLevel + 2 },
        }).lean();

        if (words.length < PROBLEMS_PER_GAME) {
            words = await WordModel.find({}).lean();
        }

        if (words.length === 0) {
            throw new Error('ERROR_NO_WORDS: 사용 가능한 단어가 없습니다.');
        }

        // 힌트가 있는 wid, mid 조건으로 추출해야하므로 hint들도 로드
        const wordIds = words.map(w => w.wid);
        const hints = await WordHintModel.find({ wid: { $in: wordIds } }).lean();

        const hintMap = new Map<string, any[]>();
        for (const h of hints) {
            const key = `${h.wid}_${h.mid}`;
            if (!hintMap.has(key)) hintMap.set(key, []);
            hintMap.get(key)!.push(h);
        }

        const problems: WordRushProblem[] = [];
        const usedKeySet = new Set(usedProblems.map(u => `${u.wid}_${u.mid}`));

        // 문제 채우기 (랜덤 셔플)
        words = words.sort(() => 0.5 - Math.random());

        for (const word of words) {
            if (problems.length >= PROBLEMS_PER_GAME) break;

            // 의미 하나씩 접근
            for (const meaning of word.meanings) {
                if (problems.length >= PROBLEMS_PER_GAME) break;

                const key = `${word.wid}_${meaning.mid}`;
                if (usedKeySet.has(key)) continue; // 이미 사용된 문제 스킵

                const availableHints = hintMap.get(key);
                if (!availableHints || availableHints.length === 0) continue; // 힌트가 없으면 출제 불가

                // 랜덤 힌트 선택
                const selectedHint = availableHints[Math.floor(Math.random() * availableHints.length)];

                problems.push({
                    qid: QID_WORD_RUSH,
                    wid: word.wid,
                    mid: meaning.mid,
                    hintId: selectedHint._id,
                    hint: selectedHint.hint,
                    answers: meaning.en.map(ans => this.normalizeText(ans)), // 정답 리스트 정규화
                });

                usedKeySet.add(key);
            }
        }

        return {
            problems,
            totalCount: problems.length,
            level: targetLevel,
        };
    }

    /**
     * 텍스트 정규화 (대소문자 무시, 공백 무시, 특수문자 제거 후 비교용)
     */
    static normalizeText(text: string): string {
        return text.toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    /**
     * 점수 계산
     */
    static calculateFinalReward(correctCount: number, comboMax: number, clearTimeSeconds: number) {
        const rankPoint = Math.floor(correctCount * BASE_POINT + comboMax * 5 + Math.max(0, 100 - clearTimeSeconds));
        const coin = Math.floor(rankPoint * 0.3); // 코인은 랭크포인트의 약 30% 수준
        return { rankPoint, coin };
    }
}
