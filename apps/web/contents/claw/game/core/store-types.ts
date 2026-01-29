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
} from '../types/game.types';
import type { FailReason } from '@/constants/toast-messages';

export interface GrabbedDollState {
    id: string | null;
    config: DollConfig | null;
    grabOffset: Position3D;
    currentGripStrength: number;
    accuracy: number;
    isPerfectGrab: boolean;
    rotation: { x: number; y: number; z: number } | null;
}

export interface PendingReleaseDoll {
    id: string | null;
    config: DollConfig | null;
}

export interface GameStore extends GameState {
    isHoveringMachine: boolean;
    config: GameConfig;
    callbacks: GameEventCallbacks;
    soundCallbacks: SoundCallbacks;
    grabbedDoll: GrabbedDollState;
    pendingReleaseDoll: PendingReleaseDoll;
    velocity: Position3D;
    visualClawPosition: Position3D;

    // Actions
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
    startGame: () => void;
    dropClaw: () => void;
    grabDoll: () => void;
    riseClaw: () => void;
    returnClaw: () => void;
    endAttempt: (success: boolean, dollConfig?: DollConfig, failReason?: FailReason) => void;
    setGrabbedDoll: (doll: DollConfig | null, offset?: Position3D, accuracy?: number, isPerfectGrab?: boolean, rotation?: { x: number; y: number; z: number }) => void;
    updateGrabbedDollGrip: () => boolean;
    releaseDoll: () => void;
    setPendingReleaseDoll: (doll: DollConfig | null) => void;
    reportDollFellInHole: (doll: DollConfig) => void;
    checkSuccess: (dollPosition: Position3D) => boolean;
    calculateScore: (doll: DollConfig | null, wasSuccessful: boolean) => number;
    setIsHoveringMachine: (isHovering: boolean) => void;

    // Rotation Guide
    hasUserRotated: boolean;
    setHasUserRotated: (hasRotated: boolean) => void;
}

export const initialClawPosition: Position3D = {
    x: 0,
    y: CABINET_DIMENSIONS.height - 0.5,
    z: 0,
};

export const initialClawState: ClawState = {
    position: initialClawPosition,
    isOpen: true,
    gripStrength: DEFAULT_GAME_CONFIG.baseGripStrength,
};

export const initialGrabbedDollState: GrabbedDollState = {
    id: null,
    config: null,
    grabOffset: { x: 0, y: 0, z: 0 },
    currentGripStrength: 1.0,
    accuracy: 0,
    isPerfectGrab: false,
    rotation: null,
};

export const initialPendingReleaseDoll: PendingReleaseDoll = {
    id: null,
    config: null,
};

export const initialVelocity: Position3D = { x: 0, y: 0, z: 0 };

export const initialGameState: GameState = {
    phase: 'idle',
    score: 0,
    attempts: DEFAULT_GAME_CONFIG.maxAttempts,
    claw: initialClawState,
};

export const initialInteractionState = {
    isHoveringMachine: false,
    hasUserRotated: false,
};
