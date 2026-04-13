import { ChicorunProblemModel } from '../models/chicorun-problem.model';
import { CONTENT_POOL, ContentItem } from '../data/chicorun-content-pool';

// ─── 수작업 문제 (manual source) ─────────────────────────────────────────────
const REAL_PROBLEMS = [
    {
        problemId: '1-1-easy', level: 1, difficulty: 'easy', orderIndex: 1,
        passage: "[초급] Nature is beautiful. I like green trees and blue skies.",
        question: "[초급] 지문에서 나무는 어떤 색인가요?",
        choices: ["빨간색", "초록색", "노란색", "보라색"],
        correctAnswerIndex: 1,
        explanation: "지문의 첫 번째 문장에서 'green trees'라고 한 거 보여? 나무 색깔을 다시 확인해봐! 🌳",
        questionType: 'vocab', wordCount: 11, topic: 'nature', source: 'manual' as const, tags: ['color', 'nature'],
    },
    {
        problemId: '1-2-easy', level: 1, difficulty: 'easy', orderIndex: 2,
        passage: "[초급] My cat is sleeping on the sofa. It is very cute.",
        question: "[초급] 고양이는 어디에 있나요?",
        choices: ["침대 위", "상자 안", "소파 위", "테이블 아래"],
        correctAnswerIndex: 2,
        explanation: "고양이가 어디서 자고 있는지 첫 번째 문장에서 장소를 찾아봐. 침대는 아니야! 🐱",
        questionType: 'simple_fact', wordCount: 11, topic: 'animals', source: 'manual' as const, tags: ['location', 'pets'],
    },
    {
        problemId: '1-3-easy', level: 1, difficulty: 'easy', orderIndex: 3,
        passage: "[초급] I have an apple. It is red and sweet.",
        question: "[초급] 'have'와 뜻이 같은 단어는 무엇인가요?",
        choices: ["먹다(Eat)", "소유하다(Possess)", "주다(Give)", "잃어버리다(Lose)"],
        correctAnswerIndex: 1,
        explanation: "무언가를 '가지고 있다'는 뜻의 다른 단어를 찾아봐. '소유하다'라는 뜻의 단어가 보일 거야! 🔥",
        questionType: 'synonym', wordCount: 9, topic: 'food', source: 'manual' as const, tags: ['synonym', 'basic_verb'],
    },
    {
        problemId: '8-1-easy', level: 8, difficulty: 'easy', orderIndex: 1,
        passage: "[초급] Every morning, Mike goes to the library. He loves reading books about space and stars. Today, he found a big book about the moon.",
        question: "[초급] Mike는 어떤 종류의 책을 읽는 것을 좋아하나요?",
        choices: ["요리 책", "우주에 관한 책", "스포츠 책", "음악 책"],
        correctAnswerIndex: 1,
        explanation: "지문 두 번째 줄에 Mike가 어떤 주제에 미쳐있는지 나와있어! '우주'랑 '별'이 핵심이야 🚀",
        questionType: 'vocab', wordCount: 26, topic: 'science', source: 'manual' as const, tags: ['hobby', 'reading'],
    },
    {
        problemId: '8-2-easy', level: 8, difficulty: 'easy', orderIndex: 2,
        passage: "[초급] Sarah is a doctor. She ____ in a big hospital in Seoul. She helps many sick people every day.",
        question: "[초급] 빈칸에 알맞은 단어를 고르세요.",
        choices: ["work", "works", "working", "worked"],
        correctAnswerIndex: 1,
        explanation: "주어가 Sarah니까 동사 형태가 어떻게 변해야 할까? 3인칭 단수를 떠올려봐! 🔥",
        questionType: 'basic_grammar', wordCount: 21, topic: 'jobs', source: 'manual' as const, tags: ['3rd_person', 'present_tense'],
    },
    {
        problemId: '8-3-easy', level: 8, difficulty: 'easy', orderIndex: 3,
        passage: "[초급] The weather is very hot today. My family is going to the beach. We will swim in the ocean and build a sandcastle.",
        question: "[초급] 가족들은 해변에서 무엇을 할 예정인가요?",
        choices: ["쇼핑하기", "피자 먹기", "바다에서 수영하기", "영화 보기"],
        correctAnswerIndex: 2,
        explanation: "날씨가 더워서 바다에 갔대. 거기서 몸을 담그고 하는 활동이 뭔지 지문 끝부분을 찾아봐! 🌊",
        questionType: 'simple_fact', wordCount: 26, topic: 'weather', source: 'manual' as const, tags: ['activity', 'beach'],
    },
    {
        problemId: '8-4-easy', level: 8, difficulty: 'easy', orderIndex: 4,
        passage: "[초급] Minjun is very happy today. His father gave him a new bicycle as a birthday present.",
        question: "[초급] 'present'와 뜻이 같은 단어는 무엇인가요?",
        choices: ["미래(Future)", "선물(Gift)", "과제(Task)", "게임(Game)"],
        correctAnswerIndex: 1,
        explanation: "생일 때 받으면 기분 좋은 '선물'이라는 뜻의 다른 단어를 골라봐! 🎁",
        questionType: 'synonym', wordCount: 16, topic: 'daily_life', source: 'manual' as const, tags: ['synonym', 'birthday'],
    },
];

