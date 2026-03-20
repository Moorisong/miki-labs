# 치코런 백엔드 에이전트 (Backend Agent) 지침서

## 🎯 목표
치코런 서비스의 백엔드(DB, API, Auth, 문제 생성 로직)만을 전담하여 구현합니다. 모델 설계부터 컨트롤러 최적화까지 완전히 독립적으로 병렬 작업 가능합니다.

## 📝 작업 내용

### 1. DB 모델(Schema) 구현
- `Teacher`: kakaoId, name, createdAt.
- `Class`: classCode, teacherId, title.
- `Student`: studentId, classCode, nickname, passwordHash, progressIndex, point, badge, nicknameStyle, cardStyle, customize. **학생은 시스템 내 하나의 클래스에만 소속될 수 있으며, classCode + nickname 조합으로 식별.** 커스터마이징 데이터는 `students` 다큐먼트에 임베디드로 작성.

### 2. 인증 미들웨어
- 학생 인증(`studentAuth`) 및 교사 인증(`teacherAuth`) 분리. 
- Stateless 기반의 JWT 로그인 및 Payload 검증.

### 3. 학습 및 문제 채점 핵심 로직 (`solveController.js`)
- `GET /api/question`: `progressIndex` 기반 템플릿 문제 **계산 및 생성** (DB 랜덤 탐색 금지, seed 및 templateId 조합).
- `POST /api/answer`: 전달받은 `questionId`와 `seed`의 무결성 검증 후, 정답 시 `$inc`를 사용해 `progressIndex`와 `point` 1회 원자적(Atomic) 업데이트.

### 4. 기타 API
- 학생 로그인/가입 API 생성, 비밀번호는 초기 1회 bcrypt 비교 후 폐기.
- 클래스 생성, 학생 비번 초기화, 랭킹 리스트 조회 등 (progress 미포함).

## ⚠️ 주의사항 (토큰 및 리소스 절약)
- 프론트엔드 상태에 구애받지 않고 Postman이나 curl로 동작 검증 가능한 격리된 API를 목표로 설계합니다.
- 동시성 처리 충돌 방지를 위해 `$inc: { progressIndex: 1 }` 조건식에 주의합니다.
