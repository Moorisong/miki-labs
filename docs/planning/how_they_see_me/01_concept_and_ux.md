# HowTheySeeMe (HTSM) UI/UX Planning - Part 1

## 1. 목표

웹 메인을 **서비스 소개 + 테스트 참여 유도 랜딩 페이지**로 제작하여

사용자가 테스트를 바로 시작하도록 전환한다.

### 핵심 KPI

- 테스트 생성 수 (유입 지표)
- 공유 전환율 (바이럴 핵심 지표)
- 평균 참여 인원 (바이럴 강도)

---

## 2. 서비스 한 줄 정의

**"내가 아는 나 vs 남들이 보는 나"를 비교하는 성격 분석 서비스**

심리학 모델 *Johari Window* 기반이지만

서비스 전면에서는 **가볍고 재미있는 경험 중심**으로 제공한다.

※ Johari Window 언급은 **결과 페이지에서만 노출**

---

## 3. 핵심 컨셉

이 콘텐츠의 본질 = **친구 참여형 테스트**

단순 심리테스트 ❌

친구가 참여해야 완성되는 **공유형 콘텐츠**

👉 카카오 공유 = 성장 엔진

서비스 이름: **HowTheySeeMe (HTSM)**

---

## 4. 서비스 흐름 (핵심 UX)

### STEP 1 — 내가 생각하는 나 선택

- 성격 키워드 풀: **30~40개 제공**
- 선택 개수: **3개 선택**
- "내가 아는 나" 생성

👉 선택은 적고, 옵션은 많게 (피로 ↓ 다양성 ↑)

---

### STEP 2 — 친구에게 평가 요청

- 카카오 공유로 참여 유도
- 로그인 없이 익명 참여
- 친구 선택 개수: **3개 선택**

---

### STEP 3 — 결과 확장형 공개

결과는 **즉시 제공 + 참여 수에 따라 확장**

---

## 5. 결과 공개 구조 (매우 중요)

결과는 절대 잠그지 않는다.

| 참여 인원 | 상태 |
| --- | --- |
| 0명 | 기본 결과 제공 |
| 1~2명 | 맹목 영역 일부 공개 |
| **3명** | 결과 완성 ⭐ |
| **10명** | 평가 마감 🔒 |

핵심 메시지:
**3명 이상 참여 시 완전한 결과가 열립니다**

---

## 6. 바이럴 구조 (카카오 공유)

공유 목적 = 홍보 ❌

공유 목적 = **평가 요청**

### 공유 메시지 톤 (Help 요청형)

- 나를 한 단어로 표현하면 뭐야? 🙏
- 친구들이 보는 내 이미지 모으는 중 😂
- 10초 익명 평가 부탁해!

---

## 7. 참여 유도 장치

결과 페이지 필수 요소:

- 참여 인원 표시 (예: 2 / 3명)
- "완성까지 1명 남았어요" 메시지
- 공유 버튼 반복 노출

👉 공유 클릭 유도 핵심 장치

---

## 8. 결과 비주얼 전략 (핵심 ⭐)

결과 페이지 = 서비스 얼굴

목표: **스크린샷 찍고 싶게 만들기**

---

### 8.1 3D Johari Visualization (Hero 영역)

결과 상단에 **3D Johari Window 시각화** 제공

#### 연출 목표

"와… 내 결과 멋있다" → 저장/공유 유도

---

### 8.2 3D 구성 컨셉

공간 속에 떠있는 **4개의 카드**

| 영역 | 이름 |
| --- | --- |
| 좌상 | Open Self |
| 우상 | Blind Self |
| 좌하 | Hidden Self |
| 우하 | Unknown Self |

정면에서 보면 2x2 배열

살짝 3D 깊이감 유지

---

### 8.3 첫 진입 애니메이션

페이지 진입 시:

1. 화면 페이드 인
2. 중앙 빛 등장
3. 4개 카드가 사방에서 날아와 정렬

👉 "분석 완료" 연출

---

### 8.4 영역 크기 변화 로직

각 영역 카드 크기 = 데이터 비율

예:
Open 40% / Blind 25% / Hidden 20% / Unknown 15%

→ 카드 크기 자동 반영

시각적으로 즉시 이해 가능.

---

### 8.5 카드 정보 구성

각 카드 표시 정보:

- 영역 이름
- 퍼센트
- 대표 키워드 3개

이미 결과 카드 역할 수행

---

### 8.6 인터랙션

- 마우스 이동 → 카드 미세 회전
- Hover → 살짝 확대

