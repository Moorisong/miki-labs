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
];

// 인형 타입 (토끼, 곰, 고양이)
type CuteDollType = 'bunny' | 'bear' | 'cat';

interface CuteDollConfig extends DollConfig {
  cuteType: CuteDollType;
  palette: typeof DOLL_PALETTES[0];
}

const generateDollConfigs = (count: number): CuteDollConfig[] => {
  const { width, depth, floorHeight } = CABINET_DIMENSIONS;
  const margin = 0.3;
  const dolls: CuteDollConfig[] = [];

  const cuteTypes: CuteDollType[] = ['bunny', 'bear', 'cat'];

  for (let i = 0; i < count; i++) {
    const cuteType = cuteTypes[Math.floor(Math.random() * cuteTypes.length)];
    const size = 0.18 + Math.random() * 0.08;

    const x = (Math.random() - 0.5) * (width - margin * 2 - size * 2);
    const z = (Math.random() - 0.5) * (depth - margin * 2 - size * 2);
    const y = floorHeight + size + Math.random() * 0.5;

    dolls.push({
      id: `doll-${i}`,
      position: [x, y, z],
      mass: generateRandomMass(),
      friction: generateRandomFriction(),
      type: 'sphere', // 물리는 구체로 통일
      color: '#ffffff',
      size,
      cuteType,
      palette: DOLL_PALETTES[Math.floor(Math.random() * DOLL_PALETTES.length)],
    });
  }

  return dolls;
};



const useDollLogic = (api: any, ref: any, config: DollConfig) => {
  const { claw, phase, setGrabbedDoll, grabbedDoll } = useGameStore();
  const wasGrabbingRef = useRef(false);
  const grabCheckDoneRef = useRef(false);

  useFrame(() => {
    if (!ref.current) return;

    // 잡힌 인형은 집게를 따라다님
    if (grabbedDoll.id === config.id) {
      const targetY = claw.position.y - 0.3;
      api.position.set(claw.position.x, targetY, claw.position.z);
      api.velocity.set(0, 0, 0);
      api.angularVelocity.set(0, 0, 0);
      return;
    }

    // rising 단계로 전환될 때 한 번만 잡기 체크
    if (phase === 'rising' && wasGrabbingRef.current && !grabCheckDoneRef.current) {
      grabCheckDoneRef.current = true;

      if (!grabbedDoll.id) {
        const { x, y, z } = ref.current.position;
        const cx = claw.position.x;
        const cy = claw.position.y;
        const cz = claw.position.z;

        // 잡기 범위 체크 (더 관대하게)
        const distXZ = Math.sqrt((x - cx) ** 2 + (z - cz) ** 2);
        const clawBottomY = cy - 0.5;
        const dollTopY = y + config.size;
        const isUnderClaw = dollTopY >= clawBottomY - 0.15 && y < cy;

        // 잡기 범위: 중심에서 0.28 이내 (더 관대하게)
        const GRAB_RADIUS = 0.28;
        const PERFECT_RADIUS = 0.08; // 완벽한 잡기 범위

        if (distXZ < GRAB_RADIUS && isUnderClaw) {
          const offset = {
            x: x - cx,
            y: y - (cy - 0.3),
            z: z - cz
          };

          // 정확도 계산 (0 ~ 1, 1이 완벽)
          // 중심에 가까울수록 정확도 높음
          const accuracy = Math.max(0, 1 - (distXZ / GRAB_RADIUS));

          // 완벽한 잡기인지 판단
          const isPerfectGrab = distXZ < PERFECT_RADIUS;

          setGrabbedDoll(config, offset, accuracy, isPerfectGrab);
        }
      }
    }

    // phase 상태 추적
    if (phase === 'grabbing') {
      wasGrabbingRef.current = true;
    } else if (phase === 'idle' || phase === 'moving') {
      wasGrabbingRef.current = false;
      grabCheckDoneRef.current = false;
    }
  });
};

interface CuteDollProps {
  config: CuteDollConfig;
}

// 토끼 인형 (긴 귀)
const BunnyDoll = ({ config, physicsRef }: CuteDollProps & { physicsRef: React.RefObject<Mesh> }) => {
  const s = config.size;
  const { body, accent, cheek } = config.palette;

  return (
    <group>
      {/* 몸통 */}
      <mesh castShadow position={[0, -s * 0.3, 0]}>
        <sphereGeometry args={[s * 0.8, 16, 16]} />
        <meshStandardMaterial color={body} roughness={0.8} />
      </mesh>
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
const BearDoll = ({ config, physicsRef }: CuteDollProps & { physicsRef: React.RefObject<Mesh> }) => {
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
const CatDoll = ({ config, physicsRef }: CuteDollProps & { physicsRef: React.RefObject<Mesh> }) => {
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

// 물리 + 렌더링을 합친 통합 인형 컴포넌트
const CuteDoll = ({ config }: CuteDollProps) => {
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
      default:
        return null;
    }
  };

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
