import { create } from 'zustand';
import type { MissionData, ReplayState } from '../models/mission';

interface MissionStore {
  mission: MissionData | null;
  replay: ReplayState;
  setMission: (m: MissionData) => void;
  setReplayState: (r: Partial<ReplayState>) => void;
}

export const useMissionStore = create<MissionStore>((set) => ({
  mission: null,
  replay: {
    is_playing: false,
    speed: 1,
    position_pct: 58,
    locked: true,
  },
  setMission: (mission) => set({ mission }),
  setReplayState: (r) =>
    set((state) => ({ replay: { ...state.replay, ...r } })),
}));
