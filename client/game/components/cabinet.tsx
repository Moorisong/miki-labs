'use client';

import { useRef } from 'react';
import { Mesh, DoubleSide } from 'three';
import { useBox, usePlane } from '@react-three/cannon';
import { CABINET_DIMENSIONS, PHYSICS_CONFIG } from '../types/game.types';

const { width, depth, height, glassThickness, floorHeight, exitHoleSize } = CABINET_DIMENSIONS;

interface GlassPanelProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number];
}

const GlassPanel = ({ position, rotation = [0, 0, 0], size }: GlassPanelProps) => {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshPhysicalMaterial
        color="#88ccff"
        transparent
        opacity={0.2}
        roughness={0.1}
        metalness={0.1}
        side={DoubleSide}
        envMapIntensity={1}
      />
    </mesh>
  );
};

const Floor = () => {
  // 물리용 평면 (보이지 않음)
  usePlane<Mesh>(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, floorHeight, 0],
    material: {
      friction: PHYSICS_CONFIG.floorFriction,
      restitution: 0.2,
    },
    type: 'Static',
  }));

  // 시각적 바닥 (물리와 분리)
  return (
    <mesh position={[0, floorHeight / 2, 0]} receiveShadow>
      <boxGeometry args={[width - glassThickness * 2, floorHeight, depth - glassThickness * 2]} />
      <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
    </mesh>
  );
};

const Frame = () => {
  const frameColor = '#333333';
  const frameThickness = 0.08;

  const verticalFrames: [number, number, number][] = [
    [-width / 2, height / 2, -depth / 2],
    [width / 2, height / 2, -depth / 2],
    [-width / 2, height / 2, depth / 2],
    [width / 2, height / 2, depth / 2],
  ];

  const horizontalFramesBottom: { position: [number, number, number]; size: [number, number, number] }[] = [
    { position: [0, 0, -depth / 2], size: [width, frameThickness, frameThickness] },
    { position: [0, 0, depth / 2], size: [width, frameThickness, frameThickness] },
    { position: [-width / 2, 0, 0], size: [frameThickness, frameThickness, depth] },
    { position: [width / 2, 0, 0], size: [frameThickness, frameThickness, depth] },
  ];

  const horizontalFramesTop: { position: [number, number, number]; size: [number, number, number] }[] = [
    { position: [0, height, -depth / 2], size: [width, frameThickness, frameThickness] },
    { position: [0, height, depth / 2], size: [width, frameThickness, frameThickness] },
    { position: [-width / 2, height, 0], size: [frameThickness, frameThickness, depth] },
    { position: [width / 2, height, 0], size: [frameThickness, frameThickness, depth] },
  ];

  return (
    <group>
      {verticalFrames.map((pos, i) => (
        <mesh key={`v-${i}`} position={pos}>
          <boxGeometry args={[frameThickness, height, frameThickness]} />
          <meshStandardMaterial color={frameColor} metalness={0.5} roughness={0.3} />
        </mesh>
      ))}

      {horizontalFramesBottom.map((frame, i) => (
        <mesh key={`hb-${i}`} position={frame.position}>
          <boxGeometry args={frame.size} />
          <meshStandardMaterial color={frameColor} metalness={0.5} roughness={0.3} />
        </mesh>
      ))}

      {horizontalFramesTop.map((frame, i) => (
        <mesh key={`ht-${i}`} position={frame.position}>
          <boxGeometry args={frame.size} />
          <meshStandardMaterial color={frameColor} metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

const Wall = ({ position, rotation, args }: { position: [number, number, number], rotation: [number, number, number], args: [number, number, number] }) => {
  const [ref] = useBox<Mesh>(() => ({
    position,
    rotation,
    args,
    type: 'Static',
  }));

  return (
    <mesh ref={ref}>
      <boxGeometry args={args} />
      <meshBasicMaterial visible={false} />
    </mesh>
  );
};

const Walls = () => {
  const wallThickness = 0.02;

  const walls: { position: [number, number, number]; rotation: [number, number, number]; args: [number, number, number] }[] = [
    { position: [-width / 2, height / 2, 0], rotation: [0, Math.PI / 2, 0], args: [depth, height, wallThickness] },
    { position: [width / 2, height / 2, 0], rotation: [0, Math.PI / 2, 0], args: [depth, height, wallThickness] },
    { position: [0, height / 2, -depth / 2], rotation: [0, 0, 0], args: [width, height, wallThickness] },
    { position: [0, height / 2, depth / 2], rotation: [0, 0, 0], args: [width, height, wallThickness] },
  ];

  return (
    <group>
      {walls.map((wall, i) => (
        <Wall key={`wall-${i}`} {...wall} />
      ))}
    </group>
  );
};

const Cabinet = () => {
  return (
    <group>
      <Floor />
      <Frame />
      <Walls />

      <GlassPanel
        position={[-width / 2, height / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        size={[depth, height]}
      />

      <GlassPanel
        position={[width / 2, height / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        size={[depth, height]}
      />

      <GlassPanel
        position={[0, height / 2, -depth / 2]}
        size={[width, height]}
      />

      <mesh position={[0, height + 0.1, 0]}>
        <boxGeometry args={[width + 0.2, 0.2, depth + 0.2]} />
        <meshStandardMaterial color="#222222" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
};

export default Cabinet;
