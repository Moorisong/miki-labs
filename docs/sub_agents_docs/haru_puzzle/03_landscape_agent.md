# 🖥️ 가로모드(Landscape Mode) 전담 에이전트 (Landscape Agent) 작업 안내서

이 문서는 하루퍼즐(Haru Puzzle)의 **가로모드(Responsive Landscape Mode) 전용 레이아웃** 구현을 담당하는 에이전트를 위한 개발 명세서입니다.
**기존 세로모드 코드는 절대 수정하지 않으며**, 가로모드는 완전히 분리된 레이아웃 컴포넌트로 구현합니다.

---

## 04_haru_puzzle_planning.md § VII (가로모드 구현 스펙)

### 목표

기존 세로모드 UI 및 기능에 어떠한 영향도 주지 않으면서, 가로 화면(landscape orientation) 전용 플레이 환경을 추가한다.
가이드 이미지와 퍼즐판을 동시에 보면서 빠르게 조각을 맞출 수 있도록 설계한다.

---

### 화면 분류

#### Large Landscape
- **기준**: `orientation: landscape AND viewport width >= 1024px`
- **비율**: Guide 40% / Puzzle 40% / Tray 20%
- **보관함 폭**: 240px ~ 320px

#### Compact Landscape
- **기준**: `orientation: landscape AND viewport width < 1024px`
- **비율**: Guide 35% / Puzzle 45% / Tray 20%
- **보관함 폭**: 140px ~ 180px

---

### 공통 UI 레이아웃

```
┌────────────┬────────────┬─────────┐
│ Guide      │ Puzzle     │ Pieces  │
│ Draggable  │ Draggable  │ Fixed   │
│ Resizable  │ Resizable  │ Scroll  │
└────────────┴────────────┴─────────┘
```

---

### 각 패널 상세 스펙

#### Guide Panel (가이드 이미지)
| 속성 | 값 |
|------|-----|
| 초기 크기 | 퍼즐판과 동일 |
| 이동 | 드래그 가능 |
| 크기 조절 | 모서리 핸들 (50% ~ 250%) |
| 비율 유지 | 필수 (왜곡 금지) |
| 표시 원칙 | 항상 노출 (팝업 없음) |

#### Puzzle Panel (퍼즐판)
| 속성 | 값 |
|------|-----|
| 초기 크기 | 가이드 이미지와 동일 |
| 이동 | 드래그 가능 |
| 크기 조절 | 기존 `zoom` 상태 연동 (별도 시스템 금지) |

#### Tray Panel (조각 보관함)
| 속성 | 값 |
|------|-----|
| 사용 보관함 | 세로모드의 "모아보기 보관함"만 단일 사용 |
| 위치 | 항상 우측 고정 |
| 이동/크기조절 | 불가 |
| 스크롤 | 세로 스크롤 지원 |

---

### 인터랙션 모드 (드래그 충돌 방지)

| 모드 | 가이드 이동 | 퍼즐판 이동 | 조각 배치 |
|------|------------|------------|----------|
| **플레이 모드** (기본값) | ❌ | ❌ | ✅ |
| **이동 모드** | ✅ | ✅ | ❌ |

상단 툴바에 `[이동]` / `[플레이]` 토글 추가.

---

### IndexedDB 저장 필드 추가

```typescript
landscapeState: {
  guidePosition: { x: number; y: number };
  guideScale: number;
  boardPosition: { x: number; y: number };
  boardScale: number;
  interactionMode: 'play' | 'move';
}
```

기존 `puzzleState` 오브젝트에 병합하여 저장. 새로고침 후 이전 배치 복원.

---

## AI 작업 지침

### 목적

기존 세로모드 코드를 **단 한 줄도 수정하지 않고**, 가로모드 전용 레이아웃 컴포넌트를 분리 구현한다.

---

### 작업 단계

#### Step 1. orientation 분기 훅 구현

