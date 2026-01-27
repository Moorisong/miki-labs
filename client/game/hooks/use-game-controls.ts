'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../core/game-manager';
import { CABINET_DIMENSIONS, DEFAULT_GAME_CONFIG } from '../types/game.types';

interface UseGameControlsOptions {
  enabled?: boolean;
  moveSpeed?: number;
}

interface KeyState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  action: boolean;
}

const useGameControls = ({
  enabled = true,
  moveSpeed = DEFAULT_GAME_CONFIG.clawSpeed,
}: UseGameControlsOptions = {}) => {
  const keyState = useRef<KeyState>({
    up: false,
    down: false,
    left: false,
    right: false,
    action: false,
  });

  const animationFrameId = useRef<number | null>(null);
  const lastTime = useRef<number>(0);

  /* Hook State Selection - Only for rendering/return, not for event handlers */
  const phase = useGameStore((state) => state.phase);

  const { width, depth } = CABINET_DIMENSIONS;
  const halfWidth = width / 2 - 0.3;
  const halfDepth = depth / 2 - 0.3;

  const handleMovement = useCallback((deltaTime: number) => {
    // Use getState() to access current state without invoking re-renders or dependency changes
    const state = useGameStore.getState();
    if (state.phase !== 'moving') return;

    const { up, down, left, right } = keyState.current;

    // Optimization: Skip if no keys are pressed
    if (!up && !down && !left && !right) return;

    const speed = moveSpeed * deltaTime;
    const { claw, setClawPosition } = state;

    let newX = claw.position.x;
    let newZ = claw.position.z;

    if (up) newZ -= speed;
    if (down) newZ += speed;
    if (left) newX -= speed;
    if (right) newX += speed;

    newX = Math.max(-halfWidth, Math.min(halfWidth, newX));
    newZ = Math.max(-halfDepth, Math.min(halfDepth, newZ));

    if (newX !== claw.position.x || newZ !== claw.position.z) {
      setClawPosition(newX, claw.position.y, newZ);
    }
  }, [moveSpeed, halfWidth, halfDepth]); // Stable dependencies only

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // 입력 필드에 포커스가 있을 때는 게임 컨트롤 비활성화
    const activeElement = document.activeElement;
    const isInputFocused = activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement ||
      activeElement?.getAttribute('contenteditable') === 'true';

    if (isInputFocused) return;

    // Access FRESH state directly from store to avoid stale closures
    const { phase, attempts, startGame, dropClaw } = useGameStore.getState();

    // event.code를 사용하여 키보드 레이아웃/언어 설정과 무관하게 처리
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        if (phase === 'moving') event.preventDefault();
        keyState.current.up = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        if (phase === 'moving') event.preventDefault();
        keyState.current.down = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        if (phase === 'moving') event.preventDefault();
        keyState.current.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        if (phase === 'moving') event.preventDefault();
        keyState.current.right = true;
        break;
      case 'Space':
      case 'Enter':
        event.preventDefault();
        keyState.current.action = true;

        if (attempts > 0) {
          if (phase === 'idle' || phase === 'result') {
            // [FIX] 집게가 완전히 위로 올라가서 복귀한 상태인지 확인
            // 집게가 아직 올라가는 중(복귀 중)일 때 시작하면 버그 발생 가능
            // topY = 4.5(height) - 0.5 = 4.0
            const CLAW_READY_Y = 3.9; // 4.0이 목표지만 약간의 오차 허용
            const { claw } = useGameStore.getState();

            if (claw.position.y < CLAW_READY_Y) {
              console.log('Claw is still returning, reset wait...');
              return; // 아직 복귀 안 했으면 무시
            }

            startGame();
          } else if (phase === 'moving') {
            dropClaw();
          }
        }
        break;
    }
  }, [enabled]); // Dependencies reduced to just enabled

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        keyState.current.up = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        keyState.current.down = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        keyState.current.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        keyState.current.right = false;
        break;
      case 'Space':
      case 'Enter':
        keyState.current.action = false;
        break;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    lastTime.current = performance.now();

    const loop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime.current) / 1000;
      lastTime.current = currentTime;

      if (deltaTime < 0.1) {
        handleMovement(deltaTime);
      }

      animationFrameId.current = requestAnimationFrame(loop);
    };

    animationFrameId.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);

      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [enabled, handleKeyDown, handleKeyUp, handleMovement]);

  const setInputState = useCallback((key: keyof KeyState, pressed: boolean) => {
    keyState.current[key] = pressed;
  }, []);

  return {
    keyState,
    phase,
    setInputState,
  };
};

export default useGameControls;
