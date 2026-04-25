# Word Rush: Backend API 에이전트 작업 문서

## 목표
워드 러시 게임의 서버사이드 로직과 API를 구현합니다.

## 제약사항 및 규칙 (필독)
- `/docs/conventions/` 내의 코딩 스타일 문서를 반드시 준수합니다.
- `apps/server/` 디렉토리 내에서만 작업합니다.

## 상세 작업 내역

1. **스키마 및 모델 업데이트**
   - 레전드 기록 스키마 추가 (`models/chicorun-word-rush-legend.model.ts`)
   - 유저 세션 스키마 추가 (`models/chicorun-word-rush-session.model.ts`)

2. **Game Start API 구현 (`POST /chicorun/word-rush/start`)**
   - 중복 방지 로직 (session 기반) 추가
   - 문제 생성 시스템 구현 (Word, WordHints DB 조회, 동일 중복 방지 기반 힌트 추출)
   - 최대 30문제 세트 생성

3. **Game End API 구현 (`POST /chicorun/word-rush/end`)**
   - 정답 및 입력 검증 (치팅 방지 로직)
   - rankPoint 및 coin 획득 계산
   - 레전드 점수 갱신 로직

4. **치팅 방지 및 캐싱 적용**
   - 입력 속도 타임스탬프 검증 등

이 문서를 바탕으로 Backend API 에이전트 작업을 진행해주십시오. 담당 에이전트는 프론트엔드쪽 작업을 일절 수정하지 말아야 합니다.
