import { create } from 'zustand';
import type { DiagnosticsData, TwinAnalysisData } from '../models/diagnostics';

interface DiagnosticsStore {
  diagnostics: DiagnosticsData | null;
  twinAnalysis: TwinAnalysisData | null;
  setDiagnostics: (d: DiagnosticsData) => void;
  setTwinAnalysis: (t: TwinAnalysisData) => void;
}

export const useDiagnosticsStore = create<DiagnosticsStore>((set) => ({
  diagnostics: null,
  twinAnalysis: null,
  setDiagnostics: (diagnostics) => set({ diagnostics }),
  setTwinAnalysis: (twinAnalysis) => set({ twinAnalysis }),
}));
