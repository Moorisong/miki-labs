# Pet Destiny Agent Reference

## [Planning] 운명연구소 (Animal Destiny Lab)
- **문서 위치**: `docs/planning/pet_destiny/01_pet_destiny_spec.md`
- **내용 요약**: 반려동물 사주/궁합 콘텐츠의 기획, 로직, UX, 기술 명세 상세

---

## AI 작업 지침

### 1. 목적
- 운명연구소 콘텐츠의 Frontend 및 Backend 기능 구현
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
    *   **생년월일 모름 처리**:
        *   CheckBox 토글 구현 ("모름 (평균 나이를 기준으로 분석)")
        *   체크 시 DatePicker 비활성화 및 `currentYear - 3`, `06-01` 자동 설정
    *   순차적 입력 애니메이션 또는 Step UI 적용
    *   유효성 검사 및 '결과 보기' 버튼 활성화 로직
    *   로딩 화면 및 랜덤 문구 구현
3.  **결과 페이지 UI (Result UI)**
    *   결과 데이터 시각화 (게이지, 카드형 레이아웃)
    *   **모름 상태 안내**: URL Query Param (`unknown=true`) 확인하여 상단 안내 문구 표시
    *   **카카오 공유 템플릿 구현**:
        *   SDK 초기화 (`window.Kakao.init`)
        *   `Kakao.Share.sendDefault` 호출
        *   템플릿: `🐾 ${score}점! ${petType}와 집사의 궁합: ${compatibilityLabel}`
        *   설명: `${petName}와(과) ${ownerName}...주요 성격: ${mainTrait}`
        *   이미지: `/opengraph-image.png`
    *   클립보드 복사 폴백
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

---

## 결과 편향 개선 AI 작업 지침

### 1. 개요
사용자가 항상 긍정적 결과만 보지 않도록 결과 균형을 조정한다.

### 2. 작업 영역

#### [Track C] 궁합 점수 개선
**파일**: `apps/server/src/services/pet-destiny/compatibility.service.ts`
1. Seed 기반 가중치 변동 적용
   ```ts
   const seedAdjust = (seed % 3) - 1; // -1, 0, +1
   const finalScore = Math.max(0, Math.min(100, baseScore + seedAdjust));
   ```
2. 점수 범위를 0~39 구간까지 확장하여 부정 결과 허용

#### [Track D] 문장 템플릿 다양화
**파일**: `apps/server/data/compatibility.json`
1. labels 구간 확장 (40~49: 애증관계, 0~39: 주인교체)
2. 각 구간별 중립/경고/부정 문장 추가

#### [Track E] 건강 및 올해 운세 개선 (Year Fortune Update)
**파일**: `apps/server/data/fortune.json`, `apps/server/src/services/pet-destiny/fortune.service.ts`

**1. 올해 운세 로직 고도화 (`fortune.service.ts`)**:
   - 오행 비교 점수(+2/+1/-1) + Seed 조정(-1/0/+1) = 최종 점수(Range: -2 ~ +3) 계산 로직 구현
   - 점수 구간별 레이블(대길/길/보통/주의/흉) 매핑
   - 이유(Reason) 텍스트 생성: "올해는 O(O) 기운이 [돕습니다/충돌합니다]."

**2. 템플릿 데이터 구조화 (`fortune.json`)**:
   - 기존 단순 문자열 배열에서 구조화된 객체 또는 매핑 테이블로 변경
   - 각 운세 레이블별 이모지 및 상세 설명(Description) 텍스트 정의
   - **예시**:
     ```json
     {
       "daegil": { "emoji": "🍀", "desc": "최고의 기회가 찾아올 거예요!" },
       "gil": { "emoji": "🌸", "desc": "좋은 기운이 함께합니다." },
       ...
     }
     ```

#### [Track F] 상세 성격 분석 구현 (Detailed Personality)
**파일**: `apps/server/data/personality_detail.json`, `apps/server/src/services/pet-destiny/index.ts`

**1. 데이터 파일 생성 (`personality_detail.json`)**:
   - 오행(목, 화, 토, 금, 수)별로 5개 카테고리(`intro`, `body_positive`, `body_habit`, `relation_owner`, `outro`) 구성
   - 각 카테고리당 최소 3개 이상의 문장 템플릿 작성
   - `{name}` 플레이스홀더 포함

**2. 로직 구현 (`index.ts` 내부 또는 `personality.service.ts`)**:
   - `calculateDetailedPersonality(petElement, petName, seed)` 함수 구현
   - Seed 비트연산 또는 모듈로 연산을 통해 각 카테고리에서 문장 하나씩 선택
   - 선택된 문장들을 `join(' ')`하여 최종 텍스트 생성
   - 기존 `personality.description` 필드를 이 생성된 텍스트로 대체

#### [Track G] 배너 광고 구현 (Cross Promotion)
**파일**: `apps/web/contents/pet-destiny/result/cross-banner.tsx` (신규), `apps/web/app/pet-destiny/result/page.tsx`
1.  **배너 컴포넌트 구현 (`cross-banner.tsx`)**:
    *   **디자인 스펙**:
        *   배경: `#F7F7F7` (또는 `#FFFFFF`)
        *   높이: 120~140px, Radius: 12~16px
        *   레이아웃: 아이콘(좌측) + 텍스트(중앙) + CTA(우측)
    *   **텍스트 내용**:
        *   Label: "고양이 집사를 위한 추천 앱" (Small)
        *   Title: "**고양이 건강 기록 앱, 묘록**" (Bold)
        *   Desc: "병원 기록 · 투약 일정 · 증상 메모를 한 곳에서 관리하세요"
        *   CTA: "앱 보러가기 →" (하루상자 메인 컬러 사용)
    *   **링크**: 묘록 랜딩 페이지(또는 스토어)로 새 탭 이동
2.  **결과 페이지 배치**:
    *   `result/page.tsx`의 최하단 (공유 버튼 아래, Footer 위)에 배치
    *   자연스러운 "추천" 느낌으로 노출 (광고 느낌 지양)

### 3. 구현 원칙
- **Deterministic 유지**: Seed 기반 변동은 같은 입력 = 같은 결과 보장
- **균형 목표**: 긍정 40% / 중립 35% / 주의·경고 25%
- **기존 API 스키마 유지**: Response 필드 변경 없음

