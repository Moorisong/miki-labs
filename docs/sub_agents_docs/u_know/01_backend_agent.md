# 백엔드 전담 에이전트 (Backend Agent) 작업 안내서

이 문서는 "너잘알" 백엔드 및 DB 구조 설계를 담당하는 에이전트를 위한 문서입니다.

## 🎯 목표
Node.js, Express, MongoDB를 사용하여 로그인 없이 동작하는 안정적인 API와 강력한 보안(Rate Limit 등)을 구현합니다.

## 🛠 주요 작업 범위

### 1. API 엔드포인트 구현
- **`POST /api/u-know/create`**
  - 질문 셋 생성 (최대 10개)
  - `nanoid` 또는 `uuid` 기반의 랜덤 `token` 발급 (증가형 ID 절대 금지)
- **`POST /api/u-know/submit`**
  - 답변 제출
  - 테스트 1회당 1번의 응답만 허용하거나 관련된 로직 처리
- **`GET /api/u-know/result/:id`**
  - 생성된 질문 및 실제 답변 매칭 데이터 반환

### 2. 보안 및 방어 로직 (Express)
- 로그인 및 회원가입이 없으므로 남용 방지를 위한 제한 필수.
- **Rate Limit 정책:**
  - 생성 API: 1분 5회, 1시간 20회, 하루 50회
  - 답변 API: 1분 15회, 1시간 100회
  - 결과 조회: 1분 60회
- **추가 보안 로직:**
  - `fingerprintjs` 해시 검증 및 IP 기반 속도 제한
  - 페이로드(Payload) 길이 제한
  - (옵션) Cloudflare Turnstile 검증 엔드포인트

### 3. 데이터베이스 (MongoDB & Mongoose)
모든 데이터는 생성 후 3일 뒤 삭제되도록 **TTL(Time-To-Live) Index**를 반드시 적용해야 합니다.

**`tests` 컬렉션**
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

**`responses` 컬렉션**
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

**`rateLimits` 컬렉션 (선택)**
```json
{
  "fingerprintHash": "String",
  "ipHash": "String",
  "route": "String",
  "requestCount": "Number",
  "blockedUntil": "Date"
}
```

## 💡 개발 시 주의사항
- 프론트엔드가 아직 완성되지 않았으므로 Postman이나 cURL로 테스트할 수 있도록 응답을 명확한 JSON으로 반환하세요.
- 데이터 보안과 서버 안정성(디도스 방어 로직)이 제일 중요합니다.
