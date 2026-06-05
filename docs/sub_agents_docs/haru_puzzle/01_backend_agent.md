# 🔌 백엔드 및 DB/보안 전담 에이전트 (Backend Agent) 작업 안내서

이 문서는 "하루퍼즐(Haru Puzzle)" 백엔드 API 설계, DB 구조 설계, 보안 검증, 배치 스케줄링 및 어드민 설계를 담당하는 에이전트를 위한 최종 개발 명세서입니다. 본 문서의 내용을 기준으로 백엔드 구현을 단독 완성할 수 있어야 하므로 모든 상세 기획 항목이 기재되어 있습니다.

---

## 1. 기술 스택 및 프로젝트 구조

### 기술 스택
- **Runtime & Framework**: Node.js, Express
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Token), 기존 카카오 로그인 세션 연동
- **Caching/Tokens (Optional)**: MongoDB Session/TTL (Redis 미사용 시 MongoDB TTL 컬렉션 대체 가능)

### 백엔드 폴더 구조
```
backend
│
├─ config
│   ├─ db.js          # MongoDB 연결 설정
│   └─ jwt.js          # JWT 발급 및 서명 환경 설정
│
├─ models
│   ├─ User.js             # 사용자 스키마
│   ├─ Puzzle.js           # 퍼즐 목록 스키마
│   ├─ PuzzleResult.js     # 최종 완료 랭킹 기록 스키마
│   ├─ PuzzleProgress.js   # 실시간 진행 상황 스키마
│   ├─ ChallengeToken.js   # 챌린지 시작 시 1회용 토큰 스키마
│   └─ AdminLog.js         # 관리자 이력 로그 스키마
│
├─ controllers
│   ├─ puzzleController.js
│   ├─ rankingController.js
│   ├─ progressController.js
│   ├─ userController.js
│   └─ adminController.js
│
├─ routes
│   ├─ puzzleRoutes.js
│   ├─ rankingRoutes.js
│   ├─ progressRoutes.js
│   ├─ userRoutes.js
│   └─ adminRoutes.js
│
├─ middleware
│   ├─ auth.js             # 일반 사용자 JWT 검증 미들웨어
│   ├─ adminAuth.js        # ADMIN 권한 검증 미들웨어
│   └─ verifyChallenge.js  # 챌린지 토큰 및 치팅 방지 미들웨어
│
└─ app.js                  # Express 서버 인스턴스 초기화 및 로드
```

---

## 2. MongoDB 컬렉션 스키마 및 인덱스 설계

Mongoose 스키마 정의 시 다음 구조를 정확하게 구현해야 합니다.

### (1) `users`
기존 하루 서비스의 카카오 로그인 연동 정보를 식별 및 활용합니다.
```javascript
{
  _id: ObjectId,
  kakaoId: { type: String, required: true, unique: true }, // 카카오 고유 ID (UNIQUE 인덱스)
  nickname: { type: String, required: true },              // 카카오 닉네임 그대로 사용
  profileImage: { type: String, default: "" },             // 카카오 프로필 이미지 URL
  role: { type: String, enum: ["user", "admin"], default: "user" }, // 권한 정보
  createdAt: { type: Date, default: Date.now }
}
```
* **인덱스**: `kakaoId: 1` (Unique)

### (2) `puzzles`
매주 월요일 활성화되는 퍼즐 데이터와 지난 주차 아카이브 퍼즐 목록을 담고 있습니다.
```javascript
{
  _id: ObjectId,
  week: { type: Number, required: true, unique: true },     // 주차 넘버 (예: 24, UNIQUE 인덱스)
  title: { type: String, required: true },                 // 퍼즐 제목 (예: "숲속의 오두막")
  imageUrl: { type: String, required: true },              // 홈서버 또는 클라우드 스토리지 이미지 경로
  startDate: { type: Date, required: true },               // 퍼즐 활성화 시작 시각 (월요일 00:00:00 KST)
  endDate: { type: Date, required: true },                 // 퍼즐 활성화 종료 시각 (일요일 23:59:59 KST)
  participantCount: { type: Number, default: 0 },          // 기록 저장 완료 유저 수 (참여자 수)
  archived: { type: Boolean, default: false }              // 지난 주차 퍼즐 여부
}
```
* **인덱스**: `week: 1` (Unique), `archived: 1`

