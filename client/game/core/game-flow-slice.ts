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
        const { phase, attempts, config, visualClawPosition } = get(); // claw 대신 visualClawPosition 사용
        if (attempts <= 0) return;
        if (phase !== 'idle' && phase !== 'result') return;

        // [FIX] 집게가 천장으로 완전히 복귀하지 않았으면 게임 시작 금지
        // 논리적 위치(claw.position)는 idle 전환 시 즉시 리셋되므로,
        // 실제 물리적/시각적 위치(visualClawPosition)를 확인해야 함
        const CLAW_READY_Y = 3.8; // 3.9 -> 3.8 (스프링 출렁임 고려 약간 완화)
        if (visualClawPosition.y < CLAW_READY_Y) {
            return;
        }

        set({
            phase: 'moving',
            claw: {
                ...initialClawState,
                gripStrength: config.baseGripStrength,
            },
            velocity: initialVelocity,
            grabbedDoll: initialGrabbedDollState,
            // visualClawPosition은 초기화하지 않고 현재 위치에서 자연스럽게 이어지게 함
            // 단, 너무 튈 수 있으니 start 시점에는 맞춰주는 게 좋을 수도 있지만,
            // 일단은 부드러운 연결을 위해 유지하거나, 필요 시 여기서 재설정
            visualClawPosition: { ...initialClawPosition },
        });
        get().callbacks.onPhaseChange?.('moving');
    },

    dropClaw: () => {
        const { phase, attempts, soundCallbacks, visualClawPosition } = get();
        if (attempts <= 0 || phase !== 'moving') return;

        // [FIX] 최후의 방어선: moving 상태여도 집게가 아직 복귀 중이면 drop 금지
        // startGame 검증이 뚫렸더라도 여기서 막으면 "하강해버리는" 문제는 막을 수 있음
        const CLAW_READY_Y = 3.8;
        if (visualClawPosition.y < CLAW_READY_Y) return;

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
