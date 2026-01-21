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
  // Dimensions
  const { width, depth, floorHeight } = CABINET_DIMENSIONS;

  // Floor Logic:
  // Cabinet is Width 5 (-2.5 to 2.5), Depth 4 (-2.0 to 2.0).
  // Exit hole is at Front-Right: X[1.5, 2.5], Z[1.0, 2.0].

  // 1. Left Main Section (X: -2.5 to 1.5, Full Z)
  // Width: 4, Depth: 4
  // Center X: -0.5, Center Z: 0
  const leftFloorSize: [number, number, number] = [4, floorHeight, 4];
  const leftFloorPos: [number, number, number] = [-0.5, floorHeight / 2, 0];

  // 2. Right Back Section (X: 1.5 to 2.5, Z: -2.0 to 1.0)
  // Width: 1, Depth: 3
  // Center X: 2.0, Center Z: -0.5 (Midpoint of -2.0 and 1.0)
  const rightFloorSize: [number, number, number] = [1, floorHeight, 3];
  const rightFloorPos: [number, number, number] = [2.0, floorHeight / 2, -0.5];

  // Physics Bodies (Static Boxes)
  useBox(() => ({
    args: leftFloorSize,
    position: leftFloorPos,
    type: 'Static',
    material: { friction: PHYSICS_CONFIG.floorFriction, restitution: 0.2 },
  }));

  useBox(() => ({
    args: rightFloorSize,
    position: rightFloorPos,
    type: 'Static',
    material: { friction: PHYSICS_CONFIG.floorFriction, restitution: 0.2 },
  }));

  // Visuals
  return (
    <group>
      <mesh position={leftFloorPos} receiveShadow>
        <boxGeometry args={leftFloorSize} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>
      <mesh position={rightFloorPos} receiveShadow>
        <boxGeometry args={rightFloorSize} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>

      {/* Decorative Chute/Hole Frame */}
      <mesh position={[2.0, floorHeight / 2, 1.5]}>
        <boxGeometry args={[1, floorHeight * 0.9, 1]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
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
