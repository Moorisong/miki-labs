import { useEffect, useRef } from 'react';
import { useGameStore } from '../core/game-manager';
import { CABINET_DIMENSIONS, MOVEMENT_CONFIG } from '../types/game.types';

export const useGameLoop = () => {
    const animationFrameId = useRef<number | null>(null);
    const lastTime = useRef<number>(0);
    const grabTimer = useRef<NodeJS.Timeout | null>(null);
    const gripCheckTimer = useRef<number>(0);

    // Use individual selectors to avoid full re-renders, or just access via getState in loop
    const phase = useGameStore((state) => state.phase);

    // We need these actions
    const grabDoll = useGameStore((state) => state.grabDoll);
    const riseClaw = useGameStore((state) => state.riseClaw);
    const returnClaw = useGameStore((state) => state.returnClaw);
    const endAttempt = useGameStore((state) => state.endAttempt);
    const setClawPosition = useGameStore((state) => state.setClawPosition);
    const updateGrabbedDollGrip = useGameStore((state) => state.updateGrabbedDollGrip);
    const releaseDoll = useGameStore((state) => state.releaseDoll);

    // Dimensions for logic
    const { height, floorHeight } = CABINET_DIMENSIONS;
    const topY = height - 0.5;
    const bottomY = floorHeight + 0.5; // Approximate claw height offset

    useEffect(() => {
        // Only run loop if we are in an active automated phase
        const activePhases = ['dropping', 'grabbing', 'rising', 'returning'];
        if (!activePhases.includes(phase)) {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
            }
            return;
        }

        lastTime.current = performance.now();

        const loop = (currentTime: number) => {
            const deltaTime = (currentTime - lastTime.current) / 1000;
            lastTime.current = currentTime;

            // Logic depends on phase
            // Access direct state to facilitate movement updates without re-triggering this effect
            const state = useGameStore.getState();
            const { claw, config } = state;
            const { x, y, z } = claw.position;

            // Cap delta time to prevent jumping on lag spikes
            const dt = Math.min(deltaTime, 0.1);

            switch (state.phase) {
                case 'dropping': {
                    const speed = config.dropSpeed * 2; // Adjust speed as needed
                    const newY = Math.max(bottomY, y - speed * dt);

                    if (newY !== y) {
                        setClawPosition(x, newY, z);
                    }

                    if (newY <= bottomY) {
                        // Reached bottom
                        grabDoll();
                    }
                    break;
                }
                case 'grabbing': {
                    // This phase is handled by a timer effect mostly, but we define it here for completeness
                    // Logic is handled in the separate useEffect below to avoid running multiple times
                    break;
                }
                case 'rising': {
                    const speed = config.riseSpeed * 2;
                    const newY = Math.min(topY, y + speed * dt);

                    if (newY !== y) {
                        setClawPosition(x, newY, z);
                    }

                    // 그립 체크 - 일정 간격으로 인형이 떨어질지 확인
                    gripCheckTimer.current += dt;
                    if (gripCheckTimer.current > 0.1 && state.grabbedDoll.id) {
                        gripCheckTimer.current = 0;
                        const stillHolding = updateGrabbedDollGrip();
                        if (!stillHolding) {
                            // 인형 떨어뜨림!
                            releaseDoll();
                        }
                    }

                    if (newY >= topY) {
                        // Reached top
                        returnClaw();
                    }
                    break;
                }
                case 'returning': {
                    const speed = config.clawSpeed * dt;

                    // Move towards (0, y, 0)
                    let newX = x;
                    let newZ = z;

                    const dist = Math.sqrt(x * x + z * z);

                    // 그립 체크 - 이동 중에도 인형이 떨어질 수 있음
                    gripCheckTimer.current += dt;
                    if (gripCheckTimer.current > 0.15 && state.grabbedDoll.id) {
                        gripCheckTimer.current = 0;
                        const stillHolding = updateGrabbedDollGrip();
                        if (!stillHolding) {
                            // 인형 떨어뜨림!
                            releaseDoll();
                        }
                    }

                    if (dist < 0.05) {
                        // Arrived
                        setClawPosition(0, y, 0);
                        endAttempt(!!state.grabbedDoll.id);
                    } else {
                        // Simple lerp or move towards 0
                        const moveRatio = Math.min(speed / dist, 1);
                        newX = x - x * moveRatio;
                        newZ = z - z * moveRatio;
                        setClawPosition(newX, y, newZ);
                    }
                    break;
                }
            }

            animationFrameId.current = requestAnimationFrame(loop);
        };

        animationFrameId.current = requestAnimationFrame(loop);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [phase, setClawPosition, grabDoll, riseClaw, returnClaw, endAttempt, updateGrabbedDollGrip, releaseDoll, topY, bottomY]);

    // Handle Grabbing timing
    useEffect(() => {
        if (phase === 'grabbing') {
            grabTimer.current = setTimeout(() => {
                riseClaw();
            }, 1000); // Wait 1 second before rising
        }

        return () => {
            if (grabTimer.current) {
                clearTimeout(grabTimer.current);
            }
        };
    }, [phase, riseClaw]);
};
