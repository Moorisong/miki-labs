# WordRain Problem Agent Reference

## 01_word_rain_planning (01_word_rain_planning.md)
[해당 planning 문서 참조: 6. 중복 방지 강화 섹션]
- 한 세션(20문제) 내에서 `wid`가 절대로 중복되지 않아야 함.

---

## AI 작업 지침

### 목적
- WordRain 게임의 문제 생성 로직에서 동일 게임 세션 동안 동일한 단어(wid)가 두 번 이상 등장하지 않도록 보장합니다.

### 작업 단계
1. **의미 단위 개수 검증 변경**: 기존에 문제 후보군 검증 시 `countAvailableMeanings()`로 의미(mid)의 개수만 20개 넘는지 확인하던 로직을 변경합니다. 한 단어는 한 번만 출제되어야 하므로 `words.length < PROBLEMS_PER_GAME` 조건으로 확인하여 문제가 부족할 시 전체 단어(`fallback`)로 풀을 변경하도록 합니다.
2. **단어 중복 스킵 로직 추가**: `generateSingleProblem`의 단어 반복 순회 부분(`for (const word of words)`)에서, 이미 `session.used`에 현재 `word.wid`가 들어가 있다면 해당 `word`를 통째로 스킵(`continue`)합니다.

### 주의사항
- 기존의 `mid` 중복 체크 로직이나 `recentWids` 로직 등 다른 구조를 부수지 않고, `wid` 중복 체크 로직을 상단에 추가하는 방식(Add-on)으로 구현합니다.
- `words.length`가 20개가 안되는 경우 무한 루프에 돌지 않도록 fallback 조건(`isFallback`)을 유지합니다.
