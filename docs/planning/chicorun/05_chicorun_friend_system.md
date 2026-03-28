# 05. 치코런 친구 시스템 명세

## 1. 목적
치코런은 혼자 학습하는 서비스지만, 친구와 함께 경쟁하고 서로의 성장을 응원하며 동기부여를 높이기 위해 **친구 시스템**을 도입한다.  
사용자는 닉네임으로 친구를 검색하고 신청 → 수락하면 친구가 되며, 친구 목록에서 서로의 진행 상황을 확인할 수 있다.

## 2. 핵심 기능 요구사항
- 닉네임은 **유니크**하며, 닉네임 검색으로만 친구 신청이 가능하다.
- 친구 신청 → 수락/거절 방식 (양방향 동의)
- 웹 환경에 최적화된 접근성 높은 UI
- 친구 기능은 학습의 보조 수단으로, 과도하게 복잡하지 않게 설계

## 3. UI/UX 설계

### 3.1 주요 진입점
- **주 진입점**: 헤더(Top Navigation) 우측에 **친구 아이콘** 배치  
  (사람 모양 또는 "Users" 아이콘, 클릭 시 친구 관리 패널/모달 오픈)
- **보조 진입점**: 학습 화면 하단 오른쪽 **플로팅 액션 버튼(Floating Action Button)**  
  - 아이콘: `+` 또는 사람+플러스
  - 클릭 시 **빠른 친구 신청 모달** 바로 열림 (닉네임 검색 중심)

### 3.2 친구 관리 화면 (Friends Panel / Modal)
헤더 친구 아이콘 클릭 시 오른쪽에서 슬라이드되는 **사이드 패널** 또는 모달로 아래 탭 구성:
- **친구 목록** (기본 탭)
  - 닉네임, 현재 레벨(`currentLevel`), 포인트, 마지막 접속일 표시
  - 정렬: 포인트 높은 순 또는 최근 활동 순
- **받은 요청** 탭
  - 신청자 닉네임, 신청일, 수락 / 거절 버튼
- **보낸 요청** 탭
  - 대상 닉네임, 신청일, 취소 버튼
- **친구 검색** (상단 검색바, 모든 탭에서 공통 사용 가능)

### 3.3 빠른 친구 신청 모달 (Floating Button 클릭 시)
- 닉네임 입력 검색창 (실시간 검색 추천)
- 검색 결과 리스트
  - 이미 친구인 경우: "이미 친구입니다" 표시
  - 요청 보낸 경우: "요청 보냄" 표시
  - 그 외: **친구 신청 버튼**

### 3.4 추가 UX 고려사항
- 친구 요청이 올 경우 헤더 친구 아이콘에 **빨간 배지**(숫자) 표시
- 레벨 선택 모달(LevelSelectModal)과 동일한 디자인 톤 유지 (일관성)
- 모바일 환경에서도 잘 동작하도록 반응형 설계

## 4. 데이터베이스 설계 (MongoDB)

### 4.1 FriendRequest 컬렉션 (추천)
```typescript
interface IFriendRequest {
  _id: ObjectId;
  fromUser: ObjectId;           // 신청한 학생
  toUser: ObjectId;             // 신청 받은 학생
  status: 'pending' | 'accepted' | 'rejected';  // 상태
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.2 Student 모델에 추가할 필드
```typescript
interface IChicorunStudent {
  // ... 기존 필드 (currentLevel, achievedMaxLevel 등)

  friends: ObjectId[];           // 수락된 친구들의 _id 배열 (양방향)
  // 또는 friends 컬렉션을 별도로 만들어 N:M 관계 관리 (추후 확장성을 위해 추천)
}
```

## 5. API 엔드포인트 (예상)
- **GET**
  - GET `/friends` → 내 친구 목록 + 받은 요청 수 반환
  - GET `/friends/search?nickname=xxx` → 닉네임으로 사용자 검색 (자기 자신 제외)
- **POST**
  - POST `/friends/request` → 친구 신청 보내기  
    body: `{ toNickname: string }`
  - POST `/friends/respond` → 친구 요청 수락/거절  
    body: `{ requestId: string, action: 'accept' | 'reject' }`
- **DELETE**
  - DELETE `/friends/:friendId` → 친구 삭제
  - DELETE `/friends/request/:requestId` → 보낸 요청 취소

## 6. 비즈니스 로직 및 제약사항
- 한 번에 보낼 수 있는 친구 신청 수 제한 최대 30건
- 자기 자신에게 친구 신청 불가
- 이미 친구이거나, 이미 신청한 경우 중복 신청 방지
- 닉네임 검색 시 부분 일치 검색 지원 (대소문자 구분 없이)
- 친구 삭제 시 양쪽에서 동시에 제거
- 친구 목록은 포인트, currentLevel 기준으로 정렬 가능
