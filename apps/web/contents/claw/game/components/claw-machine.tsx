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
  const phase = useGameStore((state) => state.phase); // Added to get phase for isPlaying check

  // Track if the current gesture started on the machine
  const isGestureOnMachine = useRef(false);

  useEffect(() => {
    const domElement = gl.domElement;

    const handlePointerDown = (e: PointerEvent) => {
      const { phase } = useGameStore.getState();
      const isPlaying = phase !== 'idle' && phase !== 'result';

      if (!isPlaying) {
        setIsHoveringMachine(false);
        isGestureOnMachine.current = false;
        return;
      }

      const rect = domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const coords = new Vector2(x, y);

      raycaster.setFromCamera(coords, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

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
        setIsHoveringMachine(true);
        isGestureOnMachine.current = true;
      } else {
        // Stop OrbitControls (which listens to pointerdown) from seeing this event
        e.stopImmediatePropagation();
        setIsHoveringMachine(false);
        isGestureOnMachine.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Only prevent browser scroll/zoom if gesture started on machine
      if (isGestureOnMachine.current && e.cancelable) {
        e.preventDefault();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      const { phase } = useGameStore.getState();
      const isPlaying = phase !== 'idle' && phase !== 'result';
      if (!isPlaying) return;

      // Raycast for wheel event
      const rect = domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const coords = new Vector2(x, y);

      raycaster.setFromCamera(coords, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

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

      if (!hitMachine) {
        // Stop OrbitControls from zooming if wheel is on background
        e.stopImmediatePropagation();
        // Allow browser scroll? Browser wheel scroll is default.
        // If OrbitControls doesn't see it, browser scrolls. Good.
        setIsHoveringMachine(false);
      } else {
        setIsHoveringMachine(true);
      }
    };

    // Use pointerdown (capture) to intercept before OrbitControls/Drei
    domElement.addEventListener('pointerdown', handlePointerDown as any, { capture: true });

    // Add touchmove (non-passive) to prevent browser scrolling when on machine
    domElement.addEventListener('touchmove', handleTouchMove as any, { passive: false });

    // Add wheel capture to block Zoom on background on PC (since we enable OrbitControls globally)
    domElement.addEventListener('wheel', handleWheel as any, { capture: true, passive: false }); // passive false? Wheel blocking usually active. But we WANT stopProp.

    return () => {
      domElement.removeEventListener('pointerdown', handlePointerDown as any, { capture: true } as any);
      domElement.removeEventListener('touchmove', handleTouchMove as any);
      domElement.removeEventListener('wheel', handleWheel as any, { capture: true } as any);
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
        style={{ touchAction: 'manipulation' }} // Allow browser scroll by default
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
