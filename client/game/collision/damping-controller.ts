import type { PublicApi } from '@react-three/cannon';
import { DAMPING_CONFIG } from '../constants/collision';

export const applyGripDamping = (api: PublicApi): void => {
  api.linearDamping.set(DAMPING_CONFIG.onGrip.linearDamping);
  api.angularDamping.set(DAMPING_CONFIG.onGrip.angularDamping);
};

export const releaseGripDamping = (api: PublicApi): void => {
  api.linearDamping.set(DAMPING_CONFIG.default.linearDamping);
  api.angularDamping.set(DAMPING_CONFIG.default.angularDamping);
};

export const setCustomDamping = (
  api: PublicApi,
  linearDamping: number,
  angularDamping: number
): void => {
  api.linearDamping.set(linearDamping);
  api.angularDamping.set(angularDamping);
};

export const interpolateDamping = (
  api: PublicApi,
  targetLinear: number,
  targetAngular: number,
  factor: number
): void => {
  const clampedFactor = Math.max(0, Math.min(1, factor));

  const currentLinear = DAMPING_CONFIG.default.linearDamping;
  const currentAngular = DAMPING_CONFIG.default.angularDamping;

  const newLinear = currentLinear + (targetLinear - currentLinear) * clampedFactor;
  const newAngular = currentAngular + (targetAngular - currentAngular) * clampedFactor;

  api.linearDamping.set(newLinear);
  api.angularDamping.set(newAngular);
};
