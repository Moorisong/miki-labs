# 🎨 프론트엔드 UI/UX 및 퍼즐엔진 전담 에이전트 (Frontend Agent) 작업 안내서

이 문서는 "하루퍼즐(Haru Puzzle)"의 프론트엔드 설계, Zustand 상태 관리, HTML5 Canvas 퍼즐 엔진 개발, IndexedDB 로컬 동기화 및 카카오 연동을 담당하는 에이전트를 위한 최종 개발 명세서입니다. 본 문서에 명시된 상세 기획을 바탕으로 다른 의존성 없이 프론트엔드 영역을 완벽하게 단독 구현할 수 있어야 합니다.

---

## 1. 기술 스택 및 디렉터리 구성

### 기술 스택
- **Framework & Routing**: React.js (Vite), React Router Dom
- **State Management**: Zustand
- **Database (Client)**: IndexedDB (Native API 또는 wrapper 라이브러리 사용 가능)
- **Rendering & Animation**: HTML5 Canvas API, Framer Motion (UI 트랜지션용)
- **HTTP Client**: Axios (JWT 인터셉터 포함)
- **Styling**: Modern Vanilla CSS, CSS Modules (글래스모피즘, HSL 컬러 팔레트, 부드러운 다크모드 필수)

### 프론트엔드 컴포넌트 디렉터리 구조
```
src
├─ apis
│   ├─ axios.js           # Authorization 헤더 자동 주입 설정
│   └─ index.js           # 백엔드 API 명세에 대응하는 비동기 요청 모듈
│
├─ components
│   ├─ layout
│   │   ├─ Header.jsx     # 상단 GNB (로고, 랭킹, 아카이브, 마이페이지/로그인 전환)
│   │   ├─ Footer.jsx     # 하단 저작권 및 힐링 문구
│   │   └─ Layout.jsx     # 공통 레이아웃 래퍼
│   ├─ home
│   │   ├─ CurrentPuzzleCard.jsx # 이번 주 퍼즐 썸네일 및 제목 노출 카드
│   │   ├─ CountdownTimer.jsx    # 다음 주 월요일까지 남은 카운트다운 타이머
│   │   ├─ RankingPreview.jsx   # TOP5 랭커 미리보기 리스트
│   │   └─ ShareButton.jsx       # 현재 퍼즐 카카오톡 공유 버튼
│   ├─ puzzle
│   │   ├─ PuzzleHeader.jsx  # 상단 뒤로가기, 타이머, 남은 조각 비율 표시기
│   │   ├─ PuzzleCanvas.jsx  # 직소퍼즐 핵심 플레이 Canvas 컴포넌트
│   │   ├─ PuzzleToolbar.jsx # 하단 믹스(섞기), 원본보기, 기록저장 툴바
│   │   ├─ OriginalImageModal.jsx # 원본 가이드 레이아웃 모달
│   │   ├─ CompletionModal.jsx    # 완성 시 세레머니, 카카오공유, 기록저장 유도
│   │   └─ SaveRecordButton.jsx   # 랭킹 제출용 컴포넌트
│   ├─ ranking
│   │   ├─ RankingTable.jsx      # 순위, 닉네임, 기록 테이블
│   │   ├─ LiveProgressBoard.jsx # 다른 플레이어들의 실시간 진행률(Zustand 연동)
│   │   └─ MyRankingCard.jsx     # 내 등수 및 상위 % 정보 카드
│   ├─ archive
│   │   └─ PuzzleCard.jsx        # 과거 아카이브 퍼즐 목록 및 플레이 전환 버튼
│   └─ mypage
│       ├─ ProfileCard.jsx       # 카카오 로그인 사용자 정보
│       ├─ StatisticsCard.jsx    # 총 완성 수 및 베스트 랩타임 통계
│       ├─ HistoryList.jsx       # 완성 및 미완성 플레이 이력 리스트
│       └─ SettingsPanel.jsx     # 로그아웃, 데이터 초기화 및 탈퇴 제어
│
├─ stores
│   ├─ authStore.js       # 카카오 인증 토큰 및 로그인 유저 정보 스토어
│   ├─ puzzleStore.js     # 드래그, 믹스, 타이머, 완성 여부 등 엔진 상태 스토어
│   ├─ rankingStore.js    # 주간 및 진행중 랭킹 데이터 스토어
│   └─ archiveStore.js    # 지난 주차 목록 스토어
│
├─ services
│   └─ indexedDB.js       # IndexedDB 데이터 로드, 자동 저장, 초기화 인터페이스
│
└─ App.jsx                # 라우터 세팅 및 최상단 상태 제어
```