👉 "살아있는 결과" 느낌

---

### 8.7 참여 증가 시 변화

친구 참여 증가 시:

- 재방문 시 카드 크기 재애니메이션

👉 결과 변화 체감 → 재공유 유도

---

### 8.8 SNS 공유 카드 생성

버튼: **Download Result Card**

자동 생성 이미지 포함:

- 4영역 정면 정렬
- 배경 그라데이션
- 서비스 로고
- 닉네임 / My Result

👉 SNS 업로드 최적화

---

## 9. Johari Window 공개 위치

결과 페이지 하단 설명:

> This result is based on the
> 
> 
> **Johari Window psychological model**
> 

신뢰도 상승 효과

---

## 10. 데이터 저장 설계 (MongoDB)

### johari_tests

- shareId
- selfKeywords
- answerCount
- isClosed
- createdAt

### johari_answers

- testId
- keywords
- fingerprintHash (중복 방지)

### johari_stats (선택)

키워드 통계 데이터

※ 개인정보 저장 없음

---

## 11. 서비스 성과 측정

### 1) 테스트 생성 수

= 유입 지표

### 2) 공유 전환율 (핵심)

친구 응답 1개 이상 받은 테스트 비율

### 3) 평균 참여 인원

| 평균 응답 수 | 의미 |
| --- | --- |
| 0~1 | 실패 |
| 1~2 | 가능성 |
| **3 이상** | 성공 가능 🔥 |

목표: 평균 3명 이상

---

## 12. 랜딩 핵심 메시지

### 메인 카피

**See how they see me.**

### 서브 카피

Friends help reveal the real you.

---

## 13. 핵심 전략 요약

1. 결과 즉시 제공 (이탈 방지)
2. 참여할수록 결과 확장 (공유 유도)
3. 카카오 공유 = 성장 엔진
4. 3D 결과 카드 = 공유 촉진 장치

---

## 한 줄 정리

**친구 참여로 완성되는 바이럴 심리 콘텐츠**

---

# UI/UX 페이지 구성 기획서

## 0. 전체 서비스 흐름

Landing → 자기선택 → 공유페이지(본인) → 친구응답페이지(친구) → 결과페이지

⚠️ 중요

- 공유 페이지 = 테스트 만든 사람이 보는 페이지
- 친구 응답 페이지 = 링크 눌러 들어온 친구가 보는 페이지

---

## 1. 랜딩 페이지 (Home)

### 목표

테스트 시작 전환

### Hero

**Headline**
See how they see me.

**Sub**
Friends help reveal the real you.

**CTA**
Start My Test →

(재방문 시) Continue My Result →

스크롤 없이 첫 화면에 배치

---

### 서비스 설명 (3 Step 카드)

1. Pick 3 words about yourself
2. Share with friends
3. See the real you revealed

텍스트 최소 / 시각 중심

---

### 소셜 프루프

Already discovering how they’re seen 👀

결과 카드 썸네일 3~4개 배치

---

### 하단 CTA 반복

Start My Test →

(재방문 시) Continue My Result →

---

## 2. 자기 선택 페이지 (Test Creation)

URL

/start

### 헤더

Step 1 of 2

Pick 3 words that describe YOU

---

### 키워드 선택 영역

- 30~40개 Chip 버튼
- 최대 3개 선택

상단 표시

Selected: 0 / 3

선택 시 색 반전

---

### CTA 버튼

비활성

Select 3 words to continue

활성

Start with Kakao →

클릭 시 카카오 로그인 후 테스트 생성 (DB에 카카오 ID 연동)

**※ 생성 시 카카오 계정과 연동하여 영구 저장 (재방문 UX 핵심)**

---

## 3. 공유 페이지 (본인용) ⭐

URL

/share/{shareId}

### 목적

친구에게 공유 유도

---

### 상단 메시지

Your test is ready 🎉

Now ask friends to describe you!

---

### 참여 진행 표시 (핵심)

0 / 3 friends responded

3 responses unlock your full result 🔓

---

### 공유 버튼 (Primary)

Ask Friends on Kakao 💬

### 보조 버튼

Copy Link

⚠️ 공유 버튼 반복 노출 필수

### 내 결과 보기 버튼 (추가)

View My Result (텍스트 링크 등)

---

### 안내 문구

Friends pick 3 words that describe you.

It takes 10 seconds and is anonymous.

---

## 4. 친구 응답 페이지 (친구용)

URL

/answer/{shareId}

### 목적

친구가 빠르게 응답 완료

---

### 헤더

Describe your friend 👀

