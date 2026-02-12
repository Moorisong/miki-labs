# HowTheySeeMe (HTSM) Backend & Security Planning - Part 2

## 1. 기술 스택

- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB (Mongoose)
- **Features**: 개인정보 저장 없음, 로그인 없음, 익명 참여

## 2. 서버 목적 및 구조

프론트엔드에서 필요한 최소 기능만 제공하며, 테스트 생성, 친구 응답 저장, 결과 계산, 중복 방지가 핵심이다.

### 폴더 구조 (Server)
- `config/`: DB 연결 등 설정
- `models/`: Mongoose 모델 정의
- `routes/`: API 라우터
- `controllers/`: 비즈니스 로직
- `utils/`: 공통 유틸리티
- `app.js`: Entry Point

## 3. MongoDB 컬렉션 설계

### 3.1 johari_tests
- `shareId` (String, Unique): 외부 공유용 고유 키
- `selfKeywords` (Array of Strings): 본인이 선택한 3개 키워드
- `answerCount` (Number, Default 0): 현재 응답 수
- `isClosed` (Boolean, Default false): 10명 도달 시 True
- `createdAt`: 생성 일시 (TTL 인덱스 활용 가능)

### 3.2 johari_answers
- `testId` (ObjectId, Ref: johari_tests): 테스트 문서 참조
- `keywords` (Array of Strings): 친구가 선택한 3개 키워드
- `fingerprintHash` (String): 중복 응답 방지용 해시
- `createdAt`: 생성 일시

### 3.3 johari_stats (Optional)
- `keyword`: 키워드
- `count`: 선택된 횟수

## 4. 로직 및 알고리즘

### 4.1 중복 응답 방지 (3중 체크)
1. **FingerprintHash**: 브라우저 정보 기반 해시 중복 검사
2. **IP + TestID**: 동일 IP에서 같은 테스트에 중복 응답 불가
3. **UserAgent + TestID**: 동일 UserAgent로 같은 테스트에 중복 응답 불가

### 4.2 Johari Window 계산 로직
- **Open**: 본인 선택 & 친구 선택 모두 존재
- **Blind**: 친구 선택만 존재
- **Hidden**: 본인 선택만 존재
- **Unknown**: 어디에도 선택되지 않음
- 각 영역별 상위 3개 키워드 추출 및 비율 계산

### 4.3 테스트 종료
- `answerCount`가 10에 도달하면 `isClosed`를 true로 변경하고 추가 응답(`POST /answers`)을 차단한다.
- 결과 조회(`GET /result`)는 계속 가능하다.

## 5. API 설계

### 5.1 테스트 생성 (POST /api/tests)
- **Input**: `selfKeywords` (3개), `proofToken`
- **Logic**: Proof Token 검증 -> shareId 생성 -> DB 저장
- **Output**: `shareId`

### 5.2 친구 응답 제출 (POST /api/answers)
- **Input**: `shareId`, `keywords` (3개), `fingerprintHash`
- **Logic**: 테스트 존재/종료 여부 확인 -> 중복 검사 -> 응답 저장 -> Count 증가 -> (10명 도달시 종료)
- **Output**: `{ success: true }`

### 5.3 결과 조회 (GET /api/result/:shareId)
- **Logic**: 테스트 및 응답 목록 조회 -> Johari 영역 계산 -> 반환
- **Output**: `answerCount`, `isClosed`, Johari 결과 객체 (Open, Blind, Hidden, Unknown 영역별 %, 키워드)

## 6. 보안 설계 (Security)

### 6.1 Rate Limiting (express-rate-limit)
- **생성**: IP당 분당 5회, 시간당 30회
- **응답**: IP당 분당 10회, ShareId당 분당 3회
- **조회**: IP당 분당 60회

### 6.2 Proof Token (Bot Prevention)
- **발급**: `GET /api/proof-token` (TTL 10분)
- **검증**: 테스트 생성 시 필수 제출, 1회 사용 후 삭제

### 6.3 Data Validation
- **Keywords**: 서버에 정의된 Whitelist 내의 단어만 허용
- **Length**: 키워드 개수 정확히 3개 확인
- **ShareId**: Base62 랜덤 문자열, 길이 제한
- **Fingerprint**: 길이 제한

### 6.4 Infrastructure Security
- **Helmet**: 기본 보안 헤더 (XSS, Clickjacking 방지)
- **CORS**: 허용된 도메인만 접근 가능
- **TTL Index**: 오래된 데이터 자동 삭제 (예: 30일)

## 7. 구현 체크리스트
- [ ] Mongoose Schema & Models
- [ ] Proof Token Logic (Redis or Memory)
- [ ] Whitelist Validation Middleware
- [ ] Johari Calculation Service
- [ ] Fingerprint Hashing & Check Logic
- [ ] Rate Limit Configuration
- [ ] Helmet & CORS Setup
