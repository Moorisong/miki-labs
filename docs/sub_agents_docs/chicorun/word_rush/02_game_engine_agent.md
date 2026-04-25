# Word Rush: Game Engine 에이전트 작업 문서

## 목표
워드 러시 게임의 핵심 플레이 로직, 상태 관리 (Custom Hook) 및 정답 처리 엔진을 구현합니다.

## 제약사항 및 규칙 (필독)
- `/docs/conventions/` 내의 코딩 스타일 문서 및 hooks 네이밍 규칙을 준수합니다.
- `apps/web/app/chicorun/game/word-rush/hooks` 또는 관련 유틸 폴더 내에서만 작업합니다.

## 상세 작업 내역

1. **상태 관리 훅 개발 (`useWordRushGame`)**
   - 게임 진행 상태 (Ready, Playing, Ending, Result)
   - 남은 시간(Time), 문제 인덱스 관리
   - 현재 힌트 스트링 및 정답 배열 파싱

2. **로직 엔진 개발**
   - 입력값과 정답 배열(`meaning.en`)을 정규화하여 일치 여부 비교 (대소문자/공백 무시)
   - 콤보 계산 로직 및 콤보 초기화 로직
   - 속도 기반 및 콤보 기반 스코어 계산

3. **연동 레이어 구성**
   - Backend API 에이전트가 만든 API 명세(`POST /start`, `POST /end`)를 모킹(Mocking)하여 연동 준비
   - UI 컴포넌트 에이전트가 쓸 수 있게 `isCorrect`, `currentScore`, `currentCombo` 등 인터페이스(Return Type) 명확화

이 문서를 바탕으로 Game Engine 에이전트 작업을 진행해주십시오. 담당 에이전트는 UI 컴포넌트를 설계/수정하지 않아야 하며 로직(Hooks/Utils)에만 집중합니다.