Pick 3 words that fit them best

---

### 키워드 선택

자기 선택 페이지와 동일 UI 재사용

Select 3 words

---

### 제출 버튼

Submit anonymously

---

### 제출 완료 화면

Your response is recorded ✅

버튼 1 (바이럴 핵심 ⭐)

See Friend's Result →
(친구의 결과를 확인하고 재미를 느껴 본인 테스트 생성으로 유도)

버튼 2

Create Your Own Test →

바이럴 확장 장치

---

## 5. 결과 페이지 ⭐ 핵심 페이지

URL

/result/{shareId}

---

## 5.1 Hero — 3D Johari Window

진입 애니메이션

1. 화면 페이드 인
2. 중앙 빛 등장
3. 4개 카드 날아와 정렬

---

### 4 영역 카드

Open Self

Blind Self

Hidden Self

Unknown Self

카드 표시 정보

- 영역 이름
- 퍼센트
- 대표 키워드 3개

카드 크기 = 데이터 비율 반영

인터랙션

- 마우스 이동 → 미세 회전
- Hover → 확대

---

## 5.2 참여 진행 표시 (항상 노출)

예시

2 / 3 responses

1 more to unlock full result 🔓

10명 도달 시

Responses closed 🔒

---

## 5.3 공유 유도 영역

Help unlock the full result!

버튼

Ask More Friends 💬

반복 노출 필수

---

## 5.4 결과 카드 다운로드

Download Result Card

이미지 포함

- 4영역 카드
- 닉네임
- 서비스 로고
- 그라데이션 배경

SNS 업로드 최적화

---

## 5.5 Johari 설명 (하단)

This result is based on the Johari Window psychological model.

---

## 5.6 결과 카드 상세 UX (업데이트)

### 핵심 구조: 설명 우선, 키워드 상시 노출
기존 키워드 나열 방식의 "분석 느낌 부족" 문제를 해결하기 위해 **설명 문단(감정)**을 상단에 배치하고, **키워드(근거)**를 하단에 자연스럽게 노출함.

#### 1. 변경된 카드 구조
1. **영역 제목** (Open Self, etc.)
2. **설명 문단**
    - 3~4문장의 자연스러운 줄글
    - 템플릿 엔진으로 자동 생성 (AI 미사용)
3. **키워드 리스트** (상시 노출)
    - Chip UI 사용
    - 설명 문단 하단에 배치하여 근거 제시

#### 2. 설명 생성 시스템 (Template Engine)
- **입력**: 각 영역 Top 3 키워드
- **출력**: 160~260자 분량의 분석 리포트 스타일 문단
- **문단 구조**:
    - A. 영역 도입 (영역별 고정)
    - B. 키워드 핵심 해석 (ex: "{k1}하고 {k2}한 성향...")
    - C. 사회적 상호작용 (인간관계 영향)
    - D. 종합 마무리
- **기대 효과**: 스크린샷 매력 증가, 체류 시간 증대, 결과 신뢰도 상승

---

## 6. 퍼널 목표 요약

Landing → 테스트 시작

자기선택 → 테스트 생성

공유페이지 → 공유 클릭

친구응답 → 응답 완료

결과페이지 → 재공유

---

# 핵심 UX 원칙

1. 모든 단계 빠르게
2. 결과 절대 잠그지 않음
3. 참여 수 항상 표시
4. 공유 버튼 반복 노출
5. 결과 페이지 = 스크린샷 욕구 유발

---

# 프론트엔드 - 기술 가이드

## 1. 전역 상태 설계

전역으로 관리해야 하는 데이터는 최소화한다.

현재 생성된 테스트 정보

shareId : 문자열

selfKeywords : 문자열 목록

결과 페이지 메타 정보

answerCount : 숫자

isClosed : 불리언

React Context 사용 권장.

## 2. API 설계

테스트 생성 API

POST 요청

엔드포인트 : tests

전송 데이터

selfKeywords : 문자열 3개

응답 데이터

shareId : 문자열

---

친구 응답 제출 API

POST 요청

엔드포인트 : answers

전송 데이터

shareId : 문자열

keywords : 문자열 3개

---

결과 조회 API

GET 요청

엔드포인트 : result 아이디

응답 데이터

answerCount : 숫자

isClosed : 불리언

Johari 결과 객체 포함

open 영역 → 퍼센트 + 키워드 목록

blind 영역 → 퍼센트 + 키워드 목록

hidden 영역 → 퍼센트 + 키워드 목록

unknown 영역 → 퍼센트 + 키워드 목록
