import 'dotenv/config';
import mongoose from 'mongoose';
import { WordModel } from './models/word.model';

/**
 * Word Rain 게임용 초기 단어 시드 데이터
 * level 1~3에 대한 기본 단어 세트
 */
const SEED_WORDS = [
    // ─── Level 1 (기초) ────────────────────────────────────────────────────────
    {
        wid: 1,
        level: 1,
        meanings: [
            { mid: 1, en: ['apple'], ko: ['사과'] },
        ],
    },
    {
        wid: 2,
        level: 1,
        meanings: [
            { mid: 1, en: ['banana'], ko: ['바나나'] },
        ],
    },
    {
        wid: 3,
        level: 1,
        meanings: [
            { mid: 1, en: ['cat'], ko: ['고양이'] },
        ],
    },
    {
        wid: 4,
        level: 1,
        meanings: [
            { mid: 1, en: ['dog'], ko: ['개', '강아지'] },
        ],
    },
    {
        wid: 5,
        level: 1,
        meanings: [
            { mid: 1, en: ['water'], ko: ['물'] },
        ],
    },
    {
        wid: 6,
        level: 1,
        meanings: [
            { mid: 1, en: ['book'], ko: ['책'] },
        ],
    },
    {
        wid: 7,
        level: 1,
        meanings: [
            { mid: 1, en: ['school'], ko: ['학교'] },
        ],
    },
    {
        wid: 8,
        level: 1,
        meanings: [
            { mid: 1, en: ['friend'], ko: ['친구'] },
        ],
    },
    {
        wid: 9,
        level: 1,
        meanings: [
            { mid: 1, en: ['house'], ko: ['집'] },
        ],
    },
    {
        wid: 10,
        level: 1,
        meanings: [
            { mid: 1, en: ['tree'], ko: ['나무'] },
        ],
    },
    {
        wid: 11,
        level: 1,
        meanings: [
            { mid: 1, en: ['fish'], ko: ['물고기', '생선'] },
        ],
    },
    {
        wid: 12,
        level: 1,
        meanings: [
            { mid: 1, en: ['bird'], ko: ['새'] },
        ],
    },
    {
        wid: 13,
        level: 1,
        meanings: [
            { mid: 1, en: ['sun'], ko: ['태양', '해'] },
        ],
    },
    {
        wid: 14,
        level: 1,
        meanings: [
            { mid: 1, en: ['moon'], ko: ['달'] },
        ],
    },
    {
        wid: 15,
        level: 1,
        meanings: [
            { mid: 1, en: ['star'], ko: ['별'] },
        ],
    },

    // ─── Level 2 (초급) ────────────────────────────────────────────────────────
    {
        wid: 16,
        level: 2,
        meanings: [
            { mid: 1, en: ['happy'], ko: ['행복한', '기쁜'] },
        ],
    },
    {
        wid: 17,
        level: 2,
        meanings: [
            { mid: 1, en: ['sad'], ko: ['슬픈'] },
        ],
    },
    {
        wid: 18,
        level: 2,
        meanings: [
            { mid: 1, en: ['beautiful'], ko: ['아름다운'] },
        ],
    },
    {
        wid: 19,
        level: 2,
        meanings: [
            { mid: 1, en: ['fast', 'quick'], ko: ['빠른'] },
        ],
    },
    {
        wid: 20,
        level: 2,
        meanings: [
            { mid: 1, en: ['slow'], ko: ['느린'] },
        ],
    },
    {
        wid: 21,
        level: 2,
        meanings: [
            { mid: 1, en: ['big', 'large'], ko: ['큰'] },
        ],
    },
    {
        wid: 22,
        level: 2,
        meanings: [
            { mid: 1, en: ['small', 'little'], ko: ['작은'] },
        ],
    },
    {
        wid: 23,
        level: 2,
        meanings: [
            { mid: 1, en: ['eat'], ko: ['먹다'] },
        ],
    },
    {
        wid: 24,
        level: 2,
        meanings: [
            { mid: 1, en: ['drink'], ko: ['마시다'] },
            { mid: 2, en: ['drink'], ko: ['음료'] },
        ],
    },
    {
        wid: 25,
        level: 2,
        meanings: [
            { mid: 1, en: ['run'], ko: ['달리다', '뛰다'] },
        ],
    },
    {
        wid: 26,
        level: 2,
        meanings: [
            { mid: 1, en: ['walk'], ko: ['걷다'] },
        ],
    },
    {
        wid: 27,
        level: 2,
        meanings: [
            { mid: 1, en: ['sleep'], ko: ['자다', '잠자다'] },
        ],
    },
    {
        wid: 28,
        level: 2,
        meanings: [
            { mid: 1, en: ['study'], ko: ['공부하다'] },
        ],
    },
    {
        wid: 29,
        level: 2,
        meanings: [
            { mid: 1, en: ['read'], ko: ['읽다'] },
        ],
    },
    {
        wid: 30,
        level: 2,
        meanings: [
            { mid: 1, en: ['write'], ko: ['쓰다', '적다'] },
        ],
    },

    // ─── Level 3 (중급) ────────────────────────────────────────────────────────
    {
        wid: 31,
        level: 3,
        meanings: [
            { mid: 1, en: ['important'], ko: ['중요한'] },
        ],
    },
    {
        wid: 32,
        level: 3,
        meanings: [
            { mid: 1, en: ['difficult', 'hard'], ko: ['어려운'] },
        ],
    },
    {
        wid: 33,
        level: 3,
        meanings: [
            { mid: 1, en: ['easy', 'simple'], ko: ['쉬운', '간단한'] },
        ],
    },
    {
        wid: 34,
        level: 3,
        meanings: [
            { mid: 1, en: ['remember'], ko: ['기억하다'] },
        ],
    },
    {
        wid: 35,
        level: 3,
        meanings: [
            { mid: 1, en: ['forget'], ko: ['잊다', '잊어버리다'] },
        ],
    },
    {
        wid: 36,
        level: 3,
        meanings: [
            { mid: 1, en: ['understand'], ko: ['이해하다'] },
        ],
    },
    {
        wid: 37,
        level: 3,
        meanings: [
            { mid: 1, en: ['explain'], ko: ['설명하다'] },
        ],
    },
    {
        wid: 38,
        level: 3,
        meanings: [
            { mid: 1, en: ['believe'], ko: ['믿다'] },
        ],
    },
    {
        wid: 39,
        level: 3,
        meanings: [
            { mid: 1, en: ['practice'], ko: ['연습하다', '실습하다'] },
            { mid: 2, en: ['practice'], ko: ['연습', '실천'] },
        ],
    },
    {
        wid: 40,
        level: 3,
        meanings: [
            { mid: 1, en: ['develop'], ko: ['발전시키다', '개발하다'] },
        ],
    },
    {
        wid: 41,
        level: 3,
        meanings: [
            { mid: 1, en: ['imagine'], ko: ['상상하다'] },
        ],
    },
    {
        wid: 42,
        level: 3,
        meanings: [
            { mid: 1, en: ['create'], ko: ['만들다', '창조하다'] },
        ],
    },
    {
        wid: 43,
        level: 3,
        meanings: [
            { mid: 1, en: ['discover'], ko: ['발견하다'] },
        ],
    },
    {
        wid: 44,
        level: 3,
        meanings: [
            { mid: 1, en: ['experience'], ko: ['경험하다'] },
            { mid: 2, en: ['experience'], ko: ['경험'] },
        ],
    },
    {
        wid: 45,
        level: 3,
        meanings: [
            { mid: 1, en: ['achieve'], ko: ['달성하다', '성취하다'] },
        ],
    },
];

export async function seedWords() {
    const MONGO_URI = process.env.MONGODB_URI;

    if (!MONGO_URI) {
        throw new Error('MONGODB_URI 환경변수가 설정되지 않았습니다.');
    }

    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(MONGO_URI);
        }

        const existingCount = await WordModel.countDocuments();
        if (existingCount > 0) {
            console.log(`[word-rain-seed] ${existingCount}개의 단어가 이미 존재합니다. 시딩을 건너뜁니다.`);
            return;
        }

        await WordModel.insertMany(SEED_WORDS);
        console.log(`[word-rain-seed] ✅ ${SEED_WORDS.length}개의 단어가 성공적으로 시딩되었습니다.`);
    } catch (error) {
        console.error('[word-rain-seed] ❌ 시딩 실패:', error);
        throw error;
    }
}

// 직접 실행 시
if (require.main === module) {
    seedWords()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
