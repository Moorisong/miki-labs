# System Agent: HowTheySeeMe (HTSM) Frontend

## 문서 위치
`docs/sub_agents_docs/how_they_see_me/01_frontend_agent.md`

## 개요
HowTheySeeMe의 웹 클라이언트 구현 에이전트입니다.
Next.js (App Router) 환경에서 사용자가 테스트를 생성하고, 친구에게 공유하고, 결과를 확인하는 모든 과정을 담당합니다.

## 역할 및 책임 (R&R)
1. **페이지 라우팅 및 상태 관리**: `useRouter` 및 `zustand`를 통한 SPA/MPA 구조 설계
2. **UI/UX 구현**:
    - **Step 1 (My Test)**: 키워드 선택 및 제출
    - **Step 2 (Share)**: 카카오 공유 및 링크 복사
    - **Step 3 (Friend)**: 키워드 선택 및 익명 제출
    - **Step 4 (Result)**: 3D Johari Window 시각화 및 결과 잠금 해제
3. **API 연동**: `axios`를 사용한 서버 통신 (생성, 응답, 결과 조회)
4. **시각화 및 바이럴**: `Three.js` (R3F)를 활용한 Johari Window 3D 카드, `html2canvas`를 활용한 이미지 생성

## 기술 스택
- **Framework**: Next.js (App Router)
- **State Management**: Zustand (전역 상태)
- **Styling**: `styled-components` 또는 `Tailwind CSS` (프로젝트 기본 설정 따름)
- **Visualization**: React Three Fiber (R3F)
- **Viral**: Kakao SDK, html2canvas

---

## 구현 단계 (Step-by-Step)

### Step 1: 프로젝트 구조 및 공통 설정
- **라우트 생성**:
    - `/htsm` (랜딩)
    - `/htsm/start` (내 키워드 선택)
    - `/htsm/share/[id]` (공유 페이지 - 작성자용)
    - `/htsm/answer/[id]` (친구 응답 페이지)
    - `/htsm/result/[id]` (최종 결과)
- **전역 상태 (Zustand)**:
    - store명: `useHtsmStore`
    - state: `shareId`, `myKeywords`, `friendKeywords`, `resultData`, `isLoading`
- **공통 컴포넌트**: `KeywordChip`, `ActionButton`, `PageContainer`

### Step 2: HTSM 랜딩 & 테스트 생성
- **랜딩 (`/htsm`)**:
    - 히어로 섹션 ("See how they see me")
    - "Start My Test" 버튼 -> `/htsm/start` 이동
    - (로그인된 경우) "Continue My Result" 버튼 노출
- **생성 페이지 (`/htsm/start`)**:
    - **로그인 체크**: 미로그인 시 "카카오로 시작하기" 버튼 노출 (필수)
    - 30~40개 키워드 리스트 렌더링 (Chips)
    - 최대 3개 선택 로직 (useState)
    - "Create My Test" 버튼 -> `POST /api/htsm/tests` 호출 (userId 포함) -> 성공 시 `/htsm/share/[id]` 이동

### Step 3: 공유 페이지 (작성자)
- **공유 페이지 (`/htsm/share/[id]`)**:
    - "0 / 3 friends responded" 진행 상태 표시 (Polling 또는 SWR 활용)
    - "Ask Friends on Kakao" 버튼 -> Kakao SDK `sendDefault` 호출
    - "Copy Link" 버튼 -> `navigator.clipboard.writeText`

### Step 4: 친구 응답 페이지
- **응답 페이지 (`/htsm/answer/[id]`)**:
    - "Describe your friend" 헤더
    - 키워드 선택 UI 재사용 (Chips)
    - "Submit anonymously" 버튼 -> `POST /api/htsm/answers` 호출
    - 성공 시 완료 화면 ("Create Your Own Test" 버튼 노출)

### Step 5: 결과 페이지 & 3D 시각화 (업데이트)
- **결과 페이지 (`/htsm/result/[id]`)**:
    - `GET /api/htsm/result/[id]` 호출
    - **조건부 렌더링**:
        - 응답 < 3: "1 more to unlock..." 블러 처리 및 잠금 아이콘
        - 응답 >= 3: 3D Canvas 및 상세 리포트 노출
    - **카드 UI 변경**:
        1. **설명 문단** (Template Engine 사용)
        2. **키워드 리스트** (상시 노출)
    - **Template Engine**:
        - [HTSM 결과 설명 문체 가이드](docs/planning/how_they_see_me/04_result_style_guide.md) 준수
        - AI 사용 없이 규칙 기반으로 **분석 리포트형** 문단 생성
        - **감정 흐름 구현**: 잔잔(Open) -> 흥미(Blind) -> **강렬(Hidden)** -> 여운(Unknown)
        - **5문장 구조**: `{도입} + {키워드1 강조} + {키워드2~3 연결} + {관계/상황 영향} + {마무리 인사이트}`
        - "사실은", "의외로", "겉으로는 ~하지만" 등 대비 표현을 사용하여 숨겨진 자아에서 감정 피크 유발
        - "작용합니다", "요소" 등 AI/논문 느낌 단어 절대 사용 금지
        - "당신"을 주인공으로 한 솔직하고 임팩트 있는 설명 제공
    - **3D Canvas (R3F)**:
        - 4개 영역(Open, Blind, Hidden, Unknown) 카드 배치 (2x2)
        - 각 영역 크기/위치는 데이터 비율에 따라 동적 조정
        - 마우스 인터랙션 (회전, 호버 시 확대)
    - **다운로드**:
        - "Download Result Card" 버튼 클릭 시 `html2canvas`로 특정 DOM 캡처 및 저장

### Step 6: 최적화 및 SEO
- **SEO**:
    - 각 페이지별 `generateMetadata` 구현 (Opengraph 이미지, 설명 동적 생성)
- **성능**:
    - 3D 모델(폰트 등) Preload
    - 카카오 SDK Lazy Loading

---

## 주의사항
- **API 에러 처리**:
    - 404 (존재하지 않는 테스트): 에러 페이지 또는 랜딩 리다이렉트
    - 403 (Rate Limit): "잠시 후 다시 시도해주세요" 모달
- **모바일 대응**:
    - 3D 캔버스 터치 제스처 지원 (OrbitControls 설정 조절)
    - 작은 화면에서 텍스트 줄바꿈/오버플로우 방지
- **Kakao Key**: `.env` 변수 확인 (`NEXT_PUBLIC_KAKAO_JS_KEY`)