### (3) `puzzle_results`
완료한 퍼즐의 공식 랭킹 및 개인 히스토리 보관을 위한 컬렉션입니다.
```javascript
{
  _id: ObjectId,
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  puzzleId: { type: Schema.Types.ObjectId, ref: 'Puzzle', required: true },
  mode: { type: String, enum: ["solo", "ranked"], required: true }, // ranked(주간대회) / solo(혼자하기)
  difficulty: { type: String, enum: ["beginner", "expert"], required: true }, // beginner(100조각) / expert(256조각)
  completionTime: { type: Number, required: true },        // 소요 시간 (초 단위 정수)
  challengeToken: { type: String, required: true },        // 사용된 검증용 1회성 UUID 토큰
  startedAt: { type: Date, required: true },               // 퍼즐 플레이 시작 일시
  completedAt: { type: Date, required: true },             // 퍼즐 플레이 종료/완성 일시
  savedAt: { type: Date, default: Date.now },              // 기록이 DB에 최종 저장된 시각
  completed: { type: Boolean, default: true }
}
```
* **인덱스**:
  - `puzzleId: 1, userId: 1`
  - `puzzleId: 1, completionTime: 1, savedAt: 1` (랭킹 조회용 초고속 정렬 인덱스)

### (4) `puzzle_progress`
로그인 유저가 플레이 중 이탈하더라도 다른 디바이스나 시점에 복원해 플레이할 수 있도록 진행률 및 플레이 시간을 동기화합니다.
```javascript
{
  _id: ObjectId,
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  puzzleId: { type: Schema.Types.ObjectId, ref: 'Puzzle', required: true },
  progress: { type: Number, required: true, min: 0, max: 100 }, // 퍼즐 완성 진행률 (%)
  lastPlayedAt: { type: Date, default: Date.now }
}
```
* **인덱스**: `userId: 1, puzzleId: 1` (Unique 복합 인덱스)

### (5) `challenge_tokens`
보안 및 기록 위조 차단을 목적으로 클라이언트의 퍼즐 시작 시점에 발급하는 1회용 티켓 스키마입니다. TTL(Time-To-Live)을 걸어 자동 소멸하도록 처리합니다.
```javascript
{
  _id: ObjectId,
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  puzzleId: { type: Schema.Types.ObjectId, ref: 'Puzzle', required: true },
  token: { type: String, required: true, unique: true },    // UUID v4 문자열
  issuedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },               // 발급 후 24시간 시점 (TTL 대상)
  used: { type: Boolean, default: false }                  // 사용 여부 (1회성 검증)
}
```
* **인덱스**: `token: 1` (Unique), `expiresAt: 1` (Mongoose schema TTL Index: `{ expireAfterSeconds: 0 }` 설정)

### (6) `admin_logs`
운영자가 퍼즐 관리, 비정상 랭킹 삭제 등을 수행한 기록을 영구 로깅합니다.
```javascript
{
  _id: ObjectId,
  adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },                // "CREATE_PUZZLE", "DELETE_RESULT", "BAN_USER", "UPDATE_PUZZLE"
  targetId: { type: Schema.Types.ObjectId },               // 조작 대상 레코드의 ID (Puzzle ID 또는 Result ID)
  details: { type: String, default: "" },                  // 비고 및 상세 내용
  createdAt: { type: Date, default: Date.now }
}
```

---

## 3. 상세 API 엔드포인트 설계서

### (1) 퍼즐(Puzzle) 관련 API

