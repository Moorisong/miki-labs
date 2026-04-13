/**
 * 치코런 학습 문제 콘텐츠 풀
 * 유형별 15~20개의 고유 콘텐츠로 구성
 */

export interface ContentItem {
    p: string;   // passage
    q: string;   // question
    c: [string, string, string, string];
    a: number;   // correct answer index (0-3)
    h: string;   // hint (MZ 말투)
    t: string;   // topic
}

// ═══════════════════════════════════════════════════════════════════════════════
// 초급 (Level 1~30)
// ═══════════════════════════════════════════════════════════════════════════════

export const VOCAB: ContentItem[] = [
    { p: "The apple is red and sweet.", q: "'red'는 무슨 색인가요?", c: ["파란색", "빨간색", "노란색", "검정색"], a: 1, h: "빨갛다는 뜻이야! crimson이랑 비슷함 🍎", t: "food" },
    { p: "I see a big dog in the park.", q: "'big'은 어떤 크기인가요?", c: ["작은", "큰", "무서운", "귀여운"], a: 1, h: "'large'랑 같은 뜻! 크다는 거야 🐕", t: "animals" },
    { p: "My mom is kind and wise.", q: "'wise'는 무슨 뜻인가요?", c: ["슬픈", "현명한", "재미있는", "피곤한"], a: 1, h: "지혜로운 사람을 표현할 때 쓰는 단어야 🦉", t: "family" },
    { p: "The sky is very cloudy today.", q: "'cloudy'는 무슨 뜻인가요?", c: ["맑은", "흐린", "더운", "추운"], a: 1, h: "cloud(구름)에 -y가 붙은 거야! ☁️", t: "weather" },
    { p: "She is wearing a pretty dress.", q: "'pretty'는 무슨 뜻인가요?", c: ["무서운", "더러운", "예쁜", "큰"], a: 2, h: "beautiful이랑 비슷한 뜻! 예쁘다는 거지 👗", t: "clothing" },
    { p: "The baby is crying loudly.", q: "'loudly'는 어떤 뜻인가요?", c: ["조용히", "크게", "천천히", "빠르게"], a: 1, h: "loud(큰 소리)에 -ly 붙여서 부사로 만든 거야 📢", t: "daily_life" },
    { p: "We need to hurry to school.", q: "'hurry'는 무슨 뜻인가요?", c: ["서두르다", "쉬다", "걷다", "멈추다"], a: 0, h: "지각하면 안 되니까 빨리빨리! 가보자고 🏃", t: "school" },
    { p: "The river is very deep.", q: "'deep'은 어떤 의미인가요?", c: ["얕은", "넓은", "깊은", "좁은"], a: 2, h: "shallow(얕은)의 반대말이야! 깊다는 뜻 🌊", t: "nature" },
    { p: "He is a brave firefighter.", q: "'brave'는 어떤 뜻인가요?", c: ["겁 많은", "게으른", "용감한", "조용한"], a: 2, h: "위험한 일을 무서워하지 않는 거! 용감 그 자체 🔥", t: "jobs" },
    { p: "My grandmother lives in a quiet village.", q: "'quiet'는 어떤 뜻인가요?", c: ["시끄러운", "조용한", "복잡한", "위험한"], a: 1, h: "noisy(시끄러운)의 반대말! 고요하다는 뜻 🏡", t: "places" },
    { p: "The ice cream is delicious.", q: "'delicious'는 무슨 뜻인가요?", c: ["맛없는", "차가운", "맛있는", "비싼"], a: 2, h: "yummy랑 같은 뜻! 먹으면 행복해지는 맛 🍦", t: "food" },
    { p: "I am very thirsty after running.", q: "'thirsty'는 어떤 상태인가요?", c: ["배고픈", "목마른", "졸린", "아픈"], a: 1, h: "목이 말라서 물이 필요한 상태! 💧", t: "health" },
    { p: "The mountain is very high.", q: "'high'는 어떤 뜻인가요?", c: ["낮은", "넓은", "높은", "작은"], a: 2, h: "하늘에 가까울 정도로 높다는 거야 ⛰️", t: "nature" },
    { p: "She always tells the truth.", q: "'truth'는 무슨 뜻인가요?", c: ["거짓말", "진실", "비밀", "이야기"], a: 1, h: "lie(거짓말)의 반대! 사실 그대로를 말하는 거야 ✨", t: "daily_life" },
    { p: "The turtle moves very slowly.", q: "'slowly'는 어떤 뜻인가요?", c: ["빠르게", "천천히", "조용히", "높이"], a: 1, h: "slow에 -ly 붙인 부사! 거북이처럼 느리게 🐢", t: "animals" },
];

export const BASIC_GRAMMAR: ContentItem[] = [
    { p: "I ____ a student.", q: "빈칸에 알맞은 단어를 고르세요.", c: ["is", "am", "are", "be"], a: 1, h: "주어가 'I'일 때는 am! 이건 기본 중의 기본 🙋‍♂️", t: "school" },
    { p: "She ____ many books.", q: "빈칸에 들어갈 말은?", c: ["have", "has", "having", "had"], a: 1, h: "3인칭 단수(she)에는 has! have 아님 주의 📚", t: "daily_life" },
    { p: "They ____ playing soccer now.", q: "빈칸에 알맞은 be동사는?", c: ["is", "am", "are", "be"], a: 2, h: "They(여러 명)에는 are! 복수니까 ⚽", t: "sports" },
    { p: "He ____ to school yesterday.", q: "빈칸에 알맞은 단어는?", c: ["go", "goes", "went", "going"], a: 2, h: "yesterday는 과거! go의 과거형은 went 🕐", t: "school" },
    { p: "We will ____ the museum tomorrow.", q: "빈칸에 알맞은 단어는?", c: ["visit", "visits", "visited", "visiting"], a: 0, h: "will 뒤에는 동사 원형! 미래시제 기본이야 🏛️", t: "places" },
    { p: "The cat is ____ the table.", q: "빈칸에 알맞은 전치사는?", c: ["in", "on", "at", "under"], a: 3, h: "테이블 '아래'라는 위치를 나타내는 전치사! 🐱", t: "animals" },
    { p: "There ____ two apples on the desk.", q: "빈칸에 알맞은 be동사는?", c: ["is", "am", "are", "was"], a: 2, h: "two apples는 복수! 복수에는 are 👀", t: "food" },
    { p: "My sister ____ taller than me.", q: "빈칸에 알맞은 be동사는?", c: ["is", "am", "are", "be"], a: 0, h: "My sister는 3인칭 단수! is가 맞아 📏", t: "family" },
    { p: "I ____ not like spicy food.", q: "빈칸에 알맞은 조동사는?", c: ["does", "do", "is", "am"], a: 1, h: "I와 함께 쓰는 부정문 조동사! do not = don't 🌶️", t: "food" },
    { p: "____ she a teacher?", q: "빈칸에 알맞은 단어는?", c: ["Do", "Does", "Is", "Are"], a: 2, h: "she + teacher니까 be동사 의문문! Is she~? ❓", t: "jobs" },
    { p: "Look at ____ beautiful flowers!", q: "빈칸에 알맞은 단어는?", c: ["this", "that", "these", "a"], a: 2, h: "flowers는 복수! 복수를 가리키는 지시대명사 🌸", t: "nature" },
    { p: "I have ____ orange and ____ banana.", q: "빈칸에 알맞은 관사 조합은?", c: ["a / a", "an / a", "a / an", "the / the"], a: 1, h: "모음(o) 앞에는 an, 자음(b) 앞에는 a! 🍊🍌", t: "food" },
    { p: "She can ____ very well.", q: "빈칸에 알맞은 동사 형태는?", c: ["sings", "sang", "sing", "singing"], a: 2, h: "can 뒤에는 항상 동사 원형! 조동사의 법칙 🎤", t: "music" },
    { p: "This book is ____. Don't touch it.", q: "빈칸에 알맞은 소유대명사는?", c: ["my", "me", "mine", "I"], a: 2, h: "뒤에 명사가 없으니까 소유대명사 mine! 🔐", t: "school" },
    { p: "The children ____ in the playground.", q: "빈칸에 알맞은 be동사는?", c: ["is", "am", "are", "was"], a: 2, h: "children은 child의 복수! 복수에는 are 🎡", t: "places" },
];

