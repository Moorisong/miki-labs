# SkillScore Agent Reference

## 07_chicorun_skill_score_system (07_chicorun_skill_score_system.md)
[해당 planning 문서의 전체 내용 참조: 07_chicorun_skill_score_system.md]
- SkillScore는 유저의 게임 실력 기반 난이도 지표 (0 ~ 1000)
- 최조 1회는 achievedMaxLevel 기반 연동
- 이후엔 accuracy, maxCombo, avgResponseTime 등으로 performanceDelta를 산출하여 갱신
- 게임 난이도를 targetDifficulty 구간으로 맵핑하여 사용

---

## AI 작업 지침

### 목적
- 치코런 플랫폼 내 여러 게임들이 독립적으로 난이도를 갱신하고 참조할 수 있도록 원활한 SkillScore 시스템 구현 및 유지 구조를 확립합니다.
- 데이터 손실이 없도록하고, 사용자에게 일관된 난이도 경험을 제공합니다.

### 작업 단계
1. **Model 업데이트**: `ChicorunStudent` 모델에 `skillScore` 숫자 타입을 추가합니다. 가급적 초기화는 별도로 처리되거나 0/null 처리를 허용하여 최초 진입 여부를 판별합니다.
2. **서비스 로직 구현**: `SkillScoreService` 코어 로직을 작성합니다.
   - `initializeSkillScore(achievedMaxLevel: number)` 
   - `calculateDelta(accuracy, maxCombo, avgResponseTime, isSuccess)`
   - `updateSkillScore(studentId, stats)`
   - `getDifficultyRange(skillScore)` 등.
3. **게임 연동 로직 적용**: 예를 들어 WordRain 게임 종료 시, 해당 Service를 호출하여 학생의 `skillScore`를 갱신합니다.
4. **옵션 모듈화 정책**: `gameModifier` 등 변동 사항은 상수화하여 관리합니다.

### 주의사항
- **데이터 보존 원칙**: 기존 유저 데이터 및 모델 마이그레이션이 파괴되지 않도록 추가(Add)만 합니다.
- **정보 보호**: SkillScore는 API 응답 시 클라이언트로 전송하지 않아도 무방하며, 전송하더라도 UI에 노출하지 않도록 합니다.
- **안정화 검증**: performanceDelta는 반드시 상하단 클리핑(Clamp) 처리를 통해 극적인 점수 폭발을 막아야 합니다. (-50 ~ +50)
