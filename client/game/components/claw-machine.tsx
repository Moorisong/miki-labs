'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Environment } from '@react-three/drei';
import { Vector2 } from 'three';
import Cabinet from './cabinet';
import Claw from './claw';
import Dolls from './dolls';
import GameCamera from './game-camera';
import { createPhysicsConfig } from '../core/physics-world';
import { PHYSICS_CONFIG } from '../types/game.types';
import { useGameStore } from '../core/game-manager';
import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';

const InteractionManager = () => {
  const { gl, camera, scene, raycaster } = useThree();
  const setIsHoveringMachine = useGameStore((state) => state.setIsHoveringMachine);

  useEffect(() => {
    const domElement = gl.domElement;

    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length === 0) return;

      const { phase } = useGameStore.getState();
      const isPlaying = phase !== 'idle' && phase !== 'result';
      if (!isPlaying) return;

      const touch = e.touches[0];
      const rect = domElement.getBoundingClientRect();

      // Normalize touch coordinates for raycasting
      const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      const coords = new Vector2(x, y);

      raycaster.setFromCamera(coords, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      // Check if we hit the machine or background
      let hitMachine = false;
      for (const intersect of intersects) {
        let obj = intersect.object;
        if (obj.name === 'BackgroundHitArea') {
          hitMachine = false;
          break;
        }

        let foundMachine = false;
        while (obj) {
          if (obj.name === 'MachineObject') {
            foundMachine = true;
            break;
          }
          obj = obj.parent as any;
        }

        if (foundMachine) {
          hitMachine = true;
          break;
        }
      }

      if (hitMachine) {
        // Only prevent default if we're hitting the machine area
        // This allows browser scrolling when touching the background
        if (e.cancelable) {
          e.preventDefault();
        }
        setIsHoveringMachine(true);
      } else {
        setIsHoveringMachine(false);
      }
    };

    domElement.addEventListener('touchstart', handleTouch, { passive: false });
    domElement.addEventListener('touchmove', handleTouch, { passive: false });

    return () => {
      domElement.removeEventListener('touchstart', handleTouch);
      domElement.removeEventListener('touchmove', handleTouch);
    };
  }, [gl, camera, scene, raycaster, setIsHoveringMachine]);

  return null;
};

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
  const containerRef = useRef<HTMLDivElement>(null);
  const physicsConfig = createPhysicsConfig();
  const phase = useGameStore((state) => state.phase);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouch = (e: TouchEvent) => {
      const { phase, isHoveringMachine } = useGameStore.getState();
      const isPlaying = phase !== 'idle' && phase !== 'result';

      // 기계 영역 위에 있고 게임 중일 때만 브라우저 기본 스크롤을 막음
      // 그래야 OrbitControls가 핀치 줌 등을 정상적으로 가로챌 수 있음
      if (isPlaying && isHoveringMachine) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    // passive: false로 설정해야 e.preventDefault() 호출이 가능함
    container.addEventListener('touchstart', handleTouch, { passive: false });
    container.addEventListener('touchmove', handleTouch, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouch);
      container.removeEventListener('touchmove', handleTouch);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '80vh',
        margin: '0 auto',
        touchAction: 'manipulation', // Allow basic touch gestures but help with delay
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          // Ensure pointer events are handled correctly
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#1a1a2e']} />
        <InteractionManager />

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
