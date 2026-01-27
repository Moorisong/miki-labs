import type { PublicApi } from '@react-three/cannon';
import type { ContactPoint } from '../types/collision.types';
import { SQUEEZE_FORCE_CONFIG } from '../constants/collision';

export interface SqueezeForceParams {
  dollApi: PublicApi;
  clawCenter: ContactPoint;
  dollCenter: ContactPoint;
  dollMass: number;
}

export const calculateSqueezeDirection = (
  clawCenter: ContactPoint,
  dollCenter: ContactPoint
): { x: number; z: number } => {
  const dx = clawCenter.x - dollCenter.x;
  const dz = clawCenter.z - dollCenter.z;

  const distance = Math.sqrt(dx * dx + dz * dz);

  if (distance < 0.001) {
    return { x: 0, z: 0 };
  }

  return {
    x: dx / distance,
    z: dz / distance,
  };
};

export const applySqueezeForce = (params: SqueezeForceParams): void => {
  const { dollApi, clawCenter, dollCenter, dollMass } = params;

  const direction = calculateSqueezeDirection(clawCenter, dollCenter);

  const forceMagnitude = dollMass * SQUEEZE_FORCE_CONFIG.forceMultiplier;

  const forceX = direction.x * forceMagnitude;
  const forceY = SQUEEZE_FORCE_CONFIG.verticalComponent;
  const forceZ = direction.z * forceMagnitude;

  dollApi.applyForce([forceX, forceY, forceZ], [0, 0, 0]);
};

export const applySlipForce = (
  dollApi: PublicApi,
  centerOffset: number,
  dollMass: number
): void => {
  const slipStrength = Math.min(centerOffset / 10, 1);

  const downwardForce = -dollMass * 2.0 * slipStrength;

  dollApi.applyForce([0, downwardForce, 0], [0, 0, 0]);

  const torqueX = (Math.random() - 0.5) * slipStrength;
  const torqueZ = (Math.random() - 0.5) * slipStrength;
  dollApi.applyTorque([torqueX, 0, torqueZ]);
};
