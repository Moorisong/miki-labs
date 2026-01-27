import { PHYSICS_CONFIG } from '../types/game.types';
import { WORLD_STEP_CONFIG } from '../constants/collision';

export interface PhysicsWorldConfig {
  gravity: [number, number, number];
  defaultContactMaterial: {
    friction: number;
    restitution: number;
  };
  allowSleep: boolean;
  iterations: number;
  stepSize: number;
  maxSubSteps: number;
}

export const createPhysicsConfig = (): PhysicsWorldConfig => {
  return {
    gravity: PHYSICS_CONFIG.gravity,
    defaultContactMaterial: {
      friction: PHYSICS_CONFIG.floorFriction,
      restitution: 0.3,
    },
    allowSleep: true,
    iterations: 10,
    stepSize: WORLD_STEP_CONFIG.fixedTimeStep,
    maxSubSteps: WORLD_STEP_CONFIG.maxSubSteps,
  };
};

export const generateRandomFriction = (): number => {
  const { dollFrictionMin, dollFrictionMax } = PHYSICS_CONFIG;
  return dollFrictionMin + Math.random() * (dollFrictionMax - dollFrictionMin);
};

export const generateRandomMass = (): number => {
  const { dollMassMin, dollMassMax } = PHYSICS_CONFIG;
  return dollMassMin + Math.random() * (dollMassMax - dollMassMin);
};

export const applyGripVariance = (baseStrength: number, variance: number): number => {
  const randomFactor = 1 + (Math.random() * 2 - 1) * variance;
  return baseStrength * randomFactor;
};

export const generateFingerStrengths = (
  baseStrength: number,
  fingerCount: number,
  variance: number = 0.05
): number[] => {
  return Array.from({ length: fingerCount }, () =>
    applyGripVariance(baseStrength, variance)
  );
};
