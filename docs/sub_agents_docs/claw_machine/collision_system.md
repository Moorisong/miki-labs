# Collision System Agent Reference

## Collision System Spec (docs/planning/claw_machine/collision_system.md)
# Collision System Spec – Ppopgi Addict

## 1. 목적 (Goal)
이 충돌 시스템의 목적은
“플레이어가 조작한 위치와 타이밍이 결과에 직접 영향을 미친다”
는 인과관계를 체감하게 만드는 것이다.

랜덤 성공/실패는 금지하며,
모든 결과는 충돌 결과의 부산물이어야 한다.

---

## 2. 사용 기술
- Physics Engine: cannon-es
- Rendering: three.js (react-three-fiber)
- State Sync: Zustand

---

## 3. Collider 정의

### 3.1 인형 (Doll)
- Shape: Box OR ConvexPolyhedron
- Mass: 0.3 ~ 1.2 (인형마다 상이)
- Friction: 0.6
- Restitution: 0.1
- Allow Rotation: true

### 3.2 집게 갈래 (Claw Prongs)
- Shape: Cylinder
- Mass: 0 (Kinematic Body)
- Friction: 0.9
- Restitution: 0
- 각 갈래는 독립 Collider를 가진다.

### 3.3 바닥 (Floor)
- Shape: Box
- Mass: 0 (Static)
- Friction: 0.8

### 3.4 출구 턱 (Exit Edge)
- Shape: Box
- Mass: 0
- Height: 실제 인형보다 약간 높게 설정

---

## 4. 충돌 이벤트 처리

### 4.1 집게 ↔ 인형
- 조건:
  - 2개 이상의 갈래가 동시에 인형과 접촉
  - 접촉 지속 시간 ≥ 120ms
- 결과:
  - Grip 상태 진입
  - 인형에 집게 방향 힘 적용

### 4.2 미끄러짐 판정
- 조건:
  - 접촉 갈래 수 < 2
  - 인형 중심과 집게 중심 오차 > 1.5cm
- 결과:
  - 인형 회전 + 하방 힘 적용

### 4.3 인형 낙하
- 조건:
  - 인형 Y 속도 < -threshold
- 결과:
  - 실패 처리
  - Attempt 차감

---

## 5. 성공 판정

### 5.1 출구 통과
- 조건:
  - 인형 Collider가 Exit Hole Trigger 안으로 진입
- 결과:
  - Success
  - Score 증가
  - Attempt 유지

---

## 6. 디버그 모드 (필수)
- 모든 Collider를 Wireframe으로 표시 가능
- 현재 접촉 중인 Collider Highlight
- HUD에 표시:
  - Contact Count
  - Center Offset (cm)
  - Grip Time (ms)
  - Velocity (m/s)

---

## 7. 금지 사항
- 버튼 기반 성공/실패 판정 금지
- 확률로 결과를 강제 변경하는 로직 금지
- 충돌 없이 상태만 바꾸는 처리 금지

---

## 8. 설계 원칙
- 결과는 항상 물리 연산의 결과여야 한다.
- 실패는 “사기”가 아니라 “놓침”으로 느껴져야 한다.
- 플레이어는 항상
  “내가 조금만 더 잘했으면 잡았다”
  라고 느껴야 한다.

---

## 9. 정밀 물리지원 명세 (Advanced Physics Spec)

### 9.1 터널링 (Tunneling) 방지 구현 상세
`cannon-es`는 기본적으로 CCD(Continuous Collision Detection)를 지원하지 않으므로, 아래 설정과 보정 로직을 필수로 적용한다.

1.  **World Step 설정 (필수)**
    - `Fixed TimeStep`: **1/60s** (60Hz) 고정.
    - `Max SubSteps`: **10** (프레임 드랍 시 물리 연산 보전).
    - 코드 예시: `world.step(1/60, deltaTime, 10)`

2.  **Collider 두께 보정 (Padding)**
    - 집게 갈래(Prong)의 시각적 두께가 얇더라도, 물리 Collider는 최소 **0.1m (10cm)** 이상의 두께(반지름)를 가져야 한다.
    - Mesh와 Body의 크기를 분리: `Visual Mesh < Physics Body`.