```typescript
// hooks/useOrientation.ts
export function useOrientation() {
  const [isLandscape, setIsLandscape] = useState(false);
  const [isLarge, setIsLarge] = useState(false);

  useEffect(() => {
    const check = () => {
      const landscape = window.matchMedia('(orientation: landscape)').matches;
      const large = window.innerWidth >= 1024;
      setIsLandscape(landscape);
      setIsLarge(large);
    };
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  return { isLandscape, isLarge };
}
```

#### Step 2. 레이아웃 분기 렌더링

```tsx
// pages/puzzle/play/[puzzleId].tsx (또는 PuzzlePlayPage.jsx)
import { useOrientation } from '@/hooks/useOrientation';
import { PortraitPuzzleLayout } from '@/components/puzzle/PortraitPuzzleLayout';   // 기존 세로모드 (변경 없음)
import { LandscapePuzzleLayout } from '@/components/puzzle/LandscapePuzzleLayout'; // 신규 가로모드

export default function PuzzlePlayPage() {
  const { isLandscape } = useOrientation();

  return isLandscape
    ? <LandscapePuzzleLayout />
    : <PortraitPuzzleLayout />;
}
```

> **주의**: 기존 세로모드 코드를 `PortraitPuzzleLayout`으로 감싸는 작업만 허용. 내부 로직 변경 금지.

#### Step 3. LandscapePuzzleLayout 컴포넌트 구현

파일 위치: `src/components/puzzle/LandscapePuzzleLayout.jsx`

구조:
```tsx
<div className="landscape-root">
  <LandscapeToolbar mode={interactionMode} onModeChange={setInteractionMode} />
  <div className="landscape-panels">
    <GuidePanel
      imageUrl={puzzleImageUrl}
      position={guidePosition}
      scale={guideScale}
      isDraggable={interactionMode === 'move'}
      onPositionChange={setGuidePosition}
      onScaleChange={setGuideScale}
    />
    <PuzzlePanelWrapper
      isDraggable={interactionMode === 'move'}
      position={boardPosition}
      onPositionChange={setBoardPosition}
    />
    <TrayPanel pieces={collectedPieces} />
  </div>
</div>
```

#### Step 4. GuidePanel 구현

- `position` state: `{ x, y }` (드래그로 변경)
- `scale` state: `number` (0.5 ~ 2.5, 모서리 핸들로 변경)
- `aspect-ratio` CSS로 비율 유지
- 모서리에 리사이즈 핸들 4개 (`resize-handle` class)
- Pointer Events로 드래그/리사이즈 통합 처리

#### Step 5. PuzzlePanelWrapper 구현

- 기존 퍼즐 컴포넌트(PuzzleCanvas 등)를 **그대로** 래핑
- 래퍼 레이어에서 드래그 이동만 추가
- 기존 zoom 상태(`puzzleStore.zoom`)는 그대로 사용
- `interactionMode === 'move'`일 때만 래퍼 드래그 활성화

#### Step 6. TrayPanel 구현

- 세로모드의 "모아보기 보관함" 컴포넌트를 직접 재사용
- 우측 고정 (`position: sticky` 또는 Flexbox 고정)
- 세로 스크롤 (`overflow-y: auto`)
- 이동/크기조절 UI 일체 제거

#### Step 7. LandscapeToolbar 구현

- 기존 세로모드 툴바를 건드리지 않고 별도 컴포넌트로 구현
- `[이동]` / `[플레이]` 토글 버튼
- 현재 모드를 시각적으로 표시 (활성 상태 강조)

#### Step 8. IndexedDB landscapeState 저장

- `services/indexedDB.js`의 기존 저장 함수 확장
- 기존 `puzzleState` 스키마에 `landscapeState` 필드를 병합 추가
- 기존 저장 로직(2초 디바운스, 언마운트 즉시 플러시) 동일하게 적용

#### Step 9. landscapeState Zustand 연동

- `puzzleStore`에 landscapeState 관련 action 추가:
  ```typescript
  setGuidePosition: (pos: {x: number; y: number}) => void;
  setGuideScale: (scale: number) => void;
  setBoardPosition: (pos: {x: number; y: number}) => void;
  setInteractionMode: (mode: 'play' | 'move') => void;
  restoreLandscapeState: (state: LandscapeState) => void;
  ```

