import { create } from 'zustand';
import type { TwinVisualizationState } from '../models/engine';

export type TwinModelMode = 'SOLID' | 'WIREFRAME';
export type TwinTarget = 'AIRFRAME' | 'ENGINE_STP';

interface TwinStore {
  twinState: TwinVisualizationState | null;
  modelMode: TwinModelMode;
  twinTarget: TwinTarget;
  explodedFactor: number; // 0.0 (assembled) to 1.0 (fully exploded)
  isAutoExploding: boolean;
  selectedPart: string | null;
  setTwinState: (s: TwinVisualizationState) => void;
  setModelMode: (m: TwinModelMode) => void;
  setTwinTarget: (t: TwinTarget) => void;
  setExplodedFactor: (f: number) => void;
  setIsAutoExploding: (b: boolean) => void;
  setSelectedPart: (p: string | null) => void;
  toggleModelMode: () => void;
}

export const useTwinStore = create<TwinStore>((set) => ({
  twinState: null,
  modelMode: 'SOLID',
  twinTarget: 'ENGINE_STP',
  explodedFactor: 0.0,
  isAutoExploding: false,
  selectedPart: null,
  setTwinState: (twinState) => set({ twinState }),
  setModelMode: (modelMode) => set({ modelMode }),
  setTwinTarget: (twinTarget) => set({ twinTarget }),
  setExplodedFactor: (explodedFactor) => set({ explodedFactor: Math.max(0, Math.min(1, explodedFactor)) }),
  setIsAutoExploding: (isAutoExploding) => set({ isAutoExploding }),
  setSelectedPart: (selectedPart) => set({ selectedPart }),
  toggleModelMode: () => set((state) => ({ modelMode: state.modelMode === 'SOLID' ? 'WIREFRAME' : 'SOLID' })),
}));

