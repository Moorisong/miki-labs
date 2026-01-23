'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Mesh, Group } from 'three';
import { useSphere } from '@react-three/cannon';
import {
  DollConfig,
  CABINET_DIMENSIONS,
  PHYSICS_CONFIG,
} from '../types/game.types';
import { generateRandomFriction, generateRandomMass } from '../core/physics-world';
import { useGameStore } from '../core/game-manager';
import { useFrame } from '@react-three/fiber';


// 귀여운 인형 색상 팔레트
const DOLL_PALETTES = [
  { body: '#FFB6C1', accent: '#FF69B4', cheek: '#FF1493' }, // 핑크 토끼
  { body: '#8B4513', accent: '#D2691E', cheek: '#FF6B6B' }, // 갈색 곰
  { body: '#FFA500', accent: '#FF8C00', cheek: '#FF6B6B' }, // 주황 고양이
  { body: '#F5F5DC', accent: '#000000', cheek: '#FF69B4' }, // 팬더
  { body: '#98D8C8', accent: '#7FCDCD', cheek: '#FF6B6B' }, // 민트 곰
  { body: '#DDA0DD', accent: '#BA55D3', cheek: '#FF69B4' }, // 보라 토끼
  { body: '#FFE4B5', accent: '#FFC107', cheek: '#FF6B6B' }, // 크림 고양이
  { body: '#87CEEB', accent: '#4169E1', cheek: '#FF69B4' }, // 하늘 곰
  { body: '#F0E68C', accent: '#DAA520', cheek: '#FF6B6B' }, // 노랑 토끼
  { body: '#E6E6FA', accent: '#9370DB', cheek: '#FF69B4' }, // 연보라 고양이
  { body: '#F5DEB3', accent: '#D2B48C', cheek: '#FF9999' }, // 갈색 햄스터
  { body: '#FFF5EE', accent: '#FFB6C1', cheek: '#FF69B4' }, // 흰 햄스터
  { body: '#FFEFD5', accent: '#F4A460', cheek: '#FF6B6B' }, // 크림 햄스터
  { body: '#F4A460', accent: '#8B4513', cheek: '#FF6B6B' }, // 강아지
  { body: '#D3D3D3', accent: '#FFFFFF', cheek: '#FF69B4' }, // 회색 강아지
  // New Additions:
  { body: '#957DAD', accent: '#845EC2', cheek: '#FF9EAA' }, // 라벤더
  { body: '#FF9EAA', accent: '#FFD3E0', cheek: '#FF6F91' }, // 소프트 핑크
  { body: '#D6E5FA', accent: '#B4D7FA', cheek: '#F3C5FF' }, // 베이비 블루
  { body: '#FFF0F5', accent: '#DB7093', cheek: '#FF69B4' }, // 라벤더 블러쉬
  { body: '#F0FFF0', accent: '#F0E68C', cheek: '#FFA07A' }, // 허니듀
  { body: '#E0FFFF', accent: '#87CEFA', cheek: '#FFB6C1' }, // 라이트 시안
  { body: '#FAFAD2', accent: '#FFD700', cheek: '#FF6347' }, // 라이트 골든로드
  { body: '#FFE4E1', accent: '#FA8072', cheek: '#DC143C' }, // 미스티 로즈
  { body: '#B0E0E6', accent: '#4682B4', cheek: '#FF69B4' }, // 파우더 블루
  { body: '#C8A2C8', accent: '#800080', cheek: '#FFC0CB' }, // 라일락
  { body: '#98FF98', accent: '#32CD32', cheek: '#FF4500' }, // 민트 그린
  { body: '#FFDAB9', accent: '#FF8C00', cheek: '#CD5C5C' }, // 피치 퍼프
  { body: '#D8BFD8', accent: '#9932CC', cheek: '#8B008B' }, // 엉겅퀴
  { body: '#F5FFFA', accent: '#00FA9A', cheek: '#FF1493' }, // 민트 크림
  { body: '#778899', accent: '#2F4F4F', cheek: '#FFA500' }, // 쿨 그레이
];

// 인형 타입 (토끼, 곰, 고양이, 햄스터, 강아지, 펭귄, 팬더, 양, 병아리, 여우, 개구리, 사자, 돼지, 코알라)
type CuteDollType = 'bunny' | 'bear' | 'cat' | 'hamster' | 'dog' | 'penguin' | 'panda' | 'sheep' | 'chick' | 'fox' | 'frog' | 'lion' | 'pig' | 'koala';

export interface CuteDollConfig extends DollConfig {
  cuteType: CuteDollType;
  palette: typeof DOLL_PALETTES[0];
}

export interface CuteDollProps {
  config: CuteDollConfig;
}

const generateDollConfigs = (count: number): CuteDollConfig[] => {
  const { width, depth, floorHeight } = CABINET_DIMENSIONS;
  const margin = 0.3;
  const dolls: CuteDollConfig[] = [];

  // 구멍 위치 범위 (여유를 두고 설정)
  // EXIT_ZONE: x[1.5 ~ 2.5], z[1.0 ~ 2.0]
  // 인형 크기(약 0.2)와 물리적 튀는 현상 고려하여 x > 1.0, z > 0.5 정도면 위험
  const isTooCloseToHole = (x: number, z: number) => {
    return x > 1.2 && z > 0.8;
  };

  const cuteTypes: CuteDollType[] = ['bunny', 'bear', 'cat', 'hamster', 'dog', 'penguin', 'panda', 'sheep', 'chick', 'fox', 'frog', 'lion', 'pig', 'koala'];

  // 햄스터 전용 팔레트 인덱스 (10, 11, 12)
  const hamsterPalettes = [10, 11, 12];

  // 햄스터 2마리 보장
  for (let i = 0; i < 2; i++) {
    const size = 0.16 + Math.random() * 0.06; // 햄스터는 약간 작게

    let x = (Math.random() - 0.5) * (width - margin * 2 - size * 2);
    let z = (Math.random() - 0.5) * (depth - margin * 2 - size * 2);

    // 구멍 근처라면 반대편으로 이동
    if (isTooCloseToHole(x, z)) {
      x = -Math.abs(x);
      z = -Math.abs(z);
    }

    const y = floorHeight + size + Math.random() * 0.5;

    dolls.push({
      id: `doll-${i}`,
      position: [x, y, z],
      mass: generateRandomMass(),
      friction: generateRandomFriction(),
      type: 'sphere',
      color: '#ffffff',
      size,
      cuteType: 'hamster',
      palette: DOLL_PALETTES[hamsterPalettes[Math.floor(Math.random() * hamsterPalettes.length)]],
    });
  }

  // 나머지 인형들
  for (let i = 2; i < count; i++) {
    const cuteType = cuteTypes[Math.floor(Math.random() * cuteTypes.length)];
    const size = cuteType === 'hamster' ? 0.16 + Math.random() * 0.06 : 0.18 + Math.random() * 0.08;

    let x = (Math.random() - 0.5) * (width - margin * 2 - size * 2);
    let z = (Math.random() - 0.5) * (depth - margin * 2 - size * 2);

    // 구멍 근처라면 반대편으로 이동
    if (isTooCloseToHole(x, z)) {
      x = -Math.abs(x);
      z = -Math.abs(z);
    }

    const y = floorHeight + size + Math.random() * 0.5;

    // 햄스터면 햄스터 팔레트, 강아지면 강아지 팔레트 (13, 14), 나머지는 랜덤
    let paletteIndex: number;
    if (cuteType === 'hamster') {
      paletteIndex = hamsterPalettes[Math.floor(Math.random() * hamsterPalettes.length)];
    } else if (cuteType === 'dog') {
      paletteIndex = 13 + Math.floor(Math.random() * 2);
    } else {
      // 기존 팔레트(0-9) + 새로운 파스텔 팔레트(15-29) 중 랜덤 선택
      // 햄스터/강아지 전용 제외하고 모든 색상 사용
      const availableIndices = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29
      ];
      paletteIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    }

    dolls.push({
      id: `doll-${i}`,
      position: [x, y, z],
      mass: generateRandomMass(),
      friction: generateRandomFriction(),
      type: 'sphere',
      color: '#ffffff',
      size,
      cuteType,
      palette: DOLL_PALETTES[paletteIndex],
    });
  }

  return dolls;
};



