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

// 인형 타입 (토끼, 곰, 고양이, 햄스터, 강아지)
type CuteDollType = 'bunny' | 'bear' | 'cat' | 'hamster' | 'dog';

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

  const cuteTypes: CuteDollType[] = ['bunny', 'bear', 'cat', 'hamster', 'dog'];

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
      const dropX = clawPos.x + grabbedDoll.grabOffset.x;
      const dropY = clawPos.y - 0.55 + grabbedDoll.grabOffset.y; // 집게 기준점(0.55) 재적용
      const dropZ = clawPos.z + grabbedDoll.grabOffset.z;

      console.log(`[Doll ${config.id}] Released at (${dropX.toFixed(2)}, ${dropY.toFixed(2)}, ${dropZ.toFixed(2)})`);

      api.position.set(dropX, dropY, dropZ);
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
            // 높이 판정
            const clawBottomY = cy - 0.5;
            const dollTopY = y + config.size;
            const isUnderClaw = dollTopY >= clawBottomY - 0.3 && y < cy;

            // 최대 잡기 반경 (이 범위 밖은 아예 못 잡음)
            const MAX_GRAB_RADIUS = 0.35;
            // 완벽한 잡기 반경 (이 범위 안은 100% 정확도)
            const PERFECT_GRAB_RADIUS = 0.08;

            if (isUnderClaw && distXZ < MAX_GRAB_RADIUS) {
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

              // 임계값 기반 판정
              const PERFECT_THRESHOLD = 0.80;  // 80% 이상: 완벽
              const PARTIAL_THRESHOLD = 0.35;  // 35% 이상: 불완전하게 잡힘

              if (accuracy >= PARTIAL_THRESHOLD) {
                grabCheckDoneRef.current = true;

                // *** 핵심 수정: 시각적 집게 위치 기준으로 오프셋 계산 ***
                // 인형 현재 위치 - 시각적 집게 기준 위치 = 오프셋
                // 나중에 적용할 때: 시각적 집게 위치 + 오프셋 = 인형 위치 (바로 여기!)
                const offset = {
                  x: x - cx,
                  y: y - (cy - 0.55),  // 오프셋 기준점을 낮춰서(0.25 -> 0.55) 인형이 더 위로 붙게 함
                  z: z - cz
                };
                const isPerfectGrab = accuracy >= PERFECT_THRESHOLD;

                console.log(`[Grab] Doll ${config.id}, Accuracy: ${(accuracy * 100).toFixed(1)}%, Perfect: ${isPerfectGrab}`);
                console.log(`[Grab] Visual Claw: (${cx.toFixed(2)}, ${cy.toFixed(2)}, ${cz.toFixed(2)}), Doll: (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`);

                const [rx, ry, rz] = rotationRef.current;
                setGrabbedDoll(config, offset, accuracy, isPerfectGrab, { x: rx, y: ry, z: rz });
              }
              // accuracy < 0.4면 아예 잡히지 않음 (아무것도 하지 않음)
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
