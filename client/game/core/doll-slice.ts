import { StateCreator } from 'zustand';
import { GameStore, initialGrabbedDollState, initialPendingReleaseDoll } from './store-types';
import { GRIP_CONFIG, EXIT_ZONE, SCORING } from '../types/game.types';

export const createDollSlice: StateCreator<GameStore, [], [], Partial<GameStore>> = (set, get) => ({
    setGrabbedDoll: (doll, offset, accuracy, isPerfectGrab, rotation) => {
        if (!doll) {
            set({ grabbedDoll: initialGrabbedDollState });
            return;
        }

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
                rotation: rotation || null,
            },
        });
    },

    updateGrabbedDollGrip: () => {
        const { grabbedDoll } = get();
        if (!grabbedDoll.id) return true;

        if (grabbedDoll.accuracy >= 0.90) return true;

        if (grabbedDoll.accuracy >= 0.80) {
            const rareFailChance = 0.13;
            return Math.random() >= rareFailChance;
        }

        const normalized = (grabbedDoll.accuracy - 0.35) / (0.80 - 0.35);
        const failChance = 0.50 - (normalized * 0.30);

        return Math.random() >= failChance;
    },

    releaseDoll: () => {
        set({ grabbedDoll: initialGrabbedDollState });
    },

    setPendingReleaseDoll: (doll) => {
        if (!doll) {
            set({ pendingReleaseDoll: initialPendingReleaseDoll });
            return;
        }
        set({
            pendingReleaseDoll: {
                id: doll.id,
                config: doll,
            },
        });
    },

    checkSuccess: (dollPosition) => {
        return (
            dollPosition.x >= EXIT_ZONE.x.min &&
            dollPosition.x <= EXIT_ZONE.x.max &&
            dollPosition.z >= EXIT_ZONE.z.min &&
            dollPosition.z <= EXIT_ZONE.z.max &&
            dollPosition.y >= EXIT_ZONE.y.min &&
            dollPosition.y <= EXIT_ZONE.y.max
        );
    },

    calculateScore: (doll, wasSuccessful) => {
        if (!wasSuccessful || !doll) return 0;

        const massDifficulty = (doll.mass - 0.5) / 1.5;
        const sizeDifficulty = (doll.size - 0.15) / 0.15;
        const difficulty = (massDifficulty + sizeDifficulty) / 2;

        return Math.round(SCORING.baseScore + difficulty * SCORING.difficultyMultiplier);
    },
});
