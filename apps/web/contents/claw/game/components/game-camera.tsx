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
  const hasUserRotated = useGameStore((state) => state.hasUserRotated);
  const setHasUserRotated = useGameStore((state) => state.setHasUserRotated);

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

  const handleValuesChange = () => {
    // 자동 회전이나 초기화가 아닌, 사용자 개입에 의한 회전인지 확인하는 로직이 필요할 수 있으나
    // OrbitControls는 주로 사용자 입력에 반응하므로, 
    // 변화가 발생하고 아직 회전 플래그가 false라면 true로 설정
    // 단, 초기 설정 시에도 호출될 수 있으므로 phase 체크 등 보완 필요
    if (!hasUserRotated && isPlaying) {
      // 아주 미세한 움직임(초기 세팅 등)은 무시하고 싶다면 azimuthAngle 등을 비교해야 하지만
      // 여기서는 일단 컨트롤 이벤트 발생 시 처리
      // 단, OrbitControls의 onChange는 매 프레임 발생할 수 있으므로
      // 실제로는 start 이벤트나 변화량을 감지하는게 좋음.
      // drei OrbitControls는 onStart, onEnd 등을 지원함.
    }
  };

  const handleStartInteraction = () => {
    if (!hasUserRotated && isPlaying) {
      setHasUserRotated(true);
    }
  };

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={isPlaying}
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
      onStart={handleStartInteraction}
    />
  );
};

export default GameCamera;
