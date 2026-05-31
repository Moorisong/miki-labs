# 🧩 하루퍼즐 (Haru Puzzle) 최종 기획 및 명세

## I. 최종 기획 개요

### 1. 서비스 개요
#### 서비스 소개
하루퍼즐은 매주 하나의 퍼즐 이미지를 제공하는 웹 기반 직소퍼즐 서비스이다.
사용자는 로그인 없이 퍼즐을 플레이할 수 있으며, 로그인 시 기록 저장 및 랭킹 경쟁에 참여할 수 있다.
서비스는 다음 두 가지 경험을 제공한다.
- 🧘 혼자 하기 (힐링 플레이)
- 🏆 주간 랭킹 경쟁

---

### 2. 핵심 컨셉
#### 🎯 하나의 퍼즐, 두 가지 경험
- 🧘 혼자 하기 → 힐링 중심 플레이
- 🏁 주간 대회 → 기록 경쟁 플레이

---

### 3. 핵심 운영 원칙
#### Guest First 구조
- 로그인 없이 즉시 플레이 가능
- 진행 상태 자동 저장 지원
- 기록 저장 및 랭킹 참여만 로그인 필요

#### 주간 이벤트 구조
- 모든 유저 동일 퍼즐 사용
- 매주 새로운 퍼즐 제공
- 주간 랭킹 경쟁 운영

#### 주간 교체 시점
```
매주 월요일 00:00:00 (KST)
```

#### 아카이브 유지 구조
- 이전 퍼즐은 계속 플레이 가능
- 랭킹만 종료
- 이어하기 가능

---

### 4. 사용자 구조
#### 비로그인 사용자
- **가능 기능**: 퍼즐 플레이, 이어하기, 자동 저장
- **제한 기능**: 기록 저장 불가, 랭킹 참여 불가
- **저장 위치**: IndexedDB

#### 로그인 사용자
- 기존 메인 서비스의 카카오 로그인 정보 사용
- **추가 기능**: 기록 저장, 랭킹 참여, 진행률 저장, 마이페이지 사용
- **닉네임 정책**: 카카오 닉네임 그대로 사용

---

### 5. 모드 시스템
#### 🧘 혼자 하기
- **특징**: 경쟁 없음, 자유 플레이, 이어하기 가능
- **사용 가능 난이도**: Beginner, Expert

#### 🏆 주간 대회
- **특징**: 동일 퍼즐 사용, 완료 시간 경쟁, 주간 단위 운영
- **사용 가능 난이도**: Beginner만

---

### 6. 난이도 정책
#### Beginner
- 100조각
```json
{
  "type": "beginner",
  "rows": 10,
  "cols": 10
}
```

#### Expert
- 256조각
```json
{
  "type": "expert",
  "rows": 16,
  "cols": 16
}
```

#### 공식 랭킹 규칙
- **Beginner(100조각)만 랭킹 반영**

---

### 7. 퍼즐 완료 조건
- **완료 조건**: 모든 퍼즐 조각이 올바른 위치에 고정된 상태 (즉, 100% 모든 조각 스냅 완료 시에만 완료 처리)

---

### 8. 주간 퍼즐 시스템
#### 운영 방식
- 매주 1개 퍼즐 제공
- 모든 유저 동일 이미지 사용
- 주간 랭킹 운영

#### 아카이브 정책
- **현재 퍼즐**: 메인 노출, 랭킹 활성
- **이전 퍼즐**: 아카이브 이동, 플레이 가능, 이어하기 가능, 랭킹 비활성

---

### 9. 이미지 생성 및 운영
- **생성 방식**: AI 이미지 생성, 퍼즐 전용 프롬프트 사용, 6개월치 사전 생성
- **검수 항목**: 저작권 확인, 품질 확인, 퍼즐 적합성 확인
- **저장 방식**: 홈서버 또는 스토리지, DB에는 URL만 저장

---

