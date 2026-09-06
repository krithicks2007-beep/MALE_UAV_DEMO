import { create } from 'zustand';
import type { TwinVisualizationState } from '../models/engine';

export type TwinModelMode = 'SOLID' | 'WIREFRAME';

interface TwinStore {
  twinState: TwinVisualizationState | null;
  modelMode: TwinModelMode;
  setTwinState: (s: TwinVisualizationState) => void;
  setModelMode: (m: TwinModelMode) => void;
  toggleModelMode: () => void;
}

export const useTwinStore = create<TwinStore>((set) => ({
  twinState: null,
  modelMode: 'SOLID',
  setTwinState: (twinState) => set({ twinState }),
  setModelMode: (modelMode) => set({ modelMode }),
  toggleModelMode: () => set((state) => ({ modelMode: state.modelMode === 'SOLID' ? 'WIREFRAME' : 'SOLID' })),
}));