export const SIMPLE_FACT: ContentItem[] = [
    { p: "Tom has a pet cat named Whiskers. Whiskers is gray and loves to sleep on the sofa.", q: "Whiskers는 무슨 색인가요?", c: ["갈색", "회색", "검정색", "흰색"], a: 1, h: "gray가 뭔지 찾아봐! 회색이야 🐱", t: "animals" },
    { p: "Lisa goes to school by bus every morning. The bus arrives at 8 o'clock.", q: "Lisa는 학교에 어떻게 가나요?", c: ["걸어서", "자전거로", "버스로", "택시로"], a: 2, h: "by bus! 교통수단을 확인해봐 🚌", t: "school" },
    { p: "My family has dinner at 7 PM. We usually eat rice and soup.", q: "저녁 식사 시간은 언제인가요?", c: ["오전 7시", "오후 6시", "오후 7시", "오후 8시"], a: 2, h: "7 PM은 오후 7시야! PM = 오후 🕖", t: "family" },
    { p: "Jenny's favorite season is spring. She likes flowers and warm weather.", q: "Jenny가 좋아하는 계절은?", c: ["여름", "가을", "겨울", "봄"], a: 3, h: "spring = 봄! 꽃과 따뜻한 날씨가 힌트야 🌸", t: "weather" },
    { p: "The library opens at 9 AM and closes at 6 PM. It is closed on Sundays.", q: "도서관은 언제 쉬나요?", c: ["토요일", "일요일", "월요일", "매일 열어요"], a: 1, h: "Sundays! 일요일에는 닫는다고 했어 📚", t: "places" },
    { p: "Kevin plays basketball after school. His team practices three times a week.", q: "Kevin의 팀은 일주일에 몇 번 연습하나요?", c: ["1번", "2번", "3번", "5번"], a: 2, h: "three times = 3번! 숫자를 확인해봐 🏀", t: "sports" },
    { p: "There are 30 students in my class. 16 are girls and 14 are boys.", q: "반에 남학생은 몇 명인가요?", c: ["16명", "14명", "30명", "15명"], a: 1, h: "boys = 남학생! 14명이라고 했어 👦", t: "school" },
    { p: "Grandma makes cookies every Saturday. She uses chocolate and butter.", q: "할머니는 언제 쿠키를 만드나요?", c: ["매일", "일요일마다", "토요일마다", "월요일마다"], a: 2, h: "every Saturday = 매주 토요일! 🍪", t: "food" },
    { p: "The zoo has elephants, lions, and penguins. The penguins live in a cold area.", q: "펭귄은 어디에 살고 있나요?", c: ["따뜻한 곳", "차가운 곳", "물속", "나무 위"], a: 1, h: "cold area = 차가운 곳! 펭귄은 추운 데를 좋아해 🐧", t: "animals" },
    { p: "Dad bought a new car last month. It is blue and very fast.", q: "아빠가 새 차를 산 시기는?", c: ["지난주", "어제", "지난달", "작년"], a: 2, h: "last month = 지난달! 시간 표현 체크 🚗", t: "daily_life" },
    { p: "Mina wakes up at 6:30 every day. She brushes her teeth and eats breakfast.", q: "Mina는 몇 시에 일어나나요?", c: ["6시", "6시 30분", "7시", "7시 30분"], a: 1, h: "6:30 = 6시 30분! 아침 루틴이네 ⏰", t: "daily_life" },
    { p: "The park has a big lake. Many ducks swim in the lake during summer.", q: "여름에 호수에서 수영하는 동물은?", c: ["개구리", "물고기", "오리", "거북이"], a: 2, h: "ducks = 오리! 여름에 호수에서 놀고 있어 🦆", t: "nature" },
    { p: "Today is Jane's birthday. She is turning 12 years old.", q: "Jane은 몇 살이 되나요?", c: ["10살", "11살", "12살", "13살"], a: 2, h: "turning 12 = 12살이 되는 거야! 🎂", t: "daily_life" },
    { p: "My brother studies math and science at school. His favorite subject is science.", q: "형(오빠)이 가장 좋아하는 과목은?", c: ["수학", "과학", "영어", "체육"], a: 1, h: "favorite subject = 가장 좋아하는 과목! science야 🔬", t: "school" },
    { p: "We planted tomatoes and peppers in our garden. The tomatoes turned red last week.", q: "정원에 심은 것이 아닌 것은?", c: ["토마토", "고추", "당근", "둘 다 심었음"], a: 2, h: "tomatoes와 peppers만 심었어! 당근은 없어 🌱", t: "nature" },
];