---

## 2. Zustand 글로벌 상태 관리 상세 명세

각 스토어는 백엔드 명세와 Canvas 엔진, IndexedDB 통신을 원활히 처리하기 위해 다음 인터페이스 규칙을 포함해야 합니다.

### (1) `authStore`
사용자 로그인 세션 및 JWT 관리를 담당합니다.
```typescript
interface UserProfile {
  id: string;
  nickname: string;
  profileImage: string;
}

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  user: UserProfile | null;
  setLogin: (token: string, user: UserProfile) => void;
  setLogout: () => void;
  checkAuthSession: () => Promise<void>; // 로컬스토리지 토큰 기반 세션 복원
}
```

### (2) `puzzleStore`
퍼즐 보드 데이터, 타이머 작동 및 기록 데이터 유효성을 관리합니다.
```typescript
interface PuzzlePiece {
  id: number;
  correctX: number;
  correctY: number;
  currentX: number;
  currentY: number;
  width: number;
  height: number;
  locked: boolean;
}

interface PuzzleState {
  activePuzzleId: string | null;
  activePuzzleImage: string | null;
  difficulty: "beginner" | "expert";
  pieces: PuzzlePiece[];
  timerSeconds: number;
  isTimerRunning: boolean;
  isCompleted: boolean;
  startedAt: string | null;
  challengeToken: string | null;
  
  initializePuzzle: (puzzleId: string, imgUrl: string, diff: "beginner" | "expert") => void;
  startTimer: () => void;
  stopTimer: () => void;
  updatePiecePosition: (id: number, x: number, y: number, locked: boolean) => void;
  setCompleted: (completed: boolean) => void;
  resetPuzzle: () => void;
}
```

---

## 3. HTML5 Canvas 직소 퍼즐 엔진 상세 설계

### (1) 난이도 및 렌더링 물리 규격
- **Beginner**: 가로 10열 × 세로 10행 = 총 100조각
- **Expert**: 가로 16열 × 세로 16행 = 총 256조각
- 각 조각의 기준 크기: `width = 이미지 실사이즈 / 열 개수`, `height = 이미지 실사이즈 / 행 개수`
- **퍼즐 돌기/홈 모양 그리기**:
  - 사각형 테두리를 단순히 그리는 것을 금지합니다.
  - 베지어 곡선(`bezierCurveTo`)을 사용하여 각 조각의 4개 면에 대해 돌기(tab) 혹은 홈(blank)이 서로 암수 결합되도록 무작위 곡률을 정의해야 합니다. 이웃하는 조각끼리 암수 돌기가 아귀가 맞도록 무작위 생성 시 시드값 혹은 매칭 규칙을 구현합니다.

### (2) 핵심 물리 엔진 인터랙션 로직
1. **드래그 앤 드롭 (Pointer Events)**:
   - 마우스와 터치를 단일화된 `pointerdown`, `pointermove`, `pointerup` 이벤트 핸들러로 통합 제어합니다.
   - `pointerdown`: 클릭된 화면 좌표를 스케일 및 오프셋 변환하여 마우스가 위치한 퍼즐 조각 중 `locked === false` 상태인 조각을 탐색합니다.
   - **레이어 배치**: 선택된 조각의 인덱스를 조각 배열의 가장 마지막으로 재배치하여 최상단에 그려지도록 유도합니다.
   - `pointermove`: 드래그 델타값만큼 현재 조각의 `currentX`와 `currentY`를 실시간 갱신하고 `requestAnimationFrame`을 호출해 전체 캔버스를 무결하게 다시 그립니다.
