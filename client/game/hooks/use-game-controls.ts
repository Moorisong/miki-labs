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

  const phase = useGameStore((state) => state.phase);
  const startGame = useGameStore((state) => state.startGame);
  const dropClaw = useGameStore((state) => state.dropClaw);

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

    switch (event.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        event.preventDefault();
        keyState.current.up = true;
        break;
      case 's':
      case 'arrowdown':
        event.preventDefault();
        keyState.current.down = true;
        break;
      case 'a':
      case 'arrowleft':
        event.preventDefault();
        keyState.current.left = true;
        break;
      case 'd':
      case 'arrowright':
        event.preventDefault();
        keyState.current.right = true;
        break;
      case ' ':
      case 'enter':
        event.preventDefault();
        keyState.current.action = true;

        if (phase === 'idle' || phase === 'result') {
          startGame();
        } else if (phase === 'moving') {
          dropClaw();
        }
        break;
    }
  }, [enabled, phase, startGame, dropClaw]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        keyState.current.up = false;
        break;
      case 's':
      case 'arrowdown':
        keyState.current.down = false;
        break;
      case 'a':
      case 'arrowleft':
        keyState.current.left = false;
        break;
      case 'd':
      case 'arrowright':
        keyState.current.right = false;
        break;
      case ' ':
      case 'enter':
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
