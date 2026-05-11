# 너잘알 기획 개요

## 1. 서비스 개요

### 서비스명
- 너잘알

### 한 줄 소개
“내가 생각한 너의 답변이랑 진짜 답변이 얼마나 다를까?”
친구의 반응을 예상해 질문을 만들고, 상대가 실제 답변을 입력하면 예상과 현실 차이를 비교하며 웃는 카카오톡 공유형 관계 놀이 콘텐츠.

### 핵심 컨셉
너잘알은:
- 심리 테스트 ❌
- 정답 게임 ❌

핵심은:
- 친구 반응 구경
- 예상 실패
- 의외성
- 단톡 밈화
- 웃김

### 핵심 특징
- 로그인 없이 사용 가능
- 모바일 최적화
- 카카오톡 공유 중심
- 친구/커플/단톡 가능
- 빠른 참여 구조
- 결과 이미지 저장 및 재공유 가능

### 디자인 방향
예쁜 감성 ❌

대신:
- 병맛
- 러프함
- 인터넷 밈
- 친구 놀리는 느낌
- 일부러 허접한 감성
위주로 간다.

---

## 2. 페이지별 UI/UX

### 메인 페이지 (`/u-know`)
**목표:** “이거 단톡에 던지면 재밌겠다” 느낌 즉시 전달.
- **요소:** 삐뚤어진 카드 UI, 말풍선 스타일, 과장된 버튼, 짧고 강한 애니메이션
- **CTA 예시:** 친구 긁으러 가기, 카톡으로 던지기

### 질문 생성 (`/u-know/create`)
**방식:**
- 질문 직접 입력
- 예상 답변 직접 입력
- 선택형 없음
- **placeholder 예시:** “내가 새벽 4시에 전화하면?” / “분명 욕할 듯”

**UX 포인트:**
- 입력창 placeholder 랜덤 변경
- 입력 완료 시 병맛 리액션
- 카드 추가 시 툭 떨어지는 효과

**TTL 안내:**
> “서버비 아까우니까 결과는 3일 뒤 삭제됨”

### 공유 페이지 (`/u-know/share/:id`)
**목적:** 카카오톡 공유 극대화.
- **버튼 예시:** 단톡방 폭격하기, 친구 긁으러 가기

### 친구 참여 (`/u-know/play/:token`)
**핵심:**
- 로그인 ❌, 회원가입 ❌, 긴 설명 ❌
- 즉시 답변 입력 구조.

**UX:**
- 답변 직접 입력
- 입력 시 가벼운 shake 효과
- 병맛 리액션 텍스트 노출

### 결과 페이지 (`/u-know/result/:id`)
**핵심:** 점수 시스템 없음. “예상 답변” → 카드 뒤집기 → “실제 답변” 구조로 비교 재미 제공.
- **연출:** CSS 3D 카드 뒤집기, 과한 애니메이션 금지, 짧고 임팩트 있게
- **리액션 예시:** “생각보다 모르네”, “이 정도면 타인”, “친구 계속 해도 되겠다”

---

## 3. 프론트엔드 기획

- **기술 스택:** React, CRA 또는 Vite, React Router, Axios
- **애니메이션:** Framer Motion 중심, GSAP 일부 사용, Three.js 거의 사용 안 함
- **모바일 전략:** 모바일 퍼스트 (세로 UX, 큰 입력창, 큰 버튼, 짧은 동선, 앱 같은 느낌)
- **디자인 키워드:** 병맛, 인터넷 밈, 러프함, 친구 놀리기, 괴상함
- **성능 최적화:** route split, lazy loading, motion 최소화, 모바일 GPU 고려

---

## 4. 백엔드 기획

- **기술 스택:** Node.js, Express, MongoDB, Mongoose
- **핵심 API:**
  - `POST /api/u-know/create`
  - `POST /api/u-know/submit`
  - `GET /api/u-know/result/:id`
- **정책:** 로그인 없이 사용 가능, 모든 데이터 3일 후 삭제, MongoDB TTL Index 사용

---

## 5. 서버 보안 및 공격 방어

- **Cloudflare 적용:** DDoS 방어, Bot 차단, WAF, Rate Limit, 악성 IP 차단
- **Express Rate Limit:**
  - 생성 API: 1분 5회, 1시간 20회, 하루 50회
  - 답변 API: 1분 15회, 1시간 100회
  - 결과 조회: 1분 60회
- **추가 방어:** fingerprintjs 기반 제한, CAPTCHA(Cloudflare Turnstile), 비정상 요청 탐지, payload 길이 제한, 질문 최대 10개 제한
- **링크 보안:** 증가형 ID 금지. nanoid 또는 uuid 기반 랜덤 token 사용.

---

## 6. DB 기획 (MongoDB)

**tests 컬렉션**
```json
{
  "_id": "ObjectId",
  "token": "String",
  "questions": [
    {
      "question": "String",
      "predictedAnswer": "String"
    }
  ],
  "security": {
    "fingerprintHash": "String",
    "ipHash": "String"
  },
  "createdAt": "Date",
  "expiresAt": "Date (TTL)"
}
```

**responses 컬렉션**
```json
{
  "_id": "ObjectId",
  "testId": "ObjectId",
  "responderName": "String",
  "answers": [
    {
      "questionIndex": "Number",
      "actualAnswer": "String"
    }
  ],
  "security": {
    "fingerprintHash": "String",
    "ipHash": "String"
  },
  "createdAt": "Date"
}
```

**rateLimits 컬렉션 (선택)**
```json
{
  "fingerprintHash": "String",
  "ipHash": "String",
  "route": "String",
  "requestCount": "Number",
  "blockedUntil": "Date"
}
```

---

## 7. 최종 방향성
너잘알은 친구를 분석하는 서비스가 아니라, 친구의 예상 밖 답변을 구경하면서 “아 얘 진짜 웃기네” 하고 즐기는 카카오톡 기반 병맛 관계형 놀이 콘텐츠다.
