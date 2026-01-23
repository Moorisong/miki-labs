# 🏗️ 기술 명세서 (Engineering Spec)

## 1. 기술 스택 (Tech Stack)

### Frontend
* **Core**: Next.js (App Router)
* **3D Graphics**: three.js (@react-three/fiber, @react-three/drei)
* **Physics**: cannon-es (@react-three/cannon)
* **State Management**: Users `Zustand` for game state, `React Hooks` for UI logic

### Backend
* **Runtime**: Node.js
* **Framework**: Next.js App Router (Server Actions / API Routes)
* **Database**: MongoDB (Native Driver)
* **Auth**: NextAuth.js (Kakao, Google)

---

## 2. 아키텍처 및 구조 (Architecture)

### 2.1 전체 프로젝트 구조
Next.js App Router를 사용하여 풀스택 구조로 관리합니다.

```
ppopgi-addict/
 ├─ client/                 # Next.js Fullstack Application
 │   ├─ app/
 │   │   ├─ api/            # API Routes (Backend Logic)
 │   │   ├─ game/           # 게임 플레이 (CSR)
 │   │   └─ ...
 │   ├─ components/         # UI 컴포넌트
 │   ├─ game/               # 게임 데이터 및 로직 (Zustand)
 │   │   ├─ core/           # 게임 상태/물리 엔진 로직
 │   │   └─ ...
 │   └─ lib/                # 유틸리티 및 DB 연결
 │       └─ mongodb.ts      # MongoDB 연결 설정
 └─ docs/                   # 기획 및 설계 문서
```

### 2.2 환경 변수 관리 (`client/.env.local`)

#### Database & Auth (Server-side Only)
* `MONGODB_URI`: MongoDB 접속 주소
* `NEXTAUTH_SECRET`: NextAuth 비밀 키
* `KAKAO_CLIENT_ID`: 카카오 로그인 ID
* `KAKAO_CLIENT_SECRET`: 카카오 로그인 시크릿

#### Public (Client-side)
* `NEXT_PUBLIC_BASE_URL`: 사이트 기본 주소

### 2.3 배포 전략 (Deployment)
* **Platform**: Vercel (권장) - Client 및 Serverless Function (API) 통합 배포
* **Database**: MongoDB Atlas

---

## 3. 데이터 및 백엔드 명세 (Backend & Data)

### 3.1 백엔드 역할
* **로그인**: OAuth (Kakao) 기반 유저 식별.
* **닉네임 관리**: 유일성 보장 및 변경 주기 제한.
* **점수/랭킹**: 최고 점수 및 달성 기록 저장.

### 3.2 데이터 저장 정책 (Data Storage Policy)
> **플레이 제한은 디바이스 기준으로 통일하고, 계정(DB)은 기록 저장 용도로만 사용한다.**

#### 클라이언트 저장소 (LocalStorage/IndexedDB)
* **저장 대상**: 
    * `remainingAttempts` (남은 시도 횟수)
    * `cooldownEndAt` (쿨타임 종료 시각)
* **특징**: 로그인 여부와 무관하게 브라우저/디바이스 단위로 관리.

#### 서버 저장소 (MongoDB)
* **저장 대상**:
    * 유저 정보 (ID, 닉네임, 가입일, 닉네임 변경 기록)
    * 게임 점수 (Score, DollsCaught, 달성일)
* **특징**: 로그인한 유저의 기록 보존 및 랭킹 산정용.

### 3.3 데이터 모델 (Schema)

#### User
| Field | Type | Description |
|-------|------|-------------|
| `providerId` | String | OAuth 제공자 식별 ID |
| `nickname` | String | 사용자 표시 이름 (2~10자) |
| `createdAt` | Date | 가입일 |
| `lastNicknameChange` | Date | 마지막 닉네임 변경일 (변경 후 30일간 수정 불가) |

#### Score (Collection: `scores`)
| Field | Type | Description |
|-------|------|-------------|
| `userId` | ObjectId | User 참조 |
| `nickname` | String | 당시 닉네임 (Snapshot) |
| `score` | Number | 달성 점수 |
| `dollsCaught` | Number | 잡은 인형 수 |
| `createdAt` | Date | 달성일 (랭킹 동점자 처리: 오름차순) |

### 3.4 구현된 기능 및 제약 사항
#### 닉네임 시스템
* **제약 조건**: 
    - 길이: 2자 이상 10자 이하.
    - 변경 주기: 30일 (1개월)마다 1회 변경 가능.
    - 중복: 실시간 중복 체크 적용.

#### 랭킹 시스템
* **정렬 기준**:
    1. `score` (내림차순)
    2. `createdAt` (오름차순) - 먼저 달성한 사람이 상위
* **표시**: 상위 5명(메인), 전체 목록(랭킹 페이지).
