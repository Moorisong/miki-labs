import { ChicorunProblemModel } from '../models/chicorun-problem.model';

const REAL_PROBLEMS = [
    // Level 1: Very Basic
    {
        problemId: '1-1', level: 1, difficulty: 'easy', orderIndex: 1,
        passage: "[초급] Nature is beautiful. I like green trees and blue skies.",
        question: "[초급] 지문에서 나무는 어떤 색인가요?",
        choices: ["빨간색", "초록색", "노란색", "보라색"],
        correctAnswerIndex: 1,
        explanation: "지문의 첫 번째 문장에서 'green trees'라고 한 거 보여? 나무 색깔을 다시 확인해봐! 🌳",
        questionType: 'vocab', wordCount: 11,
    },
    {
        problemId: '1-2', level: 1, difficulty: 'easy', orderIndex: 2,
        passage: "[초급] My cat is sleeping on the sofa. It is very cute.",
        question: "[초급] 고양이는 어디에 있나요?",
        choices: ["침대 위", "상자 안", "소파 위", "테이블 아래"],
        correctAnswerIndex: 2,
        explanation: "고양이가 어디서 자고 있는지 첫 번째 문장에서 장소를 찾아봐. 침대는 아니야! 🐱",
        questionType: 'simple_fact', wordCount: 11,
    },
    {
        problemId: '1-3', level: 1, difficulty: 'easy', orderIndex: 3,
        passage: "[초급] I have an apple. It is red and sweet.",
        question: "[초급] 'have'와 뜻이 같은 단어는 무엇인가요?",
        choices: ["먹다(Eat)", "소유하다(Possess)", "주다(Give)", "잃어버리다(Lose)"],
        correctAnswerIndex: 1,
        explanation: "무언가를 '가지고 있다'는 뜻의 다른 단어를 찾아봐. '소유하다'라는 뜻의 단어가 보일 거야! 🔥",
        questionType: 'synonym', wordCount: 9,
    },

    // Level 8: Primary Grade 3-4 Level
    {
        problemId: '8-1', level: 8, difficulty: 'easy', orderIndex: 1,
        passage: "[초급] Every morning, Mike goes to the library. He loves reading books about space and stars. Today, he found a big book about the moon.",
        question: "[초급] Mike는 어떤 종류의 책을 읽는 것을 좋아하나요?",
        choices: ["요리 책", "우주에 관한 책", "스포츠 책", "음악 책"],
        correctAnswerIndex: 1,
        explanation: "지문 두 번째 줄에 Mike가 어떤 주제에 미쳐있는지 나와있어! '우주'랑 '별'이 핵심이야 🚀",
        questionType: 'vocab', wordCount: 26,
    },
    {
        problemId: '8-2', level: 8, difficulty: 'easy', orderIndex: 2,
        passage: "[초급] Sarah is a doctor. She ____ in a big hospital in Seoul. She helps many sick people every day.",
        question: "[초급] 빈칸에 알맞은 단어를 고르세요.",
        choices: ["work", "works", "working", "worked"],
        correctAnswerIndex: 1,
        explanation: "주어가 Sarah니까 동사 형태가 어떻게 변해야 할까? 3인칭 단수를 떠올려봐! 🔥",
        questionType: 'basic_grammar', wordCount: 21,
    },
    {
        problemId: '8-3', level: 8, difficulty: 'easy', orderIndex: 3,
        passage: "[초급] The weather is very hot today. My family is going to the beach. We will swim in the ocean and build a sandcastle.",
        question: "[초급] 가족들은 해변에서 무엇을 할 예정인가요?",
        choices: ["쇼핑하기", "피자 먹기", "바다에서 수영하기", "영화 보기"],
        correctAnswerIndex: 2,
        explanation: "날씨가 더워서 바다에 갔대. 거기서 몸을 담그고 하는 활동이 뭔지 지문 끝부분을 찾아봐! 🌊",
        questionType: 'simple_fact', wordCount: 26,
    },
    {
        problemId: '8-4', level: 8, difficulty: 'easy', orderIndex: 4,
        passage: "[초급] Minjun is very happy today. His father gave him a new bicycle as a birthday present.",
        question: "[초급] 'present'와 뜻이 같은 단어는 무엇인가요?",
        choices: ["미래(Future)", "선물(Gift)", "과제(Task)", "게임(Game)"],
        correctAnswerIndex: 1,
        explanation: "생일 때 받으면 기분 좋은 '선물'이라는 뜻의 다른 단어를 골라봐! 🎁",
        questionType: 'synonym', wordCount: 16,
    }
];