2. **멀티터치 줌(Zoom) 및 화면 이동(Pan)**:
   - 터치가 2개 이상 유입되는 경우 드래그 중인 조각 동작을 일시 중단하고 캔버스 전체의 물리 행렬을 조작합니다.
   - 두 포인터 간의 유클리드 거리 변화율을 추적하여 캔버스 스케일을 **최소 0.5배 ~ 최대 3배**로 제한 변환(Pinch Zoom)합니다.
   - 두 손가락 드래그 시 뷰포트 오프셋 좌표(`offsetX`, `offsetY`)를 이동시켜 넓은 보드판 공간을 스크롤(Panning)할 수 있어야 합니다.
3. **스냅(Snap) 피드백**:
   - `pointerup` 시, 드래그 중이던 조각의 현재 좌표(`currentX`, `currentY`)와 원래의 올바른 완료 좌표(`correctX`, `correctY`) 사이의 거리를 계산합니다.
   - **계산식**: `Math.sqrt(Math.pow(currentX - correctX, 2) + Math.pow(currentY - correctY, 2)) <= 20`
   - 거리가 **20px 이하**인 경우, 조각을 강제로 완성 좌표로 동기화(`currentX = correctX`, `currentY = correctY`)하고 `locked = true`로 상태 변경 처리합니다.
   - **성공 피드백**: '착!'하고 맞물리는 사운드 효과를 발생시키고, 모바일 환경의 경우 `navigator.vibrate([30])`를 호출하여 경쾌한 햅틱 진동 피드백을 전달합니다.
4. **완료 감지**:
   - 모든 조각의 `locked` 상태가 `true`인지 검증(`pieces.every(p => p.locked === true)`)합니다.
   - 100% 완료 판정 시 타이머를 즉각 정지하고, 화면 가득 화려한 축하종이 폭죽이 떨어지는 애니메이션(Canvas Confetti 등)을 발생시키며 **완료 결과 모달**을 띄웁니다.

### (3) 드로잉 최적화 기법 (Double-Layer Canvas Caching)
- 모바일 브라우저의 60FPS 성능 유지를 위해 2레이어 캔버스 구조를 활용해야 합니다.
- **오프스크린 캔버스 (Offscreen Static Layer)**:
  - 이미 정렬되어 맞춰진 `locked === true` 상태의 조각들은 최초 스냅 시 단 1회 오프스크린 캔버스에 정적으로 그려 캐시로 유지합니다.
- **활성 캔버스 (Dynamic Frame Layer)**:
  - 루프 렌더링 시에는 오프스크린 캔버스에 캐시된 정적 조각 레이어를 화면 전체에 `drawImage`로 단 1번 호출하여 덮어씁니다.
  - 그 위에 사용자가 현재 클릭하고 드래그하는 활성 조각 1개만 매 프레임 동적으로 렌더링하여 모바일 디바이스의 배터리 소모와 연산 부하를 극한으로 낮춥니다.

---

## 4. IndexedDB 자동 저장 및 오프라인 상태 복원 명세

### (1) 데이터 스토어 규격
- **DB명**: `haruPuzzleDB`
- **Store명**: `puzzleState` (KeyPath: `puzzleId`)
- **문서 오브젝트 데이터 구조**:
```json
{
  "puzzleId": "week24",
  "difficulty": "beginner",
  "progress": 72,
  "completed": false,
  "startedAt": "2026-06-01T00:00:00.000Z",
  "updatedAt": "2026-06-01T00:12:30.000Z",
  "timerSeconds": 312,
  "pieces": [
    { "id": 1, "x": 120, "y": 240, "locked": false },
    { "id": 2, "x": 500, "y": 100, "locked": true }
  ]
}
```

### (2) 2초 디바운스(Debounce) 자동 저장 프로세스
- 조각이 드래그되어 위치가 바뀌거나(`updatePiecePosition`), 스냅되어 맞물릴 때마다 IndexedDB에 저장 요청을 발행합니다.
- 쓰기 부하를 방지하기 위해 로컬 헬퍼 메소드에 **2초 디바운스(2000ms delay)**를 세팅합니다.
- 사용자가 빠른 템플릿으로 조각들을 맞추는 과정 중에는 로컬 IndexedDB 디스크 I/O가 정지해 있으며, 조각 조작을 멈추고 2초가 지나거나 페이지 포커스를 잃어버리는 즉시 최종 상태를 저장하도록 설계합니다.

