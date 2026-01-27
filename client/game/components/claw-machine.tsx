'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Environment } from '@react-three/drei';
import Cabinet from './cabinet';
import Claw from './claw';
import Dolls from './dolls';
import GameCamera from './game-camera';
import { createPhysicsConfig } from '../core/physics-world';
import { PHYSICS_CONFIG } from '../types/game.types';

const Lights = () => {
  return (
    <>
      <ambientLight intensity={0.4} />

      <directionalLight
        position={[0.5, 12, 0.5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      <pointLight
        position={[0, 3.5, 0]}
        intensity={0.5}
        color="#fff5e0"
        distance={5}
        decay={2}
      />

      <spotLight
        position={[0, 5, 3]}
        angle={Math.PI / 6}
        penumbra={0.5}
        intensity={0.3}
        color="#ffe4c4"
      />
    </>
  );
};

interface ClawMachineProps {
  dollCount?: number;
}

const ClawMachine = ({
  dollCount = 12,
}: ClawMachineProps) => {
  const physicsConfig = createPhysicsConfig();

  return (
    <div style={{
      width: '100%',
      height: '80vh',
      margin: '0 auto',
      touchAction: 'none',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#1a1a2e']} />

        <Suspense fallback={null}>
          <Physics
            gravity={PHYSICS_CONFIG.gravity}
            defaultContactMaterial={{
              friction: physicsConfig.defaultContactMaterial.friction,
              restitution: physicsConfig.defaultContactMaterial.restitution,
            }}
            allowSleep={physicsConfig.allowSleep}
            iterations={physicsConfig.iterations}
          >
            <Lights />
            <Cabinet />
            <Dolls count={dollCount} />
            <Claw />
          </Physics>

          <GameCamera />
        </Suspense>

        <Suspense fallback={null}>
          <Environment preset="warehouse" />
        </Suspense>
      </Canvas>

    </div>
  );
};

export default ClawMachine;
