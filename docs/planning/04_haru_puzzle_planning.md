# 🧩 하루퍼즐 (Haru Puzzle) 구현 스펙 및 상세 명세

## I. 서비스 개요 및 핵심 컨셉

### 1. 서비스 소개
하루퍼즐은 매주 하나의 아름다운 AI 생성 이미지를 퍼즐로 제공하는 웹 기반 퍼즐 서비스이다. 
사용자는 로그인 없이도 편리하게 퍼즐을 즐길 수 있으며(Guest First), 로그인 시 기록 저장 및 랭킹 경쟁에 참가하여 다른 유저들과 기록을 겨룰 수 있다.

---

### 2. 핵심 운영 및 서비스 원칙
*   **Guest First 구조**: 로그인 없이도 플레이가 가능하며 로컬 데이터베이스(IndexedDB)에 진행 상태가 자동으로 저장된다. 기록 등록 및 랭킹 참여 시에만 카카오 로그인이 요구된다.
*   **주간 이벤트 구조**: 모든 유저가 매주 동일한 이미지를 활용하여 퍼즐을 맞추고 순위를 경쟁한다.
*   **주간 교체 시점**: 매주 월요일 00:00:00 (KST)에 신규 퍼즐이 갱신된다.
*   **아카이브 지원**: 주차가 지난 퍼즐은 아카이브 메뉴로 이동하며, 언제든지 플레이 및 이어하기가 가능하지만 랭킹 등록은 제한된다.
*   **광고 최적화**: 사용자의 의도치 않은 클릭을 유도하지 않는 위치(플레이어 툴바와 피스 트레이 사이, 메인 하단 등)에 Kakao Adfit 광고 배너가 연동되어 있다.

---

### 3. 모드 및 난이도 체계
*   **모드**: 모든 플레이는 기본적으로 공식 기록 측정 및 검증을 거치는 **랭킹 모드(ranked)**를 기준으로 설계되어 있다.
*   **난이도**: 총 3가지 난이도를 지원하며, 각 난이도별로 독립적인 주간 랭킹 경쟁이 이루어진다.
    1.  **초보 (Novice)**: 36조각 (6x6 격자)
    2.  **일반 (Beginner)**: 100조각 (10x10 격자)
    3.  **고수 (Expert)**: 256조각 (16x16 격자)

---

## II. 프론트엔드 엔진 및 UI/UX 스펙

### 1. 그리드 슬롯 기반 퍼즐 엔진
*   **구조**: 절대 좌표 캔버스 드래그 방식 대신, 화면 크기에 유연하게 대응하고 터치 조작이 편리한 **그리드 슬롯(CSS Grid) 기반 매칭 시스템**으로 구현되었다.
*   **조작 플로우**:
    1.  하단 조각 보관함(**PieceTray**)에서 맞추고자 하는 조각을 탭하여 선택한다.
    2.  퍼즐 판(**PuzzleBoard**)의 격자 슬롯 중 알맞은 위치를 탭하여 배치한다.
    3.  보드에 배치된 조각을 다시 탭하면 보관함으로 내려가지 않고 해당 조각을 든 상태(Pick up)가 된다.
    4.  조각을 든 상태에서 다른 조각이 위치한 슬롯을 선택하면 두 조각의 위치가 서로 바뀐다(Swap).
*   **완성 조건**: 모든 격자 슬롯(`slotIdx`)의 인덱스와 그 위치에 배치된 조각 번호(`pieceId`)가 완전히 일치할 때(`board.every((val, idx) => val === idx)`) 퍼즐이 성공적으로 완성된다.
*   **시각 효과 및 유틸리티**:
    *   **고수 모드(Expert) 전용 리플 효과**: 고수 모드에서 조각을 제자리에 맞췄을 때 가벼운 결합 리플 애니메이션이 렌더링된다.
    *   **줌 기능**: 줌 조절 버튼을 통해 셀의 기본 크기를 최소 0.6배에서 최대 2.2배까지 확대/축소하여 볼 수 있다.
    *   **원본 가이드 보기**: 눈 아이콘을 터치하거나 가이드 버튼을 클릭하면 원본 이미지를 오버레이 팝업으로 띄워 힌트를 얻을 수 있다.
    *   **판 엎기 (Shuffle)**: 보드에 배치된 모든 조각을 초기화하고 피스 트레이에 있는 조각들을 다시 무작위로 섞는다.