### 10. 퍼즐 UX 핵심
- **목표**: 몰입감, 부드러운 드래그, 정확한 스냅, 모바일 최적화, 빠른 반응성

---

### 11. 저장 정책
#### 자동 저장
- **목적**: 이어하기 지원
- **저장 위치**: IndexedDB
- **저장 주기**: 2초 debounce
- **저장 내용**: 조각 위치, 진행률, 완료 여부, 선택 난이도

#### 서버 저장 (로그인 사용자만)
- **트리거**: 기록 저장하기 버튼 클릭
- **저장 내용**: 완료 시간, 진행률, 랭킹 데이터, 히스토리 데이터
- **서버 저장 금지 항목**: 조각 위치, 실시간 퍼즐 상태, 퍼즐 데이터

---

### 12. 치팅 방지 및 검증 정책
#### 퍼즐 시작
- 서버에서 발급: `challengeToken`

#### 기록 저장 요청 예시
```json
{
  "puzzleId": "week24",
  "mode": "ranked",
  "difficulty": "beginner",
  "challengeToken": "...",
  "startedAt": "2026-06-01T00:00:00",
  "completedAt": "2026-06-01T00:05:12",
  "completionTime": 312
}
```

#### 서버 검증 규칙
1. **challengeToken 검증**: 유효한 토큰인지 확인
2. **challengeToken 재사용 금지**: 1회 사용 후 폐기
3. **시간 검증**: `completedAt - startedAt = completionTime` 일치 여부 확인
4. **퍼즐 완료 여부 검증**: 모든 퍼즐 조각이 올바른 위치에 고정
5. **비정상 기록 제외**: 10초, 20초, 30초 등 현실적으로 불가능한 기록은 자동 제외

#### 랭킹 반영
- 모든 검증 통과 시: 랭킹 반영, 참여자 수 증가, 히스토리 저장

---

### 13. 랭킹 정책
- **공식 랭킹**: `completionTime` 오름차순 정렬
- **동률 처리**: 동일 기록 발생 시 먼저 저장한 사용자가 상위 순위
- **진행중 TOP**: 진행률 및 최근 플레이 시간 기준으로 노출
- **참여자 수 기준**: 기록 저장 완료 유저 수 (1인 1기록)

---

### 14. 페이지 구조
```
/
├── 메인
├── 퍼즐 플레이
├── 랭킹
├── 아카이브
├── 마이페이지
└── 로그인 안내
```

---

### 15. 메인 페이지
- **표시 요소**: 이번 주 퍼즐 이미지, 퍼즐 제목, 남은 기간, 참여자 수
- **버튼**: 퍼즐 시작하기, 이어하기
- **랭킹 미리보기**: TOP5, 내 기록, 전체 랭킹
- **카카오 공유**: 현재 진행중인 주간 퍼즐을 대상으로 공유 버튼 추가

---

### 16. 퍼즐 플레이 페이지
- **상단**: 뒤로가기, 퍼즐 제목, 모드, 타이머
- **퍼즐 영역**: Canvas 렌더링, 드래그, 스냅, 확대/축소, 핀치 줌
- **하단**: 조각 섞기, 원본 보기, 기록 저장하기
- **완성 시**: 축하 애니메이션, 완료 시간 표시, 랭킹 결과 표시
- **완성 후 버튼**: 기록 저장하기, 카카오 공유하기, 메인 이동

---

### 17. 랭킹 페이지
- **표시**: 순위, 닉네임, 완료 시간, 저장 일시
- **진행중 TOP**: 닉네임, 진행률, 최근 플레이 시간
- **내 기록**: 현재 순위, 진행률, 상위 %

---

### 18. 아카이브 페이지
- **퍼즐 카드**: 썸네일, 제목, 운영 기간, 진행 상태, 참여자 수, 내 기록
- **버튼**: 플레이, 이어하기, 다시 플레이

---

