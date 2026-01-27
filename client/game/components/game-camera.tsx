'use client';

import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3, PerspectiveCamera } from 'three';
import { CABINET_DIMENSIONS } from '../types/game.types';
import { useGameStore } from '../core/game-manager';

const { width, depth, height } = CABINET_DIMENSIONS;

const CAMERA_CONFIG = {
  // 정면 뷰를 위해 X를 0으로 설정, Z를 늘려 거리 조절
  basePosition: new Vector3(0, height * 0.7, depth * 2.5),
  lookAtBase: new Vector3(0, height * 0.35, 0),
  fov: 50,
  near: 0.1,
  far: 100,
};

const GameCamera = () => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const phase = useGameStore((state) => state.phase);

  const isHoveringMachine = useGameStore((state) => state.isHoveringMachine);

  // 게임이 진행 중일 때는 항상 카메라 컨트롤을 켬.
  // 실제 조작 가능 여부(스크롤 방지)는 InteractionManager의 e.preventDefault()로 결정됨.
  const isPlaying = phase !== 'idle' && phase !== 'result';

  useEffect(() => {
    if (camera instanceof PerspectiveCamera) {
      camera.fov = CAMERA_CONFIG.fov;
      camera.near = CAMERA_CONFIG.near;
      camera.far = CAMERA_CONFIG.far;
      camera.updateProjectionMatrix();
    }

    camera.position.copy(CAMERA_CONFIG.basePosition);
    camera.lookAt(CAMERA_CONFIG.lookAtBase);
  }, [camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={isPlaying && isHoveringMachine}
      target={[0, height * 0.4, 0]}
      minDistance={2}
      maxDistance={10}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.1}
      enablePan={false}
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={0.8}
      zoomSpeed={1.0}
    />
  );
};

export default GameCamera;