---

### 2. 페이지 및 라우팅 구조 (Next.js App Router)
*   `GET /puzzle`: 하루퍼즐 메인 페이지. 이번 주 퍼즐 카드, 타이머, 참여자 수, 완료 상태, 랭킹 프리뷰(Top 5), 공유하기 및 아카이브 바로가기 제공.
*   `GET /puzzle/play/[puzzleId]`: 퍼즐 플레이어 페이지. 헤더(뒤로가기, 제목, 난이도, 타이머, 진행률), 퍼즐 그리드 보드, 툴바, 광고 영역, 피스 트레이.
*   `GET /puzzle/ranking`: 난이도별(초보, 일반, 고수) 주간 랭킹 조회 페이지. 상위 100위 테이블, 내 최고 기록 분석 카드, 성적 분포 분포도(Percentile Chart).
*   `GET /puzzle/archive`: 지난 주차들의 아카이브 퍼즐 목록 페이지.
*   `GET /puzzle/mypage`: 내 프로필, 통계(완성 개수, 최고 기록), 플레이 이력 제공 및 데이터 초기화/계정 탈퇴 기능.

---

### 3. 상태 관리 (Zustand Stores)
*   **`usePuzzleStore`**: 현재 플레이 중인 퍼즐 상태를 관리한다.
    *   `activePuzzleId`, `activePuzzleImage`, `difficulty`, `mode`, `totalPieces`
    *   `board`: 퍼즐 보드의 슬롯별 조각 배치 현황 (`(number | null)[]`)
    *   `trayPieces`: 하단 보관함에 남아있는 조각들의 ID 목록 (`number[]`)
    *   `selectedTrayPiece`: 현재 들고(선택하고) 있는 조각 ID (`number | null`)
    *   `timerSeconds`, `isTimerRunning`, `isCompleted`, `startedAt`, `challengeToken`
*   **`useRankingStore`**: 주간 랭킹 캐시 정보 및 비동기 페칭 관리.

---

## III. 데이터 보존 및 동기화 (저장 정책)

### 1. 로컬 저장소 (IndexedDB)
*   **데이터베이스명**: `haruPuzzleDB` (Version: 1)
*   **Object Store**: `puzzleState` (KeyPath: `puzzleId`)
*   **저장 주기**: 퍼즐 조각이 이동(배치, 회수, 스왑)될 때마다 저장 이벤트가 트리거되며, 브라우저 성능을 위해 **2초 디바운스(Debounce)**를 적용하여 비동기 저장한다. 단, **페이지 언마운트(이탈) 시에는 즉시 플러시(Force Save)**하여 진행 데이터의 유실을 방지한다.
*   **저장 데이터 구조**:
    ```json
    {
      "difficulty": "beginner",
      "mode": "ranked",
      "timerSeconds": 145,
      "pieces": [ ... ],
      "board": [ null, 3, 2, ... ],
      "trayPieces": [ 0, 1, 4, ... ],
      "progress": 45,
      "completed": false,
      "startedAt": "2026-06-06T11:23:15.000Z"
    }
    ```

### 2. 서버 저장소 (로그인 사용자 대상 실시간 백업)
*   **목적**: 브라우저를 변경하거나 기기를 교체해도 진행하던 퍼즐을 안전하게 이어서 플레이할 수 있도록 지원.
*   **동작**:
    *   사용자가 로그인 상태일 경우, 퍼즐 조각 배치 상태가 변경될 때마다 로컬 IndexedDB 백업과 동시에 서버의 `saveProgressApi`를 호출하여 DB `puzzle_progress` 컬렉션의 `detailState`에 현재 세부 플레이 필드를 실시간 동기화한다.
    *   **이어하기 플로우**: 퍼즐 로드 시 로컬 IndexedDB 상태를 우선 조회하고, 만약 로컬 기록이 없고 로그인된 상태라면 서버로부터 진행 상황을 다운로드받아 로컬 DB를 복원 및 동기화 후 게임을 복구한다.

