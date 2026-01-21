import { create } from 'zustand';
import {
  GamePhase,
  GameState,
  GameConfig,
  GameEventCallbacks,
  ClawState,
  Position3D,
  DollConfig,
  SoundCallbacks,
  DEFAULT_GAME_CONFIG,
  CABINET_DIMENSIONS,
  MOVEMENT_CONFIG,
  EXIT_ZONE,
  SCORING,
  GRIP_CONFIG,
} from '../types/game.types';
import { applyGripVariance } from './physics-world';

// Grabbed doll state
interface GrabbedDollState {
  id: string | null;
  config: DollConfig | null;
  grabOffset: Position3D;
  currentGripStrength: number;
  accuracy: number; // 0 ~ 1, 1이 완벽한 잡기
  isPerfectGrab: boolean; // 완벽하게 잡았는지 여부
}

interface GameStore extends GameState {
  config: GameConfig;
  callbacks: GameEventCallbacks;
  soundCallbacks: SoundCallbacks;

  // Grabbed doll tracking
  grabbedDoll: GrabbedDollState;

  // Velocity tracking for inertia
  velocity: Position3D;

  // Visual claw position (실제 렌더링된 집게 위치 - spring 물리 적용 후)
  visualClawPosition: Position3D;

  // Core state setters
  setPhase: (phase: GamePhase) => void;
  setClawPosition: (x: number, y: number, z: number) => void;
  setClawOpen: (isOpen: boolean) => void;
  updateGripStrength: () => void;
  addScore: (points: number) => void;
  useAttempt: () => void;
  resetGame: () => void;
  setCallbacks: (callbacks: GameEventCallbacks) => void;
  setSoundCallbacks: (callbacks: SoundCallbacks) => void;
  setConfig: (config: Partial<GameConfig>) => void;
  setVelocity: (x: number, y: number, z: number) => void;
  setVisualClawPosition: (x: number, y: number, z: number) => void;

  // Game flow actions
  startGame: () => void;
  dropClaw: () => void;
  grabDoll: () => void;
  riseClaw: () => void;
  returnClaw: () => void;
  endAttempt: (success: boolean) => void;

  // Grab mechanics
  setGrabbedDoll: (doll: DollConfig | null, offset?: Position3D, accuracy?: number, isPerfectGrab?: boolean) => void;
  updateGrabbedDollGrip: () => boolean; // Returns false if doll should be dropped
  releaseDoll: () => void;

  // Success/failure detection
  checkSuccess: (dollPosition: Position3D) => boolean;
  calculateScore: (doll: DollConfig | null, wasSuccessful: boolean) => number;
}

const initialClawPosition: Position3D = {
  x: 0,
  y: CABINET_DIMENSIONS.height - 0.5,
  z: 0,
};

const initialClawState: ClawState = {
  position: initialClawPosition,
  isOpen: true,
  gripStrength: DEFAULT_GAME_CONFIG.baseGripStrength,
};

const initialGrabbedDollState: GrabbedDollState = {
  id: null,
  config: null,
  grabOffset: { x: 0, y: 0, z: 0 },
  currentGripStrength: GRIP_CONFIG.baseStrength,
  accuracy: 0,
  isPerfectGrab: false,
};

const initialVelocity: Position3D = { x: 0, y: 0, z: 0 };