export const seedChicorunProblems = async () => {
    console.log('🌱 Seeding Chicorun problems with inductive explanations...');

    try {
        await ChicorunProblemModel.deleteMany({});

        const types = ['vocab', 'basic_grammar', 'simple_fact', 'synonym'];
        const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
        const problemsToInsert: any[] = [];

        // 레벨별/유형별 풍부한 시나리오 데이터 (난이도별 변별력을 위해 최소 3개 이상씩 권장)
        const contentPool: Record<string, any[]> = {
            // --- 초급 유형 ---
            vocab: [
                { p: "The apple is red and sweet.", q: "'red'는 무슨 색인가요?", c: ["파란색", "빨간색", "노란색", "검정색"], a: 1, h: "Similar to: crimson" },
                { p: "I see a big dog in the park.", q: "'big'은 어떤 크기인가요?", c: ["작은", "큰", "무서운", "귀여운"], a: 1, h: "Similar to: large" },
                { p: "My mom is kind and wise.", q: "'mom'은 누구를 의미하나요?", c: ["아빠", "엄마", "선생님", "의사"], a: 1, h: "Mother / Parent" }
            ],
            basic_grammar: [
                { p: "I ____ a student.", q: "빈칸에 알맞은 단어를 고르세요.", c: ["is", "am", "are", "be"], a: 1, h: "주어가 'I'일 때의 비동사를 찾아보자고! 🙋‍♂️" },
                { p: "She ____ many books.", q: "빈칸에 들어갈 말은?", c: ["have", "has", "having", "had"], a: 1, h: "주어가 3인칭 단수일 때 동사의 변화를 체크함? 🙅‍♀️" },
                { p: "They ____ playing soccer now.", q: "빈칸에 알맞은 비동사는?", c: ["is", "am", "are", "be"], a: 2, h: "여러 명이 놀고 있을 때 쓰는 비동사! ⚽" }
            ],
            // --- 중급 유형 (31~70) ---
            context_vocab: [
                {
                    p: "The recent economic shift has prompted a significant transformation in consumer behavior. People are now prioritizing sustainability over mere convenience when making purchasing decisions. This change is not just a trend but a fundamental shift in values.",
                    q: "본문에서 'prompted'의 의미와 가장 가까운 것은?",
                    c: ["지연시키다", "유도하다/촉발하다", "무시하다", "보호하다"],
                    a: 1, h: "경제적 변화가 행동의 변화를 '일으켰다'는 맥락을 봐봐! 🚀"
                },
                {
                    p: "While the initial results were ambiguous, further investigation provided clarity. The researchers realized that the variables had been compromised by external factors they hadn't previously considered.",
                    q: "본문에서 'ambiguous'의 뜻은?",
                    c: ["명확한", "모호한", "성공적인", "부족한"],
                    a: 1, h: "나중에 '명확해졌다'는 말과 반대되는 초기 상태가 어땠을까? ✨"
                },
                {
                    p: "Innovators often encounter resistance when introducing disruptive technologies. However, persistent effort and clear communication usually mitigate initial fears and lead to widespread adoption.",
                    q: "본문에서 'mitigate'의 의미는?",
                    c: ["완화시키다", "증가시키다", "무시하다", "포기하다"],
                    a: 0, h: "공포를 '줄여준다'는 긍정적인 맥락을 찾아봐! 💡"
                }
            ],
            inference: [
                {
                    p: "The store was crowded and the lights were dimming. Sarah checked her watch and quickened her pace, heading straight for the back exit where a dark sedan was idling.",
                    q: "지문을 통해 추론할 수 있는 Sarah의 상황은?",
                    c: ["쇼핑을 즐기고 있다", "누군가를 피해 급히 떠나려 한다", "가게를 청소하고 있다", "친구를 기다리고 있다"],
                    a: 1, h: "시계를 보고 걸음을 재촉해서 뒷문으로 나가는 모습에서 느껴지는 바이브를 체크! 🏃‍♀️"
                },
                {
                    p: "The soil in the garden was cracked and the flowers were dropping their heads. Despite the dark clouds gathering on the horizon, not a single drop had fallen for weeks.",
                    q: "지문의 상황으로 보아 정원사가 가장 바라는 것은?",
                    c: ["태풍", "가뭄 해결(비)", "비료", "벌레 퇴치"],
                    a: 1, h: "땅이 갈라지고 꽃이 고개를 숙였다면 뭐가 필요할까? 🌧️"
                }
            ],
            connector: [
                {
                    p: "High-quality education is expensive to provide. ________, it is an investment that yields significant long-term returns for both individuals and society as a whole.",
                    q: "빈칸에 들어갈 가장 적절한 연결어는?",
                    c: ["However", "Therefore", "In addition", "For example"],
                    a: 0, h: "비용이 많이 들지만 '그럼에도 불구하고' 투자 가치가 있다는 반전의 흐름임! 🔄"
                },
                {
                    p: "Regular exercise improves physical health significantly. ________, it has been shown to reduce stress and improve mental well-being in long-term studies.",
                    q: "빈칸에 알맞은 연결어는?",
                    c: ["However", "On the other hand", "Furthermore", "Instead"],
                    a: 2, h: "신체 건강에 좋다는 점에 더해서 정신 건강에도 좋다는 추가 정보임! ➕"
                }
            ],
            // --- 고급 유형 (71~100) ---
            long_inference: [
                {
                    p: "The paradox of choice suggests that while we might think more options lead to greater satisfaction, the opposite is often true. When presented with a vast array of possibilities, individuals experience decision fatigue and a higher likelihood of regret. This phenomenon has profound implications for marketing and public policy, as it challenges the traditional economic assumption that more utility is always derived from expanded choice sets.",
                    q: "필자가 주장하는 '선택의 역설'의 핵심은?",
                    c: ["선택지가 많을수록 만족도가 비례한다", "많은 선택지는 오히려 결정 장애와 후회를 부를 수 있다", "마케팅은 항상 다양한 옵션을 제공해야 한다", "인간은 이성적으로 모든 대안을 분석한다"],
                    a: 1, h: "전통적 경제학의 가정과 반대되는 '현대인의 피로감'에 주목해봐! 😵"
                },
                {
                    p: "Artificial intelligence is not a monolithic technology but a complex ensemble of algorithms mimicking cognitive functions. While the narrative often oscillates between utopian salvation and dystopian catastrophe, the reality is a nuanced landscape of incremental integration. The ethical imperative is to ensure algorithmic transparency and accountability to prevent systemic biases that could marginalize vulnerable populations.",
                    q: "필자가 AI에 대해 강조하는 태도는?",
                    c: ["극단적인 공포", "맹목적인 신뢰", "윤리적 투명성과 신중한 대처", "기술적 무관심"],
                    a: 2, h: "극단적인 이야기보다는 '윤리적 의무'와 '투명성'을 요하는 문장을 찾아봐! 🤖"
                }
            ],
            blank_grammar: [
                {
                    p: "Had it not been for the timely intervention of the emergency services, the historical landmark ________ been completely destroyed by the spreading fire.",
                    q: "빈칸에 문법적으로 가장 알맞은 표현은?",
                    c: ["will have", "would have", "might be", "can have"],
                    a: 1, h: "가정법 과거완료의 도치 구문임! 과거의 일을 가정할 때 쓰는 표현을 찾아봐! 🔑"
                },
                {
                    p: "Only after the sun had fully set ________ they decide to return to the camp, realizing how far they had wandered into the forest.",
                    q: "빈칸에 들어갈 알맞은 조동사는?",
                    c: ["do", "did", "have", "had"],
                    a: 1, h: "Only 부사구가 문두에 오면 일어나는 '도치' 현상을 기억함? 🔦"
                },
                {
                    p: "Were you to invest in this company now, you ________ see significant returns in the next decade, provided the current growth trajectory continues.",
                    q: "가정법 미래/도치 구문에 어울리는 표현은?",
                    c: ["will", "would", "shall", "can"],
                    a: 1, h: "If you were to... 가 도치된 형태에서 귀결절의 조동사는? 📈"
                }
            ]
        };

        const levelTypes: Record<string, string[]> = {
            low: ['vocab', 'basic_grammar', 'vocab', 'basic_grammar'],
            mid: ['context_vocab', 'inference', 'context_vocab', 'connector', 'inference'],
            high: ['long_inference', 'blank_grammar', 'long_inference', 'blank_grammar']
        };

        for (let lv = 1; lv <= 100; lv++) {
            const problemsCount = lv <= 30 ? 12 : lv <= 70 ? 15 : 18;
            const currentRange = lv <= 30 ? 'low' : lv <= 70 ? 'mid' : 'high';
            const availableTypes = levelTypes[currentRange];

            for (let idx = 1; idx <= problemsCount; idx++) {
                // 초/중/고급 난이도 루프
                for (let dIdx = 0; dIdx < difficulties.length; dIdx++) {
                    const diff = difficulties[dIdx];
                    const problemId = `${lv}-${idx}-${diff}`;

                    const real = REAL_PROBLEMS.find(p => p.level === lv && p.orderIndex === idx && p.difficulty === diff);
                    if (real) {
                        problemsToInsert.push(real);
                        continue;
                    }

                    const qType = availableTypes[(idx - 1) % availableTypes.length];
                    const pool = contentPool[qType] || contentPool['vocab'];

                    // 레벨, 문제인덱스, 그리고 '난이도 인덱스(dIdx)'를 모두 조합하여 scene 선택
                    const sceneIdx = (lv * 17 + idx * 7 + dIdx) % pool.length;
                    const scene = pool[sceneIdx];

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
                    });
                }
            }
        }

        console.log(`📡 Inserting ${problemsToInsert.length} problems...`);
        await ChicorunProblemModel.insertMany(problemsToInsert, { ordered: false });

        console.log('✅ Chicorun problems seeded successfully for all 100 levels with distinct difficulties!');
    } catch (error) {
        console.error('❌ Error seeding Chicorun problems:', error);
    }
};