---

## IV. 백엔드 API 및 데이터베이스 명세

### 1. MongoDB 스키마 정의 (Mongoose)

#### `puzzles` (퍼즐 마스터 정보)
```typescript
{
  week: { type: Number, required: true, unique: true, index: true },
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  participantCount: { type: Number, default: 0 },
  playCount: { type: Number, default: 0 },
  archived: { type: Boolean, default: false, index: true }
}
```

#### `puzzle_results` (랭킹 및 완주 기록)
```typescript
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  puzzleId: { type: Schema.Types.ObjectId, ref: 'Puzzle', required: true, index: true },
  mode: { type: String, enum: ['solo', 'ranked'], required: true },
  difficulty: { type: String, enum: ['novice', 'beginner', 'expert'], required: true },
  completionTime: { type: Number, required: true },
  challengeToken: { type: String, required: true },
  startedAt: { type: Date, required: true },
  completedAt: { type: Date, required: true },
  savedAt: { type: Date, default: Date.now },
  completed: { type: Boolean, default: true }
}
// 복합 인덱스: { puzzleId: 1, completionTime: 1, savedAt: 1 } (랭킹 정렬 및 조회 최적화)
// 복합 인덱스: { puzzleId: 1, userId: 1 } (참여자수 집계 최적화)
```

#### `puzzle_progress` (실시간 진행 상황)
```typescript
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  puzzleId: { type: Schema.Types.ObjectId, ref: 'Puzzle', required: true },
  progress: { type: Number, required: true, min: 0, max: 100 },
  lastPlayedAt: { type: Date, default: Date.now },
  detailState: { type: Schema.Types.Mixed, required: false }
}
// 복합 유니크 인덱스: { userId: 1, puzzleId: 1 }
```

#### `challenge_tokens` (1회성 검증 토큰)
```typescript
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  puzzleId: { type: Schema.Types.ObjectId, ref: 'Puzzle', required: true },
  token: { type: String, required: true, unique: true },
  issuedAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true }, // TTL 인덱스로 자동 삭제 유도 가능 (7일 후 만료)
  used: { type: Boolean, default: false }
}
```

---

### 2. 백엔드 API 엔드포인트 명세

| 엔드포인트 | HTTP 메서드 | 설명 | 인증 필요 여부 |
| :--- | :--- | :--- | :--- |
| `/api/puzzle/current` | `GET` | 이번 주 활성 퍼즐 조회 | X |
| `/api/puzzle/archive` | `GET` | 지난 아카이브 퍼즐 목록 조회 | X |
| `/api/puzzle/stats` | `GET` | 전체 퍼즐 플레이 수 및 통계 | X |
| `/api/puzzle/:id` | `GET` | 특정 퍼즐 상세 데이터 조회 | X |
| `/api/puzzle/rankings/current` | `GET` | 현재 주간 퍼즐 랭킹 조회 (Top 100) | X (쿼리: `difficulty`) |
| `/api/puzzle/rankings/me` | `GET` | 내 최고 순위 및 백분율 조회 | O |
| `/api/puzzle/challenge/start` | `POST` | 보안용 챌린지 시작 토큰 발급 | O |
| `/api/puzzle/results` | `POST` | 검증 미들웨어를 거친 완주 기록 등록 | O (검증 미들웨어 통과 필수) |
| `/api/puzzle/progress` | `POST` | 실시간 진행률 및 상세 배치도 업로드 | O |
| `/api/puzzle/progress` | `GET` | 내 특정 퍼즐 진행도 다운로드 | O |
| `/api/puzzle/progress` | `DELETE` | 내 퍼즐 진행 상태 초기화 (일부 또는 전체) | O |
| `/api/puzzle/users/me` | `GET` | 마이페이지 프로필 및 플레이 이력 조회 | O |
| `/api/puzzle/users/me` | `DELETE` | 계정 탈퇴 (개인정보 및 모든 랭킹/진행 데이터 파기) | O |