### 19. 마이페이지
- **프로필**: 카카오 프로필 이미지, 카카오 닉네임, 총 완료 퍼즐 수, 최고 기록
- **히스토리**: 완료 기록, 진행 기록, 랭킹 기록
- **설정**: 로그아웃, 데이터 초기화, 계정 탈퇴

---

### 20. 기술 스택
- **Frontend**: React, React Router, Axios, IndexedDB, Canvas API, Zustand
- **Backend**: Node.js, Express, JWT
- **Database**: MongoDB (또는 세션/일시적 캐시용 Redis)
- **Authentication**: 기존 메인 서비스 카카오 로그인 사용
- **Storage**: 홈서버 또는 클라우드 스토리지

---

### 21. MongoDB 설계
#### users
```json
{
  "_id": "ObjectId",
  "kakaoId": "123456",
  "nickname": "카카오닉네임",
  "profileImage": "...",
  "createdAt": "2026-05-26"
}
```

#### puzzles
```json
{
  "_id": "ObjectId",
  "week": 24,
  "title": "숲속의 오두막",
  "imageUrl": "...",
  "startDate": "...",
  "endDate": "...",
  "participantCount": 1284,
  "archived": false
}
```

#### puzzle_results
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "puzzleId": "ObjectId",
  "mode": "ranked",
  "difficulty": "beginner",
  "completionTime": 312,
  "challengeToken": "...",
  "startedAt": "...",
  "completedAt": "...",
  "savedAt": "...",
  "completed": true
}
```

#### puzzle_progress
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "puzzleId": "ObjectId",
  "progress": 72,
  "lastPlayedAt": "2026-05-26T18:12:00"
}
```

---

### 22. IndexedDB 설계
#### puzzleState (haruPuzzleDB)
```json
{
  "puzzleId": "week24",
  "difficulty": "beginner",
  "progress": 72,
  "completed": false,
  "startedAt": "2026-06-01T00:00:00",
  "updatedAt": "2026-05-26",
  "pieces": [
    {
      "id": 1,
      "x": 120,
      "y": 250,
      "locked": false
    }
  ]
}
```

---

### 23. 최종 운영 원칙
- 로그인 없이 즉시 플레이 가능 (Guest First)
- 자동 저장으로 이어하기 지원
- 기록 저장은 사용자 선택, 랭킹 참여는 로그인 필요
- 진행률 서버 저장 지원 (로그인 사용자 대상)
- 주간 퍼즐은 모든 유저 동일
- 공식 랭킹은 Beginner 기준 (Expert는 혼자 하기 전용)
- 아카이브 퍼즐은 계속 플레이 가능하며 힐링과 경쟁 경험을 동시 제공
- 퍼즐 기록이 누적되는 컬렉션 구조 지향

---
---

## II. 개발 상세 명세

### 1. Frontend 상세 명세

#### 페이지 및 라우팅 구조
```
/
├── Home (/) - 이번주 퍼즐 카드, 타이머, 랭킹 프리뷰, 카카오 공유, 시작/이어하기
├── PuzzlePlay (/puzzle/:puzzleId) - Canvas 플레이어, 툴바, 완료 모달
├── Ranking (/ranking) - 전체 랭킹 테이블, 진행중 TOP, 내 랭킹
├── Archive (/archive) - 지난 퍼즐 카드 목록
└── MyPage (/mypage) - 내 프로필, 통계, 완료 히스토리, 로그아웃/탈퇴
```

#### 상태 관리 (Zustand Stores)
- `authStore`: 로그인 상태(isLoggedIn), 토큰(JWT), 사용자 프로필 관리
- `puzzleStore`: 현재 플레이 중인 퍼즐 정보, 조각 데이터, 타이머, 완료 여부 관리
- `rankingStore`: 주간 랭킹 리스트, 진행중 TOP 리스트, 내 랭킹 정보 관리
- `archiveStore`: 지난 퍼즐 리스트, 아카이브 플레이 상태 관리

