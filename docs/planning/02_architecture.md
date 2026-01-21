# 🏗️ 아키텍처 및 구조 (Architecture & Structure)

## 1. 전체 프로젝트 구조
Monorepo 형태로 구성하여 클라이언트와 서버를 한 곳에서 관리합니다.

```
ppopgi-addict/
 ├─ client/                 # Next.js Frontend
 │   ├─ app/
 │   │   ├─ page.tsx        # 메인 (소개, SSR)
 │   │   ├─ game/page.tsx   # 게임 (CSR, 'use client')
 │   │   ├─ ranking/page.tsx# 랭킹 (SSR)
 │   │   └─ layout.tsx
 │   └─ components/         # 공통 컴포넌트
 └─ server/                 # Express Backend
     ├─ src/
     │   ├─ models/         # DB 모델
     │   ├─ routes/         # API 라우트
     │   └─ controllers/    # 로직 핸들러
     └─ index.ts
```

## 2. 환경 변수 관리

### Client (`client/.env.local`)
* `NEXT_PUBLIC_API_URL`: 백엔드 API 주소

### Server (`server/.env`)
* `PORT`: 서버 포트 (기본 3000)
* `MONGO_URI`: MongoDB 접속 주소
* `OAUTH_CLIENT_ID`: OAuth 클라이언트 ID

## 3. 배포 전략 (Deployment)
* **Client**: Vercel 등 Next.js 최적화 호스팅 권장
* **Server**: Node.js 호스팅 가능한 환경 (AWS, Heroku, Railway 등)
* **Database**: MongoDB Atlas 활용 권장
