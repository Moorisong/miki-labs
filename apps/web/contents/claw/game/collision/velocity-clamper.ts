import type { PublicApi } from '@react-three/cannon';
import { VELOCITY_CONFIG } from '../constants/collision';

export const clampVelocity = (
  api: PublicApi,
  maxVelocity: number = VELOCITY_CONFIG.maxVelocity
): void => {
  api.velocity.subscribe((velocity) => {
    const [vx, vy, vz] = velocity;
    const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);

    if (speed > maxVelocity) {
      const scale = maxVelocity / speed;
      api.velocity.set(vx * scale, vy * scale, vz * scale);
    }
  });
};

export const createVelocityClamper = (maxVelocity: number = VELOCITY_CONFIG.maxVelocity) => {
  let lastVelocity: [number, number, number] = [0, 0, 0];
  let unsubscribe: (() => void) | null = null;

  const attach = (api: PublicApi): void => {
    if (unsubscribe) {
      unsubscribe();
    }

    unsubscribe = api.velocity.subscribe((velocity) => {
      lastVelocity = velocity as [number, number, number];
    });
  };

  const update = (api: PublicApi): void => {
    const [vx, vy, vz] = lastVelocity;
    const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);

    if (speed > maxVelocity) {
      const scale = maxVelocity / speed;
      api.velocity.set(vx * scale, vy * scale, vz * scale);
    }
  };

  const detach = (): void => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };

  const getSpeed = (): number => {
    const [vx, vy, vz] = lastVelocity;
    return Math.sqrt(vx * vx + vy * vy + vz * vz);
  };

  return {
    attach,
    update,
    detach,
    getSpeed,
  };
};

export const isVelocityExceeded = (
  velocity: [number, number, number],
  maxVelocity: number = VELOCITY_CONFIG.maxVelocity
): boolean => {
  const [vx, vy, vz] = velocity;
  const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
  return speed > maxVelocity;
};

export const calculateClampedVelocity = (
  velocity: [number, number, number],
  maxVelocity: number = VELOCITY_CONFIG.maxVelocity
): [number, number, number] => {
  const [vx, vy, vz] = velocity;
  const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);

  if (speed <= maxVelocity) {
    return velocity;
  }

  const scale = maxVelocity / speed;
  return [vx * scale, vy * scale, vz * scale];
};
