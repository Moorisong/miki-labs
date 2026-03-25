# 치코런(Chicorun) - 기술 및 기획 통합 명세

## 1. 서비스 개요
교사가 클래스를 생성하고 학생들이 참여하여 게임 방식으로 영어 학습을 진행하는 웹 서비스입니다. 닉네임과 비밀번호만으로 빠르게 접속하며, 최초 로그인 이후에는 JWT 기반 인증이 유지됩니다.

---

## 2. 사용자 구조
- **교사**: 클래스 생성, 학생 관리, 학습 진행 상황 확인 (카카오 로그인 연동).
- **학생**: 클래스 링크 입장, 닉네임+비밀번호 등록 및 학습 진행 (JWT 인증).

---

## 3. 데이터베이스 설계 (MongoDB/Mongoose)

### students
- **_id**: ObjectId
- **classCode**: String (클래스 고유 코드)
- **nickname**: String (유니크 닉네임)
- **passwordHash**: String (bcrypt 해시)
- **progressIndex**: Number (완료한 총 문제 수, 0~1499)
- **point**: Number (보유 포인트)
- **badge**: String (배지 이미지 경로)
- **nicknameStyle**: { color, bold, italic, underline, fontSize, x, y, rotate }
- **cardStyle**: String (배경 색상 또는 그라디언트)
- **customize**:
    - **stickers**: Array of { id, emoji, x, y, scale, rotate }
    - **frameId**: String
    - **badgeId**: String
    - **borderStyle**: { color, width, style, radius }
    - **pointStyle**: { color, background, borderWidth, borderColor, fontSize, x, y, rotate }
    - **rankStyle**: { color, fontSize, x, y, rotate }
    - **badgeStyle**: { fontSize, x, y, rotate }
- **ownedItems**: Array of itemIds
- **currentLevel**: Number (현재 플레이 레벨)
- **achievedMaxLevel**: Number (검증된 최고 레벨, 페널티 기준)
- **currentLevelSolvedCount/TotalCount**: 통계
- **currentLevelMaxStreak/CurrentStreak**: 연속 정답 정보

👉 **카드 규격**: 260px x 340px (모든 커스터마이징 좌표는 이 범위 내에 존재해야 함)

---

## 4. 레벨 및 문제 시스템

### 4.1 레벨 구조
- **총 100 레벨**, 1,500문제로 구성.
- **초급 (1~30)**: 레벨당 12문제 (총 360문제)
- **중급 (31~70)**: 레벨당 15문제 (총 600문제)
- **고급 (71~100)**: 레벨당 18문제 (총 540문제)

### 4.2 레벨 관리 (이원화)
- **currentLevel**: 학생이 자유롭게 이동 가능한 레벨.
- **achievedMaxLevel**: 레벨 완주(정확도 및 스트릭 조건 충족) 시에만 업데이트되는 기준 레벨.

### 4.3 문제 출제
- 모든 문제는 미리 생성되어 **DB에 저장**되어 있음.
- `progressIndex`에 따라 순차적으로 출제됨 (Deterministic).
- 서버는 ‘조회’하는 것이 아니라 인덱스에 따라 ‘배정’함.

---

## 5. 포인트 시스템

### 기본 보상 (시도 횟수 기반)
- **1차 시도 (Perfect!)**: **5P**
- **2차 시도 (Great!)**: **3P**
- **3차 시도 이상 (Good!)**: **1P**

### 보너스 및 페널티
- **레벨 클리어**: +50P
- **10연속 1회 정답 (Perfect 10)**: +20P
- **레벨 차이 페널티**: `currentLevel`이 `achievedMaxLevel`보다 훨씬 낮은 경우 보상 감소 (-3레벨 이하 50%, -6레벨 이하 30% 이하).

---

## 6. 🏆 랭킹 및 꾸미기 페이지

### 랭킹 페이지
- 포인트 기준 클래스 내 실시간 랭킹.
- 커스터마이징된 프로필 카드 노출.
- 등수(#n)는 카드 외부 상단에 별도 표시.

### 꾸미기 페이지
- 배지, 배경, 스티커 배치 가능.
- 드래그 앤 드롭으로 스티커 위치 및 크기, 회전 조절.
- 저장 시 포인트 차감 (일일 횟수별 차등 차감: 1회 100P, 2회 200P...).

---

## 7. 보안 및 최적화
- **bcrypt** 기반 비밀번호 해시 저장.
- **JWT** 기반 무상위(Stateless) 인증.
- **progressIndex + seed** 기반 문제 유효성 검증.
- 랭킹 및 대량 조회 시 인덱스 최적화 (`{ classCode: 1, point: -1 }`).
