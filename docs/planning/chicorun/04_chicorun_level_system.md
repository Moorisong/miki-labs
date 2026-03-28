# 04. 치코런 레벨 점프 역효과 방지 및 레벨 시스템 명세

## 1. 문제 인식
초급 유저가 실수로(또는 호기심에) 고급 레벨로 이동한 후 우연히 1~2문제를 맞히면, 기존 `maxLevel`이 영구적으로 높아진다. 이로 인해 다시 초급 문제로 돌아왔을 때 본인의 실제 실력과는 무관하게 포인트 페널티(1P 지급 등)를 받게 되는 역효과가 발생한다. 이는 "운 좋게 한 번 맞힌 것"을 "실제 실력"으로 오인하는 기존 로직의 부작용이다.

## 2. 해결 전략: 레벨 분리 및 엄격한 검증
학생의 실제 학습 위치와 포인트 계산의 기준이 되는 검증된 실력을 완전히 분리한다.

- **현재 플레이 레벨 (`currentLevel`)**: 학생이 자유롭게 변경하고 이동할 수 있는 레벨 (UX 자유도 보장).
- **검증된 최고 레벨 (`achievedMaxLevel`)**: 실제로 레벨을 '완주'하고 '실력'이 증명되었을 때만 올라가는 레벨. **포인트 페널티 계산의 기준점**이 된다.

## 3. 데이터 구조 변경 (Student Model)

```typescript
interface IChicorunStudent {
  // ... 기존 필드
  currentLevel: number;        // 현재 플레이 중인 레벨
  achievedMaxLevel: number;    // 실제로 검증된 최고 레벨 (페널티 기준)
  
  // 레벨 완주 검증을 위한 통계 (현재 레벨 기준)
  currentLevelSolvedCount: number;  // 현재 레벨에서 맞힌 문제 수
  currentLevelTotalCount: number;   // 현재 레벨에서 푼 전체 문제 수
  currentLevelMaxStreak: number;    // 현재 레벨에서의 최대 연속 정답 수
  currentLevelCurrentStreak: number; // 현재 연속 정답 수
}
```

## 4. `achievedMaxLevel` 업데이트 규칙
다음 조건을 모두 만족한 상태에서 해당 레벨의 **마지막 문제**를 맞히고 **레벨 클리어 화면**에 도달할 때만 업데이트된다.

1. **완주**: 해당 레벨의 모든 문제(초급 12, 중급 15, 고급 18문제)를 순차적으로 모두 풀 것.
2. **정확도**: 
   - 초급/중급: 70% 이상 (푼 문제 중 정답 수)
   - 고급: 60% 이상
3. **연속 정답**: 레벨 내에서 **연속 5회 이상** 정답 기록이 있을 것 (우연히 찍기 방지).

> **결과**: 한두 문제 맞힌 것만으로는 절대 `achievedMaxLevel`이 올라가지 않음.

## 5. 포인트 페널티 계산 방식
- 기준점: `maxLevel` 대신 **`achievedMaxLevel`**을 사용.
- **예시**:
  - `achievedMaxLevel` = 50 이지만 `currentLevel` = 10 이라면 → **강한 페널티 적용 (1P)**
  - `achievedMaxLevel` = 1 이지만 `currentLevel` = 90 이라면 → **페널티 없음 (정상 5P 지급)**. 단, 90레벨을 완주하기 전까지는 `achievedMaxLevel`은 1로 유지됨.

## 6. UX 개선 사항

### A. 레벨 점프 경고 (Warning Modal)
학생이 자신의 `achievedMaxLevel`보다 훨씬 높은 레벨로 수동 변경하려고 할 때 경고창 노출.
- "고급 레벨로 이동하면 문제를 풀 수는 있지만, 이 레벨을 완주(정확도 및 연속 정답 조건 충족)하지 않으면 포인트 기준인 '최고 레벨'은 올라가지 않아요. 계속 진행하시겠어요?"

### B. 학습 레벨 및 최고 레벨 관리 (Learn Modal)
별도의 설정 페이지 대신, 학습 화면 상단의 '변경' 버튼을 통해 노출되는 **레벨 선택 모달(LevelSelectModal)**에서 다음 기능을 제공한다.
- **레벨 이동**: 원하는 레벨 구간을 선택하여 현재 학습 중인 `currentLevel`을 즉시 변경 (최초 시작 시 필수 선택).
- **최고 레벨 초기화 (Reset Achieved Level)**: 본인의 실제 실력보다 `achievedMaxLevel`이 너무 높게 설정되어 포인트 페널티를 받는 경우, 이를 현재 `currentLevel`로 동기화하는 기능.

---

## 7. 구현 현황
1. **서버 모델**: `ChicorunStudent` 모델에 통계 필드(`solvedCount`, `streak` 등) 구현 완료.
2. **정답 처리**: `submitAnswer` 시 실시간 통계 업데이트 및 클리어 시점에만 `achievedMaxLevel` 갱신 로직 반영.
3. **포인트 페널티**: `achievedMaxLevel`과 `currentLevel` 차이에 따른 보상 차등 지급 API(`GET /question`) 반영.
4. **학습 화면 모달**: `LevelSelectModal`을 통해 레벨 점프 경고 및 최고 레벨 초기화 기능 구현 완료.
