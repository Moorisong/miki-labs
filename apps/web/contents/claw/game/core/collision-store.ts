import { create } from 'zustand';
import { createCollisionSlice, CollisionSlice, initialCollisionState } from './collision-slice';

export const useCollisionStore = create<CollisionSlice>((set, get, api) => ({
  ...createCollisionSlice(set, get, api),
}));

export { initialCollisionState };
export type { CollisionSlice };
