import { StateCreator } from 'zustand';
import { GameStore, initialGameState, initialVelocity, initialClawPosition, initialClawState, initialGrabbedDollState, initialPendingReleaseDoll } from './store-types';

export const createGameFlowSlice: StateCreator<GameStore, [], [], Partial<GameStore>> = (set, get) => ({
    setPhase: (phase) => {
        set({ phase });
        get().callbacks.onPhaseChange?.(phase);
    },

    addScore: (points) => {
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

    setCallbacks: (callbacks) => {
        set({ callbacks });
    },

    setSoundCallbacks: (callbacks) => {
        set({ soundCallbacks: callbacks });
    },

    setConfig: (config) => {
        set((state) => ({
            config: { ...state.config, ...config },
        }));
    },

    startGame: () => {
        const { phase, attempts, config } = get();
        if (attempts <= 0) return;
        if (phase !== 'idle' && phase !== 'result') return;

        set({
            phase: 'moving',
            claw: {
                ...initialClawState,
                gripStrength: config.baseGripStrength,
            },
            velocity: initialVelocity,
            grabbedDoll: initialGrabbedDollState,
            visualClawPosition: { ...initialClawPosition },
        });
        get().callbacks.onPhaseChange?.('moving');
    },

    dropClaw: () => {
        const { phase, attempts, soundCallbacks } = get();
        if (attempts <= 0 || phase !== 'moving') return;

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
        if (get().phase !== 'grabbing') return;
        get().setPhase('rising');
    },

    returnClaw: () => {
        if (get().phase !== 'rising') return;
        get().setPhase('returning');
    },

    endAttempt: (success, dollConfig) => {
        const { grabbedDoll, soundCallbacks, attempts } = get();
        const targetDoll = dollConfig || grabbedDoll.config;

        if (success && targetDoll) {
            const score = get().calculateScore(targetDoll, true);
            get().addScore(score);
            soundCallbacks.onSuccess?.();
        } else {
            soundCallbacks.onFail?.();
        }

        get().releaseDoll();
        get().useAttempt();
        get().setClawOpen(true);

        if (get().attempts > 0) {
            get().setPhase('idle');
            get().setClawPosition(initialClawPosition.x, initialClawPosition.y, initialClawPosition.z);
            set({ velocity: initialVelocity });
        } else {
            get().setPhase('result');
        }
    },

    reportDollFellInHole: (doll) => {
        const { phase, soundCallbacks, pendingReleaseDoll, attempts } = get();
        if (phase === 'result') return;

        if (phase === 'idle') {
            if (!pendingReleaseDoll.id || pendingReleaseDoll.id !== doll.id) return;
        }

        const score = get().calculateScore(doll, true);
        get().addScore(score);
        soundCallbacks.onSuccess?.();

        // Bonus for success
        set((state) => ({ attempts: state.attempts + 1 }));
        set({ pendingReleaseDoll: initialPendingReleaseDoll });

        if (phase === 'idle') {
            if (get().attempts <= 0) get().setPhase('result');
            return;
        }

        get().useAttempt();
        get().setClawOpen(true);

        if (get().attempts > 0) {
            get().setPhase('idle');
            get().setClawPosition(initialClawPosition.x, initialClawPosition.y, initialClawPosition.z);
            set({ velocity: initialVelocity });
        } else {
            get().setPhase('result');
        }
    },
});
