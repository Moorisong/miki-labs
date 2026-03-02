# System Agent: 자아탐험 (구 HTSM) Frontend

## 문서 위치
`docs/sub_agents_docs/how_they_see_me/01_frontend_agent.md`

## 개요
HTSM의 웹 클라이언트 구현 에이전트입니다.
Next.js (App Router) 환경에서 사용자가 테스트를 생성하고, 친구에게 공유하고, 결과를 확인하는 모든 과정을 담당합니다.

## 역할 및 책임 (R&R)
1. **페이지 라우팅 및 상태 관리**: `useSession`(NextAuth)과 `zustand`를 활용한 사용자 흐름 제어
2. **UI/UX 구현**:
    - **Step 1: 자기 선택 (Self Selection)**: 키워드 선택 및 테스트 생성
    - **Step 2: 공유 (Share)**: 카카오톡 공유 (친구 초대)
    - **Step 3: 친구 응답 (Friend Answer)**: 익명 답변 제출
    - **Step 4: 결과 확인 (Result)**: 3D Johari Window 시각화 (R3F) 및 분석 리포트
3. **API 연동**: `/api/htsm/*` 엔드포인트 통신 및 에러 핸들링
4. **인터랙티브 시각화**: `react-three-fiber`를 사용한 3D 결과 카드 구현 및 `html2canvas`를 활용한 이미지 생성

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
    - **참여 유도 (Request Page) - [상세 명세](docs/planning/how_they_see_me/05_share_feature_ux.md)**:
        - 타이틀: "친구에게 요청하기 👇"
        - 버튼: [친구 초대 (카카오톡)] / [초대 링크 복사]
        - **카카오 메시지**: 상세 문구는 소스 코드 및 상수를 참조
        - 링크: 요청 페이지 URL
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
    - **결과 확산 (Result Page) - [상세 명세](docs/planning/how_they_see_me/05_share_feature_ux.md)**:
        - **탭 구조 도입**: `[ 내 결과 공유 ]` (기본) / `[ 친구 참여시키기 ]`
        - 섹션 타이틀: "친구에게 공유하기 🔥"
        - **모드 1 (내 결과 공유)**:
            - 목적: 결과 자랑 ("내 결과 봐봐")
            - **카카오 메시지**: 상세 문구는 소스 코드 및 상수를 참조
            - 링크: 결과 페이지 URL
        - **모드 2 (친구 참여시키기)**:
            - 목적: 친구 유입 ("너도 해봐")
            - **카카오 메시지**: 상세 문구는 소스 코드 및 상수를 참조
            - 링크: 요청 페이지 URL (`/htsm/answer/[id]`)
    - **조건부 렌더링**:
        - 응답 < 3: "1 more to unlock..." 블러 처리 및 잠금 아이콘 (서버에서 `friendsNeeded` 값 제공)
        - 응답 >= 3: 3D Canvas 및 상세 리포트 노출
    - **카드 UI 변경**:
        - **서버 주도 렌더링**: 프론트엔드는 결과 텍스트를 생성하지 않음
        - 서버에서 받은 `description` 필드를 그대로 렌더링
        - 키워드 리스트 및 테마 색상도 서버 응답(`cards` 배열) 기반으로 표시
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
