import { StateCreator } from 'zustand';
import type {
  CollisionState,
  CollisionActions,
  ContactPoint,
  ProngContact,
  GripStatus,
  CollisionDebugInfo,
} from '../types/collision.types';
import { CLAW_CONFIG } from '../types/game.types';
import {
  createInitialProngContacts,
  registerContact,
  unregisterContact,
  updateContactDurations,
  resetAllContacts,
} from '../collision/contact-tracker';
import {
  determineGripState,
  shouldTransitionToGrip,
  shouldTransitionToRelease,
} from '../collision/grip-state-machine';
import {
  applyGripDamping as applyDamping,
  releaseGripDamping as releaseDamping,
} from '../collision/damping-controller';
import { applySqueezeForce as applySqueeze } from '../collision/squeeze-force';
import { calculateClampedVelocity } from '../collision/velocity-clamper';
import { createDebugInfo } from '../collision/debug-overlay';
import type { PublicApi } from '@react-three/cannon';

export interface CollisionSlice extends CollisionState, CollisionActions {}

const initialGripStatus: GripStatus = {
  state: 'none',
  contactingProngs: [],
  totalContactDuration: 0,
  centerOffset: 0,
  isStable: false,
};

const initialDebugInfo: CollisionDebugInfo = {
  contactCount: 0,
  centerOffsetCm: 0,
  gripTimeMs: 0,
  velocityMs: 0,
};

export const initialCollisionState: CollisionState = {
  gripStatus: initialGripStatus,
  prongContacts: createInitialProngContacts(CLAW_CONFIG.fingerCount),
  activeContacts: [],
  grippedDollId: null,
  debugInfo: initialDebugInfo,
};

export const createCollisionSlice: StateCreator<
  CollisionSlice,
  [],
  [],
  CollisionSlice
> = (set, get) => ({
  ...initialCollisionState,

  registerProngContact: (prongIndex: number, dollId: string, contactPoint: ContactPoint) => {
    const currentTime = performance.now();
    const newContacts = registerContact(get().prongContacts, prongIndex, currentTime);

    set({
      prongContacts: newContacts,
      grippedDollId: dollId,
    });
  },

  unregisterProngContact: (prongIndex: number) => {
    const newContacts = unregisterContact(get().prongContacts, prongIndex);
    set({ prongContacts: newContacts });

    let hasAnyContact = false;
    newContacts.forEach((contact) => {
      if (contact.isContacting) hasAnyContact = true;
    });

    if (!hasAnyContact) {
      set({ grippedDollId: null });
    }
  },

  updateGripStatus: (deltaTime: number) => {
    const { prongContacts, gripStatus: currentGripStatus, grippedDollId } = get();
    const currentTime = performance.now();

    const updatedContacts = updateContactDurations(prongContacts, currentTime);

    const clawCenter: ContactPoint = { x: 0, y: 0, z: 0 };
    const dollCenter: ContactPoint = { x: 0, y: 0, z: 0 };

    const newGripStatus = determineGripState({
      prongContacts: updatedContacts,
      clawCenter,
      dollCenter,
      currentTime,
    });

    const transitionToGrip = shouldTransitionToGrip(currentGripStatus.state, newGripStatus.state);
    const transitionToRelease = shouldTransitionToRelease(currentGripStatus.state, newGripStatus.state);

    set({
      prongContacts: updatedContacts,
      gripStatus: newGripStatus,
    });

    return { transitionToGrip, transitionToRelease };
  },

  applyGripDamping: (dollApi: PublicApi) => {
    applyDamping(dollApi);
  },

  releaseGripDamping: (dollApi: PublicApi) => {
    releaseDamping(dollApi);
  },

  applySqueezeForce: (
    dollApi: PublicApi,
    clawCenter: ContactPoint,
    dollCenter: ContactPoint,
    mass: number
  ) => {
    applySqueeze({
      dollApi,
      clawCenter,
      dollCenter,
      dollMass: mass,
    });
  },

  clampVelocity: (dollApi: PublicApi) => {
    dollApi.velocity.subscribe((velocity) => {
      const clamped = calculateClampedVelocity(velocity as [number, number, number]);
      const [vx, vy, vz] = velocity;
      const [cx, cy, cz] = clamped;

      if (vx !== cx || vy !== cy || vz !== cz) {
        dollApi.velocity.set(cx, cy, cz);
      }
    });
  },

  resetCollisionState: () => {
    set({
      gripStatus: initialGripStatus,
      prongContacts: createInitialProngContacts(CLAW_CONFIG.fingerCount),
      activeContacts: [],
      grippedDollId: null,
      debugInfo: initialDebugInfo,
    });
  },

  setDebugEnabled: (enabled: boolean) => {
    if (!enabled) {
      set({ debugInfo: initialDebugInfo });
    }
  },
});