---

## V. 보안 및 치팅 방지 로직 (Verify Challenge)

랭킹 순위의 무결성을 유지하기 위해 `/api/puzzle/results` API 호출 시 다음과 같은 보안 검증 미들웨어(`verifyChallenge`)를 반드시 거친다.

1.  **중복 제출 방지**: 동일 유저가 동일한 `startedAt`과 `completionTime`을 가진 기록을 중복 전송 시, 챌린지 토큰 검증 없이 성공 응답(200)을 반환하여 불필요한 에러를 방지한다.
2.  **Challenge Token 1회성 검증**:
    *   플레이 시작 단계에서 `/api/puzzle/challenge/start`를 통해 발급받은 고유 토큰이 유효한지 확인한다.
    *   동일한 토큰의 재사용을 막기 위해 MongoDB에서 조회 및 업데이트(`findOneAndUpdate`)를 활용해 원자적으로 `used = true` 처리를 수행한다.
3.  **플레이 경과 시간 무결성 검증 (Wall-Clock Time Check)**:
    *   클라이언트 타이머의 임의 가속 치팅을 잡기 위해 실제 완료 시간과 시작 시간의 차이(현실 흐른 시간)인 `completedAt - startedAt`을 구한다.
    *   이 값(초)이 클라이언트 타이머에 기록된 `completionTime`보다 5초 이상 짧은 경우(`calculatedDurationSeconds < completionTime - 5`), 부당하게 조작된 치팅으로 간주하여 `400 Bad Request` 에러를 반환한다.
4.  **최소 완성 속도 필터링 (Speed Filter)**:
    *   36조각, 100조각, 256조각을 정상적으로 맞추는 데 물리적으로 불가능한 속도인 **30초 미만**의 완주 타임(`completionTime < 30`)은 스피드핵 등으로 규정하여 기록 등록을 즉시 차단한다.
5.  **랭킹 중복 등록 방지**:
    *   각 난이도별로 1인당 최종 1개의 랭킹 기록만 보존하며, 이미 완료한 동일 난이도의 랭킹 데이터가 존재할 경우 에러를 반환한다.

---

## VI. 계정 탈퇴 및 데이터 파기 프로세스
사용자가 서비스 탈퇴(`/api/puzzle/users/me` DELETE)를 진행할 때, 개인정보 보호 및 데이터 정리를 위해 아래의 데이터가 원자적 트랜잭션으로 연쇄 파기된다.
1.  `users` 컬렉션의 카카오 프로필 및 계정 정보
2.  `puzzle_progress`에 저장된 실시간 진행 상황 및 배치 데이터
3.  `puzzle_results`에 저장된 모든 완주 기록 및 주간 랭킹 정보
4.  `challenge_tokens`에 보관된 사용자용 토큰 내역

---

## VII. 가로모드(Responsive Landscape Mode) 구현 스펙

### 1. 목표 및 기본 원칙

가로 화면(landscape orientation) 전용 플레이 환경을 추가한다.
기존 세로모드 UI 및 기능에 어떠한 영향도 주지 않으며, 가이드 이미지와 퍼즐판을 동시에 보면서 빠르게 조각을 맞출 수 있도록 설계한다.

**세로모드 보존 필수 항목**
- 퍼즐판 구조, 조각 보관함 구조, 모아보기 보관함
- 광고 위치, 툴바, 진행 저장 로직
- IndexedDB 저장, 랭킹 시스템, 난이도별 동작

**구현 방식**: 가로모드는 별도 레이아웃 컴포넌트로 분리하며, orientation 또는 viewport 조건에 따라 분기 렌더링한다.
```
PortraitPuzzleLayout   ← 기존 세로모드 (변경 없음)
LandscapePuzzleLayout  ← 신규 가로모드
```

---

### 2. 가로모드 화면 분류