export const SYNONYM: ContentItem[] = [
    { p: "The movie was very funny.", q: "'funny'와 뜻이 비슷한 단어는?", c: ["무서운(scary)", "재미있는(amusing)", "슬픈(sad)", "지루한(boring)"], a: 1, h: "웃긴 = amusing! funny랑 뜻이 같아 😂", t: "daily_life" },
    { p: "She is a smart student.", q: "'smart'와 뜻이 비슷한 단어는?", c: ["게으른(lazy)", "아름다운(pretty)", "똑똑한(intelligent)", "키 큰(tall)"], a: 2, h: "머리가 좋다! intelligent = smart 🧠", t: "school" },
    { p: "I'm very tired today.", q: "'tired'와 뜻이 비슷한 단어는?", c: ["신나는(excited)", "피곤한(exhausted)", "배고픈(hungry)", "행복한(happy)"], a: 1, h: "지쳐서 쓰러질 것 같은 상태! exhausted 😴", t: "daily_life" },
    { p: "The test was really hard.", q: "'hard'와 뜻이 비슷한 단어는?", c: ["쉬운(easy)", "짧은(short)", "어려운(difficult)", "길은(long)"], a: 2, h: "어렵다는 뜻! difficult = hard 📝", t: "school" },
    { p: "She was very glad to see him.", q: "'glad'과 뜻이 비슷한 단어는?", c: ["화난(angry)", "기쁜(pleased)", "걱정되는(worried)", "무서운(scared)"], a: 1, h: "반가워서 기쁜 거야! pleased = glad 😊", t: "daily_life" },
    { p: "He is a wealthy businessman.", q: "'wealthy'와 뜻이 비슷한 단어는?", c: ["가난한(poor)", "부유한(rich)", "바쁜(busy)", "늙은(old)"], a: 1, h: "돈이 많다! rich = wealthy 💰", t: "jobs" },
    { p: "The garden looks gorgeous.", q: "'gorgeous'와 뜻이 비슷한 단어는?", c: ["못생긴(ugly)", "아주 아름다운(stunning)", "작은(tiny)", "낡은(old)"], a: 1, h: "눈이 부시게 아름답다! stunning 🌺", t: "nature" },
    { p: "Please begin the test now.", q: "'begin'과 뜻이 비슷한 단어는?", c: ["끝내다(finish)", "시작하다(start)", "쉬다(rest)", "멈추다(stop)"], a: 1, h: "시작한다! start = begin 🏁", t: "school" },
    { p: "I want to purchase a new bag.", q: "'purchase'와 뜻이 비슷한 단어는?", c: ["팔다(sell)", "사다(buy)", "빌리다(borrow)", "만들다(make)"], a: 1, h: "돈을 내고 사는 거야! buy = purchase 🛍️", t: "daily_life" },
    { p: "The answer is correct.", q: "'correct'와 뜻이 비슷한 단어는?", c: ["틀린(wrong)", "맞는(right)", "어려운(hard)", "쉬운(simple)"], a: 1, h: "정답! right = correct ✅", t: "school" },
    { p: "The puppy is very tiny.", q: "'tiny'와 뜻이 비슷한 단어는?", c: ["거대한(huge)", "아주 작은(miniature)", "빠른(fast)", "느린(slow)"], a: 1, h: "엄청 작다는 거! miniature = tiny 🐶", t: "animals" },
    { p: "She was angry about the mistake.", q: "'angry'와 뜻이 비슷한 단어는?", c: ["슬픈(sad)", "화난(furious)", "기쁜(happy)", "무서운(scared)"], a: 1, h: "분노! furious는 angry보다 더 화난 거야 😡", t: "daily_life" },
    { p: "The story was strange.", q: "'strange'와 뜻이 비슷한 단어는?", c: ["재미있는(fun)", "이상한(weird)", "긴(long)", "무서운(scary)"], a: 1, h: "뭔가 수상하고 이상한! weird = strange 🤔", t: "daily_life" },
    { p: "He always helps his friends.", q: "'help'과 뜻이 비슷한 단어는?", c: ["방해하다(disturb)", "돕다(assist)", "따르다(follow)", "떠나다(leave)"], a: 1, h: "도와주는 거! assist = help 🤝", t: "daily_life" },
    { p: "The food was awful.", q: "'awful'과 뜻이 비슷한 단어는?", c: ["맛있는(tasty)", "끔찍한(terrible)", "비싼(expensive)", "싼(cheap)"], a: 1, h: "형편없이 나쁘다! terrible = awful 🤮", t: "food" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 중급 (Level 31~70)
// ═══════════════════════════════════════════════════════════════════════════════

export const CONTEXT_VOCAB: ContentItem[] = [
    { p: "The recent economic shift has prompted a significant transformation in consumer behavior. People are now prioritizing sustainability over mere convenience.", q: "본문에서 'prompted'의 의미와 가장 가까운 것은?", c: ["지연시키다", "유도하다/촉발하다", "무시하다", "보호하다"], a: 1, h: "경제적 변화가 행동의 변화를 '일으켰다'는 맥락! 🚀", t: "economy" },
    { p: "While the initial results were ambiguous, further investigation provided clarity. The researchers finally identified the key variables.", q: "본문에서 'ambiguous'의 뜻은?", c: ["명확한", "모호한", "성공적인", "부족한"], a: 1, h: "나중에 '명확해졌다'는 말의 반대! 처음엔 불분명했다는 거야 ✨", t: "science" },
    { p: "Innovators often encounter resistance when introducing disruptive technologies. However, persistent effort usually mitigates initial fears.", q: "'mitigate'의 의미는?", c: ["완화시키다", "증가시키다", "무시하다", "포기하다"], a: 0, h: "공포를 '줄여준다'는 긍정적 맥락! 완화야 💡", t: "technology" },
    { p: "The government decided to abolish the outdated regulation that had hindered small businesses for decades.", q: "'abolish'의 의미는?", c: ["강화하다", "폐지하다", "수정하다", "연장하다"], a: 1, h: "outdated(구식) 규정을 없앤다는 맥락! 🗑️", t: "society" },
    { p: "Despite the abundant evidence supporting the theory, a few skeptics remained unconvinced and demanded more rigorous testing.", q: "'abundant'의 의미는?", c: ["부족한", "풍부한", "모호한", "위험한"], a: 1, h: "증거가 많은데도 의심한다는 흐름! 풍부하다는 뜻 📊", t: "science" },
    { p: "The prolonged drought devastated the agricultural sector, leaving farmers with little to harvest that season.", q: "'prolonged'의 의미는?", c: ["짧은", "장기간의", "갑작스러운", "가벼운"], a: 1, h: "가뭄이 오래 계속되어 농업이 망했다는 맥락! ⏳", t: "environment" },
    { p: "The company's transparent policies fostered trust among its employees and boosted overall morale.", q: "'fostered'의 의미는?", c: ["파괴했다", "촉진했다/길렀다", "감소시켰다", "숨겼다"], a: 1, h: "투명한 정책이 신뢰를 '키웠다'는 긍정적 맥락! 🌱", t: "economy" },
    { p: "The vaccine's efficacy was demonstrated through extensive clinical trials involving thousands of participants.", q: "'efficacy'의 의미는?", c: ["위험성", "효능/효과", "비용", "부작용"], a: 1, h: "백신이 임상시험을 통해 '효과'가 있음을 보여줬다는 거야 💉", t: "health" },
    { p: "Residents were urged to evacuate the coastal areas as the hurricane was projected to make landfall within hours.", q: "'evacuate'의 의미는?", c: ["머무르다", "대피하다", "관찰하다", "축하하다"], a: 1, h: "허리케인이 오니까 해안가에서 '빠져나가라'는 거야! 🌀", t: "environment" },
    { p: "The politician's rhetoric was compelling, but critics argued that his proposals lacked substance and practical feasibility.", q: "'rhetoric'의 의미는?", c: ["침묵", "수사/웅변", "법률", "투표"], a: 1, h: "설득력 있는 '말'이지만 내용이 없다는 비판! 🎙️", t: "society" },
    { p: "The artist's work was considered avant-garde, challenging the conventional norms of the art world at the time.", q: "'conventional'의 의미는?", c: ["혁신적인", "전통적인/관습적인", "불필요한", "위험한"], a: 1, h: "avant-garde(전위적)와 대비되는 단어! 기존의 관습이야 🎨", t: "culture" },
    { p: "The merger between the two companies was expected to yield significant profits and expand their market share.", q: "'yield'의 의미는?", c: ["잃다", "산출하다/가져다주다", "숨기다", "거부하다"], a: 1, h: "합병으로 이익을 '가져다준다'는 맥락! 📈", t: "economy" },
    { p: "The teacher commended the student for her diligent work ethic, noting she had consistently exceeded expectations.", q: "'commended'의 의미는?", c: ["비난했다", "칭찬했다", "무시했다", "벌을 주었다"], a: 1, h: "열심히 한 학생을 선생님이 인정! 칭찬이야 👏", t: "education" },
    { p: "The new policy inadvertently caused a surge in unemployment, an outcome nobody had anticipated during the planning stage.", q: "'inadvertently'의 의미는?", c: ["의도적으로", "의도치 않게", "성공적으로", "빠르게"], a: 1, h: "아무도 예상 못한 결과! 실수로/의도치 않게 발생 🤦", t: "society" },
    { p: "The chef's culinary skills were unparalleled; no other restaurant in the city could replicate the unique flavors he created.", q: "'unparalleled'의 의미는?", c: ["평범한", "비교할 수 없는/독보적인", "부족한", "유사한"], a: 1, h: "아무도 따라올 수 없는 수준! 독보적이야 👨‍🍳", t: "food" },
];

export const INFERENCE: ContentItem[] = [
    { p: "The store was crowded and the lights were dimming. Sarah checked her watch and quickened her pace, heading straight for the back exit where a dark sedan was idling.", q: "Sarah의 상황으로 추론할 수 있는 것은?", c: ["쇼핑을 즐기고 있다", "누군가를 피해 급히 떠나려 한다", "가게를 청소하고 있다", "친구를 기다리고 있다"], a: 1, h: "시계를 보고 걸음을 재촉해서 뒷문으로! 급한 상황이야 🏃‍♀️", t: "daily_life" },
    { p: "The soil in the garden was cracked and the flowers were drooping. Despite the dark clouds on the horizon, not a single drop had fallen for weeks.", q: "정원사가 가장 바라는 것은?", c: ["태풍", "비", "비료", "벌레 퇴치"], a: 1, h: "땅이 갈라지고 꽃이 시들었으면 뭐가 필요할까? 🌧️", t: "nature" },
    { p: "Jake put on his helmet, checked the air in his tires, and filled his water bottle. He looked at the trail map one last time before heading out.", q: "Jake가 하려는 활동은?", c: ["등산", "자전거 타기", "수영", "낚시"], a: 1, h: "헬멧+타이어+트레일 지도 = 자전거! 🚴", t: "sports" },
    { p: "Maria stared at the blank canvas, mixing colors on her palette. She closed her eyes, took a deep breath, and made her first brushstroke.", q: "Maria가 하고 있는 것은?", c: ["요리", "그림 그리기", "청소", "글쓰기"], a: 1, h: "캔버스+팔레트+붓질 = 그림! 🎨", t: "culture" },
    { p: "The waiting room was packed. Nurses rushed between rooms carrying clipboards. A child coughed in the corner while her mother filled out forms.", q: "이 장소는 어디인가?", c: ["학교", "도서관", "병원", "식당"], a: 2, h: "간호사+대기실+서류 작성 = 병원에 왔구나! 🏥", t: "health" },
    { p: "He folded the letter carefully and placed it in the envelope. With a heavy sigh, he wrote an address he hadn't visited in years and attached a stamp.", q: "그의 감정 상태는?", c: ["신나는", "그리움/아쉬움", "화남", "무관심"], a: 1, h: "한숨+오랫동안 안 간 주소 = 그리운 마음이야 💌", t: "daily_life" },
    { p: "The detective examined the broken window, the scattered papers, and the empty safe. He noticed muddy footprints leading to the back door.", q: "이 장면에서 추론할 수 있는 것은?", c: ["자연재해가 발생했다", "도둑이 침입했다", "이사를 준비 중이다", "청소를 했다"], a: 1, h: "깨진 창문+빈 금고+진흙 발자국 = 도둑! 🔍", t: "daily_life" },
    { p: "She spent hours arranging the tables, hanging decorations, and placing name cards at each seat. The cake was in the fridge, ready to be brought out.", q: "그녀가 준비하고 있는 것은?", c: ["회의", "파티/축하 행사", "이사", "시험"], a: 1, h: "장식+이름표+케이크 = 파티 준비! 🎉", t: "daily_life" },
    { p: "The audience held their breath as the tightrope walker stepped onto the wire, fifty feet above the ground. One slight misstep could end in disaster.", q: "관객의 감정은?", c: ["지루함", "긴장/불안", "기쁨", "분노"], a: 1, h: "숨을 멈추고 지켜보는 건 긴장감 때문! 😰", t: "culture" },
    { p: "Every shelf was filled with old books, and a thick layer of dust covered the counters. The shopkeeper adjusted his glasses and greeted the rare customer warmly.", q: "이 가게에 대해 추론할 수 있는 것은?", c: ["매우 인기 있다", "손님이 적고 오래되었다", "최근에 오픈했다", "온라인 전용이다"], a: 1, h: "먼지+드문 손님 = 오래되고 한적한 가게! 📖", t: "places" },
    { p: "The professor's voice trailed off as he noticed most students staring at their phones. He paused, then asked a question directly to the student in the front row.", q: "교수의 의도는?", c: ["수업을 끝내려 한다", "학생들의 주의를 환기하려 한다", "쉬는 시간을 주려 한다", "핸드폰을 칭찬하려 한다"], a: 1, h: "폰만 보는 학생들에게 직접 질문! 집중시키려는 거야 📱", t: "education" },
    { p: "As the plane descended, the passengers saw tiny houses and winding rivers below. The captain announced they would land in ten minutes.", q: "현재 상황은?", c: ["비행기가 이륙 중이다", "비행기가 착륙 준비 중이다", "비행기가 결항되었다", "비행기가 폭풍을 만났다"], a: 1, h: "하강 중+10분 후 착륙 = 곧 도착! ✈️", t: "travel" },
    { p: "The restaurant's parking lot was completely full. People waited outside on the sidewalk, checking their phones for their turn number.", q: "이 식당에 대해 추론할 수 있는 것은?", c: ["곧 폐업할 예정이다", "매우 인기 있는 맛집이다", "예약제로만 운영된다", "배달 전문점이다"], a: 1, h: "주차장 만석+밖에서 대기 = 초인기 맛집! 🍽️", t: "food" },
    { p: "The team huddled together, their uniforms soaked with sweat. The scoreboard showed a one-point difference with only two minutes remaining.", q: "팀의 상황은?", c: ["크게 이기고 있다", "경기가 취소되었다", "박빙의 승부 중이다", "연습 중이다"], a: 2, h: "1점 차+2분 남음 = 아슬아슬한 접전! ⏱️", t: "sports" },
    { p: "She glanced at the long line of applicants stretching down the hallway. Adjusting her resume one last time, she rehearsed her answers silently.", q: "그녀가 준비하고 있는 것은?", c: ["시험", "면접", "발표", "여행"], a: 1, h: "이력서+대답 리허설+지원자 줄 = 면접 준비! 💼", t: "jobs" },
];

export const CONNECTOR: ContentItem[] = [
    { p: "High-quality education is expensive to provide. ________, it is an investment that yields significant long-term returns.", q: "빈칸에 들어갈 가장 적절한 연결어는?", c: ["However", "Therefore", "In addition", "For example"], a: 0, h: "비용이 많이 들지만 '그럼에도 불구하고' 투자할 가치가 있다! 반전 🔄", t: "education" },
    { p: "Regular exercise improves physical health. ________, it has been shown to reduce stress and improve mental well-being.", q: "빈칸에 알맞은 연결어는?", c: ["However", "On the other hand", "Furthermore", "Instead"], a: 2, h: "신체 건강에 좋고 '게다가' 정신 건강에도! 추가 정보 ➕", t: "health" },
    { p: "The team practiced hard every day. ________, they won the championship easily.", q: "빈칸에 알맞은 연결어는?", c: ["However", "As a result", "On the contrary", "Meanwhile"], a: 1, h: "열심히 연습한 '결과' 우승! 인과관계야 🏆", t: "sports" },
    { p: "Many students prefer online classes. ________, some teachers believe face-to-face is more effective.", q: "빈칸에 알맞은 연결어는?", c: ["Therefore", "In addition", "On the other hand", "As a result"], a: 2, h: "학생 vs 선생님의 다른 의견! 반면에 🔀", t: "education" },
    { p: "Smartphones offer many benefits. ________, excessive use can lead to eye strain and poor sleep.", q: "빈칸에 알맞은 연결어는?", c: ["Moreover", "However", "Therefore", "Similarly"], a: 1, h: "장점이 있지만 '하지만' 단점도! 역접 관계 📱", t: "technology" },
    { p: "Eating vegetables is important for health. ________, fruits provide essential vitamins and fiber.", q: "빈칸에 알맞은 연결어는?", c: ["However", "Similarly", "Instead", "Nevertheless"], a: 1, h: "채소와 '마찬가지로' 과일도 건강에 좋다! 유사 관계 🥗", t: "health" },
    { p: "She studied all night for the exam. ________, she overslept and almost missed it.", q: "빈칸에 알맞은 연결어는?", c: ["Therefore", "Unfortunately", "Moreover", "Similarly"], a: 1, h: "열심히 공부했는데 '불행히도' 늦잠! 예상 못한 반전 😱", t: "school" },
    { p: "Solar energy is clean and renewable. ________, wind power also offers a sustainable alternative to fossil fuels.", q: "빈칸에 알맞은 연결어는?", c: ["However", "In contrast", "Likewise", "Nevertheless"], a: 2, h: "태양 에너지와 '마찬가지로' 풍력도! 비슷한 맥락 🌞", t: "environment" },
    { p: "The car was old and unreliable. ________, the owner decided to buy a new one.", q: "빈칸에 알맞은 연결어는?", c: ["Nevertheless", "Therefore", "However", "Meanwhile"], a: 1, h: "차가 낡아서 '그래서' 새 차를 샀다! 당연한 결과 🚗", t: "daily_life" },
    { p: "Learning a musical instrument takes patience. ________, practice at least 30 minutes daily.", q: "빈칸에 알맞은 연결어는?", c: ["However", "For instance", "In other words", "Nevertheless"], a: 1, h: "인내가 필요하다는 말의 '예를 들면' 매일 30분 연습! 🎵", t: "music" },
    { p: "The population of the city has doubled. ________, housing prices have skyrocketed.", q: "빈칸에 알맞은 연결어는?", c: ["Instead", "Consequently", "Although", "Similarly"], a: 1, h: "인구 증가의 '결과로' 집값 폭등! 인과관계 🏙️", t: "society" },
    { p: "The museum was closed for renovation. ________, visitors were directed to the temporary exhibition space downtown.", q: "빈칸에 알맞은 연결어는?", c: ["Moreover", "Instead", "Similarly", "Furthermore"], a: 1, h: "박물관이 닫혀서 '대신' 임시 전시장으로! 대체 🏛️", t: "culture" },
    { p: "The experiment failed multiple times. ________, the scientist refused to give up and eventually found a breakthrough.", q: "빈칸에 알맞은 연결어는?", c: ["Therefore", "Furthermore", "Nevertheless", "Similarly"], a: 2, h: "실패했지만 '그럼에도 불구하고' 포기 안 함! 끈기 💪", t: "science" },
    { p: "Reading books improves vocabulary and comprehension. ________, it enhances creativity and critical thinking skills.", q: "빈칸에 알맞은 연결어는?", c: ["However", "In addition", "Instead", "On the contrary"], a: 1, h: "어휘력에 좋고 '게다가' 창의력에도! 추가 장점 📚", t: "education" },
    { p: "The weather forecast predicted rain. ________, she still decided to go hiking without an umbrella.", q: "빈칸에 알맞은 연결어는?", c: ["Therefore", "As a result", "Nevertheless", "Moreover"], a: 2, h: "비 예보인데 '그럼에도' 우산 없이 등산! 무모하네 ⛰️", t: "weather" },
];

export const MAIN_IDEA: ContentItem[] = [
    { p: "Sleep is essential for brain health. During deep sleep, the brain clears out waste products that build up during waking hours. Insufficient sleep has been linked to memory problems and increased risk of cognitive decline.", q: "이 글의 주제로 가장 적절한 것은?", c: ["수면의 종류", "수면이 뇌 건강에 미치는 영향", "기억력 훈련 방법", "수면 부족의 원인"], a: 1, h: "전체적으로 수면과 뇌 건강의 관계를 설명하고 있어! 🧠", t: "health" },
    { p: "Recycling alone cannot solve our waste problem. We must also reduce consumption and reuse items whenever possible. A circular economy model, where products are designed for reuse, offers the most sustainable path forward.", q: "이 글의 주제로 가장 적절한 것은?", c: ["재활용의 역사", "폐기물 줄이기의 종합적 접근 필요성", "제품 디자인 트렌드", "소비자 행동 분석"], a: 1, h: "재활용만으로는 부족하고 종합적인 접근이 필요하다는 메시지! ♻️", t: "environment" },
    { p: "Social media has transformed how we communicate. While it connects people across distances instantly, studies show increasing loneliness and anxiety among heavy users. The paradox of connection without genuine interaction deserves attention.", q: "이 글의 주제로 가장 적절한 것은?", c: ["SNS의 발전 과정", "SNS가 소통에 미치는 양면적 영향", "외로움의 원인 분석", "인터넷 중독 해결법"], a: 1, h: "연결되지만 외로운 역설! SNS의 양면성이 핵심이야 📱", t: "technology" },
    { p: "Urban farming is gaining popularity worldwide. By growing food in cities, communities reduce transportation costs, enjoy fresher produce, and strengthen neighborhood bonds. Rooftop and vertical gardens are leading this green revolution.", q: "이 글의 주제로 가장 적절한 것은?", c: ["도시 인구 증가 문제", "도시 농업의 장점과 확산", "유기농 식품의 효과", "정원 가꾸기 방법"], a: 1, h: "도시에서 농사짓는 것의 장점을 쭉 나열했어! 🏙️🌱", t: "environment" },
    { p: "Music education does more than teach notes and rhythms. Research indicates that children who learn instruments develop stronger mathematical skills, better memory, and enhanced emotional intelligence.", q: "이 글의 주제로 가장 적절한 것은?", c: ["악기 연주 방법", "음악 교육의 다양한 인지적 효과", "수학 학습 전략", "어린이 감정 발달 단계"], a: 1, h: "음악 교육이 지능 발달에 미치는 긍정적 효과들! 🎵", t: "education" },
    { p: "Bees are more important to our food supply than most people realize. They pollinate roughly 75% of the fruits and vegetables we eat. The recent decline in bee populations is therefore a serious threat to global food security.", q: "이 글의 주제로 가장 적절한 것은?", c: ["벌의 생태적 특징", "꿀 생산 과정", "벌 개체 수 감소와 식량 안보 위협", "과일 재배 기술"], a: 2, h: "벌이 줄면 우리 먹을 것도 위험하다는 경고! 🐝", t: "environment" },
    { p: "Body language often speaks louder than words. A firm handshake, eye contact, and open posture can convey confidence even before a single word is spoken in a job interview.", q: "이 글의 주제로 가장 적절한 것은?", c: ["면접 준비 방법", "비언어적 소통(바디랭귀지)의 중요성", "자신감을 키우는 방법", "악수의 역사"], a: 1, h: "말보다 몸짓이 더 중요할 수 있다! 바디랭귀지의 힘 💪", t: "society" },
    { p: "Fast fashion produces trendy clothing at low costs, but its environmental impact is alarming. The industry generates massive waste and pollution, prompting calls for more sustainable consumer choices.", q: "이 글의 주제로 가장 적절한 것은?", c: ["패션 트렌드 분석", "패스트 패션의 환경적 문제점", "의류 가격 비교", "지속 가능한 소재 개발"], a: 1, h: "싸고 예쁘지만 환경에 나쁘다는 게 요점! 👗", t: "environment" },
    { p: "Introverts are often misunderstood as antisocial. In reality, they simply recharge their energy through solitude rather than social interaction. Many successful leaders are introverts who thrive in thoughtful, reflective environments.", q: "이 글의 주제로 가장 적절한 것은?", c: ["외향적 성격의 장점", "내향적 성격에 대한 오해와 실제", "리더십 훈련 프로그램", "에너지 관리 방법"], a: 1, h: "내향적인 게 나쁜 게 아니라 다를 뿐이야! 🤫", t: "society" },
    { p: "Water scarcity affects billions worldwide, yet about 30% of the global water supply is wasted through leaks, pollution, and inefficient use. Addressing infrastructure and habits is critical.", q: "이 글의 주제로 가장 적절한 것은?", c: ["물의 과학적 특성", "물 부족 문제와 낭비 해결의 필요성", "수질 오염의 원인", "댐 건설의 필요성"], a: 1, h: "물이 부족한데 30%를 낭비! 해결이 시급하다는 메시지 💧", t: "environment" },
    { p: "Mindfulness meditation, once considered an Eastern practice, has gained mainstream acceptance in Western medicine. Clinical studies demonstrate its effectiveness in reducing chronic pain, anxiety, and depression.", q: "이 글의 주제로 가장 적절한 것은?", c: ["동양 철학의 역사", "명상의 의학적 효과와 주류화", "만성 통증 치료법", "서양 의학의 한계"], a: 1, h: "명상이 서양 의학에서도 인정받는 효과가 있다! 🧘", t: "health" },
    { p: "Homework has been a staple of education for centuries, but recent studies question its effectiveness for younger students. Some researchers argue that play-based learning yields better outcomes for children under ten.", q: "이 글의 주제로 가장 적절한 것은?", c: ["숙제의 역사", "어린 학생에게 숙제의 효과에 대한 의문", "놀이 기반 학습 방법", "교육 과정 개편 방향"], a: 1, h: "숙제가 정말 효과적인가? 의문을 제기하는 글이야 📝", t: "education" },
    { p: "The gig economy offers workers flexibility and autonomy, but it often comes without benefits like health insurance, retirement plans, or job security. This trade-off raises important questions about workers' rights.", q: "이 글의 주제로 가장 적절한 것은?", c: ["프리랜서의 일상", "긱 경제의 장단점과 노동권 문제", "건강보험의 중요성", "은퇴 준비 방법"], a: 1, h: "자유롭지만 불안정한 긱 경제의 양면! ⚖️", t: "economy" },
    { p: "Volcanic eruptions, while destructive, play a vital role in Earth's ecosystem. The minerals released enrich surrounding soil, making volcanic regions some of the most fertile lands on the planet.", q: "이 글의 주제로 가장 적절한 것은?", c: ["화산 폭발의 위험성", "화산 활동의 파괴적이면서도 유익한 역할", "토양 오염 문제", "자연재해 대비 방법"], a: 1, h: "파괴적이지만 토양을 비옥하게! 양면이 있어 🌋", t: "science" },
    { p: "Libraries are evolving beyond book lending. Modern libraries offer digital media, maker spaces, free Wi-Fi, community events, and even career counseling, becoming essential community hubs.", q: "이 글의 주제로 가장 적절한 것은?", c: ["전자책의 발전", "도서관의 역할 확대와 변화", "지역 사회 행사 기획", "도서관 건축 디자인"], a: 1, h: "책만 빌려주는 곳이 아니라 커뮤니티 허브로! 📚", t: "culture" },
];

export const PURPOSE: ContentItem[] = [
    { p: "Are you tired of waking up exhausted? Try SleepWell pillows — scientifically designed to support your neck and spine. Order now and get 30% off your first purchase!", q: "이 글의 목적으로 가장 적절한 것은?", c: ["수면 연구 결과를 보고하려고", "베개 제품을 광고하려고", "수면 건강 정보를 제공하려고", "목 건강의 중요성을 알리려고"], a: 1, h: "할인+주문하세요 = 광고야! 🛒", t: "health" },
    { p: "Dear Mr. Kim, I am writing to express my concern regarding the noise from the construction site adjacent to our school. The constant drilling disrupts classes and affects students' concentration.", q: "이 글의 목적은?", c: ["공사 현장을 칭찬하려고", "민원/항의를 제기하려고", "학교를 소개하려고", "공사 일정을 안내하려고"], a: 1, h: "concern(우려)+disrupts(방해) = 불만/항의! ✉️", t: "education" },
    { p: "Welcome to the National Museum! Please note that flash photography is not permitted. Guided tours depart from the main lobby every hour. Enjoy your visit!", q: "이 글의 목적은?", c: ["박물관의 역사를 소개하려고", "방문객에게 안내 정보를 제공하려고", "사진 촬영 기술을 설명하려고", "전시물을 설명하려고"], a: 1, h: "플래시 금지+투어 안내 = 방문 안내문! 🏛️", t: "culture" },
    { p: "Attention all residents: A community meeting will be held this Saturday at 3 PM in the town hall to discuss the proposed park renovation. Your input is valuable.", q: "이 글의 목적은?", c: ["공원 역사를 설명하려고", "주민 회의를 공지하려고", "건축 설계를 보여주려고", "행사 결과를 보고하려고"], a: 1, h: "meeting+this Saturday = 회의 공지! 📢", t: "society" },
    { p: "Many people believe that homework helps students learn better. However, research shows that excessive homework can increase stress and decrease motivation, especially among younger students.", q: "이 글의 목적은?", c: ["숙제의 이점을 강조하려고", "과도한 숙제에 반대하는 주장을 하려고", "학생들의 스트레스를 비교하려고", "학부모에게 조언하려고"], a: 1, h: "excessive(과도한)+stress = 많은 숙제에 반대! 논설 ✍️", t: "education" },
    { p: "Step 1: Preheat the oven to 180°C. Step 2: Mix flour, sugar, and eggs in a bowl. Step 3: Pour the batter into a greased pan. Step 4: Bake for 25 minutes.", q: "이 글의 목적은?", c: ["요리 대회를 홍보하려고", "레시피/만드는 방법을 안내하려고", "오븐 사용법을 설명하려고", "베이킹 역사를 소개하려고"], a: 1, h: "Step 1, 2, 3... = 조리법 안내! 🍰", t: "food" },
    { p: "Last summer, I traveled to Jeju Island with my family. We climbed Hallasan, visited Manjanggul Cave, and enjoyed fresh seafood every night. It was the best trip ever.", q: "이 글의 목적은?", c: ["제주도를 광고하려고", "여행 경험을 공유하려고", "여행 계획을 세우려고", "등산 안전 수칙을 안내하려고"], a: 1, h: "I traveled+best trip = 개인 여행 경험 공유! ✈️", t: "travel" },
    { p: "Volunteers needed! Help us clean up the local beach this Sunday morning. All supplies will be provided. Meet at the main parking lot at 9 AM. Together, we can make a difference!", q: "이 글의 목적은?", c: ["해변 오염을 보도하려고", "자원봉사자를 모집하려고", "청소 용품을 판매하려고", "주차장 이용을 안내하려고"], a: 1, h: "Volunteers needed = 자원봉사자 모집 공고! 🏖️", t: "environment" },
    { p: "The rise of artificial intelligence will fundamentally reshape the job market. While some roles will disappear, new opportunities in AI maintenance, ethics, and creative fields will emerge.", q: "이 글의 목적은?", c: ["AI 기술을 비판하려고", "AI가 일자리에 미칠 영향을 분석하려고", "새로운 직업을 홍보하려고", "AI 윤리 규정을 제안하려고"], a: 1, h: "reshape(재편)+some disappear, new emerge = 영향 분석! 🤖", t: "technology" },
    { p: "Dear valued customer, we regret to inform you that your shipment has been delayed due to severe weather conditions. We expect delivery by Friday. We sincerely apologize for any inconvenience.", q: "이 글의 목적은?", c: ["날씨를 알려주려고", "배송 지연을 사과하고 알리려고", "새 상품을 소개하려고", "배송비 환불을 안내하려고"], a: 1, h: "delayed+apologize = 지연 안내 및 사과! 📦", t: "daily_life" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 고급 (Level 71~100) — 수능 유형 중심
// ═══════════════════════════════════════════════════════════════════════════════

export const LONG_INFERENCE: ContentItem[] = [
    { p: "The paradox of choice suggests that while we might think more options lead to greater satisfaction, the opposite is often true. When presented with a vast array of possibilities, individuals experience decision fatigue and a higher likelihood of regret. This phenomenon has profound implications for marketing and public policy.", q: "필자가 주장하는 '선택의 역설'의 핵심은?", c: ["선택지가 많을수록 만족도가 비례한다", "많은 선택지는 오히려 결정 장애와 후회를 부른다", "마케팅은 항상 다양한 옵션을 제공해야 한다", "인간은 이성적으로 모든 대안을 분석한다"], a: 1, h: "전통적 경제학의 가정과 반대! 많으면 오히려 피곤 😵", t: "society" },
    { p: "Artificial intelligence is not a monolithic technology but a complex ensemble of algorithms. While the narrative often oscillates between utopian salvation and dystopian catastrophe, the reality is a nuanced landscape of incremental integration. The ethical imperative is to ensure algorithmic transparency.", q: "필자가 AI에 대해 강조하는 태도는?", c: ["극단적인 공포", "맹목적인 신뢰", "윤리적 투명성과 신중한 대처", "기술적 무관심"], a: 2, h: "극단이 아닌 '윤리적 의무'와 '투명성'을 강조! 🤖", t: "technology" },
    { p: "The decline of small bookshops is often blamed on e-commerce giants, but the truth is more complex. Rising rents, changing reading habits, and the allure of digital convenience all play a role. Those bookshops that survive have reinvented themselves as community spaces.", q: "소규모 서점의 쇠퇴 원인으로 본문이 강조하는 것은?", c: ["전자상거래만이 유일한 원인이다", "복합적 요인이 작용하고 있다", "정부 규제가 주된 원인이다", "독서 인구가 증가하고 있다"], a: 1, h: "하나의 원인이 아니라 여러 요인! 복합적이야 📖", t: "economy" },
    { p: "Neuroplasticity challenges the long-held belief that the adult brain is a fixed organ. Research demonstrates that learning new skills, languages, or even playing musical instruments can physically alter brain structure at any age. This understanding revolutionizes rehabilitation and education.", q: "신경가소성에 대한 본문의 핵심 주장은?", c: ["성인의 뇌는 변하지 않는다", "뇌는 나이에 관계 없이 변화할 수 있다", "음악만이 뇌를 변화시킨다", "재활은 불가능하다"], a: 1, h: "성인도 새로운 걸 배우면 뇌가 변한다! 혁명적 🧠", t: "science" },
    { p: "The tragedy of the commons describes how individuals acting in self-interest can deplete shared resources. Overfishing, deforestation, and air pollution are all examples. Solutions require collective action, from international agreements to local governance structures.", q: "공유지의 비극의 핵심 문제는?", c: ["공유 자원이 부족하다", "개인의 이기심이 공유 자원을 고갈시킨다", "국제 협약이 불필요하다", "지역 거버넌스가 실패했다"], a: 1, h: "다 같이 쓰는 자원을 각자 이기적으로 쓰면 파멸! 🌍", t: "environment" },
    { p: "Confirmation bias is the tendency to seek out information that confirms our existing beliefs while ignoring contradictory evidence. In the age of social media, algorithms amplify this by creating echo chambers. Critical thinking requires actively seeking diverse perspectives.", q: "확증 편향을 심화시키는 현대적 요인은?", c: ["학교 교육", "소셜 미디어 알고리즘", "신문 구독", "도서관 방문"], a: 1, h: "알고리즘이 내가 좋아하는 것만 보여줘서 편향이 강화! 📱", t: "technology" },
    { p: "The placebo effect demonstrates the powerful connection between mind and body. Patients given sugar pills often show measurable improvement if they believe the treatment is real. This challenges purely materialist views of medicine and highlights the role of expectation in healing.", q: "위약 효과가 의학에 시사하는 바는?", c: ["약물만이 치료에 효과적이다", "기대와 믿음이 실제 치유에 영향을 준다", "설탕이 치료 효과가 있다", "의사의 역할이 줄어들고 있다"], a: 1, h: "가짜 약인데 효과가 있다? 마음의 힘이야! 💊", t: "health" },
    { p: "The Great Pacific Garbage Patch is not a solid island of trash but rather a vast area of microplastics suspended in the water. These particles enter the food chain, ultimately affecting human health. The solution demands both individual behavior change and global policy reform.", q: "태평양 쓰레기 섬에 대한 올바른 설명은?", c: ["거대한 고체 쓰레기 섬이다", "미세 플라스틱이 물속에 떠 있는 광범위한 영역이다", "이미 정책적으로 해결되었다", "인간 건강에는 영향이 없다"], a: 1, h: "떠다니는 미세 플라스틱! 보이지 않지만 위험해 🌊", t: "environment" },
    { p: "Cultural appropriation versus appreciation is a nuanced debate. Borrowing elements from another culture can be either respectful homage or harmful exploitation, depending largely on context, power dynamics, and the depth of understanding involved.", q: "문화적 차용에 대한 필자의 관점은?", c: ["항상 잘못된 일이다", "언제나 긍정적이다", "맥락과 권력 관계에 따라 다르다", "법적으로 규제해야 한다"], a: 2, h: "무조건 좋다/나쁘다가 아니라 맥락이 중요! 🎭", t: "culture" },
    { p: "Sleep-deprived societies pay an enormous economic price. Studies estimate that insufficient sleep costs developed nations billions annually through reduced productivity, workplace accidents, and increased healthcare utilization. Yet sleep is routinely sacrificed for work and entertainment.", q: "수면 부족이 경제에 미치는 영향은?", c: ["경제적 영향은 미미하다", "생산성 저하와 비용 증가로 막대한 손실을 초래한다", "오직 개인의 건강에만 영향을 준다", "수면은 경제와 무관하다"], a: 1, h: "잠 안 자면 돈을 잃는다! 생산성+사고+의료비 📉", t: "economy" },
    { p: "The Dunning-Kruger effect reveals that individuals with limited knowledge in a domain tend to overestimate their abilities, while experts often underestimate theirs. This cognitive bias has significant implications for decision-making in politics, business, and everyday life.", q: "더닝-크루거 효과의 핵심은?", c: ["전문가는 항상 자신감이 넘친다", "능력이 부족한 사람이 자신의 능력을 과대평가한다", "지식이 많을수록 자신감도 높다", "모든 사람이 자신을 정확히 평가한다"], a: 1, h: "모르면 모르는 줄도 모른다! 무지의 자신감 🎓", t: "society" },
    { p: "Rewilding is an ecological restoration approach that allows natural processes to resume in degraded landscapes. By reintroducing keystone species and removing artificial barriers, ecosystems can recover their complexity and resilience. This contrasts with traditional conservation, which often focuses on preserving specific species.", q: "재야생화가 전통적 보전과 다른 점은?", c: ["특정 종만 보호한다", "자연 과정의 회복에 초점을 맞춘다", "인공적 관리를 강화한다", "도시 환경에만 적용된다"], a: 1, h: "특정 종이 아니라 자연 시스템 전체를 복원! 🦅", t: "environment" },
    { p: "The mere-exposure effect, a well-documented psychological phenomenon, shows that people develop preferences for things simply because they are familiar with them. This principle underlies much of advertising strategy and explains why repeated exposure to a product increases purchase likelihood.", q: "단순 노출 효과가 광고에서 중요한 이유는?", c: ["새로운 제품이 항상 선호된다", "반복 노출이 구매 가능성을 높인다", "소비자는 항상 합리적으로 결정한다", "광고는 효과가 없다"], a: 1, h: "자주 보면 좋아진다! 광고의 핵심 원리 📺", t: "economy" },
    { p: "The impostor syndrome affects high-achieving individuals who believe their success is undeserved, attributing it to luck rather than ability. Despite evidence of competence, they live in fear of being exposed as frauds. Understanding this pattern is crucial for mental health in competitive environments.", q: "가면 증후군의 특징은?", c: ["능력이 부족한 사람들에게 나타난다", "성공한 사람이 자신의 능력을 의심하고 사기꾼처럼 느낀다", "오직 학생에게만 발생한다", "자신감이 넘치는 상태를 의미한다"], a: 1, h: "잘하면서도 '나는 가짜야' 느끼는 것! 🎭", t: "health" },
    { p: "Sunk cost fallacy is the tendency to continue investing in a failing endeavor because of what has already been spent, rather than cutting losses and moving on. This irrational behavior affects decisions from personal relationships to corporate strategy and government policy.", q: "매몰 비용 오류의 핵심은?", c: ["과거 투자를 무시하는 행동", "이미 투자한 것 때문에 실패하는 일에 계속 매달리는 것", "항상 합리적인 결정을 내리는 것", "손실을 빨리 인정하는 것"], a: 1, h: "이미 쓴 돈 때문에 더 쓰게 되는 함정! 💸", t: "economy" },
];

export const BLANK_GRAMMAR: ContentItem[] = [
    { p: "Had it not been for the timely intervention of the emergency services, the historical landmark ________ been completely destroyed by the fire.", q: "빈칸에 문법적으로 가장 알맞은 표현은?", c: ["will have", "would have", "might be", "can have"], a: 1, h: "가정법 과거완료 도치! 과거 사실의 반대를 가정 🔑", t: "society" },
    { p: "Only after the sun had fully set ________ they decide to return to camp, realizing how far they had wandered.", q: "빈칸에 들어갈 알맞은 조동사는?", c: ["do", "did", "have", "had"], a: 1, h: "Only 부사구 문두 도치! 과거이므로 did 🔦", t: "nature" },
    { p: "Were you to invest in this company now, you ________ see significant returns in the next decade.", q: "가정법 미래/도치 구문에 어울리는 표현은?", c: ["will", "would", "shall", "can"], a: 1, h: "If you were to = Were you to... 도치 가정법! 📈", t: "economy" },
    { p: "Not until the results were published ________ the scientists realize the significance of their discovery.", q: "빈칸에 알맞은 조동사는?", c: ["do", "did", "have", "will"], a: 1, h: "Not until 도치 구문! 과거 시제라 did가 필요 🔬", t: "science" },
    { p: "The more you practice, the ________ you will become at solving complex problems.", q: "빈칸에 알맞은 단어는?", c: ["good", "better", "best", "well"], a: 1, h: "The 비교급, the 비교급 구문! better가 맞아 📚", t: "education" },
    { p: "It is essential that every student ________ the exam regulations before entering the hall.", q: "빈칸에 알맞은 동사 형태는?", c: ["reads", "read", "reading", "has read"], a: 1, h: "It is essential that + 주어 + 동사 원형! 당위를 나타내는 가정법 현재 📝", t: "education" },
    { p: "________ the weather been better, we would have gone on a picnic by the river.", q: "빈칸에 알맞은 단어는?", c: ["If", "Had", "Should", "Were"], a: 1, h: "If the weather had been = Had the weather been 도치! ☀️", t: "weather" },
    { p: "The novel, ________ was written in the 19th century, continues to influence modern literature.", q: "빈칸에 알맞은 관계대명사는?", c: ["that", "which", "what", "who"], a: 1, h: "콤마 뒤에는 which! 비제한적 용법이야 📖", t: "culture" },
    { p: "________ it not for your constant support, I could never have completed this ambitious project.", q: "빈칸에 알맞은 단어는?", c: ["Had", "Were", "Should", "If"], a: 1, h: "If it were not = Were it not 현재 가정법 도치! 🤝", t: "daily_life" },
    { p: "The professor insisted that the report ________ submitted by the end of this week.", q: "빈칸에 알맞은 동사 형태는?", c: ["is", "be", "was", "will be"], a: 1, h: "insist that + 주어 + 동사 원형(be)! 요구/주장 동사 뒤 가정법 현재 📄", t: "education" },
    { p: "No sooner had the bell rung ________ the students rushed out of the classroom.", q: "빈칸에 알맞은 표현은?", c: ["when", "than", "before", "after"], a: 1, h: "No sooner had... than...! 도치 상관접속사 🔔", t: "school" },
    { p: "The package, ________ contents were fragile, was handled with extreme care.", q: "빈칸에 알맞은 관계대명사는?", c: ["which", "that", "whose", "whom"], a: 2, h: "'내용물이 ~한' 소유격이 필요! whose contents 📦", t: "daily_life" },
    { p: "Seldom ________ such a remarkable display of teamwork in professional sports.", q: "빈칸에 알맞은 표현은?", c: ["we have seen", "have we seen", "we seen", "seen we have"], a: 1, h: "Seldom 부정어 도치! have we seen이 맞아 🏅", t: "sports" },
    { p: "The suggestion that working hours ________ reduced was met with mixed reactions from the management.", q: "빈칸에 알맞은 동사 형태는?", c: ["are", "be", "were", "would be"], a: 1, h: "suggestion that + 동사 원형(be)! 제안의 가정법 현재 ⏰", t: "economy" },
    { p: "It was not until I arrived at the airport ________ I realized I had left my passport at home.", q: "빈칸에 알맞은 표현은?", c: ["when", "that", "which", "before"], a: 1, h: "It was not until... that...! 강조 구문이야 ✈️", t: "travel" },
];

export const ATTITUDE: ContentItem[] = [
    { p: "The author argues that while technology has undeniably improved our lives, society must remain vigilant against its potential to erode privacy and human connection. Progress should not come at the expense of fundamental human values.", q: "필자의 기술에 대한 태도는?", c: ["무조건적 찬성", "신중한 낙관 (조건부 수용)", "완전한 거부", "무관심"], a: 1, h: "기술은 좋지만 조심해야 한다! 조건부 긍정 ⚖️", t: "technology" },
    { p: "Critics of standardized testing often argue that it reduces education to mere memorization, failing to measure creativity, critical thinking, or emotional intelligence. However, defenders note it provides a consistent, objective measure across diverse populations.", q: "이 글의 표준화 시험에 대한 논조는?", c: ["전적으로 지지", "전적으로 반대", "양측 의견을 균형 있게 제시", "무관심적 나열"], a: 2, h: "Critics say... However, defenders note... = 양쪽 다 보여주는 균형적 관점 📊", t: "education" },
    { p: "The corporate rush toward sustainability commitments often amounts to little more than greenwashing. Genuine environmental progress requires transparent metrics, third-party verification, and a willingness to sacrifice short-term profits for long-term ecological health.", q: "기업의 친환경 행보에 대한 필자의 비판은?", c: ["전적으로 지지한다", "대부분 겉치레(그린워싱)에 불과하다", "기업만이 환경 문제를 해결할 수 있다", "수익 극대화가 최우선이다"], a: 1, h: "겉으로만 친환경! greenwashing이라고 비판 🌿", t: "environment" },
    { p: "While some view social media as a democratic tool empowering marginalized voices, others see it as a breeding ground for misinformation and polarization. The truth, as is often the case, lies somewhere in between.", q: "소셜 미디어에 대한 필자의 태도는?", c: ["완전히 긍정적", "완전히 부정적", "극단을 피하고 중립적·균형적 시각", "관심 없음"], a: 2, h: "somewhere in between = 중간 입장! 균형 잡힌 시각 📱", t: "technology" },
    { p: "The obsession with economic growth measured by GDP ignores crucial factors like environmental degradation, social inequality, and mental health. A more holistic metric is needed to truly assess a nation's well-being.", q: "GDP 중심 경제 성장에 대한 필자의 태도는?", c: ["전적으로 찬성", "회의적/비판적 (더 종합적인 지표 필요)", "경제와 무관하다고 봄", "GDP 폐지를 주장"], a: 1, h: "GDP만으로는 부족하다! 더 종합적인 척도가 필요 📊", t: "economy" },
    { p: "Traditional medicine offers wisdom accumulated over centuries, but it must be validated through rigorous scientific methodology before being integrated into modern healthcare. Dismissing it entirely is as unwise as accepting it uncritically.", q: "전통 의학에 대한 필자의 태도는?", c: ["완전한 수용", "완전한 거부", "과학적 검증을 조건으로 한 개방적 태도", "서양 의학보다 우월하다"], a: 2, h: "무조건 받아들이거나 무시하지 말고 검증 후 수용! 조건부 🌿", t: "health" },
    { p: "The author contends that arts education is not a luxury but a necessity. In an increasingly automated world, creativity and aesthetic sensitivity are among the few skills that resist replication by machines.", q: "예술 교육에 대한 필자의 태도는?", c: ["불필요한 사치", "기계로 대체 가능", "자동화 시대에 반드시 필요한 역량", "기술 교육보다 덜 중요"], a: 2, h: "예술은 사치가 아니라 필수! AI가 못하는 영역 🎨", t: "education" },
    { p: "The writer views space exploration not as a wasteful expenditure but as humanity's insurance policy. By establishing a presence beyond Earth, we protect our species against existential threats tied to a single planet.", q: "우주 탐사에 대한 필자의 태도는?", c: ["세금 낭비라고 비판", "인류를 위한 필수 투자로 옹호", "과학적 가치만 인정", "무관심"], a: 1, h: "낭비가 아니라 보험! 인류 생존을 위한 투자 🚀", t: "science" },
    { p: "Gaming is often dismissed as a mindless pastime, but research suggests it can enhance problem-solving skills, spatial awareness, and even social collaboration. The key lies in moderation and mindful selection of games.", q: "게임에 대한 필자의 태도는?", c: ["전적으로 유해", "적절히 활용하면 긍정적 효과가 있는 균형적 시각", "무조건 장려", "교육에만 유용"], a: 1, h: "mindless가 아님! 적절히 하면 좋다는 균형적 관점 🎮", t: "culture" },
    { p: "The writer argues that diversity in the workplace is not merely a moral imperative but a strategic advantage. Companies with diverse teams consistently outperform homogeneous ones in innovation and financial returns.", q: "직장 내 다양성에 대한 필자의 태도는?", c: ["불필요한 사회적 압력", "도덕적 의무이자 전략적 이점으로 적극 지지", "재무적으로 불리하다", "개인의 선택에 맡겨야 한다"], a: 1, h: "도덕+전략 두 가지 측면에서 다양성을 적극 지지! 🌈", t: "economy" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 통합 콘텐츠 풀 Export
// ═══════════════════════════════════════════════════════════════════════════════

export const CONTENT_POOL: Record<string, ContentItem[]> = {
    // 초급
    vocab: VOCAB,
    basic_grammar: BASIC_GRAMMAR,
    simple_fact: SIMPLE_FACT,
    synonym: SYNONYM,
    // 중급
    context_vocab: CONTEXT_VOCAB,
    inference: INFERENCE,
    connector: CONNECTOR,
    main_idea: MAIN_IDEA,
    purpose: PURPOSE,
    // 고급
    long_inference: LONG_INFERENCE,
    blank_grammar: BLANK_GRAMMAR,
    attitude: ATTITUDE,
};
