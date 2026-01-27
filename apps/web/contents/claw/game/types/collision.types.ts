import type { PublicApi } from '@react-three/cannon';

export type ColliderType = 'prong' | 'doll' | 'floor' | 'exitEdge';

export type GripState = 'none' | 'touching' | 'gripping' | 'slipping';

export interface ContactPoint {
  x: number;
  y: number;
  z: number;
}

export interface ContactInfo {
  prongIndex: number;
  dollId: string;
  startTime: number;
  contactPoint: ContactPoint;
  normalForce: number;
}

export interface ProngContact {
  prongIndex: number;
  isContacting: boolean;
  contactStartTime: number | null;
  contactDuration: number;
}

export interface GripStatus {
  state: GripState;
  contactingProngs: number[];
  totalContactDuration: number;
  centerOffset: number;
  isStable: boolean;
}

export interface CollisionState {
  gripStatus: GripStatus;
  prongContacts: Map<number, ProngContact>;
  activeContacts: ContactInfo[];
  grippedDollId: string | null;
  debugInfo: CollisionDebugInfo;
}

export interface CollisionDebugInfo {
  contactCount: number;
  centerOffsetCm: number;
  gripTimeMs: number;
  velocityMs: number;
}

export interface DollPhysicsApi {
  id: string;
  api: PublicApi;
  mass: number;
}

export interface GripTransition {
  transitionToGrip: boolean;
  transitionToRelease: boolean;
}

export interface CollisionActions {
  registerProngContact: (prongIndex: number, dollId: string, contactPoint: ContactPoint) => void;
  unregisterProngContact: (prongIndex: number) => void;
  updateGripStatus: (deltaTime: number) => GripTransition;
  applyGripDamping: (dollApi: PublicApi) => void;
  releaseGripDamping: (dollApi: PublicApi) => void;
  applySqueezeForce: (dollApi: PublicApi, clawCenter: ContactPoint, dollCenter: ContactPoint, mass: number) => void;
  clampVelocity: (dollApi: PublicApi) => void;
  resetCollisionState: () => void;
  setDebugEnabled: (enabled: boolean) => void;
}

export interface CollisionStore extends CollisionState, CollisionActions {}