#### Large Landscape
- **대상**: 데스크탑, 노트북, 태블릿 가로모드
- **기준**: `orientation: landscape AND viewport width >= 1024px`
- **비율**: Guide 40% / Puzzle 40% / Tray 20%

#### Compact Landscape
- **대상**: 모바일 가로모드, 소형 태블릿
- **기준**: `orientation: landscape AND viewport width < 1024px`
- **비율**: Guide 35% / Puzzle 45% / Tray 20%
- **보관함 폭**: 140px ~ 180px (Large: 240px ~ 320px)

---

### 3. 가로모드 공통 UI 구조

```
┌─────────┬─────────┬─────────┐
│ Guide   │ Puzzle  │ Tray    │
│ Image   │ Board   │ Pieces  │
└─────────┴─────────┴─────────┘
```

| 영역 | 내용 |
|------|------|
| 왼쪽 (Guide) | 원본 가이드 이미지 - 드래그 이동 가능, 모서리 핸들로 크기 조절 가능 |
| 가운데 (Puzzle) | 퍼즐판 - 드래그 이동 가능, 기존 줌 기능 연동 |
| 오른쪽 (Tray) | 조각 보관함 - 우측 고정, 이동/크기조절 불가, 세로 스크롤 지원 |

---

### 4. 가이드 이미지(Guide Panel) 상세

- **초기 크기**: 퍼즐판과 동일한 크기로 시작
- **이동**: 드래그로 자유 이동
- **크기 조절**: 모서리 핸들 드래그 (최소 50% / 기본 100% / 최대 250%)
- **비율 유지**: 이미지 원본 비율 항상 유지, 왜곡 금지
- **표시 원칙**: 항상 화면에 노출 (세로모드의 팝업 방식 대신 독립 패널)

---

### 5. 퍼즐판(Puzzle Panel) 상세

- **초기 크기**: 가이드 이미지와 동일한 크기로 시작
- **이동**: 드래그로 자유 이동
- **크기 조절**: 기존 줌 기능(`zoom` 상태) 연동 (별도 시스템 금지)

---

### 6. 조각 보관함(Tray) 상세

- **세로모드와의 차이**: 일반 보관함 + 모아보기 보관함 2단계 구조를 제거하고, 세로모드의 "모아보기 보관함"만 단일 사용
- **위치**: 항상 우측 고정
- **스크롤**: 세로 스크롤 지원
- **고정 원칙**: 이동 불가, 크기 조절 불가

---

### 7. 드래그 충돌 방지 (인터랙션 모드)

가이드 이동 / 퍼즐판 이동 / 조각 배치가 동시에 존재하므로 모드 분리로 충돌을 방지한다.

| 모드 | 기본 상태 | 가이드 이동 | 퍼즐판 이동 | 조각 배치 |
|------|----------|------------|------------|----------|
| **플레이 모드** (기본) | ✅ | ❌ | ❌ | ✅ |
| **이동 모드** | | ✅ | ✅ | ❌ |

상단 툴바에 `[이동]` / `[플레이]` 토글 버튼을 추가한다.

---

### 8. 상태 저장 (IndexedDB 연동)

가로모드에서도 아래 값을 기존 퍼즐 상태와 함께 IndexedDB에 저장하며, 새로고침 후 이전 배치를 복원한다.

```typescript
// IndexedDB puzzleState에 추가 저장 필드
landscapeState: {
  guidePosition: { x: number; y: number };
  guideScale: number;
  boardPosition: { x: number; y: number };
  boardScale: number;
  interactionMode: 'play' | 'move';
}
```

---

### 9. UX 최적화 원칙

> "가이드 이미지와 퍼즐판을 동시에 보며 최소 이동으로 조각을 맞출 수 있게 하는 것"

- 팝업 최소화 / 모달 최소화
- 불필요한 버튼 제거
- 단일 보관함 사용
- 원본 이미지 항상 노출
- Compact 모드에서는 초기 크기를 작게 시작하여 전체 화면을 한눈에 파악 가능하게 함
