import { create } from 'zustand';
import { DEFAULT_GAME_CONFIG } from '../types/game.types';
import { GameStore, initialGameState, initialInteractionState, initialGrabbedDollState, initialPendingReleaseDoll, initialVelocity, initialClawPosition } from './store-types';
import { createClawSlice } from './claw-slice';
import { createDollSlice } from './doll-slice';
import { createGameFlowSlice } from './game-flow-slice';

export const useGameStore = create<GameStore>((set, get, api) => ({
  ...initialGameState,
  ...initialInteractionState,
  config: DEFAULT_GAME_CONFIG,
  callbacks: {},
  soundCallbacks: {},
  grabbedDoll: initialGrabbedDollState,
  pendingReleaseDoll: initialPendingReleaseDoll,
  velocity: initialVelocity,
  visualClawPosition: { ...initialClawPosition },

  // Integrate slices
  ...createClawSlice(set, get, api) as any,
  ...createDollSlice(set, get, api) as any,
  ...createGameFlowSlice(set, get, api) as any,
}));

export type { GameStore };
