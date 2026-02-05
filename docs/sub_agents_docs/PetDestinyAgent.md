# Pet Destiny Agent Reference

## [Planning] 동물 운명연구소 (Animal Destiny Lab)
- **문서 위치**: `docs/planning/pet_destiny/01_pet_destiny_spec.md`
- **내용 요약**: 반려동물 사주/궁합 콘텐츠의 기획, 로직, UX, 기술 명세 상세

---

## AI 작업 지침

### 1. 목적
- 동물 운명연구소 콘텐츠의 Frontend 및 Backend 기능 구현
- 병렬 개발이 가능하도록 Backend(API/Logic)와 Frontend(UI/UX) 작업을 분리하여 정의

### 2. 병렬 작업 구조 (Parallel Execution)

#### [Track A] Backend & Logic Implementation
**목표**: 룰 기반 계산 엔진 및 API 서버 구현
1.  **데이터 구성 (Data Setup)**
    *   `apps/server/data/` 디렉토리에 JSON 템플릿 파일 생성
    *   `personality.json`, `health.json`, `mind.json`, `compatibility.json`, `fortune.json`
    *   기획 문서의 '데이터 구조' 및 '내용'을 토대로 더미/실제 텍스트 채우기
2.  **서비스 로직 구현 (Core Logic)**
    *   `apps/server/services/` 내 모듈 구현
    *   `zodiacService`: 띠 및 천간 계산
    *   `elementService`: 오행 변환 및 속성 매핑
    *   `compatibilityService`: 궁합 점수 계산
    *   `seedService`: 해시 기반 Seed 생성
3.  **API 구현 (API Layer)**
    *   `POST /api/pet-destiny` 엔드포인트 생성 (`apps/server/routes/` 등)
    *   Validation: Joi/Zod 등을 이용한 날짜 및 타입 검증
    *   Caching: 메모리 캐시 적용 (24시간 TTL)

#### [Track B] Frontend & UX Implementation
**목표**: 사용자 입력 및 결과 시각화 구현
1.  **페이지 스켈레톤 (Skeleton)**
    *   `apps/web/contents/pet-destiny/` 디렉토리 생성
    *   입력 페이지 (`page.tsx`) 및 결과 페이지 (`result/page.tsx`) 라우팅 구성
    *   `apps/web/app/pet-destiny/` Next.js 라우트 설정
2.  **입력 폼 UI (Input UX)**
    *   동물 선택(Radio), DatePicker 컴포넌트 구현
    *   순차적 입력 애니메이션 또는 Step UI 적용
    *   유효성 검사 및 '결과 보기' 버튼 활성화 로직
    *   로딩 화면 및 랜덤 문구 구현
3.  **결과 페이지 UI (Result UI)**
    *   결과 데이터 시각화 (게이지, 카드형 레이아웃)
    *   공유 기능 (카카오 SDK 연동, 클립보드 복사)
    *   SEO 메타태그 동적 생성 (`generateMetadata`)

### 3. 통합 및 검증 (Integration)
*   Back/Front 작업 완료 후 연동 테스트
*   **Deterministic 검증**: 동일 입력에 대해 서버 재시작 후에도 동일 결과가 나오는지 확인
*   **Rate Limit 확인**: 분당 10회 제한 동작 확인

### 4. 주의사항 (Critical Rules)
- **Strict Logic**: 오행/띠 계산 수식은 기획 문서의 공식을 정확히 따를 것 (`(year - 4) % 12` 등)
- **No Database**: DB 스키마 변경이나 마이그레이션 불필요. JSON과 코드로만 동작.
- **Security**: 서버 로그에 사용자 생년월일 남기지 말 것.
- **Parallelism**: Track A와 Track B는 서로 API 스키마(`Request/Response Schema`)만 준수하면 독립적으로 진행 가능.