// ─── 레벨 구간별 유형 배분 (spec 반영, 신규 유형 포함) ─────────────────────
const LEVEL_TYPES: Record<string, string[]> = {
    low: ['vocab', 'basic_grammar', 'simple_fact', 'synonym', 'vocab', 'basic_grammar', 'simple_fact', 'synonym'],
    mid: ['context_vocab', 'inference', 'connector', 'main_idea', 'purpose', 'context_vocab', 'inference', 'connector'],
    high: ['long_inference', 'blank_grammar', 'attitude', 'long_inference', 'blank_grammar', 'attitude'],
};

// ─── 소수 기반 분산 해싱 (대소수: 콘텐츠 고르게 분배) ─────────────────────────
const PRIMES = [31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

function getContentIndex(level: number, orderIndex: number, diffIdx: number, poolSize: number): number {
    // 소수 기반 해싱을 통한 더 고른 분배
    const prime1 = PRIMES[level % PRIMES.length];
    const prime2 = PRIMES[(orderIndex + 3) % PRIMES.length];
    const prime3 = PRIMES[(diffIdx + 7) % PRIMES.length];
    const hash = (level * prime1 + orderIndex * prime2 + diffIdx * prime3) % poolSize;
    return Math.abs(hash) % poolSize;
}

// ─── 메인 시더 함수 ───────────────────────────────────────────────────────────
export const seedChicorunProblems = async () => {
    console.log('🌱 Seeding Chicorun problems with expanded content pool...');

    try {
        await ChicorunProblemModel.deleteMany({});

        const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
        const problemsToInsert: any[] = [];

        // 수집 통계용
        const usedContentTracker: Record<string, Set<number>> = {};

        for (let lv = 1; lv <= 100; lv++) {
            const problemsCount = lv <= 30 ? 12 : lv <= 70 ? 15 : 18;
            const currentRange = lv <= 30 ? 'low' : lv <= 70 ? 'mid' : 'high';
            const availableTypes = LEVEL_TYPES[currentRange];

            for (let idx = 1; idx <= problemsCount; idx++) {
                for (let dIdx = 0; dIdx < difficulties.length; dIdx++) {
                    const diff = difficulties[dIdx];
                    const problemId = `${lv}-${idx}-${diff}`;

                    // 수작업 문제 먼저 확인
                    const real = REAL_PROBLEMS.find(
                        p => p.level === lv && p.orderIndex === idx && p.difficulty === diff
                    );
                    if (real) {
                        problemsToInsert.push(real);
                        continue;
                    }

                    // 유형 결정 (순환 + 연속 방지)
                    const qType = availableTypes[(idx - 1) % availableTypes.length];
                    const pool = CONTENT_POOL[qType] || CONTENT_POOL['vocab'];

                    // 소수 기반 콘텐츠 선택
                    const sceneIdx = getContentIndex(lv, idx, dIdx, pool.length);
                    const scene = pool[sceneIdx];

                    // 통계 추적
                    const trackKey = `${qType}-${diff}`;
                    if (!usedContentTracker[trackKey]) usedContentTracker[trackKey] = new Set();
                    usedContentTracker[trackKey].add(sceneIdx);

                    problemsToInsert.push({
                        problemId,
                        level: lv,
                        difficulty: diff,
                        orderIndex: idx,
                        passage: scene.p,
                        question: scene.q,
                        choices: scene.c,
                        correctAnswerIndex: scene.a,
                        explanation: `💡 힌트 - ${scene.h}`,
                        questionType: qType,
                        wordCount: scene.p.split(' ').length,
                        topic: scene.t,
                        source: 'template' as const,
                        tags: [qType, currentRange, scene.t],
                    });
                }
            }
        }

        // 통계 출력
        console.log('\n📊 Content distribution stats:');
        for (const [key, indices] of Object.entries(usedContentTracker)) {
            const type = key.split('-')[0];
            const poolSize = CONTENT_POOL[type]?.length || 0;
            console.log(`  ${key}: ${indices.size}/${poolSize} unique items used`);
        }

        console.log(`\n📡 Inserting ${problemsToInsert.length} problems...`);
        await ChicorunProblemModel.insertMany(problemsToInsert, { ordered: false });

        console.log('✅ Chicorun problems seeded successfully for all 100 levels with distinct difficulties!');
    } catch (error) {
        console.error('❌ Error seeding Chicorun problems:', error);
    }
};
