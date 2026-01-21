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

  const cuteTypes: CuteDollType[] = ['bunny', 'bear', 'cat', 'hamster', 'dog'];

  // 햄스터 전용 팔레트 인덱스 (10, 11, 12)
  const hamsterPalettes = [10, 11, 12];

  // 햄스터 2마리 보장
  for (let i = 0; i < 2; i++) {
    const size = 0.16 + Math.random() * 0.06; // 햄스터는 약간 작게

    const x = (Math.random() - 0.5) * (width - margin * 2 - size * 2);
    const z = (Math.random() - 0.5) * (depth - margin * 2 - size * 2);
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

    const x = (Math.random() - 0.5) * (width - margin * 2 - size * 2);
    const z = (Math.random() - 0.5) * (depth - margin * 2 - size * 2);
    const y = floorHeight + size + Math.random() * 0.5;

    // 햄스터면 햄스터 팔레트, 강아지면 강아지 팔레트 (13, 14), 나머지는 랜덤
    let paletteIndex: number;
    if (cuteType === 'hamster') {
      paletteIndex = hamsterPalettes[Math.floor(Math.random() * hamsterPalettes.length)];
    } else if (cuteType === 'dog') {
      paletteIndex = 13 + Math.floor(Math.random() * 2);
    } else {
      paletteIndex = Math.floor(Math.random() * 10); // 기존 팔레트 0-9
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

  useEffect(() => {
    const unsubscribePos = api.position.subscribe((p: [number, number, number]) => {
      positionRef.current = p;
    });
    const unsubscribeRot = api.rotation.subscribe((r: [number, number, number]) => {
      rotationRef.current = r;
    });
    return () => {
      unsubscribePos();
      unsubscribeRot();
    };
  }, [api]);

  useFrame(() => {
    if (!ref.current) return;

    // 매 프레임 최신 상태 가져오기 (closure 문제 방지)
    const state = useGameStore.getState();
    const { phase, grabbedDoll, visualClawPosition, setGrabbedDoll } = state;

    const isGrabbed = grabbedDoll.id === config.id;

    // 잡힘 상태 변경 감지
    if (isGrabbed) {
      if (!wasGrabbedRef.current) {
        wasGrabbedRef.current = true;

        // 물리 타입을 Kinematic으로 변경하여 물리 연산에서 제외하고 위치 제어만 가능하게 함
        // (mass=0 과 유사하지만 충돌 계산 등에서 더 확실함)
        // api.type.set('Kinematic')이 지원되지 않을 수 있으므로 mass=0 및 collisionResponse 비활성화 등 사용
        api.mass.set(0);
        api.velocity.set(0, 0, 0);
        api.angularVelocity.set(0, 0, 0);
        api.collisionResponse.set(false); // 다른 물체완 충돌하지 않음
      }

      // ** 위치 강제 고정 **
      // 오프셋 적용하여 실제 잡힌 위치에 고정
      const targetX = visualClawPosition.x + grabbedDoll.grabOffset.x;
      const targetY = visualClawPosition.y - 0.25 + grabbedDoll.grabOffset.y;
      const targetZ = visualClawPosition.z + grabbedDoll.grabOffset.z;

      api.position.set(targetX, targetY, targetZ);
      api.velocity.set(0, 0, 0);
      api.angularVelocity.set(0, 0, 0);
      api.rotation.set(0, 0, 0);

      if (ref.current) {
        ref.current.position.set(targetX, targetY, targetZ);
        ref.current.rotation.set(0, 0, 0); // 회전도 고정
      }
      return;
    }

    // 놓쳤을 때
    if (!isGrabbed && wasGrabbedRef.current) {
      wasGrabbedRef.current = false;

      api.mass.set(config.mass);
      api.collisionResponse.set(true); // 충돌 다시 활성화

      // 걸려서 떨어지는 효과 (랜덤 속도 및 회전)
      const randX = (Math.random() - 0.5) * 1.0;
      const randZ = (Math.random() - 0.5) * 1.0;
      api.velocity.set(randX, -1, randZ);

      const randAng = 5;
      api.angularVelocity.set(
        (Math.random() - 0.5) * randAng,
        (Math.random() - 0.5) * randAng,
        (Math.random() - 0.5) * randAng
      );
      api.wakeUp();
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

        if (elapsed > 1400) { // 1.4초 후 판정 (집게가 완전히 오므라든 후)
          if (!grabbedDoll.id) {
            const [x, y, z] = positionRef.current;
            const cx = visualClawPosition.x;
            const cy = visualClawPosition.y;
            const cz = visualClawPosition.z;

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

                const offset = {
                  x: x - cx,
                  y: 0,
                  z: z - cz
                };
                const isPerfectGrab = accuracy >= PERFECT_THRESHOLD;

                console.log(`[Grab] Accuracy: ${(accuracy * 100).toFixed(1)}%, Perfect: ${isPerfectGrab}`);

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
        return null;
    }
  };

  return (
    <group ref={ref as any} visible={!isGrabbed}>
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
