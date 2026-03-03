# 교사용 랜덤 도구 웹 서비스 (Teacher Random Tool) - AI Context

본 문서는 AI 에이전트가 `teacher-random-tool` 프로젝트의 목적, 구조, 기술적 제약 사항, 핵심 기능을 명확히 이해하고 개발을 보조하기 위해 작성되었습니다.

## 1. 프로젝트 개요 (Overview)

### 1.1 목적
교실 환경에서 교사가 수업 도구로 즉시 사용할 수 있는 **웹 기반 랜덤 유틸리티**입니다. 복잡한 설치나 설정 없이 바로 사용할 수 있으며, 학생들의 흥미를 유발하는 시각적 연출(애니메이션)을 중요시합니다.

### 1.2 핵심 제약 사항 (Constraints)
- **Zero Backend**: 서버, DB, 로그인, 회원가입 기능이 **없음**.
- **No Installation**: 순수 웹 애플리케이션 (SPA) 형태.
- **Local Context**: 모든 데이터와 로직은 브라우저 내에서 처리 (`localStorage` 활용).
- **Environment**: 전자칠판, 교탁 PC, 태블릿 등 다양한 스크린 대응.

## 2. 아키텍처 및 기술 스택 (Architecture & Tech Stack)

- **Framework**: React (Vite 기반)
- **Language**: TypeScript
- **Routing**: `react-router-dom` (기능별 URL 분리)
- **Styling**: Vanilla CSS (Global Styling, `global.css`), CSS Modules 권장
- **Animation**: Canvas API (공 튀기기), CSS Animations (기본 효과)
- **Export**: `html-to-image` (DOM 캡처)
- **Deployment**: Static Hosting (GitHub Pages, Netlify 등)

## 3. 라우팅 및 페이지 구조 (Routing Structure)

| 경로 | 컴포넌트 역할 | 비고 |
|---|---|---|
| `/` | 홈 (Home) | 기능 선택 대시보드 |
| `/number` | 번호 뽑기 (NumberPicker) | 기본 랜덤 번호 추첨 |
| `/ball` | 공 튀기기 (BallPicker) | Canvas 물리 엔친/연출 기반 추첨 |
| `/seat` | 자리 배치 (SeatRandom) | 자리 배치 및 이미지 저장 |
| `/settings` | 설정 (Settings) | *선택 사항* (전체 학생 수, 반 정보 등) |

## 4. 상세 기능 명세 (Functional Specifications)

### 4.1 기본 랜덤 번호 뽑기 (`/number`)
- **Input**: 전체 학생 수(N), 뽑을 인원 수(S)
- **Output**: 1~N 사이의 중복 없는 정수 S개
- **Logic**:
  - `Math.random()` 기반의 무작위 추출.
  - **제외 기능**: 결석 등 특정 번호를 결과 집합에서 영구 제외 가능.
  - **재추첨**: 결과가 마음에 들지 않을 경우 다시 뽑기 가능.
- **UX**: 숫자는 매우 크게 표시, 슬롯머신 등의 텍스트 애니메이션 권장.

### 4.2 공 튀기기 (`/ball`)
- **Key Feature**: HTML5 Canvas를 이용한 공들의 물리적 움직임 연출.
- **Components**:
  - `Ball`: 번호가 적힌 원형 객체 대량 생성.
  - `Goal`: 공이 들어가는 구멍 또는 영역.
- **Modes**:
  1.  **연출형 (Rigged Mode)**:
      - 결과(당첨 번호)를 로직 내부에서 미리 결정 (`pre-determined`).
      - 시각적으로는 랜덤해 보이지만, 결정된 공만 골인되도록 유도하거나 그 공만 물리적으로 골인 처리.
      - **목적**: 수업 진행의 공정성 확보, 결과 재현성, 빠른 진행.
  2.  **물리형 (Physics Mode)**:
      - 완전한 무작위 물리 시뮬레이션.
      - 충돌 결과에 따라 우연히 골인하는 공이 당첨.
      - **목적**: 극도의 긴장감, 의외성. (단, 중복 당첨이나 늦은 진행 가능성 있음).
- **UI Requirement**: 현재 어떤 모드인지 교사가 인지할 수 있도록 작게라도 표시 필수.

### 4.3 자리 자동 배치 (`/seat`)
- **Input**: 전체 학생 수, 좌석 배치도(행/열).
- **Feature**:
  - **고정석 (Fixed Seats)**: 특정 학생(번호)을 특정 위치에 고정 (`Lock`). 고정된 사실은 결과 화면에서 숨김 처리(UI상 일반 학생과 구분 불가해야 함).
  - **셔플 (Shuffle)**: 고정되지 않은 나머지 학생들을 나머지 좌석에 무작위 할당.
- **Export**:
  - '이미지 저장' 버튼 제공.
  - 현재 배치된 좌석표 DOM 요소를 `html-to-image`로 캡처하여 다운로드.
  - UI 컨트롤(버튼 등)은 캡처에서 제외.

## 5. 데이터 저장소 (Data Persistence)

`localStorage`를 DB처럼 사용하여 브라우저 종료 후에도 설정을 유지합니다.

| Key | Type | Description |
|---|---|---|
| `TRT_SETTINGS_TOTAL_STUDENTS` | number | 전체 학생 수 (기본값) |
| `TRT_SEAT_FIXED_DATA` | JSON | 고정석 설정 데이터 `{ studentId: { x, y } }` |
| `TRT_LATEST_SEAT_RESULT` | JSON | 마지막 자리 배치 결과 (새로고침 복구용) |

## 6. UI/UX 가이드라인

1.  **Visibility**: 전자칠판 사용을 가정하여 버튼과 폰트는 일반 웹앱보다 1.5배~2배 크게 설계.
2.  **Simplicity**: 복잡한 메뉴 뎁스 지양. 원클릭으로 핵심 기능 수행.
3.  **Responsiveness**: F11 전체화면 모드에서도 레이아웃이 깨지지 않아야 함.
4.  **Flow**: 라우트 이동 시 이전 작업 상태(임시 결과)는 원칙적으로 초기화하되, 명시적 저장 데이터는 유지.