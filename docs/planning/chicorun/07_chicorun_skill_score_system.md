# 치코런 공통 난이도 시스템 (SkillScore) 기획서

## 1. 목적
- 모든 게임(워드레인, 스펠링, 듣기 등)의 난이도를 유저 실력 기반으로 동적 조절
- 학습 레벨과 게임 실력을 분리하되, 초기 진입 난이도만 학습 데이터를 활용하여 자연스러운 온보딩 제공

## 2. 핵심 개념

### 2.1 SkillScore
- 유저의 게임 실력을 나타내는 난이도 지표
- **모든 게임에서 공통으로 사용**되는 단일 점수 체계
- 범위: **0 ~ 1000** (권장, 최소값은 시스템 안전을 위해 50~100으로 설정)

## 3. 구조 및 정책

### 3.1 초기값 설정 (최초 1회 연결)
- 사용자가 게임 시스템에 처음 진입할 때 1회에 한하여 학습 도달 레벨(`achievedMaxLevel`)에 기반하여 설정
- **산식**: `skillScore = achievedMaxLevel * K`
  - `achievedMaxLevel`: 학습 페이지에서의 최고 도달 레벨
  - `K`: 스케일 상수 (권장: 10 ~ 15)
- **예시**:
  - Level 20 도달 유저 → 200 ~ 300 점으로 시작
  - Level 50 도달 유저 → 500 ~ 750 점으로 시작

### 3.2 이후 갱신 정책
- 최초 초기화 이후, 학습 레벨이 오르더라도 SkillScore에는 영향을 주지 않음 (완전 분리)
- 순수하게 게임 결과 기반으로만 갱신
- **산식**: `skillScore += performanceDelta`

### 3.3 PerformanceDelta 계산 식
```text
performanceDelta = (accuracy * 50) + (maxCombo * 5) - (avgResponseTime * 10) - failPenalty
```

**구성 요소**:
- `accuracy`: 정답률 (0.0 ~ 1.0)
- `maxCombo`: 게임 내 최대 콤보
- `avgResponseTime`: 유저의 평균 반응 시간 (초 단위 측정)
- `failPenalty`: 게임 실패/클리어 여부에 따른 페널티
  - 실패 시: 30
  - 성공/생존 시: 0

### 3.4 안정화 장치 (Safeguards)
1. **변화량 제한 (Clamp)**: 너무 급격한 난이도 변동 방지
   - `performanceDelta` = Clamp(`performanceDelta`, -50, +50)
2. **최소값 보호**: 너무 쉬워져서 게임 오동작 또는 극단적 지루함 방지
   - `skillScore` = Math.max(`minSkillScore`, `skillScore`)
   - `minSkillScore`: 50 ~ 100 권장
3. **최대값 제한**: 끝없는 난이도 상승 방지
   - `skillScore` = Math.min(1000, `skillScore`)

## 4. 데이터 연동 (난이도 매핑)

### 4.1 단어 난이도 기준 매핑
- 최종 `skillScore`를 기준으로 게임에서 출제될 단어 레벨(`targetDifficulty`)을 산출
- `targetDifficulty = f(skillScore)`

**매핑 예시**:
| SkillScore | 단어 난이도 |
| --- | --- |
| 0 ~ 200 | 1 ~ 3 레벨 |
| 200 ~ 400 | 2 ~ 5 레벨 |
| 400 ~ 600 | 4 ~ 7 레벨 |
| 600 ~ 800 | 6 ~ 9 레벨 |
| 800 ~ 1000| 7 ~ 10 레벨 |

### 4.2 게임별 보정치 (Option)
- 게임마다 기본 체감 난이도가 다르므로, 동일한 SkillScore에 게임별 오프셋을 적용 가능
- `effectiveSkill = skillScore + gameModifier`

**예시**:
- 워드레인: 0 (기본)
- 스펠링 확인: -50
- 듣기: -100

## 5. UI/UX 및 설계 원칙
- **비공개 점수**: SkillScore는 유저에게 노출되지 않는 내부(Under-the-hood) 수치입니다.
- **도전적 난이도 유지**: 난이도는 항상 현재 실력보다 약간 어렵게 설정되도록 매핑합니다.
- **명확한 연결과 분리**: 초기 진입만 학습 데이터와 연결하고 이후 플레이 경험은 게임 스킬 측정 생태계로 독립시킵니다.
- **공통 프로파일**: 모든 미니게임은 동일한 SkillScore를 참조하여 전반적인 사용자 실력에 맞춰줍니다.