const initialGameState: GameState = {
  phase: 'idle',
  score: 0,
  attempts: DEFAULT_GAME_CONFIG.maxAttempts,
  claw: initialClawState,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialGameState,
  config: DEFAULT_GAME_CONFIG,
  callbacks: {},
  soundCallbacks: {},
  grabbedDoll: initialGrabbedDollState,
  velocity: initialVelocity,
  visualClawPosition: { ...initialClawPosition },

  setPhase: (phase: GamePhase) => {
    set({ phase });
    get().callbacks.onPhaseChange?.(phase);
  },

  setClawPosition: (x: number, y: number, z: number) => {
    set((state) => ({
      claw: {
        ...state.claw,
        position: { x, y, z },
      },
    }));
  },

  setClawOpen: (isOpen: boolean) => {
    set((state) => ({
      claw: {
        ...state.claw,
        isOpen,
      },
    }));
  },

  updateGripStrength: () => {
    const { config } = get();
    const newStrength = applyGripVariance(
      config.baseGripStrength,
      config.gripVariance
    );
    set((state) => ({
      claw: {
        ...state.claw,
        gripStrength: newStrength,
      },
    }));
  },

  addScore: (points: number) => {
    const newScore = get().score + points;
    set({ score: newScore });
    get().callbacks.onScoreChange?.(newScore);
  },

  useAttempt: () => {
    const remaining = get().attempts - 1;
    set({ attempts: remaining });
    get().callbacks.onAttemptUsed?.(remaining);

    if (remaining <= 0) {
      get().callbacks.onGameEnd?.(get().score);
    }
  },

  resetGame: () => {
    set({
      ...initialGameState,
      attempts: get().config.maxAttempts,
    });
  },

  setCallbacks: (callbacks: GameEventCallbacks) => {
    set({ callbacks });
  },

  setSoundCallbacks: (callbacks: SoundCallbacks) => {
    set({ soundCallbacks: callbacks });
  },

  setConfig: (config: Partial<GameConfig>) => {
    set((state) => ({
      config: { ...state.config, ...config },
    }));
  },

  setVelocity: (x: number, y: number, z: number) => {
    set({ velocity: { x, y, z } });
  },

  setVisualClawPosition: (x: number, y: number, z: number) => {
    set({ visualClawPosition: { x, y, z } });
  },

  startGame: () => {
    const { phase, soundCallbacks } = get();
    if (phase !== 'idle' && phase !== 'result') return;

    set({
      phase: 'moving',
      claw: {
        ...initialClawState,
        gripStrength: get().config.baseGripStrength,
      },
      velocity: initialVelocity,
      grabbedDoll: initialGrabbedDollState,
      visualClawPosition: { ...initialClawPosition },
    });
    get().callbacks.onPhaseChange?.('moving');
  },

  dropClaw: () => {
    const { phase, soundCallbacks } = get();
    if (phase !== 'moving') return;

    soundCallbacks.onClawDrop?.();
    get().setPhase('dropping');
  },

  grabDoll: () => {
    const { phase, soundCallbacks } = get();
    if (phase !== 'dropping') return;

    get().updateGripStrength();
    get().setClawOpen(false);
    soundCallbacks.onGrab?.();
    get().setPhase('grabbing');
  },

  riseClaw: () => {
    const { phase } = get();
    if (phase !== 'grabbing') return;

    get().setPhase('rising');
  },

  returnClaw: () => {
    const { phase } = get();
    if (phase !== 'rising') return;

    get().setPhase('returning');
  },

  endAttempt: (success: boolean) => {
    const { grabbedDoll, soundCallbacks } = get();

    if (success && grabbedDoll.config) {
      const score = get().calculateScore(grabbedDoll.config, true);
      get().addScore(score);
      soundCallbacks.onSuccess?.();
    } else {
      soundCallbacks.onFail?.();
    }

    get().releaseDoll();
    get().useAttempt();
    get().setClawOpen(true);

    const remaining = get().attempts;
    if (remaining > 0) {
      get().setPhase('idle');
      get().setClawPosition(
        initialClawPosition.x,
        initialClawPosition.y,
        initialClawPosition.z
      );
      set({ velocity: initialVelocity });
    } else {
      get().setPhase('result');
    }
  },

  // Grab mechanics
  setGrabbedDoll: (doll: DollConfig | null, offset?: Position3D, accuracy?: number, isPerfectGrab?: boolean) => {
    if (!doll) {
      set({ grabbedDoll: initialGrabbedDollState });
      return;
    }

    // 정확도에 따라 초기 그립 강도 조정
    // 완벽한 잡기면 최대 강도, 아니면 정확도에 비례
    const initialGripStrength = isPerfectGrab
      ? GRIP_CONFIG.baseStrength
      : GRIP_CONFIG.baseStrength * (0.5 + (accuracy || 0) * 0.5);

    set({
      grabbedDoll: {
        id: doll.id,
        config: doll,
        grabOffset: offset || { x: 0, y: 0, z: 0 },
        currentGripStrength: initialGripStrength,
        accuracy: accuracy || 0,
        isPerfectGrab: isPerfectGrab || false,
      },
    });
  },

  updateGrabbedDollGrip: () => {
    const { grabbedDoll, phase } = get();

    if (!grabbedDoll.id) return true;

    // 완벽하게 잡은 경우 (90% 이상) 절대 떨어지지 않음
    if (grabbedDoll.isPerfectGrab) {
      return true;
    }

    // 여기서부터는 40-89% 정확도의 불완전한 잡기
    let newGripStrength = grabbedDoll.currentGripStrength;

    if (phase === 'rising' || phase === 'returning') {
      // 정확도가 낮을수록 빠르게 감소
      // accuracy 0.35 -> decayRate 약 0.65 (매우 빠른 감소)
      // accuracy 0.79 -> decayRate 약 0.92 (느린 감소)
      const normalizedAccuracy = Math.max(0, Math.min(1, (grabbedDoll.accuracy - 0.35) / 0.45)); // 0.35~0.80를 0~1로 매핑, 클램프
      const baseDecay = 0.65; // 최저 감소율 (35% 정확도) - 매우 공격적
      const maxDecay = 0.92; // 최고 감소율 (79% 정확도)
      const adjustedDecayRate = baseDecay + normalizedAccuracy * (maxDecay - baseDecay);

      newGripStrength *= adjustedDecayRate;

      // 미끄러짐 확률: 정확도가 낮을수록 높음
      // accuracy 0.35 -> slipChance 약 50%
      // accuracy 0.55 -> slipChance 약 35%
      // accuracy 0.79 -> slipChance 약 15%
      const slipChance = (1 - normalizedAccuracy) * 0.4 + 0.1;

      // returning 단계에서 추가 미끄러짐
      const totalSlipChance = slipChance + (phase === 'returning' ? 0.15 : 0);

      if (Math.random() < totalSlipChance) {
        // 미끄러지면 그립 크게 감소
        const slipAmount = 0.3 + normalizedAccuracy * 0.3; // 0.3~0.6
        newGripStrength *= slipAmount;
        console.log(`[Slip] Grip reduced to ${(newGripStrength * 100).toFixed(1)}%`);
      }

      set({
        grabbedDoll: {
          ...grabbedDoll,
          currentGripStrength: newGripStrength,
        },
      });

      // 그립이 임계값 이하면 떨어뜨림
      if (newGripStrength < GRIP_CONFIG.releaseThreshold) {
        console.log(`[Drop] Doll dropped! Final grip: ${(newGripStrength * 100).toFixed(1)}%`);
        return false;
      }
    }

    return true;
  },

  releaseDoll: () => {
    set({ grabbedDoll: initialGrabbedDollState });
  },

  // Success/failure detection
  checkSuccess: (dollPosition: Position3D) => {
    return (
      dollPosition.x >= EXIT_ZONE.x.min &&
      dollPosition.x <= EXIT_ZONE.x.max &&
      dollPosition.z >= EXIT_ZONE.z.min &&
      dollPosition.z <= EXIT_ZONE.z.max &&
      dollPosition.y >= EXIT_ZONE.y.min &&
      dollPosition.y <= EXIT_ZONE.y.max
    );
  },

  calculateScore: (doll: DollConfig | null, wasSuccessful: boolean) => {
    if (!wasSuccessful || !doll) return 0;

    // Calculate difficulty based on mass and size (heavier/larger = harder)
    const massDifficulty = (doll.mass - 0.5) / 1.5; // Normalize to 0-1
    const sizeDifficulty = (doll.size - 0.15) / 0.15; // Normalize to 0-1
    const difficulty = (massDifficulty + sizeDifficulty) / 2;

    return Math.round(SCORING.baseScore + difficulty * SCORING.difficultyMultiplier);
  },
}));

export type { GameStore };