const useDollLogic = (api: any, ref: any, config: DollConfig) => {
  const wasGrabbingRef = useRef(false);
  const grabCheckDoneRef = useRef(false);
  const positionRef = useRef<[number, number, number]>([0, 0, 0]);
  const wasGrabbedRef = useRef(false);
  const rotationRef = useRef<[number, number, number]>([0, 0, 0]);
  const holeFallReportedRef = useRef(false);
  // 잡히기 전 원래 위치 저장 (놓을 때 사용)
  const originalPositionRef = useRef<[number, number, number]>([0, 0, 0]);

  useEffect(() => {
    const unsubscribePos = api.position.subscribe((p: [number, number, number]) => {
      positionRef.current = p;
      // 잡히지 않았을 때만 원래 위치 업데이트
      if (!wasGrabbedRef.current) {
        originalPositionRef.current = p;
      }
    });
    const unsubscribeRot = api.rotation.subscribe((r: [number, number, number]) => {
      rotationRef.current = r;
    });
    return () => {
      unsubscribePos();
      unsubscribeRot();
    };
  }, [api]);

  // 높은 우선순위(100)로 실행하여 물리 엔진 업데이트(-1) 이후에 실행되도록 함
  // 이렇게 하면 물리 엔진 구독이 mesh 위치를 덮어쓴 후에 우리가 다시 설정
  useFrame(() => {
    if (!ref.current) return;

    // 매 프레임 최신 상태 가져오기 (closure 문제 방지)
    const state = useGameStore.getState();
    const { phase, grabbedDoll, visualClawPosition, setGrabbedDoll, pendingReleaseDoll, reportDollFellInHole } = state;

    const isGrabbed = grabbedDoll.id === config.id;

    // 잡힘 상태 변경 감지
    if (isGrabbed) {
      if (!wasGrabbedRef.current) {
        wasGrabbedRef.current = true;
        holeFallReportedRef.current = false;

        console.log(`[Doll ${config.id}] Grabbed! Moving physics body far away.`);

        // 물리 바디를 멀리 치워버림 (충돌/간섭 방지)
        // mesh 위치는 따로 수동 제어
        api.mass.set(0);
        api.velocity.set(0, 0, 0);
        api.angularVelocity.set(0, 0, 0);
        api.collisionResponse.set(false);
        api.position.set(0, -1000, 0); // 물리 바디를 화면 밖으로
        api.wakeUp();
      }

      // ** 시각적 mesh는 물리 바디를 따라감 (화면 밖으로 사라짐) **
      // 대신 Claw 컴포넌트에서 별도의 GrabbedDollVisual을 렌더링하여 보여줌.
      // 이렇게 하면 물리 엔진과의 싸움을 피하고 코드가 분리됨.
      return;
    }

    // 놓쳤을 때: 물리 바디를 현재 mesh 위치로 복귀
    if (!isGrabbed && wasGrabbedRef.current) {
      wasGrabbedRef.current = false;

      // GrabbedDollVisual이 있던 위치(집게)에서 물리 바디를 되살림
      // 정확한 위치 동기화를 위해 store의 visualClawPosition 활용 가능하나,
      // 여기서는 물리 바디가 -1000에 있다가 돌아오는 것이므로,
      // "놓는 순간"의 위치를 잘 지정해야 함.

      const clawPos = state.visualClawPosition;

      // 집게 위치 + 오프셋에서 시작
      let dropX = clawPos.x + grabbedDoll.grabOffset.x;
      let dropY = clawPos.y - 0.65 + grabbedDoll.grabOffset.y; // 집게 기준점(0.65) 재적용
      let dropZ = clawPos.z + grabbedDoll.grabOffset.z;

      // 인형이 기계 바깥/바닥 아래로 나가지 않도록 위치 제한
      const { width, depth, floorHeight } = CABINET_DIMENSIONS;
      const minY = floorHeight + config.size; // 바닥 높이 + 인형 크기 (인형이 바닥에 묻히지 않도록)
      const halfWidth = width / 2 - 0.2; // 벽에서 약간 떨어지도록
      const halfDepth = depth / 2 - 0.2;

      // Y 위치 제한: 바닥 아래로 가지 않도록
      if (dropY < minY) {
        dropY = minY;
      }
      // X, Z 위치 제한: 기계 안쪽에 머무르도록
      dropX = Math.max(-halfWidth, Math.min(halfWidth, dropX));
      dropZ = Math.max(-halfDepth, Math.min(halfDepth, dropZ));

      console.log(`[Doll ${config.id}] Released at (${dropX.toFixed(2)}, ${dropY.toFixed(2)}, ${dropZ.toFixed(2)})`);

      api.position.set(dropX, dropY, dropZ);
      // 물리 바디 위치 구독이 업데이트되기 전에 positionRef를 즉시 설정
      // 이렇게 해야 구멍 낙하 감지 로직이 올바른 위치를 참조함
      positionRef.current = [dropX, dropY, dropZ];
      api.velocity.set(0, 0, 0); // 초기 속도 0
      api.mass.set(config.mass);
      api.collisionResponse.set(true);

      // 성공적인 놓기인지 확인 (releasing 단계이거나, 이미 idle로 넘어갔지만 pendingDoll인 경우)
      const isSuccessDrop = phase === 'releasing' ||
        (state.pendingReleaseDoll.id === config.id);

      if (isSuccessDrop) {
        // 성공적인 놓기: 똑바로 아래로 떨어지도록 함
        // 랜덤성을 제거하고 약간의 하방 속도만 부여
        api.velocity.set(0, 0, 0);
        api.angularVelocity.set(0, 0, 0);
      } else {
        // 실수로 놓침 (Slip): 부드럽게 미끄러지는 효과
        const randX = (Math.random() - 0.5) * 0.4;
        const randZ = (Math.random() - 0.5) * 0.4;
        api.velocity.set(randX, 0, randZ);

        const randAng = 2;
        api.angularVelocity.set(
          (Math.random() - 0.5) * randAng,
          (Math.random() - 0.5) * randAng,
          (Math.random() - 0.5) * randAng
        );
      }
      api.wakeUp();
    }

    // *** 구멍 낙하 감지 ***
    // 게임 진행 중일 경우 언제든지 구멍에 떨어지면 성공 (굴러서 들어가는 경우 포함)
    // 단, moving 단계(시작 직후)는 인형 물리 초기화로 튀는 경우가 있어 제외함
    // idle 상태에서도 pendingReleaseDoll과 일치하는 인형은 감지 (비동기 성공 처리)
    const pendingDoll = state.pendingReleaseDoll;
    const isPendingDoll = pendingDoll.id === config.id;
    const isGameActive = (phase !== 'result' && phase !== 'moving') &&
      (phase !== 'idle' || isPendingDoll);

    if (isGameActive && !holeFallReportedRef.current) {
      const [x, y, z] = positionRef.current;

      // EXIT_ZONE check: XZ 범위 안이고 Y가 임계값(-0.5) 아래로 떨어지면 성공
      const EXIT_ZONE = {
        x: { min: 1.5, max: 2.5 },
        z: { min: 1.0, max: 2.0 },
      };
      const FALL_THRESHOLD_Y = -0.5; // 구멍 바닥 아래
      const MIN_VALID_Y = -10.0; // 너무 깊게 떨어진 인형은 무시 (이전 게임 잔재 등)

      const inExitZoneXZ =
        x >= EXIT_ZONE.x.min && x <= EXIT_ZONE.x.max &&
        z >= EXIT_ZONE.z.min && z <= EXIT_ZONE.z.max;

      // Y가 임계값보다 작고, 너무 깊지 않은 경우에만 성공 처리
      if (inExitZoneXZ && y < FALL_THRESHOLD_Y && y > MIN_VALID_Y) {
        holeFallReportedRef.current = true;
        console.log(`[Hole Fall] Doll ${config.id} fell into hole at Y=${y.toFixed(2)}`);
        reportDollFellInHole(config);
      }
    }

    // grabbing 단계에서 미리 잡기 체크 (집게가 멈춰있을 때)
    if (phase === 'grabbing') {
      // 그랩 애니메이션이 어느정도 진행된 후 판정
      // 집게 오므리는 시간을 고려하여 0.6초 딜레이
      if (!grabCheckDoneRef.current) {
        // 타이머 시작 (없으면 초기화)
        if (!ref.current.userData.grabTimer) {
          ref.current.userData.grabTimer = Date.now();
        }

        const elapsed = Date.now() - ref.current.userData.grabTimer;

        if (elapsed > 800) { // 0.8초 후 판정 (집게가 올라가기 전에 판정 완료)
          if (!grabbedDoll.id) {
            const [x, y, z] = positionRef.current;
            // *** 핵심 수정: 시각적 집게 위치(visualClawPosition)를 사용 ***
            // 오프셋 계산과 적용에서 같은 기준점을 사용해야 순간이동이 안 생김
            const clawPos = visualClawPosition;
            const cx = clawPos.x;
            const cy = clawPos.y;
            const cz = clawPos.z;

            const distXZ = Math.sqrt((x - cx) ** 2 + (z - cz) ** 2);
            // 높이 판정 (정확한 Sweet Spot 계산)
            // 집게 구조: 본체(Body) -> 손가락 시작점 -> 손가락 끝(Tip)
            // 인형은 이 "손가락 길이" 사이에 위치해야만 잡을 수 있음.
            const FINGER_LENGTH = 0.4; // CLAW_CONFIG.fingerLength와 동일해야 함

            // 유효 잡기 범위 (Y축)
            const clawBodyY = cy;               // 집게 본체 높이
            const clawFingerTipY = cy - FINGER_LENGTH - 0.1; // 손가락 끝 높이 (약간의 여유 -0.1)

            // 인형의 상단/하단
            const dollTopY = y + config.size;
            const dollBottomY = y - config.size;

            // 조건 1: 인형이 집게 본체(천장)를 뚫고 위에 있지 않아야 함
            const notTooHigh = dollTopY < clawBodyY + 0.1;

            // 조건 2: 인형이 손가락 끝보다 너무 아래에 있지 않아야 함 (최소한 절반은 걸쳐야 함)
            const notTooLow = y > clawFingerTipY;

            // 조건 3: 수평 거리 (기존 유지)
            // 최대 잡기 반경 (이 범위 밖은 아예 못 잡음)
            const MAX_GRAB_RADIUS = 0.35;
            // 완벽한 잡기 반경 (이 범위 안은 100% 정확도)
            const PERFECT_GRAB_RADIUS = 0.08;

            // 종합 판정: 높이가 손가락 범위 안이고, 반경 내에 있어야 함
            const isInsideClawZone = notTooHigh && notTooLow && distXZ < MAX_GRAB_RADIUS;

            if (isInsideClawZone) {
              // 정확도 계산: 중심에 가까울수록 높음
              // distXZ가 0이면 accuracy = 1.0
              // distXZ가 MAX_GRAB_RADIUS이면 accuracy = 0
              let accuracy: number;
              if (distXZ <= PERFECT_GRAB_RADIUS) {
                accuracy = 1.0; // 완벽한 중앙
              } else {
                // PERFECT_GRAB_RADIUS ~ MAX_GRAB_RADIUS 사이를 0.0 ~ 1.0으로 매핑
                const normalizedDist = (distXZ - PERFECT_GRAB_RADIUS) / (MAX_GRAB_RADIUS - PERFECT_GRAB_RADIUS);
                accuracy = 1.0 - normalizedDist;
              }

              // 임계값 기반 판정 (엄격하게 적용)
              const PERFECT_THRESHOLD = 0.70;  // 70% 이상이면 잡기 성공 (안정권)
              const MIN_GRAB_THRESHOLD = 0.50; // 50% ~ 70%: 잡힐 수도 있고 미끄러질 수도 있음 (운)

              // 50% 미만이면 무조건 튕겨나감 (옆에 붙거나 위에 얹혀지는 비현실적 상황 방지)

              const roll = Math.random();
              const isLuckyGrab = accuracy >= MIN_GRAB_THRESHOLD && accuracy < PERFECT_THRESHOLD && roll > 0.6; // 운 좋게 잡힘
              const isGuaranteedGrab = accuracy >= PERFECT_THRESHOLD;

              if (isGuaranteedGrab || isLuckyGrab) {
                grabCheckDoneRef.current = true;

                // *** 핵심 수정: 잡힌 위치 오프셋 계산 ***
                // 중요: 물리적 위치 그대로 잡지 않고, 살짝 보정하여 "예쁘게" 잡히도록 함
                // 하지만 너무 인위적이지 않게 XZ 오프셋은 50%만 반영 (중앙으로 살짝 당김)

                const pullToCenter = 0.5;
                const finalOffsetX = (x - cx) * pullToCenter;
                const finalOffsetZ = (z - cz) * pullToCenter;

                // Y 오프셋만 나중에 렌더러(claw.tsx)에서 일괄 적용하므로 여기선 0으로 둠 (상대 위치 무시)
                // 대신 grabbedDoll 저장 시에는 원본 오프셋을 저장하되 사용처에서 무시하게 됨

                const offset = {
                  x: finalOffsetX,
                  y: 0, // Y는 claw.tsx에서 startDollY로 강제 고정하므로 의미 없음
                  z: finalOffsetZ
                };

                const isPerfectGrabFlag = accuracy >= 0.9;

                console.log(`[Grab] Doll ${config.id} CAUGHT! Accuracy: ${(accuracy * 100).toFixed(1)}%, Perfect: ${isPerfectGrabFlag}`);

                const [rx, ry, rz] = rotationRef.current;
                setGrabbedDoll(config, offset, accuracy, isPerfectGrabFlag, { x: rx, y: ry, z: rz });
              } else {
                // [New] 잡기 실패(살짝 닿음): 순간이동(Grab State 진입) 대신 물리적으로 튕겨 나가게 처리
                // 집게 중심으로부터 바깥쪽으로 밀어냄
                grabCheckDoneRef.current = true;

                const bumpStrength = 1.0 * (1.0 - accuracy); // 가까울수록(중심에 깊게 박힐수록) 더 세게 밀려남
                const angle = Math.atan2(z - cz, x - cx);
                const vx = Math.cos(angle) * bumpStrength;
                const vz = Math.sin(angle) * bumpStrength;

                // 방향 분석: 집게 중심과 인형 위치 차이
                const offsetX = x - cx; // 양수: 인형이 집게 오른쪽, 음수: 왼쪽
                const offsetZ = z - cz; // 양수: 인형이 집게 앞쪽, 음수: 뒤쪽

                // 더 큰 방향이 주요 실패 원인 (인형이 있는 쪽으로 더 갔어야 함)
                let direction: 'left' | 'right' | 'forward' | 'backward' | 'too_far';
                if (Math.abs(offsetX) > Math.abs(offsetZ)) {
                  // 인형이 오른쪽에 있으면 -> 오른쪽으로 더 갔어야 함
                  direction = offsetX > 0 ? 'right' : 'left';
                } else {
                  // 인형이 앞에 있으면 -> 앞으로 더 갔어야 함
                  direction = offsetZ > 0 ? 'forward' : 'backward';
                }

                console.log(`[Bump] Doll ${config.id} bumped away. Accuracy: ${accuracy}, Direction: ${direction}`);

                // 잡기 실패 토스트 표시
                state.soundCallbacks.onFail?.({ type: 'grab_miss', direction });

                // 옆으로 밀면서 살짝 튀어오르게 함
                api.velocity.set(vx, 0.5, vz);
                api.angularVelocity.set(Math.random(), Math.random(), Math.random());
              }
            }
          } else {
            // 이미 누군가 잡혔으면 나는 체크 종료
            grabCheckDoneRef.current = true;
          }
        }
      }
    }

    // 상태 초기화
    if (phase !== 'grabbing' && phase !== 'rising' && phase !== 'returning') {
      grabCheckDoneRef.current = false;
      if (ref.current) {
        ref.current.userData.grabTimer = null;
      }
    }

    // Reset hole fall reported when phase changes away from releasing
    if (phase !== 'releasing') {
      holeFallReportedRef.current = false;
    }

  });
};

