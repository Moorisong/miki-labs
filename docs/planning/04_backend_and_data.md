# 📡 백엔드 및 데이터 (Backend & Data)

## 1. 백엔드 역할
초기 단계에서는 최소한의 기능만 수행합니다.
* **로그인**: OAuth 기반 유저 식별 (회원가입 절차 간소화)
* **점수**: 최고 점수 기록 저장 및 갱신
* **랭킹**: 전체 유저 랭킹 조회

## 2. 데이터 저장 규칙
* **매 판 저장하지 않음**: 서버 부하 방지 및 데이터 낭비 최소화
* **최고 점수 갱신 시**: 클라이언트에서 최고 기록 달성 시에만 API 요청 및 저장

## 3. 데이터 모델 (Schema)

### User
| Field | Type | Description |
|-------|------|-------------|
| `providerId` | String | OAuth 제공자 식별 ID |
| `nickname` | String | 사용자 표시 이름 |
| `createdAt` | Date | 가입일 |

### Score
| Field | Type | Description |
|-------|------|-------------|
| `userId` | ObjectId | User 참조 |
| `bestScore` | Number | 최고 점수 |
| `updatedAt` | Date | 갱신일 (랭킹 정렬 기준) |

## 4. API 명세 (Draft)

### Auth
* `POST /auth/login`: 소셜 로그인 토큰 검증 및 유저 세션 생성

### Ranking
* `POST /ranking/submit`: 점수 제출 (최고 점수 갱신 시)
* `GET /ranking/top`: 상위 랭킹 조회
* `GET /ranking/me`: 내 랭킹 및 정보 조회
