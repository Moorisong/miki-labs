import type { CollisionDebugInfo, GripStatus } from '../types/collision.types';

export interface DebugOverlayData {
  contactCount: number;
  centerOffsetCm: number;
  gripTimeMs: number;
  velocityMs: number;
  gripState: string;
  isStable: boolean;
}

export const createDebugInfo = (
  gripStatus: GripStatus,
  velocity: number
): CollisionDebugInfo => {
  return {
    contactCount: gripStatus.contactingProngs.length,
    centerOffsetCm: Math.round(gripStatus.centerOffset * 100) / 100,
    gripTimeMs: Math.round(gripStatus.totalContactDuration),
    velocityMs: Math.round(velocity * 100) / 100,
  };
};

export const formatDebugOverlay = (data: DebugOverlayData): string[] => {
  return [
    `Contact: ${data.contactCount}`,
    `Offset: ${data.centerOffsetCm.toFixed(1)} cm`,
    `Grip: ${data.gripTimeMs} ms`,
    `Speed: ${data.velocityMs.toFixed(1)} m/s`,
    `State: ${data.gripState}`,
    `Stable: ${data.isStable ? 'Yes' : 'No'}`,
  ];
};

export const createDebugOverlayData = (
  gripStatus: GripStatus,
  velocity: number
): DebugOverlayData => {
  return {
    contactCount: gripStatus.contactingProngs.length,
    centerOffsetCm: gripStatus.centerOffset,
    gripTimeMs: gripStatus.totalContactDuration,
    velocityMs: velocity,
    gripState: gripStatus.state,
    isStable: gripStatus.isStable,
  };
};

export const shouldShowDebugWarning = (data: DebugOverlayData): boolean => {
  if (data.gripState === 'slipping') return true;
  if (data.centerOffsetCm > 1.0) return true;
  if (data.velocityMs > 10) return true;
  return false;
};
