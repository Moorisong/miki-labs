import { useCallback, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { PublicApi } from '@react-three/cannon';
import type { ContactPoint, DollPhysicsApi } from '../types/collision.types';
import { useCollisionStore } from '../core/collision-store';
import {
  applyGripDamping,
  releaseGripDamping,
} from '../collision/damping-controller';
import { applySqueezeForce, applySlipForce } from '../collision/squeeze-force';
import { createVelocityClamper } from '../collision/velocity-clamper';

interface UseCollisionSystemProps {
  clawPosition: ContactPoint;
  isClawOpen: boolean;
  dollApis: Map<string, DollPhysicsApi>;
}

export const useCollisionSystem = ({
  clawPosition,
  isClawOpen,
  dollApis,
}: UseCollisionSystemProps) => {
  const velocityClampers = useRef<Map<string, ReturnType<typeof createVelocityClamper>>>(new Map());
  const wasGripping = useRef(false);

  const {
    gripStatus,
    grippedDollId,
    prongContacts,
    registerProngContact,
    unregisterProngContact,
    updateGripStatus,
    resetCollisionState,
  } = useCollisionStore();

  useEffect(() => {
    dollApis.forEach((dollApi, dollId) => {
      if (!velocityClampers.current.has(dollId)) {
        const clamper = createVelocityClamper();
        clamper.attach(dollApi.api);
        velocityClampers.current.set(dollId, clamper);
      }
    });

    return () => {
      velocityClampers.current.forEach((clamper) => clamper.detach());
      velocityClampers.current.clear();
    };
  }, [dollApis]);

  useEffect(() => {
    if (isClawOpen && grippedDollId) {
      const dollApi = dollApis.get(grippedDollId);
      if (dollApi) {
        releaseGripDamping(dollApi.api);
      }
      resetCollisionState();
      wasGripping.current = false;
    }
  }, [isClawOpen, grippedDollId, dollApis, resetCollisionState]);

  useFrame((_, delta) => {
    const { transitionToGrip, transitionToRelease } = updateGripStatus(delta);

    if (grippedDollId) {
      const dollApi = dollApis.get(grippedDollId);

      if (dollApi) {
        if (transitionToGrip && !wasGripping.current) {
          applyGripDamping(dollApi.api);
          wasGripping.current = true;
        }

        if (transitionToRelease && wasGripping.current) {
          releaseGripDamping(dollApi.api);
          wasGripping.current = false;
        }

        if (gripStatus.state === 'gripping') {
          const dollCenter: ContactPoint = { x: 0, y: 0, z: 0 };

          applySqueezeForce({
            dollApi: dollApi.api,
            clawCenter: clawPosition,
            dollCenter,
            dollMass: dollApi.mass,
          });
        }

        if (gripStatus.state === 'slipping') {
          applySlipForce(dollApi.api, gripStatus.centerOffset, dollApi.mass);
        }
      }
    }

    velocityClampers.current.forEach((clamper, dollId) => {
      const dollApi = dollApis.get(dollId);
      if (dollApi) {
        clamper.update(dollApi.api);
      }
    });
  });

  const handleProngCollisionStart = useCallback(
    (prongIndex: number, dollId: string, contactPoint: ContactPoint) => {
      if (!isClawOpen) {
        registerProngContact(prongIndex, dollId, contactPoint);
      }
    },
    [isClawOpen, registerProngContact]
  );

  const handleProngCollisionEnd = useCallback(
    (prongIndex: number) => {
      unregisterProngContact(prongIndex);
    },
    [unregisterProngContact]
  );

  return {
    gripStatus,
    grippedDollId,
    prongContacts,
    handleProngCollisionStart,
    handleProngCollisionEnd,
  };
};