#### API 통신 규칙
- Axios 인스턴스에 공통 인터셉터를 적용하여 `LocalStorage`의 JWT 토큰 존재 시 `Authorization: Bearer <JWT>` 헤더 자동 주입.

---

### 2. Backend 상세 명세

#### API 엔드포인트 명세

##### 1. 퍼즐 관련
- **현재 퍼즐 조회**
  `GET /api/puzzles/current`
  - 응답: `{ id, title, imageUrl, startDate, endDate, participantCount }`
- **아카이브 목록 조회**
  `GET /api/puzzles/archive`
- **특정 퍼즐 상세 조회**
  `GET /api/puzzles/:id`

##### 2. 보안 & 챌린지
- **챌린지 시작 토큰 발급**
  `POST /api/challenge/start`
  - 요청 바디: `{ puzzleId }`
  - 응답: `{ challengeToken }`

##### 3. 진행 상태 & 결과 저장 (인증 필요)
- **실시간 진행률 저장**
  `POST /api/progress`
  - 요청 바디: `{ puzzleId, progress }`
- **랭킹 기록 제출 및 저장**
  `POST /api/results`
  - 요청 바디: `{ puzzleId, mode, difficulty, challengeToken, startedAt, completedAt, completionTime }`

##### 4. 랭킹 관련
- **주간 랭킹 조회**
  `GET /api/rankings/current`
- **내 랭킹 조회 (인증 필요)**
  `GET /api/rankings/me`

##### 5. 사용자 관련 (인증 필요)
- **내 정보 조회**
  `GET /api/users/me`
- **계정 탈퇴**
  `DELETE /api/users/me`

---

### 3. 데이터베이스 및 서버 로직 명세

#### MongoDB 인덱스 설계
- **`users`**: `kakaoId` (UNIQUE)
- **`puzzles`**: `week` (UNIQUE), `archived`
- **`puzzle_results`**: `puzzleId`, `userId`, `completionTime`, `savedAt` (랭킹 복합 인덱스)
- **`puzzle_progress`**: `userId` + `puzzleId` (UNIQUE)
- **`challenge_tokens`**: `token` (UNIQUE), `expiresAt` (TTL Index로 24시간 후 자동 소멸)

#### 챌린지 검증 정책 (치팅 방지)
1. **JWT 검증**: 유효한 로그인 사용자인지 확인
2. **토큰 존재 및 만료 여부 검증**: `challenge_tokens` 테이블에서 토큰을 찾아 유효성 확인
3. **1회성 검증**: 토큰을 찾은 후 즉시 `used = true`로 상태 변경하여 재사용 금지
4. **시간 일관성 검증**: 요청 바디의 `completedAt - startedAt = completionTime` 계산값 검증
5. **난이도 및 기간 검증**: 주간 랭킹은 활성 기간 내의 `Beginner` 난이도만 허용
6. **비정상 기록 필터링**: 30초 미만 등 물리적으로 불가능한 완성 시간 기록은 필터링(차단)

#### 배치 작업 (Cron)
- **매주 월요일 00:00 (KST)**
  1. 현재 주간 퍼즐의 `archived` 필드를 `true`로 업데이트
  2. 다음 주차에 해당하는 신규 퍼즐 데이터를 활성화 (`archived = false`)
  3. 랭킹용 `participantCount` 초기화 및 신규 주간 랭킹 집계 시작
- **진행률 데이터 정리 (선택적)**
  - 90일 이상 미접속 사용자의 진행률(`puzzle_progress`) 데이터를 정리하여 DB 최적화

---

### 4. 🧩 퍼즐 엔진 및 UX 설계

#### 퍼즐 생성 및 분할
- 퍼즐 이미지를 HTML5 Canvas에 로드한 후 설정된 `rows`와 `cols`에 맞춰 격자형으로 분할.
- 각 조각은 고유 ID를 부여받으며, 베지어 곡선을 이용해 직소퍼즐 형태의 돌기/홈(tab/blank) 모양을 동적으로 렌더링.
- **조각 섞기 (Shuffle)**: 보드판 외부의 대기 영역 또는 Canvas 내 랜덤 좌표로 조각들을 무작위 배치.

