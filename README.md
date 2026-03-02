# 📦 하루상자 (Haroo Box)

하루상자는 짧은 시간 안에 가볍게 즐길 수 있는 아기자기한 놀이·게임·기록 콘텐츠를 모아둔 웹 플랫폼입니다.

## 🎮 서비스 특징

- **다양한 미니콘텐츠**: 심리 분석 등 다양한 미니콘텐츠와 테스트 제공
- **카카오 간편 로그인**: 로그인을 통해 자신의 기록을 안전하게 저장할 수 있습니다.

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js (App Router)
- **State Management**: Zustand
- **Authentication**: NextAuth.js (Kakao Provider)
- **Styling**: Vanilla CSS (CSS Modules)

### Backend
- **Environment**: Node.js, Express
- **Database**: MongoDB, Mongoose

## 🚀 시작하기

### 1. 저장소 복제
```bash
git clone https://github.com/your-username/haroo-box.git
cd haroo-box
```

### 2. 백엔드 설정 및 실행
```bash
cd apps/server
npm install
# .env 파일 생성 및 MONGODB_URI 설정 필요
npm run dev
```

### 3. 프론트엔드 설정 및 실행
```bash
cd apps/web
npm install
# .env.local 파일 설정 필요 (NEXTAUTH_SECRET, KAKAO_CLIENT_ID 등)
npm run dev
```

## 📂 프로젝트 구조

- `apps/web/`: Next.js 기반 프론트엔드 코드
- `apps/server/`: Express 기반 백엔드 API 서버
- `docs/`: 기획 및 설계 문서