3.  **Velocity Clamping (속도 제한)**
    - 인형이 튕겨 나갈 때의 최대 속도를 제한하여 벽을 뚫는 현상 방지.
    - `Body.velocity.clamp(min, max)` 대신, 매 프레임 `velocity` 벡터의 길이를 체크.
    - **Max Velocity Limit**: `15.0 unit/s`.

4.  **Raycasting 보완 (옵션)**
    - 프레임 간 이동 거리가 Collider 크기보다 클 경우 (`velocity * dt > size`), 이동 방향으로 Ray를 쏘아 충돌 예상 지점 감지.

### 9.2 "자석 현상" 방지 및 자연스러운 그립 (Natural Grip)
인형이 집게 중심점으로 빨려 들어가는(Attract) 방식은 절대 금지한다. 대신 아래의 **"Squeeze & Damp"** 방식을 사용한다.

1.  **힘의 방향 (Force Direction)**
    - ❌ 금지: `Center of Claw` 방향으로 끌어당기기.
    - ✅ 허용: **`Opposite Prong` (맞은편 갈래) 방향**으로 미는 힘.
    - 즉, 집게가 "쥐어짜는(Squeeze)" 물리력을 모사한다.

2.  **힘의 크기 (Force Magnitude via Impulse)**
    - 매 프레임 `ApplyForce`를 하지 않고, `Contact Equation`의 **Stiffness(경도)**와 **Relaxation(이완)**을 조절하는 방식 권장.
    - 보조적인 힘 적용 시: `F = FrictionCoefficient * NormalForce`.
    - 너무 강한 힘으로 인형이 떨리는 현상(Jittering) 방지.

3.  **Damping (감쇠) 조절 - 핵심**
    - `Grip` 상태(2갈래 접촉 & 120ms 경과)가 되면, 해당 인형 Body의 Damping 값을 일시적으로 대폭 상향한다.
    - **Default**: `linearDamping = 0.01`, `angularDamping = 0.01`
    - **On Grip**: `linearDamping = 0.8`, `angularDamping = 0.9`
    - 효과: 인형이 집게 안에서 "끈적하게" 움직이며, 튕겨나가지 않고 안착됨. 자석처럼 위치가 강제되는 것이 아니라, **마찰이 극도로 높아진 느낌**을 줌.
    - **On Release**: 즉시 Default 값으로 복원.

4.  **Release Threshold**
    - 집게가 벌어지는 순간(`ClawState.OPENING`), Damping을 즉시 해제하여 중력에 의해 자연스럽게 툭 떨어지게 함.

---

## AI 작업 지침
### 목적
충돌 시스템의 물리적 정확성과 재미 요소(미끄러짐, 잡기)를 구현하고, 디버깅 도구를 통해 검증 가능하도록 만듦.

### 작업 단계
1.  **Physics World 초기화**: `Fixed TimeStep(1/60)`, `MaxSubSteps(10)` 설정 필수.
2.  **Collider 설정**: Prongs의 Collider Radius > 0.1m 확보. Visual Mesh와 분리.
3.  **이벤트 루프 구현**: `useFrame` 내부에서 `Velocity Check` 및 접촉 감지 수행.
4.  **Grip State Machine**:
    - 접촉 감지 -> 120ms 타이머 -> Grip State 전환.
    - **Grip 진입 시**: Target Doll의 `linearDamping`=0.8, `angularDamping`=0.9 설정.
    - **Force 적용**: **Y축 성분을 제외(0)**한 **중심축(Center Axis)** 방향의 미세한 힘 적용.
5.  **Release 로직**: Claw Open 시 Damping 원복.
6.  **디버그 모드**: 수치 표시 및 Velocity Vector 시각화.

### 주의사항
- **인위적 위치 이동 금지**: `position.set()`이나 `position.copy()`로 인형 위치를 강제하지 말 것.
- **수직(Y) 힘 금지**: 그립 보조 힘은 오직 수평(Horizontal)으로만 작용해야 "자석"처럼 보이지 않음.
- **성능 최적화**: Raycasting 등 무거운 연산 지양. Collider 두께와 TimeStep만으로 터널링 방지.
