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
`cannon-es` 환경에서 성능 저하 없이 터널링을 막기 위해 아래 3가지 설정을 필수로 적용한다. (Raycasting 등 고비용 연산 배제)

1.  **World Step 설정 (필수)**
    - `Fixed TimeStep`: **1/60s** (60Hz) 고정.
    - `Max SubSteps`: **10** (프레임 드랍 시 물리 연산 보전).
    - 코드 예시: `world.step(1/60, deltaTime, 10)`

2.  **Collider 두께 보정 (Padding)**
    - 집게 갈래(Prong)의 시각적 두께가 얇더라도, 물리 Collider는 최소 **0.1m (10cm)** 이상의 두께(반지름)를 가져야 한다.
    - Mesh와 Body의 크기를 분리: `Visual Mesh < Physics Body`. 이는 가장 저렴하고 확실한 터널링 방지책이다.

3.  **Velocity Clamping (속도 제한)**
    - 인형이 물리 연산 오류로 튕겨 나갈 때 벽을 뚫는 현상을 방지.
    - 매 프레임 `velocity` 벡터의 길이를 체크하고 제한한다.
    - **Max Velocity Limit**: `15.0 unit/s`.

### 9.2 "자석 현상" 방지 및 자연스러운 그립 (Natural Grip)
인형이 집게에 찰싹 달라붙는 위화감을 없애기 위해 **"수평 조이기(Horizontal Squeeze)"**와 **"강한 감쇠(High Damping)"** 전략을 사용한다.

1.  **힘의 방향 (Force Direction)**
    - **집게 중심축(Center Axis)을 향한 수평(XZ) 방향**으로만 힘을 가한다.
    - **중요**: **Y축(수직) 성분은 절대 0으로 고정**한다. 들어 올리는 힘이 들어가면 "염력"처럼 보여 부자연스럽다.

2.  **힘의 크기 (Weak Constant Force)**
    - 복잡한 Contact Stiffness 조절 대신, 약한 힘을 지속적으로 가한다.
    - 힘의 크기: `F = BoxMass * 5.0` (중력가속도의 약 0.5배 수준으로 미약하게).
    - 목적: 인형이 집게 밖으로 밀려나지 않게만 잡아주는 역할.

3.  **Damping (감쇠) 조절 - 핵심 (Most Important)**
    - `Grip` 상태(2갈래 접촉 & 120ms 경과)가 되면, 해당 인형 Body의 Damping 값을 일시적으로 대폭 상향한다.
    - **Default**: `linearDamping = 0.01`, `angularDamping = 0.01`
    - **On Grip**: `linearDamping = 0.8`, `angularDamping = 0.9`
    - 효과: 인형이 집게 안에서 "끈적하게" 움직이며, 타격(Impulse)에 둔감해져 튕겨나가지 않음.
    - **On Release**: 즉시 Default 값으로 복원.

4.  **Release Threshold**
    - 집게가 벌어지는 순간(`ClawState.OPENING`), Damping을 즉시 해제하여 중력에 의해 자연스럽게 툭 떨어지게 함.
