import { StateCreator } from 'zustand';
import { GameStore, initialClawState, initialVelocity, initialClawPosition } from './store-types';
import { applyGripVariance } from './physics-world';

export const createClawSlice: StateCreator<GameStore, [], [], Partial<GameStore>> = (set, get) => ({
    setClawPosition: (x, y, z) => {
        set((state) => ({
            claw: {
                ...state.claw,
                position: { x, y, z },
            },
        }));
    },

    setClawOpen: (isOpen) => {
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

    setVelocity: (x, y, z) => {
        set({ velocity: { x, y, z } });
    },

    setVisualClawPosition: (x, y, z) => {
        set({ visualClawPosition: { x, y, z } });
    },
});
