export type GamePhase =
  | 'idle'
  | 'moving'
  | 'dropping'
  | 'grabbing'
  | 'rising'
  | 'returning'
  | 'releasing'
  | 'result';

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface ClawState {
  position: Position3D;
  isOpen: boolean;
  gripStrength: number;
}

export interface DollConfig {
  id: string;
  position: [number, number, number];
  mass: number;
  friction: number;
  type: 'sphere' | 'box' | 'cylinder';
  color: string;
  size: number;
}

export interface GameState {
  phase: GamePhase;
  score: number;
  attempts: number;
  claw: ClawState;
}

export interface GameConfig {
  maxAttempts: number;
  clawSpeed: number;
  dropSpeed: number;
  riseSpeed: number;
  baseGripStrength: number;
  gripVariance: number;
}

export interface GameEventCallbacks {
  onPhaseChange?: (phase: GamePhase) => void;
  onScoreChange?: (score: number) => void;
  onGameEnd?: (finalScore: number) => void;
  onAttemptUsed?: (remaining: number) => void;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  maxAttempts: 10,
  clawSpeed: 3,
  dropSpeed: 2,
  riseSpeed: 1.5,
  baseGripStrength: 0.7,
  gripVariance: 0.1,
};

export const CABINET_DIMENSIONS = {
  width: 5,
  depth: 4,
  height: 4.5,
  glassThickness: 0.05,
  floorHeight: 0.1,
  exitHoleSize: 1.2,
};

export const CLAW_CONFIG = {
  fingerCount: 3,
  fingerLength: 0.4,
  fingerWidth: 0.08,
  openAngle: Math.PI / 6,
  closedAngle: Math.PI / 12,
  baseRadius: 0.15,
  cableLength: 0.1,
};

export const PHYSICS_CONFIG = {
  gravity: [0, -9.82, 0] as [number, number, number],
  floorFriction: 0.8,
  dollFrictionMin: 0.6,
  dollFrictionMax: 0.95,
  dollMassMin: 0.8,
  dollMassMax: 2.5,
  dollLinearDamping: 0.9,
  dollAngularDamping: 0.95,
};

// Movement bounds for claw (inside cabinet)
export const MOVE_BOUNDS = {
  x: { min: -2.3, max: 2.3 },
  z: { min: -1.8, max: 1.8 },
};

// Movement physics constants
export const MOVEMENT_CONFIG = {
  moveSpeed: 0.08,
  acceleration: 1.0,
  deceleration: 0.95,
  dropSpeed: 0.04,
  riseSpeed: 0.025,
  returnSpeed: 0.05,
  toHoleSpeed: 1.2, // 구멍으로 이동하는 속도 (느리게)
};

// Exit zone for success detection (Front-Right corner)
// Cabinet width 5 (-2.5 to 2.5), depth 4 (-2.0 to 2.0)
// Hole size ~1.2
export const EXIT_ZONE = {
  x: { min: 1.5, max: 2.5 },   // Right side
  y: { min: -1.0, max: 1.0 },  // Vertical range
  z: { min: 1.0, max: 2.0 },   // Front side
};

export const EXIT_HOLE_POSITION = {
  x: 2.0, // Center of exit zone X
  z: 1.5, // Center of exit zone Z
};

// Scoring constants
export const SCORING = {
  baseScore: 100,
  difficultyMultiplier: 50,
};

// Grip physics constants
export const GRIP_CONFIG = {
  baseStrength: 1.0,
  decayRate: 0.998, // Per frame decay during rising (Slower decay)
  releaseThreshold: 0.15, // Below this, doll is dropped (Lower threshold)
  offsetThreshold: 0.3, // Center offset that increases slip chance
  slipChanceBase: 0.02, // Greatly reduced base slip chance
  slipChanceMax: 0.15, // Reduced max slip chance
};

// Sound callback types
export interface SoundCallbacks {
  onClawMove?: () => void;
  onClawDrop?: () => void;
  onGrab?: () => void;
  onSuccess?: () => void;
  onFail?: () => void;
}

// Extended doll config with grab state
export interface GrabbableDoll extends DollConfig {
  isGrabbed: boolean;
  grabOffset: Position3D;
  difficulty: number;
}