### (3) 복원(Resume) 시나리오
- 사용자가 `/puzzle/:puzzleId` 라우트로 진입하는 즉시 IndexedDB의 `puzzleState`에 현재 `puzzleId`와 대조되는 항목이 있는지 조회합니다.
- **이어하기 복원 조건**: 레코드가 성공적으로 존재하고 `completed === false`인 경우.
- **UI 흐름**: "이전 플레이 중이던 퍼즐 기록이 존재합니다. 이어서 맞추시겠습니까?"를 묻는 슬라이드 모달을 노출합니다.
  - **수락 시**: `timerSeconds`와 조각들의 배열 좌표 정보를 상태 관리계(`puzzleStore`)에 이식하여 Canvas에 그대로 그리며 쾌속 복원합니다.
  - **거절/새로하기 시**: 해당 IndexedDB의 특정 퍼즐 키 항목을 완전히 삭제하고, 이미지 원본 크기로부터 조각 배열을 신규 초기 배치(무작위 Shuffle)하여 0% 상태로 플레이를 리부트합니다.

---

## 5. 비회원(Guest First) 및 회원 로그인 분기 시나리오

개발 에이전트는 로그인 상태 유무에 따른 UX 차단 정책을 엄격하게 구현해야 합니다.

### (1) 비로그인 유저 (Guest)
- **가능한 범위**: 퍼즐 목록 조회, 아카이브 진입, 로컬 Canvas 퍼즐 플레이, IndexedDB 실시간 백업, 이어하기, 오프라인 모드.
- **제한된 범위**:
  - 퍼즐이 100% 완료되었을 때, 하단의 **기록 저장하기** 버튼 클릭 시 즉각 로그인 가이드 모달로 진입시킵니다.
  - "로그인 후 기록을 등록하면 공식 주간 랭킹에 본인 닉네임과 최고 기록을 등재할 수 있습니다"라는 안내 메커니즘을 적용해 비로그인 참여를 보장하면서도 로그인을 유도합니다.

### (2) 로그인 유저 (Kakao OAuth User)
- **추가 확장 기능**:
  - 퍼즐 완성 시, 백엔드로부터 사전 발급받았던 `challengeToken`을 첨부하여 `POST /api/results`로 전송, 랭킹에 기록을 저장합니다.
  - 퍼즐 시작 시 자동으로 `POST /api/challenge/start`를 호출하여 백엔드 검증 토큰 정보를 보관합니다.
  - 로컬 IndexedDB에 저장되는 것과 동시에, `POST /api/progress` API를 2초 디바운스로 병렬 동기화하여 다른 컴퓨터에서 마이페이지를 통해 접속하더라도 마지막 퍼즐 플레이 상태를 완벽히 동기화해 줍니다.

---

## 6. 고급 비주얼 및 프리미엄 스타일 가이드

사용자에게 프리미엄 힐링 게임이라는 첫인상을 줄 수 있도록 현대적이고 완성도 높은 웹 디자인 요소를 적극 활용해야 합니다.

- **색상 테마**: 인공적인 형광색을 완전 배제하고, 차분한 HSL 테마와 어두운 저조도 파스텔톤 다크 테마를 기본으로 사용합니다.
- **글래스모피즘(Glassmorphism)**: 캔버스를 래핑하는 패널, 툴바, 랭킹 리스트 등에 투명한 블러 처리(`backdrop-filter: blur(12px)`)와 파스텔 그라데이션 선 테두리를 세련되게 적용합니다.
- **인터랙션 애니메이션**: Framer Motion을 사용하여 홈 카드 썸네일 호버 시 입체 3D 틸트 효과를 더하고, 아카이브 전환 시 모션 슬라이드 효과를 추가하여 UI가 살아 움직이는 듯한 느낌을 보장합니다.