---

### 주의사항

1. **세로모드 코드 수정 절대 금지**
   - 기존 퍼즐 컴포넌트, 스토어, IndexedDB 서비스의 기존 필드 및 로직 수정 불가
   - 기존 코드에는 "래핑"과 "추가"만 허용

2. **줌 기능 중복 구현 금지**
   - 가로모드의 퍼즐판 스케일은 반드시 기존 `puzzleStore`의 `zoom` 상태를 사용
   - 별도 zoom state 생성 금지

3. **보관함 구조 변경 금지**
   - 가로모드에서는 "모아보기 보관함" 컴포넌트를 재사용
   - 세로모드의 일반 보관함 + 모아보기 보관함 구조는 세로모드에서 그대로 유지

4. **드래그 충돌 방지 필수**
   - `interactionMode`가 `'play'`일 때는 GuidePanel, PuzzlePanelWrapper의 드래그 이벤트 비활성화
   - `interactionMode`가 `'move'`일 때는 조각 배치 이벤트 비활성화

5. **비율 유지 필수**
   - GuidePanel의 이미지 비율은 CSS `aspect-ratio` 또는 `object-fit: contain`으로 항상 유지

6. **IndexedDB 필드 추가 방식**
   - 기존 저장 데이터 구조에 `landscapeState` 키를 병합 추가 (기존 필드 제거/수정 금지)

7. **반응형 분기 명확화**
   - Large (≥1024px): Guide 40% / Puzzle 40% / Tray 20%
   - Compact (<1024px): Guide 35% / Puzzle 45% / Tray 20% (보관함 140~180px)

---

### 모듈 분리 구조 (병렬 구현 가능)

각 모듈은 독립적으로 병렬 구현 가능:

| 모듈 | 파일 | 의존성 |
|------|------|--------|
| `useOrientation` 훅 | `hooks/useOrientation.ts` | 없음 |
| `GuidePanel` | `components/puzzle/landscape/GuidePanel.jsx` | 없음 |
| `TrayPanel` | `components/puzzle/landscape/TrayPanel.jsx` | 기존 모아보기 보관함 컴포넌트 |
| `LandscapeToolbar` | `components/puzzle/landscape/LandscapeToolbar.jsx` | `puzzleStore` |
| `PuzzlePanelWrapper` | `components/puzzle/landscape/PuzzlePanelWrapper.jsx` | 기존 퍼즐 컴포넌트 |
| `LandscapePuzzleLayout` | `components/puzzle/LandscapePuzzleLayout.jsx` | 위 모든 컴포넌트 |
| `landscapeState` IndexedDB | `services/indexedDB.js` 확장 | 기존 저장 서비스 |
| `puzzleStore` 확장 | `stores/puzzleStore.js` 확장 | 기존 스토어 |

---

### 완료 기준 체크리스트

- [ ] `useOrientation` 훅 동작 확인 (resize, orientationchange 이벤트 반응)
- [ ] 세로모드 → 가로모드 전환 시 `LandscapePuzzleLayout` 렌더링 확인
- [ ] 가로모드 → 세로모드 전환 시 `PortraitPuzzleLayout`으로 복귀 확인 (기존 상태 보존)
- [ ] GuidePanel 드래그 이동 동작
- [ ] GuidePanel 모서리 핸들 크기 조절 (50%~250%, 비율 유지)
- [ ] PuzzlePanelWrapper 드래그 이동 동작 (이동 모드에서만)
- [ ] 기존 zoom 기능 가로모드에서도 정상 동작
- [ ] TrayPanel 우측 고정 및 세로 스크롤
- [ ] `[이동]` / `[플레이]` 모드 토글 동작
- [ ] 모드별 드래그 충돌 방지 확인
- [ ] `landscapeState` IndexedDB 저장 및 새로고침 후 복원
- [ ] Large / Compact 레이아웃 비율 분기 확인 (1024px 기준)
- [ ] 기존 세로모드 기능 전체 정상 동작 (회귀 없음)
