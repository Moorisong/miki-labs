# 🧸 Claw Addict (인형뽑기 중독)

현실적인 물리 엔진 기반의 3D 웹 인형뽑기 게임입니다.

## 🎮 게임 특징

- **현실적인 물리 시뮬레이션**: Three.js와 Cannon-es를 사용하여 집게의 움직임, 줄의 흔들림, 인형의 충돌 등을 사실적으로 구현했습니다.
- **도전적인 게임 설계**: 
    - 기본 시도 횟수 **5회** 제공
    - 인형 뽑기 성공 시 시도 횟수 **+1회** 보너스
    - 모든 기회 소진 시 **1시간의 쿨타임** 발생 (localStorage 기반 데이터 유지)
- **랭킹 시스템**: 뽑은 인형 점수를 합산하여 전 세계 유저들과 순위를 경쟁할 수 있습니다.
- **카카오 간편 로그인**: 로그인을 통해 자신의 기록을 안전하게 저장하고 랭킹보드에 이름을 올릴 수 있습니다.

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js (App Router)
- **3D Engine**: Three.js, @react-three/fiber
- **Physics**: Cannon-es, @react-three/cannon
- **State Management**: Zustand
- **Authentication**: NextAuth.js (Kakao Provider)
- **Styling**: Vanilla CSS (CSS Modules)

### Backend
- **Environment**: Node.js, Express
- **Database**: MongoDB, Mongoose

## 🚀 시작하기

### 1. 저장소 복제
```bash
git clone https://github.com/your-username/claw-addict.git
cd claw-addict
```

### 2. 백엔드 설정 및 실행
```bash
cd server
npm install
# .env 파일 생성 및 MONGODB_URI 설정 필요
npm run dev
```

### 3. 프론트엔드 설정 및 실행
```bash
cd client
npm install
# .env.local 파일 설정 필요 (NEXTAUTH_SECRET, KAKAO_CLIENT_ID 등)
npm run dev
```

## 📂 프로젝트 구조

- `client/`: Next.js 기반 프론트엔드 코드
    - `game/`: 3D 요소, 물리 훅, 게임 매니저 등 핵심 로직
    - `components/`: UI 컴포넌트 (HUD, 랭킹보드, 이펙트 등)
- `server/`: Express 기반 백엔드 API 서버 (랭킹 서비스)
- `docs/`: 기획 및 설계 문서
