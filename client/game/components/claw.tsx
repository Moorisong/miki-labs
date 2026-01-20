'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Vector3 } from 'three';
import { useSphere } from '@react-three/cannon';
import { CLAW_CONFIG, CABINET_DIMENSIONS } from '../types/game.types';
import { useGameStore } from '../core/game-manager';
import { generateFingerStrengths } from '../core/physics-world';

const {
  fingerCount,
  fingerLength,
  fingerWidth,
  openAngle,
  closedAngle,
  baseRadius,
  cableLength,
} = CLAW_CONFIG;

// 집게 중앙에 위치한 물리 충돌체 (인형과 충돌)
const ClawCollider = () => {
  const { claw, phase } = useGameStore();
  const { position, isOpen } = claw;

  // 집게가 열렸을 때만 작은 충돌체 (인형을 살짝 밀어내는 정도)
  const colliderSize = isOpen ? 0.08 : 0.01;

  const [ref, api] = useSphere<Mesh>(() => ({
    type: 'Kinematic',
    args: [colliderSize],
    position: [position.x, position.y - 0.3, position.z],
    material: {
      friction: 0.1,
      restitution: 0.05, // 거의 튕기지 않음
    },
  }));

  // 집게 위치에 따라 충돌체 위치 업데이트
  useFrame(() => {
    api.position.set(position.x, position.y - 0.3, position.z);
  });

  return (
    <mesh ref={ref} visible={false}>
      <sphereGeometry args={[colliderSize, 8, 8]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
};

interface ClawFingerProps {
  index: number;
  isOpen: boolean;
  strengthVariance: number;
  clawPosition: { x: number; y: number; z: number };
}

const ClawFinger = ({ index, isOpen, strengthVariance, clawPosition }: ClawFingerProps) => {
  const groupRef = useRef<Group>(null);
  const angleOffset = (index / fingerCount) * Math.PI * 2;
  const targetAngle = isOpen ? openAngle : closedAngle;
  const currentAngleRef = useRef(openAngle);

  // 손가락 끝 위치에 물리 충돌체 (작게, 부드럽게)
  const [fingerRef, fingerApi] = useSphere<Mesh>(() => ({
    type: 'Kinematic',
    args: [fingerWidth * 0.5],
    position: [0, 0, 0],
    material: {
      friction: 0.2,
      restitution: 0.02, // 거의 튕기지 않음
    },
  }));

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const currentAngle = currentAngleRef.current;
    const adjustedTarget = targetAngle * (1 + (strengthVariance - 1) * 0.1);
    const newAngle = currentAngle + (adjustedTarget - currentAngle) * Math.min(delta * 5, 1);
    currentAngleRef.current = newAngle;
    groupRef.current.rotation.x = newAngle;

    // 손가락 끝 위치 계산 (월드 좌표)
    const fingerTipLocalY = -fingerLength - fingerLength * 0.3;
    const fingerTipLocalX = baseRadius * 0.8 + fingerWidth / 2;

    // 회전 적용
    const cosAngle = Math.cos(newAngle);
    const sinAngle = Math.sin(newAngle);
    const rotatedY = fingerTipLocalY * cosAngle;
    const rotatedZ = fingerTipLocalY * sinAngle;

    // angleOffset에 따른 회전
    const cosOffset = Math.cos(angleOffset);
    const sinOffset = Math.sin(angleOffset);
    const worldX = clawPosition.x + fingerTipLocalX * cosOffset;
    const worldZ = clawPosition.z + fingerTipLocalX * sinOffset + rotatedZ * cosOffset;
    const worldY = clawPosition.y + rotatedY - baseRadius * 0.5;

    fingerApi.position.set(worldX, worldY, worldZ);
  });

  return (
    <group rotation={[0, angleOffset, 0]}>
      <group ref={groupRef} position={[baseRadius * 0.8, -baseRadius * 0.5, 0]}>
        <mesh castShadow position={[fingerWidth / 2, -fingerLength / 2, 0]}>
          <boxGeometry args={[fingerWidth, fingerLength, fingerWidth]} />
          <meshStandardMaterial
            color="#888888"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        <mesh
          castShadow
          position={[fingerWidth / 2, -fingerLength - fingerLength * 0.3, fingerWidth * 0.3]}
          rotation={[Math.PI / 6, 0, 0]}
        >
          <boxGeometry args={[fingerWidth * 0.8, fingerLength * 0.6, fingerWidth * 0.6]} />
          <meshStandardMaterial
            color="#666666"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      </group>
      {/* 손가락 물리 충돌체 (보이지 않음) */}
      <mesh ref={fingerRef} visible={false}>
        <sphereGeometry args={[fingerWidth * 0.8, 4, 4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

const ClawBase = () => {
  return (
    <group>
      <mesh castShadow position={[0, cableLength / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, cableLength, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
      </mesh>

      <mesh castShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[baseRadius, baseRadius * 1.2, baseRadius, 16]} />
        <meshStandardMaterial color="#555555" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh castShadow position={[0, -baseRadius * 0.4, 0]}>
        <cylinderGeometry args={[baseRadius * 0.8, baseRadius * 0.6, baseRadius * 0.3, 16]} />
        <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

const Claw = () => {
  const groupRef = useRef<Group>(null);
  const targetPosition = useRef(new Vector3());
  const currentVelocity = useRef(new Vector3());
  const visualPosition = useRef({ x: 0, y: 0, z: 0 });

  const { claw, phase } = useGameStore();
  const { position, isOpen, gripStrength } = claw;

  const fingerStrengths = useMemo(
    () => generateFingerStrengths(gripStrength, fingerCount, 0.05),
    [gripStrength]
  );

  useEffect(() => {
    targetPosition.current.set(position.x, position.y, position.z);
  }, [position.x, position.y, position.z]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const current = groupRef.current.position;
    const target = targetPosition.current;

    const dampingFactor = phase === 'dropping' || phase === 'rising' ? 0.15 : 0.1;
    const springStrength = phase === 'dropping' || phase === 'rising' ? 8 : 12;

    const dx = target.x - current.x;
    const dy = target.y - current.y;
    const dz = target.z - current.z;

    currentVelocity.current.x += dx * springStrength * delta;
    currentVelocity.current.y += dy * springStrength * delta;
    currentVelocity.current.z += dz * springStrength * delta;

    currentVelocity.current.multiplyScalar(1 - dampingFactor);

    current.x += currentVelocity.current.x * delta;
    current.y += currentVelocity.current.y * delta;
    current.z += currentVelocity.current.z * delta;

    // 시각적 위치 업데이트 (물리 충돌체용)
    visualPosition.current = { x: current.x, y: current.y, z: current.z };

    const swayAmount = 0.02;
    const swaySpeed = 3;
    if (phase === 'moving') {
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.001 * swaySpeed) * swayAmount;
      groupRef.current.rotation.z = Math.cos(Date.now() * 0.001 * swaySpeed * 0.7) * swayAmount;
    } else {
      groupRef.current.rotation.x *= 0.95;
      groupRef.current.rotation.z *= 0.95;
    }
  });

  return (
    <>
      <ClawCollider />
      <group
        ref={groupRef}
        position={[position.x, position.y, position.z]}
      >
        <ClawBase />

        {Array.from({ length: fingerCount }).map((_, index) => (
          <ClawFinger
            key={index}
            index={index}
            isOpen={isOpen}
            strengthVariance={fingerStrengths[index]}
            clawPosition={position}
          />
        ))}
      </group>
    </>
  );
};

export default Claw;
