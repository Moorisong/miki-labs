# System Agent: 자아탐험 (구 HTSM) Backend

## 문서 위치
`docs/sub_agents_docs/how_they_see_me/02_backend_agent.md`

## 개요
자아탐험의 서버 로직과 API를 담당하는 백엔드 에이전트입니다.
안정적인 서비스 운영을 위해 Rate Limit, 보안 검증(Proof Token), 중복 응답 방지를 철저히 수행하며, Johari Window 계산 로직을 제공합니다.

## 역할 및 책임 (R&R)
1. **API 구현**: RESTful API 엔드포인트(생성, 응답, 조회) 개발
2. **데이터 모델링**: MongoDB 스키마 설계 (`JohariTest`, `JohariAnswer`)
3. **핵심 로직**:
    - **테스트 생성**: Proof Token 검증, shareId 생성
    - **친구 응답**: 중복 검사 (Fingerprint), 데이터 처리
    - **결과 계산**: Johari Window 4개 영역(Open, Blind, Hidden, Unknown) 데이터 가공
4. **보안/안정성**: Rate Limit, IP 차단, 봇 방지, 자동 삭제(TTL)

## 기술 스택
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB (Mongoose)
- **Security**: Helmet, Rate Limit, CORS, Crypto (Hash)
- **Utils**: UUID, Nanoid (ShareID 용)

---

## 구현 단계 (Step-by-Step)

### Step 1: 기본 설정 및 스키마 정의
- **환경 설정**: `.env` (MONGO_URI, PORT 등)
- **Mongoose Schema**:
    - `JohariTestSchema`: `shareId`(Index, Unique), `selfKeywords`(Array), `answerCount`(Default 0), `isClosed`(Boolean), `createdAt`(Date, TTL 30일)
    - `JohariAnswerSchema`: `testId`(Ref), `keywords`(Array), `fingerprintHash`(String, Index), `createdAt`(Date)
- **미들웨어**:
    - `helmet()` 적용
    - `cors()` 설정 (Whitelist 도메인만 허용)

### Step 2: Rate Limit & Proof Token
- **Rate Limit (`express-rate-limit`)**:
    - `createLimiter`: IP당 5회/분, 30회/시 (테스트 생성)
    - `answerLimiter`: IP당 5회/10초 (응답 제출)
    - `viewLimiter`: IP당 60회/분 (결과 조회)
- **Proof Token API (`GET /api/htsm/proof-token`)**:
    - 요청 시 랜덤 토큰(UUID) 발급 -> 메모리(Map) 또는 Redis에 저장 (TTL 10분)
    - 생성 API 호출 시 `header` 또는 `body`로 제출받아 검증 후 삭제 (1회용)

### Step 3: 테스트 생성 API (`POST /api/htsm/tests`)
- **Input**: `{ selfKeywords: ["A", "B", "C"], proofToken: "..." }`
- **Logic**:
    1. **Proof Token 검증**: 유효하지 않으면 403 Forbidden
    2. **로그인 검증**: `userId`(Kakao ID) 필수
    3. **생성 제한**: 하루 최대 5개 생성 가능 (초과 시 429)
    4. **Whitelist 검증**: `selfKeywords`가 서버 정의 리스트에 포함되는지 확인
    5. **ShareId 생성**: `nanoid` (10자)
    6. **DB 저장**: `JohariTest` 문서 생성 (`userId`, `createdIp`, `createdUserAgent` 저장)
- **Output**: `{ shareId: "..." }`

### Step 4: 친구 응답 API (`POST /api/htsm/answers`)
- **Input**: `{ shareId: "...", keywords: ["D", "E", "F"], fingerprintHash: "..." }`
- **Logic**:
    1. **Test 조회**: 존재 여부 및 `isClosed` 확인 (닫혀있으면 403)
    2. **중복 검사 (현실적 차단)**:
        - `fingerprintHash`가 해당 `testId`의 `JohariAnswer`에 이미 존재 시 차단
        - 동일 IP + `testId` 조합 2회 이상 시 차단
    3. **Rate Limit**: 10초 내 5회 초과 요청 거부
    3. **저장 및 업데이트**:
        - `JohariAnswer` 저장
        - `JohariTest.answerCount` 증가 ($inc)
        - `answerCount` >= 10 이면 `isClosed: true` 설정
- **Output**: `{ success: true, isClosed: boolean }`

### Step 5: 결과 조회 및 Johari 로직 (`GET /api/htsm/result/[id]`)
- **Input**: `shareId`
- **Logic**:
    1. **Test & Answers 조회**: `JohariTest`와 연관된 `JohariAnswer` 목록 가져오기
    2. **Johari 계산**:
        - **Total Set**: `selfKeywords` + `allAnswerKeywords`
        - **Open**: Self ∩ Friend (나도 알고, 남도 앎)
        - **Blind**: Friend - Self (나는 모르는데, 남은 앎)
        - **Hidden**: Self - Friend (나만 알고, 남은 모름)
        - **Unknown**: 전체 키워드 풀 - Total Set (나도 모르고, 남도 모름)
    3. **데이터 가공 & Description 생성**:
        - 각 영역별 상위 키워드 추출
        - `description-generator` 유틸을 사용하여 결과 텍스트 생성 (Template Engine)
        - 참여율(`participationPercent`), 남은 친구 수(`friendsNeeded`) 계산
        - 카드 렌더링용 데이터(`cards`) 배열 구성
- **Output**:
    ```json
    {
      "answerCount": 5,
      "isClosed": false,
      "participationPercent": 60,
      "friendsNeeded": 0,
      "cards": [
        {
          "title": "개방된 자아",
          "area": "open",
          "theme": "green",
          "keywords": ["A", "B"],
          "description": "사람들이 당신을 볼 때..."
        },
        // ... (4개 영역)
      ],
      "johari": { ... } // (레거시 또는 디버깅용 유지)
    }
    ```

### Step 6: 보안 및 예외 처리
- **Validation**:
    - `shareId`: 정규식 검사 (알파뉴메릭)
    - `keywords`: 배열 길이(3), 문자열 타입 확인
    - `fingerprintHash`: 길이 제한 (최대 200자)
- **Error Handling**:
    - DB 연결 실패, 중복 키 오류 등 적절한 HTTP 상태 코드 및 메시지 반환
- **Logging**: 주요 이벤트(생성, 응답, 조회) 로그 기록 (console or winston)

---

## 데이터베이스 (MongoDB)
- **Database Name**: `htsm` (권장 - 기존 DB와 분리 또는 prefix 사용)
- **Collections**: `johari_tests`, `johari_answers`
- **Indexes**:
    - `johari_tests`: `{ shareId: 1 }` (Unique), `{ createdAt: 1 }` (TTL)
    - `johari_answers`: `{ testId: 1 }`, `{ fingerprintHash: 1 }`, `{ createdAt: 1 }` (TTL)
