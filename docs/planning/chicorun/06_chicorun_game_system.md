#### 🎮 치코런 게임 확장 기획 (Word System 기반)

기존 치코런 구조를 유지하면서 다양한 게임을 확장하기 위한 **단어 기반 통합 시스템 설계**

---

# 🎯 1. 기획 목표

- AI 없이 **고정된 문제 DB 기반 게임 운영**
- 모든 게임이 **공통 단어 DB를 공유**
- **중복 방지 + 공정성 + 확장성 확보**
- 치코런의 `progressIndex` 철학 유지 (순차 + 검증 가능)

---

# 📦 2. 핵심 데이터 구조

## 2.1 words (공통 단어 DB) ✅ 필수

```
{
  wid: Number, // 단어 고유 ID (인덱싱)
  meanings: [
    {
      mid: Number, // 의미 ID (단어 내부 고유)
      en: [String], // 영어 정답 (복수 가능)
      ko: [String]  // 한글 뜻 (복수 가능)
    }
  ],
  level: Number // 난이도 (레벨 기반)
}
```

👉 단어가 아니라 **“의미 단위”로 관리 (핵심)**

👉 en/ko 모두 복수 처리 → 정답 범위 확장

---

## 2.2 wordHints (힌트/문장 DB) ✅ 필수

```
{
  _id: ObjectId,
  wid: Number,  // 단어 ID
  mid: Number,  // 의미 ID (중요)
  text: String, // 영어 설명 문장
  difficulty: Number // 힌트 난이도
}
```

👉 힌트는 **특정 의미(mid)에 종속**

---

## 2.3 questionTypes (문제 유형) ✅ 확장용

```
{
  qid: Number,
  type: String, // 내부 로직용 key
  description: String
}
```

예:

```
{qid:1,type:"typing_meaning" }
{qid:2,type:"typing_spelling" }
{qid:3,type:"hint_guess_word" }
```

👉 **문제 생성 로직을 분기하는 핵심 스위치**

---

# 🧠 3. 설계 철학

## 3.1 데이터 vs 로직 분리

| 구분 | 역할 |
| --- | --- |
| words | 정답 데이터 (의미 단위) |
| wordHints | 문제 문장 |
| qid | 문제 생성 방식 |

👉 **qid는 로직 제어용**

---

## 3.2 관계 구조

```
words (1)
  └── meanings (N)
        └── wordHints (N)
```

👉 하나의 의미에 여러 힌트 → 문제 다양성 확보

---

# 🎮 4. 게임별 구조

---

## 4.1 산성비 (Word Rain)

### 방식

- 한글 뜻 → 영어 입력

---

### 사용 데이터

```
wid + mid
```

---

### 문제 생성

- meanings 중 하나 선택
- ko 배열 중 랜덤 노출
- en 배열 기준 정답 체크

---

### 정답 체크

```
input ∈ meaning.en
```

---

### 중복 방지

```
used = [ { wid:1, mid:1 } ]
```

---

## 4.2 타이핑 배틀

### 방식

- 영어 힌트 → 단어 입력

---

### 문제 구조

```
{
  wid:1,
  mid:1,
  hintId:ObjectId,
  hint:"A fruit that is red or green"
}
```

---

### 데이터 흐름

1. wid 선택
2. meanings 선택
3. wordHints 조회 (wid + mid)
4. difficulty 필터
5. 랜덤 힌트 선택
6. 문제 생성

---

### 중복 방지

👉 기본

```
wid + mid + hintId
```

👉 추가 전략

- 최근 N개 wid 제한
- 동일 mid 연속 방지

---

# 🔁 5. 문제 생성 시스템

## 5.1 기본 구조

```
{
  qid:Number,
  wid:Number,
  mid:Number,
  hintId?:ObjectId
}
```

---

## 5.2 생성 흐름

1. 게임 시작
2. 단어 후보 조회 (level 기반)
3. meanings 포함 랜덤 선택
4. 사용된 문제 필터링
5. hint 필요 시 조회
6. 세션 저장

---

## 5.3 난이도 기반 선택 (추천)

```
wordHints.find({
  wid,
  mid,
  difficulty: { $lte:userLevel }
})
```

---

# 💾 6. 세션 스토리지 구조

```
{
  used: [
    { wid:1, mid:1, hintId:ObjectId },
    { wid:3, mid:2, hintId:ObjectId }
  ],
  expiresAt:1710000000
}
```

---

## 역할

- 의미 단위 중복 방지
- 게임 세션 유지
- TTL 기반 자동 초기화

---

# ⚠️ 7. 중복 방지 전략

| 기준 | 설명 | 사용 게임 |
| --- | --- | --- |
| wid + mid | 동일 의미 재출제 방지 | 산성비 |
| wid + mid + hintId | 완전 동일 문제 금지 | 타이핑 배틀 |
| recent wid 제한 | 단어 반복 방지 | 공통 |
| mid 연속 제한 | 의미 반복 방지 | 타이핑 배틀 |

---

# 🛡️ 8. 치팅 방지

- 문제는 서버에서 생성
- 클라이언트는 입력만 전달
- seed 기반 문제 재현 가능
- 비정상 입력 속도 감지 가능

---

# ⚙️ 9. API 설계

## 게임 시작

```
POST /game/start
```

응답:

```
{
  problems: [
    {
      wid:1,
      mid:1,
      hint:"A fruit that is red or green"
    }
  ]
}
```

---

## 게임 종료

```
POST /game/end
```

```
{
  score:Number,
  correctCount:Number
}
```

---

# 🚀 10. 확장 방향

## 추가 가능 게임

- 객관식 퀴즈
- 스펠링 입력 게임
- 반의어 게임
- 듣기 평가 (audio 확장)

---

## 확장 방법

- qid 추가
- 로직만 추가
- 기존 DB 그대로 사용

---

# ⚡ 11. 성능 & 인덱스 (중요)

```
// wordHints
{ wid:1, mid:1, difficulty:1 }

// words
{ level:1 }
```

👉 이유

- wid + mid 기반 빠른 조회
- 의미 단위 필터링 최적화

---

# 🎯 12. 핵심 요약

- 단어 DB는 하나로 통합
- **의미(mid) 단위로 문제 생성**
- en/ko 모두 복수 정답 허용
- 힌트는 의미에 종속
- qid는 문제 생성 방식 정의
- 세션 기반 중복 방지

---

# 🔥 최종 한줄

👉 **“정답은 하나가 아니라 집합이다”**