#### 1) 현재 활성화된 주간 퍼즐 조회
* **HTTP Method & Path**: `GET /api/puzzles/current`
* **인증 여부**: 비인증 가능
* **성공 응답 (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "60d5ec4b1234567890abcdef",
    "week": 24,
    "title": "숲속의 오두막",
    "imageUrl": "https://storage.haru.site/puzzles/week24.png",
    "startDate": "2026-06-01T00:00:00.000Z",
    "endDate": "2026-06-07T23:59:59.000Z",
    "participantCount": 1284
  }
}
```

#### 2) 아카이브 퍼즐 목록 조회
* **HTTP Method & Path**: `GET /api/puzzles/archive`
* **인증 여부**: 비인증 가능
* **성공 응답 (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "60d5ec4b1234567890abcde1",
      "week": 23,
      "title": "봄날의 고양이",
      "imageUrl": "https://storage.haru.site/puzzles/week23.png",
      "startDate": "2026-05-25T00:00:00.000Z",
      "endDate": "2026-05-31T23:59:59.000Z",
      "participantCount": 948,
      "archived": true
    }
  ]
}
```

#### 3) 특정 퍼즐 상세 조회
* **HTTP Method & Path**: `GET /api/puzzles/:id`
* **인증 여부**: 비인증 가능
* **성공 응답 (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "60d5ec4b1234567890abcde1",
    "week": 23,
    "title": "봄날의 고양이",
    "imageUrl": "https://storage.haru.site/puzzles/week23.png",
    "participantCount": 948,
    "archived": true
  }
}
```

---

### (2) 챌린지 및 보안 API

#### 1) 챌린지 시작 토큰 발급
* **HTTP Method & Path**: `POST /api/challenge/start`
* **인증 여부**: **JWT 인증 필수** (Authorization Header: `Bearer <JWT_TOKEN>`)
* **요청 바디**:
```json
{
  "puzzleId": "60d5ec4b1234567890abcdef"
}
```
* **성공 응답 (201 Created)**:
```json
{
  "success": true,
  "challengeToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### (3) 기록 저장 및 실시간 진행률 API

#### 1) 실시간 진행률 서버 저장 (이탈 대비 백업)
* **HTTP Method & Path**: `POST /api/progress`
* **인증 여부**: **JWT 인증 필수**
* **요청 바디**:
```json
{
  "puzzleId": "60d5ec4b1234567890abcdef",
  "progress": 72
}
```
* **성공 응답 (200 OK)**:
```json
{
  "success": true,
  "message": "Progress synchronized successfully"
}
```

#### 2) 최종 완료 랭킹 기록 저장 (치팅 검증 수반)
* **HTTP Method & Path**: `POST /api/results`
* **인증 여부**: **JWT 인증 필수**
* **요청 바디**:
```json
{
  "puzzleId": "60d5ec4b1234567890abcdef",
  "mode": "ranked",
  "difficulty": "beginner",
  "challengeToken": "550e8400-e29b-41d4-a716-446655440000",
  "startedAt": "2026-06-01T00:00:00.000Z",
  "completedAt": "2026-06-01T00:05:12.000Z",
  "completionTime": 312
}
```
* **성공 응답 (201 Created)**:
```json
{
  "success": true,
  "message": "Result verified and recorded in ranking",
  "data": {
    "resultId": "60d5ec4b1234567890abc999",
    "completionTime": 312,
    "savedAt": "2026-06-01T00:05:13.000Z"
  }
}
```
* **검증 실패 응답 예시 (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Invalid challenge token or speedhack pattern detected"
}
```

---

### (4) 랭킹 및 마이페이지 API

#### 1) 현재 주간 퍼즐의 전체 랭킹 조회
* **HTTP Method & Path**: `GET /api/rankings/current`
* **인증 여부**: 비인증 가능
* **성공 응답 (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "nickname": "코딩하는고양이",
      "profileImage": "https://...",
      "completionTime": 142,
      "savedAt": "2026-06-01T02:15:30.000Z"
    },
    {
      "rank": 2,
      "nickname": "하루마스터",
      "profileImage": "https://...",
      "completionTime": 195,
      "savedAt": "2026-06-01T01:05:10.000Z"
    }
  ]
}
```

#### 2) 내 최고 기록 및 현재 랭킹 순위 조회
* **HTTP Method & Path**: `GET /api/rankings/me?puzzleId=60d5ec4b1234567890abcdef`
* **인증 여부**: **JWT 인증 필수**
* **성공 응답 (200 OK)**:
```json
{
  "success": true,
  "data": {
    "myRank": 21,
    "nickname": "사용자닉네임",
    "completionTime": 312,
    "totalParticipants": 1284,
    "topPercent": 1.63
  }
}
```

#### 3) 마이페이지 프로필 및 플레이 이력 히스토리 전체 조회
* **HTTP Method & Path**: `GET /api/users/me`
* **인증 여부**: **JWT 인증 필수**
* **성공 응답 (200 OK)**:
```json
{
  "success": true,
  "data": {
    "profile": {
      "nickname": "카카오닉네임",
      "profileImage": "https://...",
      "createdAt": "2026-05-26T00:00:00.000Z"
    },
    "statistics": {
      "totalCompleted": 8,
      "bestTimeBeginner": 215,
      "bestRank": 3
    },
    "history": [
      {
        "puzzleId": "60d5ec4b1234567890abcde1",
        "title": "봄날의 고양이",
        "imageUrl": "https://...",
        "difficulty": "beginner",
        "completionTime": 215,
        "savedAt": "2026-05-27T10:11:12.000Z",
        "completed": true
      }
    ]
  }
}
```

#### 4) 회원 계정 탈퇴 (CASCADE 일괄 삭제)
* **HTTP Method & Path**: `DELETE /api/users/me`
* **인증 여부**: **JWT 인증 필수**
* **성공 응답 (200 OK)**:
```json
{
  "success": true,
  "message": "User account and all associated puzzle history successfully deleted."
}
```

---

## 4. 핵심 서버 검증 및 치팅 방지 로직 (치명적 중요)

`POST /api/results` 라우트로 넘어오는 랭킹 저장 요청은 서버에서 다음 단계를 정확하게 하나도 빠짐없이 검증해야 합니다.

1. **JWT 인증 확인**:
   - `req.headers.authorization`에서 `Bearer <token>` 구조를 분리해 JWT 유효성을 검증하고 `req.user` 데이터를 추출합니다.
2. **Challenge Token 유효성 검증**:
   - 요청에 포함된 `challengeToken`을 DB의 `challenge_tokens` 컬렉션에서 `token` 필드로 단일 검색합니다.
   - 검색된 토큰의 `used`가 `true`이거나, `expiresAt` 시점이 지나 만료되었거나, 현재 `userId` 또는 `puzzleId`와 다른 경우 `403 Forbidden` 처리합니다.
   - **1회성 폐기 처리**: 유효함이 확인되면 즉시 해당 토큰 레코드의 `used` 상태를 `true`로 저장(`challenge_tokens.updateOne({ token }, { $set: { used: true } })`)하여 다중 제출 시도를 원천 차단합니다.
3. **플레이 경과 시간 무결성 검증**:
   - 요청 바디의 `completedAt`과 `startedAt` 데이터의 밀리초 차이를 초 단위로 환산한 값 (`(completedAt - startedAt) / 1000`)이 제출된 `completionTime` 값과 오차범위 1~2초 이내로 일치하는지 비교 검증합니다. 불일치할 시 차단합니다.
4. **비정상 기록 자동 필터링 (스피드핵 차단 정책)**:
   - 100조각의 Beginner 직소퍼즐을 사람이 정상적인 UI 입력 드래그를 통해 고정하는 시간은 최소 30초 이상이 소요됩니다.
   - 따라서 **`completionTime < 30` (30초 미만)의 결과물은 검증 통과를 거부**하고 치팅 시도로 간주해 자동 차단합니다.
5. **난이도 및 활성화 상태 검증**:
   - 랭킹 경쟁 모드(`mode === "ranked"`)의 경우, 오직 난이도가 `beginner`인 경우에만 랭킹 삽입을 인정합니다.
   - 현재 시각이 퍼즐의 활성 기간(`startDate` ~ `endDate`) 이내인지 대조하고, 기한이 만료된 퍼즐은 아카이브 상태로 간주하여 랭킹 기록 저장에서 배제합니다. (아카이브 퍼즐은 랭킹 삽입을 차단하고 힐링 플레이 이력 보관만 허용)

---

## 5. 관리자(Admin) 시스템 설계

운영 편의성 및 데이터 관리용 API 및 로깅 처리 설계 명세입니다.

### (1) 관리자 인증 미들웨어 (`adminAuth.js`)
- `auth.js` 미들웨어 통과 후, 유저 데이터의 `role` 필드가 `admin`인지 추가 확인합니다. `admin`이 아닐 시 `403 Forbidden` 응답을 반환합니다.

### (2) 어드민 전용 API 명세
* **신규 퍼즐 등록**: `POST /api/admin/puzzles`
  - 요청 바디: `{ week, title, imageUrl, startDate, endDate }`
  - 처리: 신규 퍼즐 데이터를 생성하고 `admin_logs`에 작업 로그 생성.
* **퍼즐 정보 수정**: `PUT /api/admin/puzzles/:id`
  - 요청 바디: `{ title, imageUrl, startDate, endDate }`
* **특정 퍼즐 수동 아카이브 처리**: `PATCH /api/admin/puzzles/:id/archive`
  - 요청 바디: `{ archived: true }`
* **비정상/치팅 유저 랭킹 기록 삭제**: `DELETE /api/admin/results/:id`
  - 처리: `puzzle_results`에서 해당 기록 식별 후 삭제. 해당 퍼즐의 `puzzles.participantCount`를 `1` 감소시킵니다.
* **전체 사용자 가입 현황 및 정보 조회**: `GET /api/admin/users`

---

## 6. 스케줄링 배치 작업 (Cron) 설계

Express 서버 초기화 또는 별도의 스케줄러 라이브러리(`node-cron` 등)를 로드하여 다음 백그라운드 작업을 실행합니다.

### (1) 주간 퍼즐 교체 자동화 (매주 월요일 00:00:00 KST)
- **Cron Expression**: `0 0 0 * * 1` (KST 기준 동작 보장)
- **수행 로직**:
  1. 현재 활성화되어 있던 (즉, `endDate`가 방금 지난) 퍼즐 데이터를 찾아 `archived = true`로 필드를 일괄 업데이트합니다.
  2. 오늘 날짜가 시작일에 속하는 신규 등록 퍼즐(`week` 정보 일치 또는 시작일 조건 일치)을 스캔하여 `archived = false`로 활성화합니다.
  3. 활성화되는 새 퍼즐의 `participantCount` 카운터를 `0`으로 명시적 초기화합니다.
  4. 새로운 주간 랭킹 경쟁 이벤트 테이블을 열어 사용자 제출 준비 상태를 완료합니다.

### (2) 진행률 데이터베이스 주기적 최적화 (선택적 구현)
- **주기**: 매월 1일 03:00:00
- **수행 로직**:
  - `puzzle_progress` 데이터 중 최근 플레이 일자(`lastPlayedAt`)로부터 **90일 이상 경과**한 로그인 유저의 불필요 진행 정보들을 삭제하여 DB 용량 및 캐시 부하를 방지합니다.

---

## 7. MVP 개발 우선순위 가이드

백엔드 서브에이전트가 코드를 단계적으로 배포/마일스톤을 검증할 수 있도록 설계된 중요도 등급입니다.

1. **1순위 (핵심 기능)**: `User` 및 `Puzzle` 스키마 구축, `GET /api/puzzles/current` API 구현, `POST /api/results`의 치팅 방지 필터를 제외한 기본 기록 저장 및 `GET /api/rankings/current` 랭킹 조회.
2. **2순위 (보안 및 게스트 대응)**: `challenge_tokens` DB 모델링 및 1회성 토큰 발급 API, 결과 저장 시 챌린지 검증 및 시간/30초 스피드핵 차단 로직 구현, IndexedDB 백업을 위한 `POST /api/progress` 진행 데이터 저장.
3. **3순위 (운영 및 아카이브)**: 매주 월요일 00:00 자동 퍼즐 교체용 배치 크론 스크립트 작성, `GET /api/puzzles/archive` 과거 이력 조회, 마이페이지 히스토리 및 `DELETE /api/users/me` 회원 탈퇴 프로세스 연동.
4. **4순위 (어드민 및 디테일)**: 어드민 CRUD 컨트롤러 및 미들웨어 적용, `admin_logs` 이력 기록 시스템 연동.
