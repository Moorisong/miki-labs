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

        // 난이도별/유형별 풍부한 시나리오 데이터 (최소 5개씩)
        const contentPool: Record<string, Record<string, any[]>> = {
            vocab: {
                easy: [
                    { p: "The apple is red.", q: "'red'는 무슨 색인가요?", c: ["파란색", "빨간색", "노란색", "검정색"], a: 1, h: "Similar to: crimson" },
                    { p: "I see a big dog.", q: "'big'은 어떤 크기인가요?", c: ["작은", "큰", "무서운", "귀여운"], a: 1, h: "Similar to: large" },
                    { p: "My mom is kind.", q: "'mom'은 누구를 말하나요?", c: ["아빠", "형", "엄마", "선생님"], a: 2, h: "Mother / Parent" },
                    { p: "The sky is blue.", q: "'blue'는 무슨 색인가요?", c: ["파란색", "하얀색", "초록색", "보라색"], a: 0, h: "Similar to: azure" },
                    { p: "He is my friend.", q: "'friend'는 누구인가요?", c: ["적", "친구", "동생", "의사"], a: 1, h: "Similar to: buddy" }
                ],
                medium: [
                    { p: "The sun is bright today.", q: "'bright'는 어떤 뜻인가요?", c: ["어두운", "밝은", "차가운", "흐린"], a: 1, h: "Similar to: brilliant / shining" },
                    { p: "I like sweet fruit.", q: "'sweet'는 어떤 맛인가요?", c: ["매운", "달콤한", "짠", "쓴"], a: 1, h: "Similar to: sugary" },
                    { p: "The river is very long.", q: "'long'은 어떤 상태인가요?", c: ["짧은", "긴", "깊은", "얕은"], a: 1, h: "Similar to: extended" },
                    { p: "She is a smart student.", q: "'smart'는 어떤 뜻인가요?", c: ["똑똑한", "게으른", "무서운", "슬픈"], a: 0, h: "Similar to: intelligent" },
                    { p: "The box is very heavy.", q: "'heavy'는 어떤 상태인가요?", c: ["가벼운", "무거운", "작은", "깨끗한"], a: 1, h: "Similar to: weighty" }
                ],
                hard: [
                    { p: "Celestial luminescence is vital.", q: "'luminescence'는 무엇인가요?", c: ["열기", "빛(발광)", "소리", "중력"], a: 1, h: "Similar to: fluorescence / glow" },
                    { p: "The protagonist showed resilience.", q: "'resilience'는 어떤 성질인가요?", c: ["나약함", "회복력(탄력)", "공포", "자존심"], a: 1, h: "Similar to: flexibility / endurance" },
                    { p: "Ephemeral moments are precious.", q: "'ephemeral'은 어떤 시간인가요?", c: ["지속적인", "수명이 짧은(덧없는)", "영원한", "무거운"], a: 1, h: "Similar to: fleeting / short-lived" },
                    { p: "His behavior was idiosyncratic.", q: "'idiosyncratic'은 어떤 행동인가요?", c: ["일반적인", "특유의(기괴한)", "지루한", "친절한"], a: 1, h: "Similar to: peculiar / unique" },
                    { p: "The theory is redundant now.", q: "'redundant'는 어떤 상태인가요?", c: ["필수적인", "불필요한(과잉의)", "유용한", "복잡한"], a: 1, h: "Similar to: unnecessary / superfluous" }
                ]
            },
            basic_grammar: {
                easy: [
                    { p: "I ____ a boy.", q: "빈칸에 알맞은 단어를 고르세요.", c: ["is", "am", "are", "be"], a: 1, h: "주어가 'I'인데 'am' 안 고르면 어쩔? 🤷‍♂️ 짝꿍 잘 찾아봐!" },
                    { p: "She ____ many books.", q: "빈칸에 들어갈 말은?", c: ["have", "has", "having", "had"], a: 1, h: "주어가 'She'면 3인칭 단수임. -s 붙이는 거 까먹으면 안 됨! 🙅‍♀️" },
                    { p: "They ____ happy.", q: "빈칸에 알맞은 것은?", c: ["is", "am", "are", "be"], a: 2, h: "여러 명이면 복수형 써야지! are가 찰떡임. 폼 잡아보자고! 🕶️" },
                    { p: "You ____ a good student.", q: "빈칸에 들어갈 말은?", c: ["is", "am", "are", "be"], a: 2, h: "너(You)랑 짝꿍인 비동사는 딱 하나지? 바로 골라버리자! ✨" },
                    { p: "It ____ a desk.", q: "빈칸에 알맞은 것은?", c: ["is", "am", "are", "be"], a: 0, h: "사물 하나면 단수형 써야 함. is가 정답 각 아님? 💻" }
                ],
                medium: [
                    { p: "She ____ to school every day.", q: "빈칸에 들어갈 올바른 형태는?", c: ["go", "goes", "going", "gone"], a: 1, h: "매일 하는 건 현재형임. 주어가 She니까 s 붙여야 깔끼함! 🏫" },
                    { p: "I ____ my homework now.", q: "빈칸에 알맞은 것은?", c: ["do", "does", "doing", "am doing"], a: 3, h: "지금 당장 하는 중이면 be+ing 써야 함. 진행형 가보자고! ✍️" },
                    { p: "We ____ soccer yesterday.", q: "과거형으로 알맞은 것은?", c: ["play", "plays", "played", "playing"], a: 2, h: "어제(yesterday) 일임. 과거형 안 쓰면 서운함! ⚽" },
                    { p: "He ____ like milk.", q: "부정문을 만들 때 알맞은 것은?", c: ["don't", "doesn't", "isn't", "aren't"], a: 1, h: "부정문 만들 때 do/does 선택 장애 오면 안 됨! He니까?! 🥛" },
                    { p: "They ____ dancing.", q: "빈칸에 알맞은 비동사는?", c: ["is", "am", "are", "be"], a: 2, h: "여러 명이 댄스 중임. 복수 진행형은 be동사 선정이 중요함! 🕺" }
                ],
                hard: [
                    { p: "Scarcely ____ the news broke...", q: "부정어 도치 구문을 완성하세요.", c: ["had", "did", "has", "does"], a: 0, h: "부정어 문두에 오면 도치 일어남. 시제까지 챙기면 폼 미쳤다! 🗞️" },
                    { p: "Were it ____ for your help...", q: "가정법 과거완료 도치 표현은?", c: ["not", "no", "never", "only"], a: 0, h: "If 생략된 도치 구문임. 익숙해지면 진짜 영어 고수임! 🤝" },
                    { p: "Lest he ____ forget the key...", q: "당위나 목적을 나타내는 조동사는?", c: ["should", "would", "might", "will"], a: 0, h: "~하지 않도록! Lest ~ should 구문 모르면 MZ 아님? 🔑" },
                    { p: "So ____ was the storm that...", q: "형용사 도치 구문의 빈칸은?", c: ["violent", "violently", "violence", "more violent"], a: 0, h: "강조하려고 형용사가 앞으로 튀어 나옴. 주어랑 수 일치 조심! ⛈️" },
                    { p: "Only then ____ I realize my mistake.", q: "Only 도치문법에 맞는 것은?", c: ["did", "had", "would", "will"], a: 0, h: "Only 부사구 왔으니 의문문 어순으로 슥- 바꿔줘야 함! 💡" }
                ]
            },
            simple_fact: {
                easy: [
                    { p: "I like sweet red apples.", q: "좋아하는 과일의 특징은?", c: ["작고 파란", "달콤하고 빨간", "크고 노란", "쓰고 초록색인"], a: 1, h: "과일의 맛과 색깔을 나타내는 단어들을 다시 봐보자! 🍎" },
                    { p: "The blue ball is under the chair.", q: "공의 위치는 어디인가요?", c: ["의자 위", "의자 밑", "책상 옆", "침대 위"], a: 1, h: "위치를 나타내는 단어 'under'가 무슨 뜻이었지? 🔵" },
                    { p: "Mom is cooking pasta in the kitchen.", q: "엄마는 지금 무엇을 하시나요?", c: ["청소", "요리", "독서", "취침"], a: 1, h: "엄마의 동작을 나타내는 'cooking'을 찾아봐! 🍳" },
                    { p: "My sister is a talented artist.", q: "여동생의 직업(재능)은?", c: ["의사", "예술가", "선생님", "경찰"], a: 1, h: "무엇을 잘한다고 적혀있는지 단어를 다시 읽어볼까? 🎨" },
                    { p: "The weather is cloudy and cold.", q: "지금 날씨는 어떤가요?", c: ["맑고 더움", "흐리고 추움", "비오고 시원함", "눈오고 따뜻함"], a: 1, h: "날씨를 설명하는 단어 'cloudy'와 'cold'를 확인해봐! ☁️" }
                ],
                medium: [
                    { p: "School starts at 8:30, but I arrive early.", q: "지문의 내용으로 알 수 있는 것은?", c: ["지각을 했다", "일찍 도착했다", "학교에 안 갔다", "수업이 끝났다"], a: 1, h: "시간보다 먼저 도착했다는 표현인 'arrive early'를 찾아봐! 🏫" },
                    { p: "Max is a friendly dog who loves to play catch.", q: "강아지 Max의 성격은 어떤가요?", c: ["무서움", "조용함", "다정함", "게으름"], a: 2, h: "성격을 설명하는 'friendly'라는 단어의 뜻을 생각해보자! 🐶" },
                    { p: "The library is closed on Mondays for cleaning.", q: "도서관이 월요일에 문을 닫는 이유는?", c: ["주말이라서", "청소 때문에", "공휴일이라서", "직원이 없어서"], a: 1, h: "닫는 이유가 적힌 'for cleaning' 부분을 다시 읽어봐! 🧼" },
                    { p: "There are four chairs around the small wooden table.", q: "테이블의 특징에 대해 알 수 있는 것은?", c: ["금속으로 됨", "나무로 된 작은 크기", "매우 크고 화려함", "의자가 하나도 없음"], a: 1, h: "테이블을 수식하는 'small'과 'wooden'을 확인해봐! 🪑" },
                    { p: "She is wearing a white hat to avoid the sun.", q: "그녀가 모자를 쓴 목적은?", c: ["예뻐 보이려고", "햇빛을 피하려고", "머리를 가리려고", "춥다고 느껴서"], a: 1, h: "모자를 쓴 이유인 'to avoid the sun'을 찾아봐! 👒" }
                ],
                hard: [
                    { p: "The treaty signed in Paris ended the long conflict.", q: "파리 조약이 체결됨으로써 발생한 결과는?", c: ["전쟁이 시작됨", "갈등이 종결됨", "국경이 폐쇄됨", "새로운 조세 제도가 생김"], a: 1, h: "조약이 가져온 결과인 'ended the conflict'를 추론해봐! 📜" },
                    { p: "Watson and Crick's model revealed the secret of life.", q: "왓슨과 크릭의 모델이 기여한 바는?", c: ["신메뉴 개발", "생명의 비밀 규명", "새로운 행성 발견", "수학 공식 증명"], a: 1, h: "생명의 비밀인 'secret of life'를 밝혀냈다는 핵심을 잡아봐! 🧬" },
                    { p: "The Magna Carta limited the power of the absolute king.", q: "마그나 카르타의 주요 목적은 무엇이었나요?", c: ["왕권 강화", "왕권의 제한", "영토 확장", "종교 자유"], a: 1, h: "왕의 권력을 제한했다는 'limited the power'를 이해해야 함! ⚖️" },
                    { p: "Platonic ideals suggest a realm of perfect forms.", q: "플라톤적 이상주의가 시사하는 바는?", c: ["현실의 중요성", "완벽한 형상의 영역", "물질의 가변성", "감각의 신뢰성"], a: 1, h: "추상적인 개념인 'realm of perfect forms'에 집중해봐! 🏛️" },
                    { p: "The paradox of choice leads to decision paralysis.", q: "선택의 역설이 인간에게 미치는 영향은?", c: ["빠른 결정", "결정 장애(마비)", "선택의 즐거움", "만족도 상승"], a: 1, h: "너무 많은 선택이 가져오는 'decision paralysis'의 뜻을 파악해봐! 😵" }
                ]
            },
            synonym: {
                easy: [
                    { p: "I am happy.", q: "'happy'와 비슷한 단어는?", c: ["슬픈", "즐거운", "화난", "피곤한"], a: 1, h: "Similar to: joyful" },
                    { p: "The house is big.", q: "'big'과 뜻이 같은 단어는?", c: ["작은", "거대한", "차가운", "낡은"], a: 1, h: "Similar to: huge" },
                    { p: "It's a fast car.", q: "'fast'와 뜻이 같은 단어는?", c: ["느린", "빠른", "오래된", "딱딱한"], a: 1, h: "Similar to: rapid" },
                    { p: "She is pretty.", q: "'pretty'와 비슷한 단어는?", c: ["못생긴", "예쁜", "나쁜", "무서운"], a: 1, h: "Similar to: beautiful" },
                    { p: "The book is good.", q: "'good'과 비슷한 뜻은?", c: ["나쁜", "좋은", "어려운", "슬픈"], a: 1, h: "Similar to: nice" }
                ],
                medium: [
                    { p: "This room is large.", q: "'large'와 뜻이 같은 단어는?", c: ["작은", "큰(big)", "추운", "텅 빈"], a: 1, h: "Similar to: spacious" },
                    { p: "The task is quick.", q: "'quick'의 유의어로 알맞은 것은?", c: ["빠른(fast)", "느린", "어려운", "쉬운"], a: 0, h: "Similar to: swift" },
                    { p: "The speech was brief.", q: "'brief'와 같은 뜻의 단어는?", c: ["긴", "짧은(short)", "시끄러운", "빠른"], a: 1, h: "Similar to: concise" },
                    { p: "Genuine leather.", q: "'genuine'의 유의어를 선택하세요.", c: ["가짜의", "진짜의(real)", "저렴한", "딱딱한"], a: 1, h: "Similar to: authentic" },
                    { p: "Sufficient funds.", q: "'sufficient'와 비슷한 단어는?", c: ["충분한(enough)", "부족한", "추가의", "열악한"], a: 0, h: "Similar to: ample" }
                ],
                hard: [
                    { p: "Unyielding resilience.", q: "'resilience'의 동의어로 알맞은 것은?", c: ["취약함", "불굴의 의지(fortitude)", "공포", "교만함"], a: 1, h: "Similar to: toughness / perseverance" },
                    { p: "Obscure reference.", q: "'obscure'와 같은 의미를 고르세요.", c: ["명확한", "모호한(ambiguous)", "유명한", "새로운"], a: 1, h: "Similar to: vague / unclear" },
                    { p: "Precarious situation.", q: "'precarious'를 대체할 단어는?", c: ["안전한", "불안정한(unstable)", "안정적인", "좋은"], a: 1, h: "Similar to: risky / fragile" },
                    { p: "Meticulous work.", q: "'meticulous'의 유의어는?", c: ["부주의한", "철저한(thorough)", "빠른", "지루한"], a: 1, h: "Similar to: precise / detailed" },
                    { p: "Ubiquitous presence.", q: "'ubiquitous'와 뜻이 같은 것은?", c: ["희귀한", "어디에나 있는(pervasive)", "독특한", "새로운"], a: 1, h: "Similar to: universal / omnipresent" }
                ]
            }
        };

        for (let lv = 1; lv <= 100; lv++) {
            const problemsCount = lv <= 30 ? 12 : lv <= 70 ? 15 : 18;

            for (let idx = 1; idx <= problemsCount; idx++) {
                for (const diff of difficulties) {
                    const problemId = `${lv}-${idx}-${diff}`;

                    const real = REAL_PROBLEMS.find(p => p.level === lv && p.orderIndex === idx && p.difficulty === diff);
                    if (real) {
                        problemsToInsert.push(real);
                        continue;
                    }

                    const qType = types[(idx - 1) % types.length];
                    const pool = contentPool[qType][diff];
                    // 레벨과 인덱스를 조합하여 중복 최소화
                    const sceneIdx = (lv * 7 + idx * 3) % pool.length;
                    const scene = pool[sceneIdx];

                    // MZ 스타일 힌트 세트 A: 유의어/어휘용 (20종)
                    const synTemplates = [
                        (s: string) => `비슷한 단어로 '${s}' 있는 거 앎? 폼 미쳤다 🔥`,
                        (s: string) => `'${s}'이랑 찰떡궁합임. 가보자고! 🚀`,
                        (s: string) => `이거 '${s}'이랑 거의 쌍둥이인 거 실화? 😲`,
                        (s: string) => `'${s}' 알면 이미 어휘 고수임. 깔끼하지? ✨`,
                        (s: string) => `응, 이거 '${s}'이랑 같은 뜻이야. 폼 유지하삼! 🕶️`,
                        (s: string) => `'${s}'이라고 들어봄? 이게 바로 그거임! 💡`,
                        (s: string) => `'${s}'이랑 세트임. 모르면 어쩔? 🤷‍♂️`,
                        (s: string) => `완전 '${s}' 바이브임. 정답 각 보임? 🎯`,
                        (s: string) => `이거 '${s}'이랑 완전 똑같음 대박 사건! 📢`,
                        (s: string) => `'${s}'이랑 친구임. 사이좋게 외워보자고! 🤝`,
                        (s: string) => `헐, 이거 '${s}'이랑 친구인 거 몰랐음? 폼 미쳤다 🔥`,
                        (s: string) => `'${s}'이랑 완전 같은 결임. 센스 굿! 👍`,
                        (s: string) => `이거 '${s}'이랑 1+1임. 같이 외우면 개이득! 💎`,
                        (s: string) => `진정한 MZ라면 '${s}'도 알겠지? 가보자고! 🏃‍♂️`,
                        (s: string) => `'${s}'이랑 소울메이트임. 잊지 마삼! 💜`,
                        (s: string) => `와, '${s}'이랑 완전 판박이임! 대박적! ✨`,
                        (s: string) => `'${s}' 알면 넌 이미 어휘 능력자! 지렸다 👏`,
                        (s: string) => `이거 '${s}'이랑 패키지임. 한 번에 마스터함! 📦`,
                        (s: string) => `솔직히 '${s}'이랑 같은 거 모르면 안 됨. 다시 가보자! 👀`,
                        (s: string) => `'${s}'이랑 완전 킹정하는 동의어임. 폼 나옴! 🤴`
                    ];

                    // MZ 스타일 힌트 세트 B: 문법/규칙 래핑용 (20종)
                    const grammarTemplates = [
                        (h: string) => `야, 이거 중요함. ${h} 가보자고! 🔥`,
                        (h: string) => `앗, 실수? ${h} 다시 체크해봐! 🧐`,
                        (h: string) => `문법 폼 미쳤다... ${h} 이거 알면 고수임. ✨`,
                        (h: string) => `${h} 이거 모르면 어쩔? 다시 집중! 🤷‍♂️`,
                        (h: string) => `진짜 이거 규칙임. ${h} 잊지 말자! 💡`,
                        (h: string) => `잠깐! ${h} 이 부분 다시 읽어보면 정답 각! 🎯`,
                        (h: string) => `오답 실화? ${h} 생각하면 바로 보임. 😲`,
                        (h: string) => `${h} 챙겨야 MZ 문법 고수지! 가보자고! 🚀`,
                        (h: string) => `깔끼하게 ${h} 딱 확인하고 다시 도전! 👍`,
                        (h: string) => `이거 헷갈림? ${h} 이 규칙이 핵심임! 🔑`,
                        (h: string) => `반성 금지! ${h} 이것만 알면 다음엔 맞힘! 💪`,
                        (h: string) => `실력 발휘 좀 해봐! ${h} 보이지? 🕶️`,
                        (h: string) => `${h} 이거 완전 꿀팁인데 안 쓸 거임? 💎`,
                        (h: string) => `정신 차리고! ${h} 규칙 적용 레벨 업! 📈`,
                        (h: string) => `야 너두 할 수 있어. ${h} 로 가보자고! 🏃‍♂️`,
                        (h: string) => `역시 문법은 기세임. ${h} 기세로 밀어붙여! 📢`,
                        (h: string) => `너의 실력을 믿어. ${h} 만 봐봐! ✨`,
                        (h: string) => `이거 틀리면 서운함. ${h} 다시 가보자! 💜`,
                        (h: string) => `문법 폼 유지해야지! ${h} 알겠지? 🤴`,
                        (h: string) => `마지막 힌트임. ${h} 이거임! 💡`
                    ];

                    // MZ 스타일 힌트 세트 C: 일반/동기부여용 (20종)
                    const genericTemplates = [
                        (lv: number) => `레벨 ${lv} 공부 중임! 가보자고! 🚀`,
                        (lv: number) => `야, 벌써 레벨 ${lv}임? 폼 미쳤다! 🔥`,
                        (lv: number) => `레벨 ${lv} 마스터까지 얼마 안 남음. 기세임! 📈`,
                        (lv: number) => `실수해도 괜찮음. 레벨 ${lv} 가보자고! ✨`,
                        (lv: number) => `레벨 ${lv} 영어 고수 탄생 임박! 깔끼함! 🕶️`,
                        (lv: number) => `지금처럼만 하면 레벨 ${lv} 찢었다! 💪`,
                        (lv: number) => `레벨 ${lv} 공부는 기세임. 꺾이지 말자! 📢`,
                        (lv: number) => `야 너두 레벨 ${lv} 할 수 있어! 🏃‍♂️`,
                        (lv: number) => `레벨 ${lv}에서 멈추면 어쩔? 계속 가자! 🤷‍♂️`,
                        (lv: number) => `레벨 ${lv} 폼 유지하면서 가보자고! 🤴`,
                        (lv: number) => `오답은 정답의 어머니임. 레벨 ${lv} 화이팅! 🌱`,
                        (lv: number) => `와, 레벨 ${lv}까지 온 거 실화? 대박사건! 😲`,
                        (lv: number) => `레벨 ${lv} 정복하고 폼 미쳐보자! 🎯`,
                        (lv: number) => `레벨 ${lv} 공부 바이브 좋음. 가보자고! 🚀`,
                        (lv: number) => `포기하면 MZ 아님. 레벨 ${lv} 끝까지 가자! 💎`,
                        (lv: number) => `레벨 ${lv}에서 보석 같은 실력 쌓는 중! 💎`,
                        (lv: number) => `너의 열정, 레벨 ${lv}만큼 뜨거움! 🔥`,
                        (lv: number) => `레벨 ${lv}에서 실력 쑥쑥 크는 중! 🌳`,
                        (lv: number) => `이미 잘하고 있음. 레벨 ${lv} 조져보자! 👊`,
                        (lv: number) => `레벨 ${lv} 끝까지 가면 대박날 듯! ✨`
                    ];

                    let hintStr = "";
                    const tIdx = (lv * 13 + idx * 7) % 20;

                    if (scene.h) {
                        if (scene.h.startsWith("Similar to:")) {
                            const syn = scene.h.replace("Similar to:", "").trim();
                            hintStr = synTemplates[tIdx](syn);
                        } else {
                            // 문법/규칙인 경우 B세트 사용
                            hintStr = grammarTemplates[tIdx](scene.h);
                        }
                    } else {
                        // 사실확인/일반인 경우 C세트 사용
                        hintStr = genericTemplates[tIdx](lv);
                    }

                    problemsToInsert.push({
                        problemId,
                        level: lv,
                        difficulty: diff,
                        orderIndex: idx,
                        passage: `${scene.p} (Lv.${lv})`,
                        question: scene.q,
                        choices: scene.c,
                        correctAnswerIndex: scene.a,
                        explanation: `💡 힌트 - ${hintStr}`,
                        questionType: qType,
                        wordCount: scene.p.split(' ').length,
                    });
                }
            }
        }

        console.log(`📡 Inserting ${problemsToInsert.length} problems...`);
        await ChicorunProblemModel.insertMany(problemsToInsert, { ordered: false });

        console.log('✅ Chicorun problems seeded successfully for all 100 levels and 3 difficulties with variety!');
    } catch (error) {
        console.error('❌ Error seeding Chicorun problems:', error);
    }
};
