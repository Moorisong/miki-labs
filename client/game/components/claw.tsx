'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Vector3, QuadraticBezierCurve3, BufferGeometry, Line as ThreeLine, LineBasicMaterial, Euler } from 'three';
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
  const position = useGameStore((state) => state.claw.position);
  const isOpen = useGameStore((state) => state.claw.isOpen);
  const phase = useGameStore((state) => state.phase);

  // 집게가 열렸을 때만 작은 충돌체. 
  // 잡는 순간 인형을 밀어내지 않도록 충분히 작게 유지하고 위치를 위로.
  const colliderSize = isOpen ? 0.05 : 0.01;

  const [ref, api] = useSphere<Mesh>(() => ({
    type: 'Kinematic',
    args: [colliderSize],
    position: [position.x, position.y + 0.2, position.z], // -0.3 -> +0.2 위로 올림
    material: {
      friction: 0.1,
      restitution: 0.05,
    },
    collisionResponse: true,
  }));

  // 집게 위치에 따라 충돌체 위치 업데이트
  useFrame(() => {
    // 인형을 잡고 이동 중일 때는 충돌 비활성화
    // 또한 구멍 구역(x > 1.0)에 있을 때도 충돌 비활성화 (떨어지는 인형을 쳐내지 않도록)
    const isInHoleZone = position.x > 1.0;
    const disableCollision = phase === 'rising' || phase === 'returning' || phase === 'releasing' || isInHoleZone;
    api.collisionResponse.set(!disableCollision);

    if (disableCollision) {
      // 충돌체를 멀리 치워버림 (벽 충돌 방지 최후의 수단)
      api.position.set(0, 1000, 0);
    } else {
      // 정상 위치 업데이트
      api.position.set(position.x, position.y + 0.2, position.z);
    }
  });

  return (
    <mesh ref={ref} visible={false}>
      {/* 충돌체를 더 작게 만들어서 인형들 사이를 파고들기 쉽게 함 */}
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
};

// 잡힌 인형을 렌더링하고 미세한 떨림(Micro-Slipping) 효과를 주는 컴포넌트
const GrabbedDollRenderer = () => {
  const grabbedDoll = useGameStore((state) => state.grabbedDoll);
  const groupRef = useRef<Group>(null);
  const noiseOffset = useRef(Math.random() * 100);

  // 저장된 회전값
  const rotation = grabbedDoll.rotation || { x: 0, y: 0, z: 0 };
  const config = grabbedDoll.config ? (grabbedDoll.config as any as CuteDollConfig) : null;

  // startDollY: 인형이 서 있을 때의 기준 Y 위치 (발바닥이 이 위치에 옴)
  // [New Rule] 손가락 길이의 정확히 중간 아래 지점에 위치시킴
  // fingerLength(0.4) + 여유분을 고려하여, 손가락 끝보다 살짝 위, 본체보다 아래인 '명당' 위치 자동 계산
  const startDollY = -(fingerLength * 0.85);

  // 회전 보정된 Y 위치 계산
  const basePosY = useMemo(() => {
    if (!config) return startDollY;

    // 인형의 기하학적 중심에 접근 (대략 높이의 절반)
    const centerHeight = config.size * 0.5;
    const localCenter = new Vector3(0, centerHeight, 0);

    // 저장된 회전값 적용하여 중심점이 어떻게 이동했는지 계산
    localCenter.applyEuler(new Euler(rotation.x, rotation.y, rotation.z));

    // 목표: "회전된 인형의 중심"이 "집게의 잡는 지점"에 와야 함.
    let targetCenterY = startDollY + config.size * 0.6;

    // 최대 높이 제한: 집게 본체를 뚫지 않도록 0.03 이하로 제한
    if (targetCenterY > 0.03) {
      targetCenterY = 0.03;
    }

    // 목표 중심점 높이를 맞추기 위해 인형의 발바닥(Origin)을 어디에 둬야 하는가?
    // OriginY + RotatedCenterY = TargetCenterY
    // OriginY = TargetCenterY - RotatedCenterY
    return targetCenterY - localCenter.y;
  }, [config, rotation.x, rotation.y, rotation.z]);

  useFrame((state) => {
    if (!groupRef.current || !config) return;

    // Micro-Slipping: 시간 기반 노이즈로 미세하게 떨림
    const time = state.clock.elapsedTime;
    const shakeAmount = 0.002;

    const nx = Math.sin(time * 20 + noiseOffset.current) * shakeAmount;
    const ny = Math.cos(time * 25 + noiseOffset.current) * shakeAmount;
    const nz = Math.sin(time * 15 + noiseOffset.current) * shakeAmount;

    // 보정된 Y 위치에 노이즈 추가하여 설정 + 오프셋 적용
    groupRef.current.position.set(
      nx + grabbedDoll.grabOffset.x,
      basePosY + ny + grabbedDoll.grabOffset.y,
      nz + grabbedDoll.grabOffset.z
    );

    // 회전에도 약간의 노이즈 추가
    groupRef.current.rotation.set(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02
    );
  });

  if (!config) return null;

  const DollComponent =
    config.cuteType === 'bunny' ? BunnyDoll :
      config.cuteType === 'bear' ? BearDoll :
        config.cuteType === 'cat' ? CatDoll :
          config.cuteType === 'hamster' ? HamsterDoll :
            config.cuteType === 'dog' ? DogDoll : null;

  if (!DollComponent) return null;

  return (
    // 초기 위치는 여기서 설정하나 useFrame이 덮어씀
    <group position={[grabbedDoll.grabOffset.x, basePosY + grabbedDoll.grabOffset.y, grabbedDoll.grabOffset.z]}>
      {/* 미세 떨림 적용 그룹 */}
      <group ref={groupRef}>
        {/* 원래 회전값 적용 그룹 */}
        <group rotation={[rotation.x, rotation.y, rotation.z]}>
          <DollComponent config={config} />
        </group>
      </group>
    </group>
  );
};

