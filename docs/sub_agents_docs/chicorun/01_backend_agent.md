# 치코런 백엔드 에이전트 (Backend Agent) 지침서

## 🎯 목표
치코런 서비스의 백엔드(DB, API, Auth, 문제 생성 로직)만을 전담하여 구현합니다. 모델 설계부터 컨트롤러 최적화까지 완전히 독립적으로 병렬 작업 가능합니다.

## 📝 작업 내용

### 1. DB 모델(Schema) 및 레벨 시스템
* `Student` 모델에 `selectedLevel` (enum: beginner, intermediate, advanced) 필드 추가 (기본값: beginner).
* 레벨 선택 시 `progressIndex` 재매핑 및 `level offset` 적용 로직 구현.
  * beginner: 0 ~ 2999
  * intermediate: 3000 ~ 6999
  * advanced: 7000 ~ 9999

### 2. 🧠 문제 생성 엔진 (`generateQuestion`)
* **핵심 원칙**: DB 저장 없음, 서버 사이드 생성, deterministic.
* **Seed 생성**: `hash(studentId + classCode + progressIndex)`.
* **문제 유형**: `sentence_choice`, `word_order`, `fill_blank`, `translation`, `transformation`, `error_detection`, `word_meaning`.
* **레벨별 비율 적용**: `getTypeByIndex(progressIndex)` 로직 (동일 유형 3회 연속 금지).
* **템플릿 시스템**: `TEMPLATES` 및 `WORDS` 풀 구축 (레벨별 단어/문법 제약 적용).
* **오답 생성**: 최소 2가지 오류 혼합 (시제, 수일치, 어순 등).

### 3. API 엔드포인트 구현
* `GET /api/chicorun/question`: 현재 `progressIndex`와 `seed`에 기반한 문제 생성 및 반환.
* `POST /api/chicorun/answer`: `questionId`와 `seed` 무결성 검증, 정답 시 `$inc`를 사용한 원자적 업데이트.
* `POST /api/chicorun/level`: 레벨 선택 API (progressIndex 범위 이동).

---

## AI 작업 지침

### 목적
서버 부하를 최소화하면서 10,000개의 고품질 영어 학습 문제를 동적으로 생성하고 검증하는 시스템 구축.

### 작업 단계
1. `ChicorunStudent` 모델 업데이트 (selectedLevel 추가).
2. `ProblemEngine` 유틸리티 서비시 생성 (타입 결정, 템플릿 선택, 단어 조합).
3. `solveController.ts` 내 기존 placeholder 로직을 신규 엔진으로 교체.
4. 레벨 변경 API 구현.

### 주의사항
* **보안**: `questionId`는 반드시 서버의 시크릿과 `seed`, `progressIndex`를 조합하여 생성/검증해야 함.
* **일관성**: 동일한 `progressIndex`와 `studentId`에 대해 항상 동일한 문제가 생성되어야 함.
* **난이도**: 고급(Advanced) 레벨은 수능형 문장(7-12단어) 및 복합 구조를 반영해야 함.
