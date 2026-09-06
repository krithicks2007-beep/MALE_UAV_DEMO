import { create } from 'zustand';
import type { ScenarioId } from '../models/engine';
import { SCENARIO_DEFINITIONS } from '../models/engine';
import { setScenario } from '../adapters/MockAdapter';

interface ScenarioStore {
  activeScenario: ScenarioId;
  selectScenario: (id: ScenarioId) => void;
  setActiveScenario: (id: ScenarioId) => void;
  definitions: typeof SCENARIO_DEFINITIONS;
}

export const useScenarioStore = create<ScenarioStore>((set) => ({
  activeScenario: 'NORMAL',
  definitions: SCENARIO_DEFINITIONS,
  selectScenario: (id) => {
    setScenario(id);
    set({ activeScenario: id });
  },
  setActiveScenario: (id) => {
    setScenario(id);
    set({ activeScenario: id });
  },
}));
