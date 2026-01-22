import { useEffect, useRef } from 'react';
import { useGameStore } from '../core/game-manager';
import { CABINET_DIMENSIONS, MOVEMENT_CONFIG, EXIT_HOLE_POSITION, CLAW_CONFIG } from '../types/game.types';

export const useGameLoop = () => {
    const animationFrameId = useRef<number | null>(null);
    const lastTime = useRef<number>(0);
    const grabTimer = useRef<NodeJS.Timeout | null>(null);
    const gripCheckTimer = useRef<number>(0);

    // Refs for releasing phase
    const releaseTimer = useRef<number>(0);
    const arrivalTimer = useRef<number>(0); // 도착 후 안정화 대기 타이머

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
    const setPhase = useGameStore((state) => state.setPhase);
    const setClawOpen = useGameStore((state) => state.setClawOpen);

    // Dimensions for logic
    const { height, floorHeight } = CABINET_DIMENSIONS;
    const topY = height - 0.5;

    // Calculate bottom limit to prevent claw from clipping into floor
    // Floor (0.1) + Finger Length (0.4) + Extra Margin (0.25)
    // 인형을 잡기 위해 조금 더 내려오되, 바닥과는 아슬아슬하게 닿지 않는 높이
    const bottomY = floorHeight + CLAW_CONFIG.fingerLength + 0.25;

    useEffect(() => {
        // Only run loop if we are in an active automated phase
        // idle도 포함: 집게가 초기 위치로 돌아가야 함
        const activePhases = ['idle', 'dropping', 'grabbing', 'rising', 'returning', 'releasing'];
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
                case 'idle': {
                    // idle 상태에서 집게가 초기 위치로 돌아가도록 함
                    const targetX = 0;
                    const targetZ = 0;
                    const speed = config.clawSpeed * 3 * dt; // 빠르게 복귀

                    const dx = targetX - x;
                    const dz = targetZ - z;
                    const dy = topY - y;
                    const distXZ = Math.sqrt(dx * dx + dz * dz);
                    const distY = Math.abs(dy);

                    // XZ 이동
                    if (distXZ > 0.01) {
                        const dirX = dx / distXZ;
                        const dirZ = dz / distXZ;
                        const moveAmount = Math.min(speed, distXZ);
                        setClawPosition(x + dirX * moveAmount, y, z + dirZ * moveAmount);
                    }
                    // Y 이동 (위로 올라가기)
                    else if (distY > 0.01) {
                        const moveY = Math.min(speed, distY) * Math.sign(dy);
                        setClawPosition(x, y + moveY, z);
                    }
                    // 도착했으면 루프 계속 (다음 게임 시작 대기)
                    break;
                }
                case 'dropping': {
                    // 내려갈 때는 무조건 벌린 상태여야 함 (안전장치)
                    if (!state.claw.isOpen) setClawOpen(true);

                    const speed = config.dropSpeed * 2; // Adjust speed as needed
                    const newY = Math.max(bottomY, y - speed * dt);

                    if (newY !== y) {
                        setClawPosition(x, newY, z);
                    }

                    if (newY <= bottomY) {
                        // [FIX] 시각적 씽크 맞추기: 로직상 도착했더라도, 시각적 줄(스프링)이 따라올 때까지 대기
                        // 화면에서 집게가 인형에 닿기도 전에 잡는 판정이 나오는 것을 방지
                        const visualY = state.visualClawPosition.y;
                        const syncThreshold = 0.2; // 허용 오차 (스프링 장력/오버슈팅 고려)

                        // 시각적 위치가 목표지점 근처(혹은 더 아래)에 도달했는지 확인
                        // (visualY가 더 작아지는 것이 아래로 내려가는 것임)
                        if (visualY <= bottomY + syncThreshold) {
                            grabDoll();
                        }
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

                    // 그립 체크 (0.1초마다)
                    // rising 단계에서만 떨어짐. returning 단계에서는 안전.
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
                    // 인형을 잡고 있는지 확인
                    const hasDoll = !!state.grabbedDoll.id;

                    // 인형이 있으면 구멍으로 천천히, 없으면 시작 위치로 빠르게
                    const targetX = hasDoll ? EXIT_HOLE_POSITION.x : 0;
                    const targetZ = hasDoll ? EXIT_HOLE_POSITION.z : 0;

                    // 구멍으로 갈 때는 MOVEMENT_CONFIG.toHoleSpeed 사용 (일정한 속도)
                    // 빈손으로 돌아갈 때는 clawSpeed 사용 (빠르게)
                    const speed = hasDoll ? MOVEMENT_CONFIG.toHoleSpeed * dt : config.clawSpeed * 2 * dt;

                    const dx = targetX - x;
                    const dz = targetZ - z;
                    const dist = Math.sqrt(dx * dx + dz * dz);

                    // 그립 체크는 rising 단계에서만 수행
                    // returning 단계에서는 구멍까지 안전하게 이동

                    // 도착 판정 거리를 매우 좁게 설정하여 구멍 중앙에 정확히 도착했을 때만 놓도록 함
                    if (dist < 0.01) {
                        // Arrived at target
                        setClawPosition(targetX, y, targetZ);

                        if (hasDoll) {
                            // 시각적 집게(스프링/관성)가 따라올 시간을 주기 위해 잠시 대기
                            arrivalTimer.current += dt;

                            if (arrivalTimer.current > 1.0) {
                                if (state.grabbedDoll.config) {
                                    // 인형이 있으면 구멍에서 놓기
                                    const dollConfig = state.grabbedDoll.config;
                                    useGameStore.getState().setPendingReleaseDoll(dollConfig);
                                    setClawOpen(true);
                                    releaseDoll();

                                    // 즉시 attempt 사용하고 idle로 전환 (스타트 버튼 바로 표시)
                                    useGameStore.getState().useAttempt();
                                    const remaining = useGameStore.getState().attempts;
                                    if (remaining > 0) {
                                        setPhase('idle');
                                    } else {
                                        setPhase('result');
                                    }
                                    // 집게 위치는 별도로 초기화하지 않음 (spring physics가 자연스럽게 처리)
                                }
                            }
                        } else {
                            // 인형이 없으면 대기 없이 바로 시도 종료 (실패)
                            arrivalTimer.current = 0;
                            setClawOpen(true);
                            endAttempt(false);
                        }
                    } else {
                        // 아직 이동 중이면 타이머 초기화
                        arrivalTimer.current = 0;

                        // Move towards target at constant speed
                        // 방향 벡터 정규화 후 일정 속도 적용
                        const dirX = dx / dist;
                        const dirZ = dz / dist;

                        const moveAmount = Math.min(speed, dist); // 목표 지점 넘어가지 않도록

                        const newX = x + dirX * moveAmount;
                        const newZ = z + dirZ * moveAmount;

                        setClawPosition(newX, y, newZ);
                    }
                    break;
                }
                case 'releasing': {
                    // Move claw back to origin (0, topY, 0) immediately while waiting for doll to fall
                    const targetX = 0;
                    const targetZ = 0;
                    const speed = config.clawSpeed * 2 * dt;

                    const dx = targetX - x;
                    const dz = targetZ - z;
                    const dist = Math.sqrt(dx * dx + dz * dz);

                    if (dist > 0.01) {
                        const dirX = dx / dist;
                        const dirZ = dz / dist;
                        const moveAmount = Math.min(speed, dist);
                        setClawPosition(x + dirX * moveAmount, y, z + dirZ * moveAmount);
                    }

                    // Wait for doll to fall into hole (detected by dolls component)
                    // Or timeout for failure
                    releaseTimer.current += dt;

                    // Check if success was already reported (phase changed by reportDollFellInHole)
                    if (state.phase !== 'releasing') {
                        break;
                    }

                    // Timeout: doll didn't fall into hole = failure
                    if (releaseTimer.current > 6.0) {
                        console.log('Timeout! Doll did not fall into hole.');

                        // Clear pending doll
                        useGameStore.getState().setPendingReleaseDoll(null);

                        // End attempt as failure
                        endAttempt(false);
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
    }, [phase, setClawPosition, grabDoll, riseClaw, returnClaw, endAttempt, updateGrabbedDollGrip, releaseDoll, setPhase, setClawOpen, topY, bottomY]);

    // Handle Grabbing timing
    useEffect(() => {
        if (phase === 'grabbing') {
            grabTimer.current = setTimeout(() => {
                riseClaw();
            }, 1200); // 1.2s 대기 (0.8s 판정 후 약간의 여유)
        }

        return () => {
            if (grabTimer.current) {
                clearTimeout(grabTimer.current);
            }
        };
    }, [phase, riseClaw]);
};
