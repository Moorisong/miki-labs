import type { GripState, GripStatus, ProngContact, ContactPoint } from '../types/collision.types';
import { GRIP_DETECTION_CONFIG, SLIP_CONFIG } from '../constants/collision';

export interface GripStateMachineInput {
  prongContacts: Map<number, ProngContact>;
  clawCenter: ContactPoint;
  dollCenter: ContactPoint;
  currentTime: number;
}

export const calculateCenterOffset = (
  clawCenter: ContactPoint,
  dollCenter: ContactPoint
): number => {
  const dx = dollCenter.x - clawCenter.x;
  const dz = dollCenter.z - clawCenter.z;
  return Math.sqrt(dx * dx + dz * dz) * 100;
};

export const getContactingProngs = (
  prongContacts: Map<number, ProngContact>,
  currentTime: number
): number[] => {
  const contacting: number[] = [];

  prongContacts.forEach((contact, prongIndex) => {
    if (contact.isContacting) {
      contacting.push(prongIndex);
    }
  });

  return contacting;
};

export const calculateTotalContactDuration = (
  prongContacts: Map<number, ProngContact>,
  currentTime: number
): number => {
  let maxDuration = 0;

  prongContacts.forEach((contact) => {
    if (contact.isContacting && contact.contactStartTime !== null) {
      const duration = currentTime - contact.contactStartTime;
      maxDuration = Math.max(maxDuration, duration);
    }
  });

  return maxDuration;
};

export const determineGripState = (input: GripStateMachineInput): GripStatus => {
  const { prongContacts, clawCenter, dollCenter, currentTime } = input;

  const contactingProngs = getContactingProngs(prongContacts, currentTime);
  const contactCount = contactingProngs.length;
  const totalContactDuration = calculateTotalContactDuration(prongContacts, currentTime);
  const centerOffset = calculateCenterOffset(clawCenter, dollCenter);

  let state: GripState = 'none';
  let isStable = false;

  if (contactCount === 0) {
    state = 'none';
  } else if (contactCount < GRIP_DETECTION_CONFIG.minProngsForGrip) {
    state = 'touching';
  } else if (totalContactDuration < GRIP_DETECTION_CONFIG.contactDurationThreshold) {
    state = 'touching';
  } else if (centerOffset > SLIP_CONFIG.centerOffsetThreshold) {
    state = 'slipping';
  } else {
    state = 'gripping';
    isStable = contactCount >= SLIP_CONFIG.minProngsForStable;
  }

  return {
    state,
    contactingProngs,
    totalContactDuration,
    centerOffset,
    isStable,
  };
};

export const shouldTransitionToGrip = (
  currentState: GripState,
  newState: GripState
): boolean => {
  if (currentState === 'none' && newState === 'gripping') return true;
  if (currentState === 'touching' && newState === 'gripping') return true;
  return false;
};

export const shouldTransitionToRelease = (
  currentState: GripState,
  newState: GripState
): boolean => {
  if (currentState === 'gripping' && newState === 'none') return true;
  if (currentState === 'gripping' && newState === 'slipping') return true;
  if (currentState === 'slipping' && newState === 'none') return true;
  return false;
};
