# 🧩 하루퍼즐 (Haru Puzzle) 서브에이전트 병렬 작업 안내서

이 문서는 "하루퍼즐" 프로젝트를 여러 에이전트가 동시에 병렬로 분담하여 작업할 수 있도록 안내하는 메인 문서입니다.
**에이전트의 토큰 소모를 최소화**하기 위해 전체 프로젝트를 **완전히 독립된 2개의 도메인(백엔드/프론트엔드)**으로 나누었습니다.

작업을 시작할 에이전트는 본인의 도메인에 해당하는 **아래의 개별 문서 중 하나만** 읽고 작업을 진행하십시오. 모든 문서를 읽을 필요가 없으므로 토큰 소모가 최소화됩니다.

---

## 🚀 에이전트별 작업 분리 리스트 (독립/병렬 작업 가능)

각 에이전트는 다른 에이전트의 작업 완료를 기다리지 말고(API 미완성시 Mock Data 및 Mock API 활용), 본인의 영역에만 집중해 코드를 완성해야 합니다.

### 1. 백엔드 및 DB/보안 전담 에이전트 (Backend Agent)
- **담당**: MongoDB 스키마 설계, Express API 구현 (퍼즐 조회, 챌린지 시작 토큰 발급, 실시간 진행률 저장, 랭킹 기록 제출/조회, 내 정보 조회 및 탈퇴), 챌린지 토큰 검증 및 치팅 방지(Rate Limit 포함), 매주 월요일 퍼즐 교체용 배치 작업(Cron) 설계.
- **문서 참조**: [01_backend_agent.md](file:///Users/shkim/Desktop/Project/miki-labs/docs/sub_agents_docs/haru_puzzle/01_backend_agent.md)

### 2. 프론트엔드 UI/UX 및 퍼즐엔진 전담 에이전트 (Frontend Agent)
- **담당**: React 기반 페이지 라우팅, HTML5 Canvas 기반 직소 퍼즐 엔진(드래그, 스냅, 줌/핀치 줌, 섞기, 원본 보기, 렌더링 성능 최적화) 구현, IndexedDB 연동(2초 debounce 자동저장/이어하기), Zustand 스토어 설계, 카카오 로그인 및 공유 기능 연동.
- **문서 참조**: [02_frontend_agent.md](file:///Users/shkim/Desktop/Project/miki-labs/docs/sub_agents_docs/haru_puzzle/02_frontend_agent.md)

---

## 💡 병렬 개발 원칙 (필수 숙지)
- 백엔드와 프론트엔드 간의 통신은 정의된 API 명세를 엄격히 준수합니다.
- 프론트엔드 개발자는 백엔드 API가 아직 개발 중인 경우, Zustand 스토어 또는 Axios Mocking을 활용하여 Dummy Data/Mock API로 프론트엔드 단독 검증을 통과시킬 수 있어야 합니다.
- 백엔드 개발자는 Postman 또는 cURL 요청에 대해 정확하고 표준적인 JSON 포맷의 성공/실패 응답을 제공해야 합니다.
