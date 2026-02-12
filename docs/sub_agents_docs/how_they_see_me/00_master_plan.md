# System Agent: HowTheySeeMe (HTSM) Core

## 문서 위치
`docs/sub_agents_docs/how_they_see_me/00_master_plan.md`

## 개요
HowTheySeeMe(HTSM)는 친구들의 익명 평가를 통해 "내가 보는 나"와 "남이 보는 나"를 비교하는 **Johari Window 기반 심리/성격 분석 웹 서비스**입니다.

## 핵심 목표
1. **극강의 바이럴**: 친구가 참여해야 결과가 열리는 구조 (Lock-in & Share)
2. **가벼운 경험**: 로그인 없음, 익명성 보장, 10초 내 참여 완료
3. **매력적인 결과**: 3D 시각화 및 고퀄리티 결과 카드로 "자랑하고 싶은" 욕구 자극

---

## Agent Roster (병렬 작업자 명단)

### 1. [HTSM-Front] Frontend Implementation Agent
- **담당**: UI/UX, 페이지 라우팅, 3D 시각화, 공유 플로우
- **문서**: `docs/sub_agents_docs/how_they_see_me/01_frontend_agent.md`
- **주요 기술**: Next.js (App Router), Three.js (R3F), Zustand, Framer Motion

### 2. [HTSM-Back] Backend & Security Agent
- **담당**: API 서버, 데이터 모델링(MongoDB), 보안(Rate Limit, Proof Token), 로직(Johari 계산)
- **문서**: `docs/sub_agents_docs/how_they_see_me/02_backend_agent.md`
- **주요 기술**: Express, MongoDB(Mongoose), Redis(옵션/메모리), Helmet

---

## Phase별 진행 계획

### Phase 1: Foundation (Zero-setup)
- **[Back]**: Express 서버 세팅, MongoDB 연결, 보안 미들웨어(Helmet, CORS) 설정
- **[Front]**: Next.js 라우팅 구조(/start, /headers, /result) 생성, 기본 레이아웃 및 디자인 시스템(폰트, 컬러) 정의

### Phase 2: Core Logic & API
- **[Back]**:
    - 키워드 데이터셋(Whitelist) 정의 (`data/htsm_keywords.json`)
    - DB 스키마 설계 (`JohariTest`, `JohariAnswer`)
    - API 엔드포인트 구현 (생성, 응답, 결과 조회)
    - Proof Token 발급 및 검증 로직 구현
- **[Front]**:
    - API 클라이언트 모듈 작성 (Axios Instance)
    - 전역 상태 관리(Zustand) 설계 (내 키워드, 공유 ID 등)

### Phase 3: UI & Interaction
- **[Front]**:
    - **Step 1 (Self)**: 키워드 선택 UI (Chip 선택 3개 제한)
    - **Step 2 (Share)**: 공유 페이지 및 카카오톡 공유하기 연동
    - **Step 3 (Friend)**: 친구 응답 페이지 및 제출 완료 UI
    - **Step 4 (Result)**:
        - 결과 대기/완성 상태 분기 처리
        - **Three.js**: 3D Johari Window 캔버스 구현 (Card 오브젝트, 회전/확대 인터랙션)
        - `html2canvas`: 결과 카드 이미지 생성 및 다운로드

### Phase 4: Integration & Optimization
- **[Back]**: Rate Limit 적용, 배포 환경 설정
- **[Front]**: SEO 메타태그(Open Graph) 동적 생성, 로딩/에러 처리, 모바일 반응형 디테일 수정
- **[VQA]**: 전체 플로우 테스트 (생성 -> 공유 -> 친구응답 3회 -> 결과 확인)

---

## 중요 공통 규칙 (Ground Rules)
1. **데이터 보존**: 기존 Claw Addict, Pet Destiny 등 다른 서비스의 코드/데이터에 영향을 주지 않는다. (`apps/web/contents/htsm`, `apps/server/src/routes/htsm` 등으로 격리)
2. **익명성 AI**: 개인식별정보(PII)는 절대 수집하지 않는다. (IP 해시만 중복 방지 용도로 사용)
3. **확장성**: 추후 다른 심리 테스트가 추가될 것을 고려하여 컴포넌트나 유틸리티를 범용적으로 설계하려 노력한다 (필수는 아님).
