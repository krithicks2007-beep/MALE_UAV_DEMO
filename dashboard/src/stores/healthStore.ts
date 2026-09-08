import { create } from 'zustand';
import type { HealthState } from '../models/health';

interface HealthStore {
  health: HealthState | null;
  setHealth: (h: HealthState) => void;
}

export const useHealthStore = create<HealthStore>((set) => ({
  health: null,
  setHealth: (health) => set({ health }),
}));
