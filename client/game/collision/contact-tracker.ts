import type { ProngContact, ContactInfo, ContactPoint } from '../types/collision.types';

export const createInitialProngContacts = (prongCount: number): Map<number, ProngContact> => {
  const contacts = new Map<number, ProngContact>();

  for (let i = 0; i < prongCount; i++) {
    contacts.set(i, {
      prongIndex: i,
      isContacting: false,
      contactStartTime: null,
      contactDuration: 0,
    });
  }

  return contacts;
};

export const registerContact = (
  contacts: Map<number, ProngContact>,
  prongIndex: number,
  currentTime: number
): Map<number, ProngContact> => {
  const newContacts = new Map(contacts);
  const existing = newContacts.get(prongIndex);

  if (existing && !existing.isContacting) {
    newContacts.set(prongIndex, {
      ...existing,
      isContacting: true,
      contactStartTime: currentTime,
      contactDuration: 0,
    });
  }

  return newContacts;
};

export const unregisterContact = (
  contacts: Map<number, ProngContact>,
  prongIndex: number
): Map<number, ProngContact> => {
  const newContacts = new Map(contacts);
  const existing = newContacts.get(prongIndex);

  if (existing) {
    newContacts.set(prongIndex, {
      ...existing,
      isContacting: false,
      contactStartTime: null,
      contactDuration: 0,
    });
  }

  return newContacts;
};

export const updateContactDurations = (
  contacts: Map<number, ProngContact>,
  currentTime: number
): Map<number, ProngContact> => {
  const newContacts = new Map<number, ProngContact>();

  contacts.forEach((contact, prongIndex) => {
    if (contact.isContacting && contact.contactStartTime !== null) {
      newContacts.set(prongIndex, {
        ...contact,
        contactDuration: currentTime - contact.contactStartTime,
      });
    } else {
      newContacts.set(prongIndex, contact);
    }
  });

  return newContacts;
};

export const createContactInfo = (
  prongIndex: number,
  dollId: string,
  contactPoint: ContactPoint,
  normalForce: number = 1.0
): ContactInfo => {
  return {
    prongIndex,
    dollId,
    startTime: performance.now(),
    contactPoint,
    normalForce,
  };
};

export const getActiveContactCount = (contacts: Map<number, ProngContact>): number => {
  let count = 0;
  contacts.forEach((contact) => {
    if (contact.isContacting) {
      count++;
    }
  });
  return count;
};

export const resetAllContacts = (contacts: Map<number, ProngContact>): Map<number, ProngContact> => {
  const newContacts = new Map<number, ProngContact>();

  contacts.forEach((contact, prongIndex) => {
    newContacts.set(prongIndex, {
      prongIndex,
      isContacting: false,
      contactStartTime: null,
      contactDuration: 0,
    });
  });

  return newContacts;
};