#### 드래그 앤 드롭 및 스냅(Snap)
- `pointerdown` / `mousedown` 시 선택된 조각을 레이어 최상단(`Selection Layer`)으로 이동.
- `pointermove` / `mousemove` 이벤트를 구독하여 마우스/터치 좌표에 따라 조각 좌표 갱신 후 `requestAnimationFrame`을 통해 Canvas를 부드럽게 재렌더링.
- `pointerup` / `mouseup` 시 스냅 거리 검사.
  - 올바른 완성 좌표(`correctX`, `correctY`)와의 거리가 **20px 이하**인 경우, 해당 조각을 완성 좌표에 스냅 시키고 `locked = true` 처리.
  - 스냅 성공 시 가벼운 결합 효과음(또는 햅틱 효과) 및 완성 이펙트 제공.

#### 줌 및 조작 편의성
- Canvas 컨텍스트의 `scale()` API를 활용해 **최소 0.5배 ~ 최대 3배** 줌 아웃/인 지원.
- 모바일 환경에서의 조작성을 향상하기 위해 두 손가락 터치 제스처를 감지하여 **Pinch-to-Zoom** 및 **두 손가락 드래그를 통한 캔버스 이동(Pan)** 기능 구현.

#### 렌더링 성능 최적화
- 전체 화면을 매번 그리는 대신 `locked`된 조각들은 정적 캐시 레이어에 미리 그려두고, 현재 드래그 중인 활성 조각만 동적으로 그려 CPU/GPU 부하를 최소화.

---

### 5. 💾 IndexedDB 상세 명세

#### DB 및 저장 정책
- **DB명**: `haruPuzzleDB` (Version: 1)
- **Object Store**: `puzzleState` (KeyPath: `puzzleId`)
- **저장 대상**: 각 조각의 현재 좌표 및 고유 ID, `locked` 여부, 진행률, 플레이 시작 시각, 난이도 등.
- **저장 주기**: 퍼즐 조각이 이동되거나 스냅될 때마다 트리거하되, 과도한 I/O를 방지하기 위해 **2초 Debounce**를 적용하여 비동기 저장.
- **이어하기 복원 플로우**:
  1. 사용자가 특정 퍼즐 플레이 진입 시, IndexedDB에서 해당 `puzzleId` 키로 저장 데이터가 존재하는지 확인.
  2. 이전 진행 기록이 존재할 경우 "이어서 플레이하시겠습니까?" 팝업 노출.
  3. 수락 시 조각 좌표와 경과 시간을 복원하여 즉시 플레이 개시.

---

### 6. 🔐 인증 및 보안 명세

#### 인증 통합 원칙
- 별도의 회원가입 없이 기존 하루 서비스의 카카오 로그인 인프라(JWT)를 온전히 공유.
- 프론트엔드는 `LocalStorage`에서 JWT를 확인하고, 백엔드는 JWT 미들웨어를 거쳐 `req.user` 객체로 카카오 사용자 정보 식별.
- **비로그인 사용자**: 로컬 IndexedDB에 퍼즐 진행 데이터를 보관하고 플레이를 정상 지원하되, 랭킹 기록 저장 단계에서 카카오 로그인을 유도하는 가이드를 제공하여 'Guest First' 가치 실현.

#### 계정 탈퇴 프로세스
- 사용자가 탈퇴를 요청하는 경우, 해당 `userId`와 연결된 다음의 정보를 트랜잭션 처리(또는 순차 삭제)하여 개인정보 보호 규정 준수:
  1. `users` 컬렉션의 사용자 데이터
  2. `puzzle_progress`에 저장된 실시간 진행 정보
  3. `puzzle_results`에 기록된 모든 랭킹 및 참여 히스토리
  4. `challenge_tokens`에 보관된 토큰 이력