interface ClawFingerProps {
  index: number;
  isOpen: boolean;
  strengthVariance: number;
  clawPosition: { x: number; y: number; z: number };
}

const ClawFinger = ({ index, isOpen, strengthVariance, clawPosition }: ClawFingerProps) => {
  // ... (implementation same as before)
  const groupRef = useRef<Group>(null);
  const angleOffset = (index / fingerCount) * Math.PI * 2;
  const targetAngle = isOpen ? openAngle : closedAngle;
  const currentAngleRef = useRef(openAngle);

  // 현재 게임 단계 가져오기
  const phase = useGameStore((state) => state.phase);

  // 손가락 끝 위치에 물리 충돌체 (작게, 부드럽게)
  const [fingerRef, fingerApi] = useSphere<Mesh>(() => ({
    type: 'Kinematic',
    args: [fingerWidth * 0.5],
    position: [0, 0, 0],
    material: {
      friction: 0.2,
      restitution: 0.02, // 거의 튕기지 않음
    },
    collisionResponse: true, // 초기값
  }));

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // 인형을 잡고 이동 중일 때는 손가락 충돌 비활성화 (벽과 충돌 방지)
    // 또한 구멍 구역(x > 1.0)에 있을 때도 충돌 비활성화 (떨어지는 인형을 쳐내지 않도록)
    const isInHoleZone = clawPosition.x > 1.0;
    const disableCollision = phase === 'rising' || phase === 'returning' || phase === 'releasing' || isInHoleZone;
    fingerApi.collisionResponse.set(!disableCollision);

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

    if (disableCollision) {
      // 충돌체를 멀리 치워버림
      fingerApi.position.set(0, 1000, 0);
    } else {
      fingerApi.position.set(worldX, worldY, worldZ);
    }
  });

  return (
    <group rotation={[0, angleOffset, 0]}>
      <group ref={groupRef} position={[baseRadius * 0.8, -baseRadius * 0.5, 0]}>
        <mesh /* castShadow */ position={[fingerWidth / 2, -fingerLength / 2, 0]}>
          <boxGeometry args={[fingerWidth, fingerLength, fingerWidth]} />
          <meshStandardMaterial
            color="#888888"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        <mesh
          /* castShadow */
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
      <mesh /* castShadow */ position={[0, cableLength / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, cableLength, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
      </mesh>

      <mesh /* castShadow */ position={[0, 0, 0]}>
        <cylinderGeometry args={[baseRadius, baseRadius * 1.2, baseRadius, 16]} />
        <meshStandardMaterial color="#555555" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh /* castShadow */ position={[0, -baseRadius * 0.4, 0]}>
        <cylinderGeometry args={[baseRadius * 0.8, baseRadius * 0.6, baseRadius * 0.3, 16]} />
        <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};


// Import doll components
import { BunnyDoll, BearDoll, CatDoll, HamsterDoll, DogDoll, CuteDollConfig } from './dolls';
import { DollConfig } from '../types/game.types';

// ... (ClawCollider and ClawFinger components remain unchanged)

const Claw = () => {
  const groupRef = useRef<Group>(null);
  const targetPosition = useRef(new Vector3());
  const currentVelocity = useRef(new Vector3());

  // Cable & Slack refs (Added via fix)
  const lineRef = useRef<ThreeLine>(null);
  const slackRef = useRef(0);
  const slackVelocityRef = useRef(0);
  const cablePoints = useMemo(() => new Array(20).fill(0).map(() => new Vector3()), []);
  const cableGeometry = useMemo(() => new BufferGeometry().setFromPoints(cablePoints), [cablePoints]);
  const prevWorldY = useRef(0);

  // Swing physics refs
  const prevVelocity = useRef(new Vector3());
  const angularVelocity = useRef(new Vector3()); // x, y, z rotational velocity
  const currentRotation = useRef(new Vector3()); // x, y, z rotation angle

  // Use selectors to avoid re-rendering on every visualClawPosition update
  const clawPosition = useGameStore((state) => state.claw.position);
  const isOpen = useGameStore((state) => state.claw.isOpen);
  const gripStrength = useGameStore((state) => state.claw.gripStrength);
  const phase = useGameStore((state) => state.phase);
  const setVisualClawPosition = useGameStore((state) => state.setVisualClawPosition);

  // 잡힌 인형 정보 가져오기
  const grabbedDoll = useGameStore((state) => state.grabbedDoll);

  const fingerStrengths = useMemo(
    () => generateFingerStrengths(gripStrength, fingerCount, 0.05),
    [gripStrength]
  );

  useEffect(() => {
    targetPosition.current.set(clawPosition.x, clawPosition.y, clawPosition.z);
  }, [clawPosition.x, clawPosition.y, clawPosition.z]);

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

    // 시각적 위치를 store에 업데이트 (그랩 판정용)
    setVisualClawPosition(current.x, current.y, current.z);

    // --- SWING PHYSICS (관성 반동) ---
    if (delta > 0.001) {
      // 가속도 계산 (m/s^2)
      const accelX = (currentVelocity.current.x - prevVelocity.current.x) / delta;
      const accelZ = (currentVelocity.current.z - prevVelocity.current.z) / delta;

      // 물리 상수
      const SWING_POWER = 0.5;      // 흔들림 강도 (관성 계수)
      const RESTORING_FORCE = 8.0;  // 복원력 (중력) - 클수록 빨리 제자리로 돌아옴
      const DAMPING = 2.0;          // 공기 저항 (감쇠) - 클수록 빨리 멈춤

      // 토크 계산
      // 오른쪽(+X)으로 가속 -> 하단이 왼쪽으로 쏠림 -> Z축 양의 회전 (\ 기울기)
      // 앞(+Z)으로 가속 -> 하단이 뒤로 쏠림 -> X축 음의 회전 (뒤로 젖혀짐)

      // 경험적 튜닝: 부호가 반대일 수도 있으니 테스트하며 조정
      // +AccelX -> +Z Rotation (Left tilt) seems correct for inertia
      const torqueZ = accelX * SWING_POWER;
      const torqueX = -accelZ * SWING_POWER;

      // 각가속도 = 토크 - 복원력 - 댐핑
      const angularAccelZ = torqueZ - (currentRotation.current.z * RESTORING_FORCE) - (angularVelocity.current.z * DAMPING);
      const angularAccelX = torqueX - (currentRotation.current.x * RESTORING_FORCE) - (angularVelocity.current.x * DAMPING);

      // 각속도 적분
      angularVelocity.current.z += angularAccelZ * delta;
      angularVelocity.current.x += angularAccelX * delta;

      // Twist (Y축 회전) - 이동 방향이 바뀌거나 멈출 때 줄이 꼬이는 효과
      // X 가속도와 Z 속도의 상호작용으로 비틀림 발생
      const twistTorque = (accelX * currentVelocity.current.z - accelZ * currentVelocity.current.x) * 0.8;

      // Weight Distribution (무게 중심)
      // 잡은 인형이 있으면 중심축이 이동하여 기울어짐
      let weightTorqueX = 0;
      let weightTorqueZ = 0;

      if (grabbedDoll.id && grabbedDoll.rotation) { // rotation이 있다는 건 잡혀있다는 뜻
        const offset = grabbedDoll.grabOffset;
        // 오프셋에 비례해 토크 발생 (무거울수록 많이 기울어짐 - mass는 DollConfig에 있음)
        // 여기서는 간단히 오프셋만 고려
        const WEIGHT_POWER = 3.0;
        weightTorqueZ = offset.x * WEIGHT_POWER; // X축으로 벗어나면 Z축 회전(기울기)
        weightTorqueX = -offset.z * WEIGHT_POWER;
      }

      // 복원력을 높이고(1.5), 댐핑을 크게(2.5) 하여 묵직한 느낌 부여
      const angularAccelY = twistTorque - (currentRotation.current.y * 1.5) - (angularVelocity.current.y * 2.5);
      angularVelocity.current.y += angularAccelY * delta;

      // 무게 중심 토크 적용
      angularVelocity.current.x += weightTorqueX * delta;
      angularVelocity.current.z += weightTorqueZ * delta;

      // Slack Physics (줄 느슨해짐)
      const currentY = groupRef.current.position.y;
      const vy = (currentY - prevWorldY.current) / delta;
      // 위로 가속하거나(줄이 밀림), 갑자기 멈출 때 slack 발생
      const accelY = (vy - currentVelocity.current.y) / delta; // 근사치

      // 줄이 느슨해지는 힘: 위로 가속할 때
      if (accelY > 5.0) {
        slackVelocityRef.current += accelY * 0.02;
      }

      // Slack Spring
      const tension = -slackRef.current * 10; // 복원력
      const slackDamping = -slackVelocityRef.current * 2;
      slackVelocityRef.current += (tension + slackDamping) * delta;
      slackRef.current += slackVelocityRef.current * delta;
      slackRef.current = Math.max(0, slackRef.current); // slack은 음수(당겨짐)가 될 수 없음

      // Update Cable Geometry
      if (lineRef.current) {
        // Update cable start position to follow the claw (gantry system effect)
        const start = new Vector3(groupRef.current.position.x, 4.5, groupRef.current.position.z);
        const end = groupRef.current.position.clone().add(new Vector3(0, cableLength, 0)); // 집게 상단
        const mid = start.clone().add(end).multiplyScalar(0.5);

        // Slack 적용: 중간점이 휘어짐
        mid.x += Math.sin(Date.now() * 0.005) * slackRef.current;
        mid.z += Math.cos(Date.now() * 0.005) * slackRef.current;

        const curve = new QuadraticBezierCurve3(start, mid, end);
        const points = curve.getPoints(19); // 20 points
        lineRef.current.geometry.setFromPoints(points);
      }

      prevWorldY.current = currentY;

      // 각도 적분
      currentRotation.current.z += angularVelocity.current.z * delta;
      currentRotation.current.x += angularVelocity.current.x * delta;
      currentRotation.current.y += angularVelocity.current.y * delta;

      // 실제 객체에 적용
      groupRef.current.rotation.set(
        currentRotation.current.x,
        currentRotation.current.y,
        currentRotation.current.z
      );
    }

    // 현재 속도를 다음 프레임의 이전 속도로 저장
    prevVelocity.current.copy(currentVelocity.current);
  });

  // renderGrabbedDoll 함수 제거됨 (GrabbedDollRenderer 컴포넌트로 대체)

  return (
    <>
      <ClawCollider />
      <group
        ref={groupRef}
      // Position is controlled by spring physics in useFrame, do not bind prop
      >
        <ClawBase />

        {Array.from({ length: fingerCount }).map((_, index) => (
          <ClawFinger
            key={index}
            index={index}
            isOpen={isOpen}
            strengthVariance={fingerStrengths[index]}
            clawPosition={clawPosition}
          />
        ))}

        <GrabbedDollRenderer />
      </group>

      {/* Slack Cable Line */}
      <mesh visible={false}> {/* Dummy mesh to keep geometry alive if needed, but line uses its own geometry */} </mesh>
      <primitive object={new ThreeLine(cableGeometry, new LineBasicMaterial({ color: '#333333', linewidth: 2 }))} ref={lineRef} />
    </>
  );
};

export default Claw;

