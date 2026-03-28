# 치코런 백엔드 에이전트 (Backend Agent) 지침서

## 🎯 목표
치코런 서비스의 백엔드(DB, API, Auth, 문제 생성 로직)만을 전담하여 구현합니다. 모델 설계부터 컨트롤러 최적화까지 완전히 독립적으로 병렬 작업 가능합니다.

## 📝 작업 내용

### 1. DB 모델(Schema) 및 레벨 시스템
* `ChicorunStudent` 모델 구현:
    - `progressIndex`: 0~1499 (현재 풀고 있는 전체 문제 번호)
    - `currentLevel`: 1~100 (현재 플레이 중인 레벨)
    - `achievedMaxLevel`: 검증된 최고 레벨 (포인트 페널티 및 레벨 점프 판단 기준)
    - 레벨별 문제 수: 1-30레벨(12개), 31-70레벨(15개), 71-100레벨(18개)
* `ChicorunProblem` 모델 구현:
    - `level`, `orderIndex`, `difficulty` ('easy'|'medium'|'hard') 기반 조회

### 2. 🧠 문제 조회 및 정답 검정 로직
* **핵심 원칙**: 미리 시딩된 DB에서 `level`, `orderIndex`, `difficulty`에 맞춰 조회.
* **Seed 생성**: `hash(studentId + progressIndex)`를 통해 프론트엔드와 무결성 검증.
* **포인트 시스템**: 
    - 시도 횟수 페널티: 1차=5P, 2차=3P, 3차이상=1P
    - 레벨/난이도 페널티: `achievedMaxLevel`보다 훨씬 낮은 레벨을 풀 때 factor(0.3~0.6) 적용.

### 3. API 엔드포인트 구현
* `GET /api/chicorun/question`: 현재 진도에 맞는 문제 및 예상 획득 포인트 반환.
* `POST /api/chicorun/answer`: 정답 여부 확인 및 포인트/통계/진도 원자적 업데이트.
* `POST /api/chicorun/level`: 레벨 선택 및 시작 지점 설정.
* `POST /api/chicorun/reset-achieved-level`: 최고 레벨 기록 초기화.
* `GET /api/chicorun/ranking`: 글로벌 Top 30 랭킹 API.

---

## AI 작업 지침

### 목적
데이터베이스 기반의 견고한 학습 시스템을 구축하고, 개별 학생의 진도와 실력을 정확하게 추적하며 보상을 관리합니다.

### 작업 단계
1. `ChicorunStudent` 및 `ChicorunProblem` 스키마 완성.
2. `getLevelAndOrderIndex(progressIndex)` 유틸리티 함수 구현.
3. `submitAnswer` 내 통계(정확도, 스트릭) 업데이트 및 레벨 클리어 조건 로직 구현.
4. 글로벌 랭킹 API (`point` 기준 내림차순) 구현.

### 주의사항
* **보안**: `questionId`는 반드시 서버의 시크릿과 `seed`, `progressIndex`를 조합하여 생성/검증해야 함.
* **일관성**: 동일한 `progressIndex`와 `studentId`에 대해 항상 동일한 문제가 생성되어야 함.
* **난이도**: 고급(Advanced) 레벨은 수능형 문장(7-12단어) 및 복합 구조를 반영해야 함.