// 렌더링용 Props (물리 Ref는 선택 사항)
export interface DollRenderProps {
  config: CuteDollConfig;
  physicsRef?: React.RefObject<Mesh>;
}

// 토끼 인형 (긴 귀)
export const BunnyDoll = ({ config, physicsRef }: DollRenderProps) => {
  const s = config.size;
  const { body, accent, cheek } = config.palette;

  return (
    <group>
      {/* 몸통 */}
      <mesh castShadow position={[0, -s * 0.3, 0]}>
        <sphereGeometry args={[s * 0.8, 16, 16]} />
        <meshStandardMaterial color={body} roughness={0.8} />
      </mesh>
      {/* ... (나머지 렌더링 코드는 동일하므로 생략하지 않고 그대로 유지해야 함, 하지만 replace_file_content는 전체 교체가 아니므로 주의) */}
      {/* 지면 관계상 전체 코드를 다 쓸 수 없으니 원래 코드의 구조를 유지하며 export 키워드만 붙이는 식으로 수정해야 함. */}
      {/* 하지만 replace_file_content는 블록 단위 교체이므로 전체 함수를 다시 써줌 */}

      {/* 머리 */}
      <mesh castShadow position={[0, s * 0.4, 0]}>
        <sphereGeometry args={[s * 0.65, 16, 16]} />
        <meshStandardMaterial color={body} roughness={0.8} />
      </mesh>
      {/* 왼쪽 귀 */}
      <mesh castShadow position={[-s * 0.25, s * 1.0, 0]}>
        <capsuleGeometry args={[s * 0.12, s * 0.5, 4, 8]} />
        <meshStandardMaterial color={body} roughness={0.8} />
      </mesh>
      {/* 왼쪽 귀 안쪽 */}
      <mesh position={[-s * 0.25, s * 1.0, s * 0.05]}>
        <capsuleGeometry args={[s * 0.06, s * 0.35, 4, 8]} />
        <meshStandardMaterial color={accent} roughness={0.8} />
      </mesh>
      {/* 오른쪽 귀 */}
      <mesh castShadow position={[s * 0.25, s * 1.0, 0]}>
        <capsuleGeometry args={[s * 0.12, s * 0.5, 4, 8]} />
        <meshStandardMaterial color={body} roughness={0.8} />
      </mesh>
      {/* 오른쪽 귀 안쪽 */}
      <mesh position={[s * 0.25, s * 1.0, s * 0.05]}>
        <capsuleGeometry args={[s * 0.06, s * 0.35, 4, 8]} />
        <meshStandardMaterial color={accent} roughness={0.8} />
      </mesh>
      {/* 왼쪽 눈 */}
      <mesh position={[-s * 0.2, s * 0.5, s * 0.5]}>
        <sphereGeometry args={[s * 0.08, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.3} />
      </mesh>
      {/* 오른쪽 눈 */}
      <mesh position={[s * 0.2, s * 0.5, s * 0.5]}>
        <sphereGeometry args={[s * 0.08, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.3} />
      </mesh>
      {/* 볼터치 왼쪽 */}
      <mesh position={[-s * 0.35, s * 0.3, s * 0.45]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.6} />
      </mesh>
      {/* 볼터치 오른쪽 */}
      <mesh position={[s * 0.35, s * 0.3, s * 0.45]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.6} />
      </mesh>
      {/* 코 */}
      <mesh position={[0, s * 0.35, s * 0.6]}>
        <sphereGeometry args={[s * 0.06, 8, 8]} />
        <meshStandardMaterial color={accent} roughness={0.5} />
      </mesh>
    </group>
  );
};

// 곰 인형 (둥근 귀)
export const BearDoll = ({ config, physicsRef }: DollRenderProps) => {
  const s = config.size;
  const { body, accent, cheek } = config.palette;

  return (
    <group>
      {/* 몸통 */}
      <mesh castShadow position={[0, -s * 0.35, 0]}>
        <sphereGeometry args={[s * 0.85, 16, 16]} />
        <meshStandardMaterial color={body} roughness={0.85} />
      </mesh>
      {/* 머리 */}
      <mesh castShadow position={[0, s * 0.4, 0]}>
        <sphereGeometry args={[s * 0.7, 16, 16]} />
        <meshStandardMaterial color={body} roughness={0.85} />
      </mesh>
      {/* 왼쪽 귀 */}
      <mesh castShadow position={[-s * 0.45, s * 0.85, 0]}>
        <sphereGeometry args={[s * 0.2, 12, 12]} />
        <meshStandardMaterial color={body} roughness={0.85} />
      </mesh>
      {/* 왼쪽 귀 안쪽 */}
      <mesh position={[-s * 0.45, s * 0.85, s * 0.1]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color={accent} roughness={0.85} />
      </mesh>
      {/* 오른쪽 귀 */}
      <mesh castShadow position={[s * 0.45, s * 0.85, 0]}>
        <sphereGeometry args={[s * 0.2, 12, 12]} />
        <meshStandardMaterial color={body} roughness={0.85} />
      </mesh>
      {/* 오른쪽 귀 안쪽 */}
      <mesh position={[s * 0.45, s * 0.85, s * 0.1]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color={accent} roughness={0.85} />
      </mesh>
      {/* 주둥이 */}
      <mesh castShadow position={[0, s * 0.25, s * 0.5]}>
        <sphereGeometry args={[s * 0.25, 12, 12]} />
        <meshStandardMaterial color={accent} roughness={0.8} />
      </mesh>
      {/* 왼쪽 눈 */}
      <mesh position={[-s * 0.22, s * 0.55, s * 0.5]}>
        <sphereGeometry args={[s * 0.09, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.3} />
      </mesh>
      {/* 오른쪽 눈 */}
      <mesh position={[s * 0.22, s * 0.55, s * 0.5]}>
        <sphereGeometry args={[s * 0.09, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.3} />
      </mesh>
      {/* 코 */}
      <mesh position={[0, s * 0.3, s * 0.75]}>
        <sphereGeometry args={[s * 0.08, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.4} />
      </mesh>
      {/* 볼터치 왼쪽 */}
      <mesh position={[-s * 0.4, s * 0.35, s * 0.4]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.5} />
      </mesh>
      {/* 볼터치 오른쪽 */}
      <mesh position={[s * 0.4, s * 0.35, s * 0.4]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

// 고양이 인형 (삼각 귀)
export const CatDoll = ({ config, physicsRef }: DollRenderProps) => {
  const s = config.size;
  const { body, accent, cheek } = config.palette;

  return (
    <group>
      {/* 몸통 */}
      <mesh castShadow position={[0, -s * 0.3, 0]}>
        <sphereGeometry args={[s * 0.75, 16, 16]} />
        <meshStandardMaterial color={body} roughness={0.8} />
      </mesh>
      {/* 머리 */}
      <mesh castShadow position={[0, s * 0.4, 0]}>
        <sphereGeometry args={[s * 0.6, 16, 16]} />
        <meshStandardMaterial color={body} roughness={0.8} />
      </mesh>
      {/* 왼쪽 귀 (삼각형) */}
      <mesh castShadow position={[-s * 0.35, s * 0.9, 0]} rotation={[0, 0, Math.PI / 6]}>
        <coneGeometry args={[s * 0.18, s * 0.35, 4]} />
        <meshStandardMaterial color={body} roughness={0.8} />
      </mesh>
      {/* 왼쪽 귀 안쪽 */}
      <mesh position={[-s * 0.35, s * 0.85, s * 0.05]} rotation={[0, 0, Math.PI / 6]}>
        <coneGeometry args={[s * 0.08, s * 0.2, 4]} />
        <meshStandardMaterial color={accent} roughness={0.8} />
      </mesh>
      {/* 오른쪽 귀 (삼각형) */}
      <mesh castShadow position={[s * 0.35, s * 0.9, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <coneGeometry args={[s * 0.18, s * 0.35, 4]} />
        <meshStandardMaterial color={body} roughness={0.8} />
      </mesh>
      {/* 오른쪽 귀 안쪽 */}
      <mesh position={[s * 0.35, s * 0.85, s * 0.05]} rotation={[0, 0, -Math.PI / 6]}>
        <coneGeometry args={[s * 0.08, s * 0.2, 4]} />
        <meshStandardMaterial color={accent} roughness={0.8} />
      </mesh>
      {/* 왼쪽 눈 */}
      <mesh position={[-s * 0.18, s * 0.5, s * 0.45]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color="#2d3436" roughness={0.3} />
      </mesh>
      {/* 왼쪽 눈동자 */}
      <mesh position={[-s * 0.18, s * 0.5, s * 0.55]}>
        <sphereGeometry args={[s * 0.04, 6, 6]} />
        <meshStandardMaterial color="#000000" roughness={0.2} />
      </mesh>
      {/* 오른쪽 눈 */}
      <mesh position={[s * 0.18, s * 0.5, s * 0.45]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color="#2d3436" roughness={0.3} />
      </mesh>
      {/* 오른쪽 눈동자 */}
      <mesh position={[s * 0.18, s * 0.5, s * 0.55]}>
        <sphereGeometry args={[s * 0.04, 6, 6]} />
        <meshStandardMaterial color="#000000" roughness={0.2} />
      </mesh>
      {/* 코 */}
      <mesh position={[0, s * 0.35, s * 0.55]}>
        <sphereGeometry args={[s * 0.05, 6, 6]} />
        <meshStandardMaterial color={accent} roughness={0.5} />
      </mesh>
      {/* 볼터치 왼쪽 */}
      <mesh position={[-s * 0.32, s * 0.32, s * 0.4]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.5} />
      </mesh>
      {/* 볼터치 오른쪽 */}
      <mesh position={[s * 0.32, s * 0.32, s * 0.4]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.5} />
      </mesh>
      {/* 수염 왼쪽 */}
      <mesh position={[-s * 0.4, s * 0.32, s * 0.5]} rotation={[0, 0, Math.PI / 12]}>
        <boxGeometry args={[s * 0.25, s * 0.015, s * 0.015]} />
        <meshStandardMaterial color="#333333" roughness={0.5} />
      </mesh>
      {/* 수염 오른쪽 */}
      <mesh position={[s * 0.4, s * 0.32, s * 0.5]} rotation={[0, 0, -Math.PI / 12]}>
        <boxGeometry args={[s * 0.25, s * 0.015, s * 0.015]} />
        <meshStandardMaterial color="#333333" roughness={0.5} />
      </mesh>
    </group>
  );
};

// 햄스터 인형 (둥근 몸, 작은 귀, 큰 볼)
export const HamsterDoll = ({ config, physicsRef }: DollRenderProps) => {
  const s = config.size;
  const { body, accent, cheek } = config.palette;

  return (
    <group>
      {/* 몸통 (통통함) */}
      <mesh castShadow position={[0, -s * 0.2, 0]}>
        <sphereGeometry args={[s * 0.9, 16, 16]} />
        <meshStandardMaterial color={body} roughness={0.9} />
      </mesh>
      {/* 머리 */}
      <mesh castShadow position={[0, s * 0.5, 0]}>
        <sphereGeometry args={[s * 0.65, 16, 16]} />
        <meshStandardMaterial color={body} roughness={0.9} />
      </mesh>
      {/* 왼쪽 귀 (작고 둥근) */}
      <mesh castShadow position={[-s * 0.35, s * 0.95, 0]}>
        <sphereGeometry args={[s * 0.12, 10, 10]} />
        <meshStandardMaterial color={body} roughness={0.9} />
      </mesh>
      {/* 왼쪽 귀 안쪽 */}
      <mesh position={[-s * 0.35, s * 0.95, s * 0.05]}>
        <sphereGeometry args={[s * 0.06, 8, 8]} />
        <meshStandardMaterial color={accent} roughness={0.9} />
      </mesh>
      {/* 오른쪽 귀 (작고 둥근) */}
      <mesh castShadow position={[s * 0.35, s * 0.95, 0]}>
        <sphereGeometry args={[s * 0.12, 10, 10]} />
        <meshStandardMaterial color={body} roughness={0.9} />
      </mesh>
      {/* 오른쪽 귀 안쪽 */}
      <mesh position={[s * 0.35, s * 0.95, s * 0.05]}>
        <sphereGeometry args={[s * 0.06, 8, 8]} />
        <meshStandardMaterial color={accent} roughness={0.9} />
      </mesh>
      {/* 큰 볼 왼쪽 (햄스터 특징!) */}
      <mesh castShadow position={[-s * 0.45, s * 0.35, s * 0.25]}>
        <sphereGeometry args={[s * 0.22, 12, 12]} />
        <meshStandardMaterial color={cheek} roughness={0.8} />
      </mesh>
      {/* 큰 볼 오른쪽 */}
      <mesh castShadow position={[s * 0.45, s * 0.35, s * 0.25]}>
        <sphereGeometry args={[s * 0.22, 12, 12]} />
        <meshStandardMaterial color={cheek} roughness={0.8} />
      </mesh>
      {/* 왼쪽 눈 */}
      <mesh position={[-s * 0.18, s * 0.6, s * 0.5]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.3} />
      </mesh>
      {/* 눈 하이라이트 왼쪽 */}
      <mesh position={[-s * 0.15, s * 0.63, s * 0.58]}>
        <sphereGeometry args={[s * 0.03, 6, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      {/* 오른쪽 눈 */}
      <mesh position={[s * 0.18, s * 0.6, s * 0.5]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.3} />
      </mesh>
      {/* 눈 하이라이트 오른쪽 */}
      <mesh position={[s * 0.21, s * 0.63, s * 0.58]}>
        <sphereGeometry args={[s * 0.03, 6, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      {/* 코 */}
      <mesh position={[0, s * 0.45, s * 0.6]}>
        <sphereGeometry args={[s * 0.06, 8, 8]} />
        <meshStandardMaterial color="#FF9999" roughness={0.5} />
      </mesh>
      {/* 손 왼쪽 */}
      <mesh castShadow position={[-s * 0.5, s * 0.0, s * 0.3]}>
        <sphereGeometry args={[s * 0.12, 8, 8]} />
        <meshStandardMaterial color={body} roughness={0.9} />
      </mesh>
      {/* 손 오른쪽 */}
      <mesh castShadow position={[s * 0.5, s * 0.0, s * 0.3]}>
        <sphereGeometry args={[s * 0.12, 8, 8]} />
        <meshStandardMaterial color={body} roughness={0.9} />
      </mesh>
      {/* 꼬리 */}
      <mesh castShadow position={[0, -s * 0.3, -s * 0.7]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color={body} roughness={0.9} />
      </mesh>
    </group>
  );
};

// 강아지 인형 (늘어진 귀, 귀여운 표정)
export const DogDoll = ({ config, physicsRef }: DollRenderProps) => {
  const s = config.size;
  const { body, accent, cheek } = config.palette;

  return (
    <group>
      {/* 몸통 */}
      <mesh castShadow position={[0, -s * 0.3, 0]}>
        <sphereGeometry args={[s * 0.8, 16, 16]} />
        <meshStandardMaterial color={body} roughness={0.85} />
      </mesh>
      {/* 머리 */}
      <mesh castShadow position={[0, s * 0.4, 0]}>
        <sphereGeometry args={[s * 0.65, 16, 16]} />
        <meshStandardMaterial color={body} roughness={0.85} />
      </mesh>
      {/* 왼쪽 귀 (늘어진) */}
      <mesh castShadow position={[-s * 0.45, s * 0.5, -s * 0.1]} rotation={[0.3, 0, -0.4]}>
        <capsuleGeometry args={[s * 0.12, s * 0.35, 4, 8]} />
        <meshStandardMaterial color={accent} roughness={0.85} />
      </mesh>
      {/* 오른쪽 귀 (늘어진) */}
      <mesh castShadow position={[s * 0.45, s * 0.5, -s * 0.1]} rotation={[0.3, 0, 0.4]}>
        <capsuleGeometry args={[s * 0.12, s * 0.35, 4, 8]} />
        <meshStandardMaterial color={accent} roughness={0.85} />
      </mesh>
      {/* 주둥이 */}
      <mesh castShadow position={[0, s * 0.25, s * 0.5]}>
        <sphereGeometry args={[s * 0.3, 12, 12]} />
        <meshStandardMaterial color={accent} roughness={0.8} />
      </mesh>
      {/* 왼쪽 눈 */}
      <mesh position={[-s * 0.2, s * 0.55, s * 0.5]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.3} />
      </mesh>
      {/* 눈 하이라이트 왼쪽 */}
      <mesh position={[-s * 0.17, s * 0.58, s * 0.58]}>
        <sphereGeometry args={[s * 0.03, 6, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      {/* 오른쪽 눈 */}
      <mesh position={[s * 0.2, s * 0.55, s * 0.5]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.3} />
      </mesh>
      {/* 눈 하이라이트 오른쪽 */}
      <mesh position={[s * 0.23, s * 0.58, s * 0.58]}>
        <sphereGeometry args={[s * 0.03, 6, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      {/* 코 */}
      <mesh position={[0, s * 0.3, s * 0.78]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.4} />
      </mesh>
      {/* 혀 */}
      <mesh position={[0, s * 0.12, s * 0.7]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[s * 0.12, s * 0.15, s * 0.05]} />
        <meshStandardMaterial color="#FF6B6B" roughness={0.6} />
      </mesh>
      {/* 볼터치 왼쪽 */}
      <mesh position={[-s * 0.38, s * 0.35, s * 0.4]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.5} />
      </mesh>
      {/* 볼터치 오른쪽 */}
      <mesh position={[s * 0.38, s * 0.35, s * 0.4]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.5} />
      </mesh>
      {/* 꼬리 */}
      <mesh castShadow position={[0, -s * 0.1, -s * 0.65]} rotation={[0.5, 0, 0]}>
        <capsuleGeometry args={[s * 0.08, s * 0.2, 4, 8]} />
        <meshStandardMaterial color={body} roughness={0.85} />
      </mesh>
    </group>
  );
};

// 펭귄 인형 (뚜둥한 몸, 흰 배, 주황색 부리와 발)
export const PenguinDoll = ({ config, physicsRef }: DollRenderProps) => {
  const s = config.size;
  const { body, accent, cheek } = config.palette;
  // 펭귄은 검은 바디, 흰 배가 기본
  const blackBody = '#1a1a2e';
  const whiteBelly = '#f8f8ff';
  const orangeAccent = '#FF6B35';

  return (
    <group>
      {/* 몸통 */}
      <mesh castShadow position={[0, -s * 0.25, 0]}>
        <sphereGeometry args={[s * 0.85, 16, 16]} />
        <meshStandardMaterial color={blackBody} roughness={0.85} />
      </mesh>
      {/* 흰 배 */}
      <mesh position={[0, -s * 0.2, s * 0.35]}>
        <sphereGeometry args={[s * 0.55, 16, 16]} />
        <meshStandardMaterial color={whiteBelly} roughness={0.8} />
      </mesh>
      {/* 머리 */}
      <mesh castShadow position={[0, s * 0.45, 0]}>
        <sphereGeometry args={[s * 0.6, 16, 16]} />
        <meshStandardMaterial color={blackBody} roughness={0.85} />
      </mesh>
      {/* 흰 얼굴 */}
      <mesh position={[0, s * 0.4, s * 0.25]}>
        <sphereGeometry args={[s * 0.4, 12, 12]} />
        <meshStandardMaterial color={whiteBelly} roughness={0.8} />
      </mesh>
      {/* 왼쪽 눈 */}
      <mesh position={[-s * 0.18, s * 0.5, s * 0.45]}>
        <sphereGeometry args={[s * 0.08, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.3} />
      </mesh>
      {/* 오른쪽 눈 */}
      <mesh position={[s * 0.18, s * 0.5, s * 0.45]}>
        <sphereGeometry args={[s * 0.08, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.3} />
      </mesh>
      {/* 부리 */}
      <mesh position={[0, s * 0.35, s * 0.6]} rotation={[Math.PI / 4, 0, 0]}>
        <coneGeometry args={[s * 0.08, s * 0.15, 8]} />
        <meshStandardMaterial color={orangeAccent} roughness={0.6} />
      </mesh>
      {/* 왼쪽 날개 */}
      <mesh castShadow position={[-s * 0.65, s * 0.0, 0]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[s * 0.12, s * 0.4, 4, 8]} />
        <meshStandardMaterial color={blackBody} roughness={0.85} />
      </mesh>
      {/* 오른쪽 날개 */}
      <mesh castShadow position={[s * 0.65, s * 0.0, 0]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[s * 0.12, s * 0.4, 4, 8]} />
        <meshStandardMaterial color={blackBody} roughness={0.85} />
      </mesh>
      {/* 왼발 */}
      <mesh castShadow position={[-s * 0.2, -s * 0.9, s * 0.2]}>
        <boxGeometry args={[s * 0.2, s * 0.08, s * 0.25]} />
        <meshStandardMaterial color={orangeAccent} roughness={0.7} />
      </mesh>
      {/* 오른발 */}
      <mesh castShadow position={[s * 0.2, -s * 0.9, s * 0.2]}>
        <boxGeometry args={[s * 0.2, s * 0.08, s * 0.25]} />
        <meshStandardMaterial color={orangeAccent} roughness={0.7} />
      </mesh>
      {/* 볼터치 */}
      <mesh position={[-s * 0.28, s * 0.35, s * 0.45]}>
        <sphereGeometry args={[s * 0.08, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.5} />
      </mesh>
      <mesh position={[s * 0.28, s * 0.35, s * 0.45]}>
        <sphereGeometry args={[s * 0.08, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

// 팬더 인형 (흑백, 눈 주위 검은 패치)
export const PandaDoll = ({ config, physicsRef }: DollRenderProps) => {
  const s = config.size;
  const { cheek } = config.palette;
  const whiteBody = '#f5f5f5';
  const blackPatch = '#1a1a1a';

  return (
    <group>
      {/* 몸통 (흰색) */}
      <mesh castShadow position={[0, -s * 0.3, 0]}>
        <sphereGeometry args={[s * 0.85, 16, 16]} />
        <meshStandardMaterial color={whiteBody} roughness={0.85} />
      </mesh>
      {/* 머리 (흰색) */}
      <mesh castShadow position={[0, s * 0.45, 0]}>
        <sphereGeometry args={[s * 0.7, 16, 16]} />
        <meshStandardMaterial color={whiteBody} roughness={0.85} />
      </mesh>
      {/* 왼쪽 귀 (검은색) */}
      <mesh castShadow position={[-s * 0.45, s * 0.9, 0]}>
        <sphereGeometry args={[s * 0.2, 12, 12]} />
        <meshStandardMaterial color={blackPatch} roughness={0.85} />
      </mesh>
      {/* 오른쪽 귀 (검은색) */}
      <mesh castShadow position={[s * 0.45, s * 0.9, 0]}>
        <sphereGeometry args={[s * 0.2, 12, 12]} />
        <meshStandardMaterial color={blackPatch} roughness={0.85} />
      </mesh>
      {/* 왼쪽 눈 패치 (검은색 타원) */}
      <mesh position={[-s * 0.22, s * 0.55, s * 0.4]}>
        <sphereGeometry args={[s * 0.18, 12, 12]} />
        <meshStandardMaterial color={blackPatch} roughness={0.8} />
      </mesh>
      {/* 오른쪽 눈 패치 (검은색 타원) */}
      <mesh position={[s * 0.22, s * 0.55, s * 0.4]}>
        <sphereGeometry args={[s * 0.18, 12, 12]} />
        <meshStandardMaterial color={blackPatch} roughness={0.8} />
      </mesh>
      {/* 왼쪽 눈동자 (흰색) */}
      <mesh position={[-s * 0.22, s * 0.55, s * 0.55]}>
        <sphereGeometry args={[s * 0.06, 8, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      {/* 오른쪽 눈동자 (흰색) */}
      <mesh position={[s * 0.22, s * 0.55, s * 0.55]}>
        <sphereGeometry args={[s * 0.06, 8, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      {/* 코 */}
      <mesh position={[0, s * 0.35, s * 0.65]}>
        <sphereGeometry args={[s * 0.08, 8, 8]} />
        <meshStandardMaterial color={blackPatch} roughness={0.5} />
      </mesh>
      {/* 왼쪽 팔 (검은색) */}
      <mesh castShadow position={[-s * 0.6, -s * 0.1, s * 0.2]} rotation={[0, 0, 0.4]}>
        <capsuleGeometry args={[s * 0.15, s * 0.25, 4, 8]} />
        <meshStandardMaterial color={blackPatch} roughness={0.85} />
      </mesh>
      {/* 오른쪽 팔 (검은색) */}
      <mesh castShadow position={[s * 0.6, -s * 0.1, s * 0.2]} rotation={[0, 0, -0.4]}>
        <capsuleGeometry args={[s * 0.15, s * 0.25, 4, 8]} />
        <meshStandardMaterial color={blackPatch} roughness={0.85} />
      </mesh>
      {/* 왼쪽 다리 (검은색) */}
      <mesh castShadow position={[-s * 0.35, -s * 0.85, s * 0.1]}>
        <sphereGeometry args={[s * 0.2, 10, 10]} />
        <meshStandardMaterial color={blackPatch} roughness={0.85} />
      </mesh>
      {/* 오른쪽 다리 (검은색) */}
      <mesh castShadow position={[s * 0.35, -s * 0.85, s * 0.1]}>
        <sphereGeometry args={[s * 0.2, 10, 10]} />
        <meshStandardMaterial color={blackPatch} roughness={0.85} />
      </mesh>
      {/* 볼터치 */}
      <mesh position={[-s * 0.4, s * 0.35, s * 0.45]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.4} />
      </mesh>
      <mesh position={[s * 0.4, s * 0.35, s * 0.45]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.4} />
      </mesh>
    </group>
  );
};

// 양 인형 (곱슬곱슬한 털, 통통한 몸)
export const SheepDoll = ({ config, physicsRef }: DollRenderProps) => {
  const s = config.size;
  const { body, cheek } = config.palette;
  const woolColor = '#fefefa';
  const faceColor = '#2d2d2d';

  return (
    <group>
      {/* 털 몸통 (여러 개의 구로 곱슬 표현) */}
      <mesh castShadow position={[0, -s * 0.2, 0]}>
        <sphereGeometry args={[s * 0.85, 16, 16]} />
        <meshStandardMaterial color={woolColor} roughness={1} />
      </mesh>
      {/* 곱슬 털 디테일 */}
      <mesh castShadow position={[-s * 0.4, s * 0.1, s * 0.3]}>
        <sphereGeometry args={[s * 0.25, 10, 10]} />
        <meshStandardMaterial color={woolColor} roughness={1} />
      </mesh>
      <mesh castShadow position={[s * 0.4, s * 0.1, s * 0.3]}>
        <sphereGeometry args={[s * 0.25, 10, 10]} />
        <meshStandardMaterial color={woolColor} roughness={1} />
      </mesh>
      <mesh castShadow position={[0, s * 0.25, -s * 0.35]}>
        <sphereGeometry args={[s * 0.28, 10, 10]} />
        <meshStandardMaterial color={woolColor} roughness={1} />
      </mesh>
      <mesh castShadow position={[-s * 0.35, -s * 0.35, -s * 0.2]}>
        <sphereGeometry args={[s * 0.22, 10, 10]} />
        <meshStandardMaterial color={woolColor} roughness={1} />
      </mesh>
      <mesh castShadow position={[s * 0.35, -s * 0.35, -s * 0.2]}>
        <sphereGeometry args={[s * 0.22, 10, 10]} />
        <meshStandardMaterial color={woolColor} roughness={1} />
      </mesh>
      {/* 머리 털 */}
      <mesh castShadow position={[0, s * 0.7, 0]}>
        <sphereGeometry args={[s * 0.45, 12, 12]} />
        <meshStandardMaterial color={woolColor} roughness={1} />
      </mesh>
      <mesh castShadow position={[-s * 0.2, s * 0.9, 0]}>
        <sphereGeometry args={[s * 0.18, 10, 10]} />
        <meshStandardMaterial color={woolColor} roughness={1} />
      </mesh>
      <mesh castShadow position={[s * 0.2, s * 0.9, 0]}>
        <sphereGeometry args={[s * 0.18, 10, 10]} />
        <meshStandardMaterial color={woolColor} roughness={1} />
      </mesh>
      <mesh castShadow position={[0, s * 0.95, 0]}>
        <sphereGeometry args={[s * 0.15, 10, 10]} />
        <meshStandardMaterial color={woolColor} roughness={1} />
      </mesh>
      {/* 얼굴 (검은색/회색) */}
      <mesh position={[0, s * 0.5, s * 0.35]}>
        <sphereGeometry args={[s * 0.35, 12, 12]} />
        <meshStandardMaterial color={faceColor} roughness={0.9} />
      </mesh>
      {/* 왼쪽 귀 */}
      <mesh castShadow position={[-s * 0.45, s * 0.55, 0]} rotation={[0, 0, -0.5]}>
        <capsuleGeometry args={[s * 0.08, s * 0.15, 4, 8]} />
        <meshStandardMaterial color={faceColor} roughness={0.9} />
      </mesh>
      {/* 오른쪽 귀 */}
      <mesh castShadow position={[s * 0.45, s * 0.55, 0]} rotation={[0, 0, 0.5]}>
        <capsuleGeometry args={[s * 0.08, s * 0.15, 4, 8]} />
        <meshStandardMaterial color={faceColor} roughness={0.9} />
      </mesh>
      {/* 왼쪽 눈 */}
      <mesh position={[-s * 0.12, s * 0.55, s * 0.6]}>
        <sphereGeometry args={[s * 0.06, 8, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      {/* 오른쪽 눈 */}
      <mesh position={[s * 0.12, s * 0.55, s * 0.6]}>
        <sphereGeometry args={[s * 0.06, 8, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      {/* 코 */}
      <mesh position={[0, s * 0.42, s * 0.68]}>
        <sphereGeometry args={[s * 0.05, 8, 8]} />
        <meshStandardMaterial color="#333333" roughness={0.5} />
      </mesh>
      {/* 다리 */}
      <mesh castShadow position={[-s * 0.35, -s * 0.8, s * 0.2]}>
        <capsuleGeometry args={[s * 0.08, s * 0.2, 4, 8]} />
        <meshStandardMaterial color={faceColor} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[s * 0.35, -s * 0.8, s * 0.2]}>
        <capsuleGeometry args={[s * 0.08, s * 0.2, 4, 8]} />
        <meshStandardMaterial color={faceColor} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[-s * 0.35, -s * 0.8, -s * 0.2]}>
        <capsuleGeometry args={[s * 0.08, s * 0.2, 4, 8]} />
        <meshStandardMaterial color={faceColor} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[s * 0.35, -s * 0.8, -s * 0.2]}>
        <capsuleGeometry args={[s * 0.08, s * 0.2, 4, 8]} />
        <meshStandardMaterial color={faceColor} roughness={0.9} />
      </mesh>
      {/* 볼터치 */}
      <mesh position={[-s * 0.25, s * 0.42, s * 0.55]}>
        <sphereGeometry args={[s * 0.08, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.5} />
      </mesh>
      <mesh position={[s * 0.25, s * 0.42, s * 0.55]}>
        <sphereGeometry args={[s * 0.08, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

// 병아리 인형 (노란색, 작은 부리와 날개)
export const ChickDoll = ({ config, physicsRef }: DollRenderProps) => {
  const s = config.size;
  const { cheek } = config.palette;
  const yellowBody = '#FFD93D';
  const orangeBeak = '#FF8C00';

  return (
    <group>
      {/* 몸통 (통통한 노란색) */}
      <mesh castShadow position={[0, -s * 0.15, 0]}>
        <sphereGeometry args={[s * 0.8, 16, 16]} />
        <meshStandardMaterial color={yellowBody} roughness={0.85} />
      </mesh>
      {/* 머리 */}
      <mesh castShadow position={[0, s * 0.5, 0]}>
        <sphereGeometry args={[s * 0.55, 16, 16]} />
        <meshStandardMaterial color={yellowBody} roughness={0.85} />
      </mesh>
      {/* 머리 깃털 */}
      <mesh castShadow position={[0, s * 0.95, 0]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[s * 0.08, s * 0.2, 6]} />
        <meshStandardMaterial color={orangeBeak} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[-s * 0.08, s * 0.9, 0]} rotation={[0.2, 0, 0.3]}>
        <coneGeometry args={[s * 0.06, s * 0.15, 6]} />
        <meshStandardMaterial color={orangeBeak} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[s * 0.08, s * 0.9, 0]} rotation={[0.2, 0, -0.3]}>
        <coneGeometry args={[s * 0.06, s * 0.15, 6]} />
        <meshStandardMaterial color={orangeBeak} roughness={0.7} />
      </mesh>
      {/* 왼쪽 눈 */}
      <mesh position={[-s * 0.15, s * 0.6, s * 0.4]}>
        <sphereGeometry args={[s * 0.09, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.3} />
      </mesh>
      {/* 눈 하이라이트 왼쪽 */}
      <mesh position={[-s * 0.12, s * 0.63, s * 0.47]}>
        <sphereGeometry args={[s * 0.03, 6, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      {/* 오른쪽 눈 */}
      <mesh position={[s * 0.15, s * 0.6, s * 0.4]}>
        <sphereGeometry args={[s * 0.09, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.3} />
      </mesh>
      {/* 눈 하이라이트 오른쪽 */}
      <mesh position={[s * 0.18, s * 0.63, s * 0.47]}>
        <sphereGeometry args={[s * 0.03, 6, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      {/* 부리 */}
      <mesh position={[0, s * 0.42, s * 0.55]} rotation={[Math.PI / 3, 0, 0]}>
        <coneGeometry args={[s * 0.1, s * 0.15, 8]} />
        <meshStandardMaterial color={orangeBeak} roughness={0.6} />
      </mesh>
      {/* 왼쪽 날개 */}
      <mesh castShadow position={[-s * 0.55, s * 0.0, 0]} rotation={[0, 0, 0.4]}>
        <sphereGeometry args={[s * 0.2, 10, 10]} />
        <meshStandardMaterial color={yellowBody} roughness={0.85} />
      </mesh>
      {/* 오른쪽 날개 */}
      <mesh castShadow position={[s * 0.55, s * 0.0, 0]} rotation={[0, 0, -0.4]}>
        <sphereGeometry args={[s * 0.2, 10, 10]} />
        <meshStandardMaterial color={yellowBody} roughness={0.85} />
      </mesh>
      {/* 왼발 */}
      <mesh castShadow position={[-s * 0.2, -s * 0.75, s * 0.15]}>
        <boxGeometry args={[s * 0.15, s * 0.06, s * 0.2]} />
        <meshStandardMaterial color={orangeBeak} roughness={0.7} />
      </mesh>
      {/* 오른발 */}
      <mesh castShadow position={[s * 0.2, -s * 0.75, s * 0.15]}>
        <boxGeometry args={[s * 0.15, s * 0.06, s * 0.2]} />
        <meshStandardMaterial color={orangeBeak} roughness={0.7} />
      </mesh>
      {/* 볼터치 */}
      <mesh position={[-s * 0.28, s * 0.45, s * 0.4]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.5} />
      </mesh>
      <mesh position={[s * 0.28, s * 0.45, s * 0.4]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

// 여우 인형 (뾰족한 귀, 큰 꼬리)
export const FoxDoll = ({ config, physicsRef }: DollRenderProps) => {
  const s = config.size;
  const { cheek } = config.palette;
  const orangeBody = '#FF6B35';
  const whiteFur = '#FFF8F0';
  const darkTip = '#8B4513';

  return (
    <group>
      {/* 몸통 */}
      <mesh castShadow position={[0, -s * 0.3, 0]}>
        <sphereGeometry args={[s * 0.8, 16, 16]} />
        <meshStandardMaterial color={orangeBody} roughness={0.85} />
      </mesh>
      {/* 흰 배 */}
      <mesh position={[0, -s * 0.25, s * 0.3]}>
        <sphereGeometry args={[s * 0.5, 12, 12]} />
        <meshStandardMaterial color={whiteFur} roughness={0.8} />
      </mesh>
      {/* 머리 */}
      <mesh castShadow position={[0, s * 0.4, 0]}>
        <sphereGeometry args={[s * 0.6, 16, 16]} />
        <meshStandardMaterial color={orangeBody} roughness={0.85} />
      </mesh>
      {/* 주둥이 */}
      <mesh castShadow position={[0, s * 0.3, s * 0.45]}>
        <sphereGeometry args={[s * 0.25, 12, 12]} />
        <meshStandardMaterial color={whiteFur} roughness={0.8} />
      </mesh>
      {/* 왼쪽 귀 (뾰족) */}
      <mesh castShadow position={[-s * 0.35, s * 0.9, 0]} rotation={[0, 0, 0.2]}>
        <coneGeometry args={[s * 0.15, s * 0.35, 4]} />
        <meshStandardMaterial color={orangeBody} roughness={0.85} />
      </mesh>
      {/* 왼쪽 귀 안쪽 */}
      <mesh position={[-s * 0.35, s * 0.85, s * 0.03]} rotation={[0, 0, 0.2]}>
        <coneGeometry args={[s * 0.08, s * 0.2, 4]} />
        <meshStandardMaterial color={whiteFur} roughness={0.8} />
      </mesh>
      {/* 오른쪽 귀 (뾰족) */}
      <mesh castShadow position={[s * 0.35, s * 0.9, 0]} rotation={[0, 0, -0.2]}>
        <coneGeometry args={[s * 0.15, s * 0.35, 4]} />
        <meshStandardMaterial color={orangeBody} roughness={0.85} />
      </mesh>
      {/* 오른쪽 귀 안쪽 */}
      <mesh position={[s * 0.35, s * 0.85, s * 0.03]} rotation={[0, 0, -0.2]}>
        <coneGeometry args={[s * 0.08, s * 0.2, 4]} />
        <meshStandardMaterial color={whiteFur} roughness={0.8} />
      </mesh>
      {/* 왼쪽 눈 */}
      <mesh position={[-s * 0.18, s * 0.5, s * 0.45]}>
        <sphereGeometry args={[s * 0.08, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.3} />
      </mesh>
      {/* 오른쪽 눈 */}
      <mesh position={[s * 0.18, s * 0.5, s * 0.45]}>
        <sphereGeometry args={[s * 0.08, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.3} />
      </mesh>
      {/* 코 */}
      <mesh position={[0, s * 0.32, s * 0.68]}>
        <sphereGeometry args={[s * 0.06, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.4} />
      </mesh>
      {/* 큰 꼬리 */}
      <mesh castShadow position={[0, -s * 0.2, -s * 0.7]} rotation={[-0.5, 0, 0]}>
        <capsuleGeometry args={[s * 0.2, s * 0.5, 6, 10]} />
        <meshStandardMaterial color={orangeBody} roughness={0.85} />
      </mesh>
      {/* 꼬리 끝 (흰색) */}
      <mesh castShadow position={[0, s * 0.1, -s * 1.0]} rotation={[-0.5, 0, 0]}>
        <sphereGeometry args={[s * 0.18, 10, 10]} />
        <meshStandardMaterial color={whiteFur} roughness={0.8} />
      </mesh>
      {/* 볼터치 */}
      <mesh position={[-s * 0.32, s * 0.35, s * 0.4]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.5} />
      </mesh>
      <mesh position={[s * 0.32, s * 0.35, s * 0.4]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

// 개구리 인형 (큰 눈, 넓은 입)
export const FrogDoll = ({ config, physicsRef }: DollRenderProps) => {
  const s = config.size;
  const { cheek } = config.palette;
  const greenBody = '#4CAF50';
  const lightGreen = '#A5D6A7';
  const yellowBelly = '#FFF9C4';

  return (
    <group>
      {/* 몸통 */}
      <mesh castShadow position={[0, -s * 0.25, 0]}>
        <sphereGeometry args={[s * 0.85, 16, 16]} />
        <meshStandardMaterial color={greenBody} roughness={0.85} />
      </mesh>
      {/* 노란 배 */}
      <mesh position={[0, -s * 0.2, s * 0.35]}>
        <sphereGeometry args={[s * 0.55, 12, 12]} />
        <meshStandardMaterial color={yellowBelly} roughness={0.8} />
      </mesh>
      {/* 머리 */}
      <mesh castShadow position={[0, s * 0.35, 0]}>
        <sphereGeometry args={[s * 0.65, 16, 16]} />
        <meshStandardMaterial color={greenBody} roughness={0.85} />
      </mesh>
      {/* 왼쪽 눈 튀어나온 부분 */}
      <mesh castShadow position={[-s * 0.3, s * 0.7, s * 0.15]}>
        <sphereGeometry args={[s * 0.2, 12, 12]} />
        <meshStandardMaterial color={greenBody} roughness={0.85} />
      </mesh>
      {/* 왼쪽 눈 (흰자) */}
      <mesh position={[-s * 0.3, s * 0.7, s * 0.32]}>
        <sphereGeometry args={[s * 0.15, 10, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      {/* 왼쪽 눈동자 */}
      <mesh position={[-s * 0.3, s * 0.7, s * 0.45]}>
        <sphereGeometry args={[s * 0.08, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.2} />
      </mesh>
      {/* 오른쪽 눈 튀어나온 부분 */}
      <mesh castShadow position={[s * 0.3, s * 0.7, s * 0.15]}>
        <sphereGeometry args={[s * 0.2, 12, 12]} />
        <meshStandardMaterial color={greenBody} roughness={0.85} />
      </mesh>
      {/* 오른쪽 눈 (흰자) */}
      <mesh position={[s * 0.3, s * 0.7, s * 0.32]}>
        <sphereGeometry args={[s * 0.15, 10, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      {/* 오른쪽 눈동자 */}
      <mesh position={[s * 0.3, s * 0.7, s * 0.45]}>
        <sphereGeometry args={[s * 0.08, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.2} />
      </mesh>
      {/* 입 (웃는 표정) */}
      <mesh position={[0, s * 0.15, s * 0.6]} rotation={[0.2, 0, 0]}>
        <torusGeometry args={[s * 0.2, s * 0.03, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#E91E63" roughness={0.5} />
      </mesh>
      {/* 왼쪽 앞발 */}
      <mesh castShadow position={[-s * 0.55, -s * 0.6, s * 0.3]}>
        <sphereGeometry args={[s * 0.15, 10, 10]} />
        <meshStandardMaterial color={lightGreen} roughness={0.85} />
      </mesh>
      {/* 오른쪽 앞발 */}
      <mesh castShadow position={[s * 0.55, -s * 0.6, s * 0.3]}>
        <sphereGeometry args={[s * 0.15, 10, 10]} />
        <meshStandardMaterial color={lightGreen} roughness={0.85} />
      </mesh>
      {/* 왼쪽 뒷다리 */}
      <mesh castShadow position={[-s * 0.45, -s * 0.8, -s * 0.1]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[s * 0.12, s * 0.25, 4, 8]} />
        <meshStandardMaterial color={greenBody} roughness={0.85} />
      </mesh>
      {/* 오른쪽 뒷다리 */}
      <mesh castShadow position={[s * 0.45, -s * 0.8, -s * 0.1]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[s * 0.12, s * 0.25, 4, 8]} />
        <meshStandardMaterial color={greenBody} roughness={0.85} />
      </mesh>
      {/* 볼터치 */}
      <mesh position={[-s * 0.4, s * 0.25, s * 0.45]}>
        <sphereGeometry args={[s * 0.12, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.5} />
      </mesh>
      <mesh position={[s * 0.4, s * 0.25, s * 0.45]}>
        <sphereGeometry args={[s * 0.12, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

// 사자 인형 (갈기)
export const LionDoll = ({ config, physicsRef }: DollRenderProps) => {
  const s = config.size;
  const { cheek } = config.palette;
  const bodyColor = '#DEB887';
  const maneColor = '#CD853F';
  const noseColor = '#8B4513';

  return (
    <group>
      {/* 몸통 */}
      <mesh castShadow position={[0, -s * 0.3, 0]}>
        <sphereGeometry args={[s * 0.8, 16, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.85} />
      </mesh>
      {/* 갈기 (여러 개의 구로 표현) */}
      <mesh castShadow position={[0, s * 0.4, -s * 0.15]}>
        <sphereGeometry args={[s * 0.75, 16, 16]} />
        <meshStandardMaterial color={maneColor} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[-s * 0.4, s * 0.5, 0]}>
        <sphereGeometry args={[s * 0.3, 12, 12]} />
        <meshStandardMaterial color={maneColor} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[s * 0.4, s * 0.5, 0]}>
        <sphereGeometry args={[s * 0.3, 12, 12]} />
        <meshStandardMaterial color={maneColor} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[-s * 0.5, s * 0.3, 0]}>
        <sphereGeometry args={[s * 0.25, 12, 12]} />
        <meshStandardMaterial color={maneColor} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[s * 0.5, s * 0.3, 0]}>
        <sphereGeometry args={[s * 0.25, 12, 12]} />
        <meshStandardMaterial color={maneColor} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, s * 0.85, 0]}>
        <sphereGeometry args={[s * 0.25, 12, 12]} />
        <meshStandardMaterial color={maneColor} roughness={0.9} />
      </mesh>
      {/* 얼굴 */}
      <mesh castShadow position={[0, s * 0.45, s * 0.25]}>
        <sphereGeometry args={[s * 0.5, 16, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.85} />
      </mesh>
      {/* 왼쪽 귀 */}
      <mesh castShadow position={[-s * 0.38, s * 0.8, s * 0.1]}>
        <sphereGeometry args={[s * 0.12, 10, 10]} />
        <meshStandardMaterial color={bodyColor} roughness={0.85} />
      </mesh>
      {/* 오른쪽 귀 */}
      <mesh castShadow position={[s * 0.38, s * 0.8, s * 0.1]}>
        <sphereGeometry args={[s * 0.12, 10, 10]} />
        <meshStandardMaterial color={bodyColor} roughness={0.85} />
      </mesh>
      {/* 주둥이 */}
      <mesh position={[0, s * 0.35, s * 0.6]}>
        <sphereGeometry args={[s * 0.2, 12, 12]} />
        <meshStandardMaterial color="#FFF8DC" roughness={0.8} />
      </mesh>
      {/* 왼쪽 눈 */}
      <mesh position={[-s * 0.18, s * 0.55, s * 0.55]}>
        <sphereGeometry args={[s * 0.08, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.3} />
      </mesh>
      {/* 오른쪽 눈 */}
      <mesh position={[s * 0.18, s * 0.55, s * 0.55]}>
        <sphereGeometry args={[s * 0.08, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.3} />
      </mesh>
      {/* 코 */}
      <mesh position={[0, s * 0.38, s * 0.78]}>
        <sphereGeometry args={[s * 0.07, 8, 8]} />
        <meshStandardMaterial color={noseColor} roughness={0.5} />
      </mesh>
      {/* 볼터치 */}
      <mesh position={[-s * 0.32, s * 0.4, s * 0.5]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.5} />
      </mesh>
      <mesh position={[s * 0.32, s * 0.4, s * 0.5]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.5} />
      </mesh>
      {/* 꼬리 */}
      <mesh castShadow position={[0, -s * 0.2, -s * 0.7]} rotation={[-0.3, 0, 0]}>
        <capsuleGeometry args={[s * 0.06, s * 0.35, 4, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.85} />
      </mesh>
      {/* 꼬리 끝 털 */}
      <mesh castShadow position={[0, s * 0.0, -s * 0.9]}>
        <sphereGeometry args={[s * 0.1, 10, 10]} />
        <meshStandardMaterial color={maneColor} roughness={0.9} />
      </mesh>
    </group>
  );
};

// 돼지 인형 (둥근 코, 꼬불꼬불 꼬리)
export const PigDoll = ({ config, physicsRef }: DollRenderProps) => {
  const s = config.size;
  const { cheek } = config.palette;
  const pinkBody = '#FFB6C1';
  const darkPink = '#FF69B4';

  return (
    <group>
      {/* 몸통 (통통) */}
      <mesh castShadow position={[0, -s * 0.2, 0]}>
        <sphereGeometry args={[s * 0.9, 16, 16]} />
        <meshStandardMaterial color={pinkBody} roughness={0.85} />
      </mesh>
      {/* 머리 */}
      <mesh castShadow position={[0, s * 0.5, 0]}>
        <sphereGeometry args={[s * 0.65, 16, 16]} />
        <meshStandardMaterial color={pinkBody} roughness={0.85} />
      </mesh>
      {/* 왼쪽 귀 */}
      <mesh castShadow position={[-s * 0.4, s * 0.9, 0]} rotation={[0.3, 0, -0.4]}>
        <coneGeometry args={[s * 0.15, s * 0.25, 4]} />
        <meshStandardMaterial color={pinkBody} roughness={0.85} />
      </mesh>
      {/* 오른쪽 귀 */}
      <mesh castShadow position={[s * 0.4, s * 0.9, 0]} rotation={[0.3, 0, 0.4]}>
        <coneGeometry args={[s * 0.15, s * 0.25, 4]} />
        <meshStandardMaterial color={pinkBody} roughness={0.85} />
      </mesh>
      {/* 코 (둥글고 큰) */}
      <mesh castShadow position={[0, s * 0.4, s * 0.55]}>
        <cylinderGeometry args={[s * 0.18, s * 0.18, s * 0.12, 16]} />
        <meshStandardMaterial color={darkPink} roughness={0.7} />
      </mesh>
      {/* 코구멍 왼쪽 */}
      <mesh position={[-s * 0.06, s * 0.4, s * 0.62]}>
        <sphereGeometry args={[s * 0.04, 8, 8]} />
        <meshStandardMaterial color="#333333" roughness={0.5} />
      </mesh>
      {/* 코구멍 오른쪽 */}
      <mesh position={[s * 0.06, s * 0.4, s * 0.62]}>
        <sphereGeometry args={[s * 0.04, 8, 8]} />
        <meshStandardMaterial color="#333333" roughness={0.5} />
      </mesh>
      {/* 왼쪽 눈 */}
      <mesh position={[-s * 0.2, s * 0.6, s * 0.45]}>
        <sphereGeometry args={[s * 0.08, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.3} />
      </mesh>
      {/* 눈 하이라이트 왼쪽 */}
      <mesh position={[-s * 0.17, s * 0.63, s * 0.52]}>
        <sphereGeometry args={[s * 0.03, 6, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      {/* 오른쪽 눈 */}
      <mesh position={[s * 0.2, s * 0.6, s * 0.45]}>
        <sphereGeometry args={[s * 0.08, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.3} />
      </mesh>
      {/* 눈 하이라이트 오른쪽 */}
      <mesh position={[s * 0.23, s * 0.63, s * 0.52]}>
        <sphereGeometry args={[s * 0.03, 6, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      {/* 볼터치 */}
      <mesh position={[-s * 0.38, s * 0.45, s * 0.35]}>
        <sphereGeometry args={[s * 0.12, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.5} />
      </mesh>
      <mesh position={[s * 0.38, s * 0.45, s * 0.35]}>
        <sphereGeometry args={[s * 0.12, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.5} />
      </mesh>
      {/* 앞발 */}
      <mesh castShadow position={[-s * 0.4, -s * 0.85, s * 0.2]}>
        <sphereGeometry args={[s * 0.15, 10, 10]} />
        <meshStandardMaterial color={pinkBody} roughness={0.85} />
      </mesh>
      <mesh castShadow position={[s * 0.4, -s * 0.85, s * 0.2]}>
        <sphereGeometry args={[s * 0.15, 10, 10]} />
        <meshStandardMaterial color={pinkBody} roughness={0.85} />
      </mesh>
      {/* 꼬불꼬불 꼬리 */}
      <mesh castShadow position={[0, -s * 0.1, -s * 0.75]} rotation={[0, 0, 0]}>
        <torusGeometry args={[s * 0.1, s * 0.04, 8, 16, Math.PI * 1.5]} />
        <meshStandardMaterial color={darkPink} roughness={0.7} />
      </mesh>
    </group>
  );
};

// 코알라 인형 (큰 솜털 귀, 둥근 코)
export const KoalaDoll = ({ config, physicsRef }: DollRenderProps) => {
  const s = config.size;
  const { cheek } = config.palette;
  const grayBody = '#808080';
  const lightGray = '#C0C0C0';
  const whiteFluff = '#F5F5F5';

  return (
    <group>
      {/* 몸통 */}
      <mesh castShadow position={[0, -s * 0.25, 0]}>
        <sphereGeometry args={[s * 0.85, 16, 16]} />
        <meshStandardMaterial color={grayBody} roughness={0.9} />
      </mesh>
      {/* 흰 배 */}
      <mesh position={[0, -s * 0.2, s * 0.35]}>
        <sphereGeometry args={[s * 0.55, 12, 12]} />
        <meshStandardMaterial color={whiteFluff} roughness={0.85} />
      </mesh>
      {/* 머리 */}
      <mesh castShadow position={[0, s * 0.45, 0]}>
        <sphereGeometry args={[s * 0.65, 16, 16]} />
        <meshStandardMaterial color={grayBody} roughness={0.9} />
      </mesh>
      {/* 왼쪽 귀 (큰 솜털) */}
      <mesh castShadow position={[-s * 0.55, s * 0.65, 0]}>
        <sphereGeometry args={[s * 0.28, 12, 12]} />
        <meshStandardMaterial color={grayBody} roughness={0.9} />
      </mesh>
      {/* 왼쪽 귀 안쪽 (흰 솜털) */}
      <mesh position={[-s * 0.55, s * 0.65, s * 0.08]}>
        <sphereGeometry args={[s * 0.18, 10, 10]} />
        <meshStandardMaterial color={whiteFluff} roughness={0.9} />
      </mesh>
      {/* 오른쪽 귀 (큰 솜털) */}
      <mesh castShadow position={[s * 0.55, s * 0.65, 0]}>
        <sphereGeometry args={[s * 0.28, 12, 12]} />
        <meshStandardMaterial color={grayBody} roughness={0.9} />
      </mesh>
      {/* 오른쪽 귀 안쪽 (흰 솜털) */}
      <mesh position={[s * 0.55, s * 0.65, s * 0.08]}>
        <sphereGeometry args={[s * 0.18, 10, 10]} />
        <meshStandardMaterial color={whiteFluff} roughness={0.9} />
      </mesh>
      {/* 흰 얼굴 패치 */}
      <mesh position={[0, s * 0.35, s * 0.35]}>
        <sphereGeometry args={[s * 0.4, 12, 12]} />
        <meshStandardMaterial color={whiteFluff} roughness={0.85} />
      </mesh>
      {/* 큰 코 */}
      <mesh castShadow position={[0, s * 0.35, s * 0.65]}>
        <sphereGeometry args={[s * 0.15, 10, 10]} />
        <meshStandardMaterial color="#2F2F2F" roughness={0.6} />
      </mesh>
      {/* 왼쪽 눈 */}
      <mesh position={[-s * 0.18, s * 0.5, s * 0.5]}>
        <sphereGeometry args={[s * 0.08, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.3} />
      </mesh>
      {/* 눈 하이라이트 왼쪽 */}
      <mesh position={[-s * 0.15, s * 0.53, s * 0.56]}>
        <sphereGeometry args={[s * 0.025, 6, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      {/* 오른쪽 눈 */}
      <mesh position={[s * 0.18, s * 0.5, s * 0.5]}>
        <sphereGeometry args={[s * 0.08, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.3} />
      </mesh>
      {/* 눈 하이라이트 오른쪽 */}
      <mesh position={[s * 0.21, s * 0.53, s * 0.56]}>
        <sphereGeometry args={[s * 0.025, 6, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      {/* 볼터치 */}
      <mesh position={[-s * 0.32, s * 0.32, s * 0.45]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.5} />
      </mesh>
      <mesh position={[s * 0.32, s * 0.32, s * 0.45]}>
        <sphereGeometry args={[s * 0.1, 8, 8]} />
        <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.5} />
      </mesh>
      {/* 팔 */}
      <mesh castShadow position={[-s * 0.6, -s * 0.1, s * 0.2]} rotation={[0, 0, 0.5]}>
        <capsuleGeometry args={[s * 0.12, s * 0.25, 4, 8]} />
        <meshStandardMaterial color={grayBody} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[s * 0.6, -s * 0.1, s * 0.2]} rotation={[0, 0, -0.5]}>
        <capsuleGeometry args={[s * 0.12, s * 0.25, 4, 8]} />
        <meshStandardMaterial color={grayBody} roughness={0.9} />
      </mesh>
    </group>
  );
};

// 물리 + 렌더링을 합친 통합 인형 컴포넌트
const CuteDoll = ({ config }: CuteDollProps) => {
  const grabbedDollId = useGameStore((state) => state.grabbedDoll.id);
  const isGrabbed = grabbedDollId === config.id;

  const [ref, api] = useSphere<Mesh>(() => ({
    mass: config.mass,
    position: config.position,
    args: [config.size],
    material: {
      friction: config.friction,
      restitution: 0.1, // 반발력 낮춤
    },
    linearDamping: PHYSICS_CONFIG.dollLinearDamping,
    angularDamping: PHYSICS_CONFIG.dollAngularDamping,
  }));

  useDollLogic(api, ref, config);

  const renderDoll = () => {
    switch (config.cuteType) {
      case 'bunny':
        return <BunnyDoll config={config} physicsRef={ref} />;
      case 'bear':
        return <BearDoll config={config} physicsRef={ref} />;
      case 'cat':
        return <CatDoll config={config} physicsRef={ref} />;
      case 'hamster':
        return <HamsterDoll config={config} physicsRef={ref} />;
      case 'dog':
        return <DogDoll config={config} physicsRef={ref} />;
      case 'penguin':
        return <PenguinDoll config={config} physicsRef={ref} />;
      case 'panda':
        return <PandaDoll config={config} physicsRef={ref} />;
      case 'sheep':
        return <SheepDoll config={config} physicsRef={ref} />;
      case 'chick':
        return <ChickDoll config={config} physicsRef={ref} />;
      case 'fox':
        return <FoxDoll config={config} physicsRef={ref} />;
      case 'frog':
        return <FrogDoll config={config} physicsRef={ref} />;
      case 'lion':
        return <LionDoll config={config} physicsRef={ref} />;
      case 'pig':
        return <PigDoll config={config} physicsRef={ref} />;
      case 'koala':
        return <KoalaDoll config={config} physicsRef={ref} />;
      default:
        // 혹시라도 타입이 없거나 잘못된 경우 기본값으로 곰인형 렌더링 (동그라미 구체만 나오는 문제 방지)
        // 팔레트가 없을 경우를 대비해 기본 팔레트 사용
        const safeConfig = {
          ...config,
          palette: config.palette || DOLL_PALETTES[1] // 갈색 곰 팔레트
        };
        return <BearDoll config={safeConfig} physicsRef={ref} />;
    }
  };

  // 잡혔을 때는 집게 내부에서 렌더링하지 않고, 여기서 직접 위치를 제어하여 절대 사라지지 않게 함
  // 집게 쪽 GrabbedDollRenderer는 제거해야 함 (중복 렌더링 방지 및 깜빡임 원인 제거)
  useFrame(() => {
    if (isGrabbed && ref.current) {
      // useDollLogic에서 위치를 제어하므로 여기서는 visible만 항상 true로 유지
      // ref.current.visible = true; // 기본값이므로 불필요
    }
  });

  return (
    <group ref={ref as any}>
      {renderDoll()}
    </group>
  );
};

interface DollsProps {
  count?: number;
}

const Dolls = ({ count = 12 }: DollsProps) => {
  const dollConfigs = useMemo(() => generateDollConfigs(count), [count]);

  return (
    <group>
      {dollConfigs.map((config) => (
        <CuteDoll key={config.id} config={config} />
      ))}
    </group>
  );
};

export default Dolls;
export { generateDollConfigs, CuteDoll };
