import { create } from 'zustand';
import type { Alert } from '../models/alerts';

interface AlertStore {
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  acknowledge: (id: string) => void;
  activeCount: () => number;
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],
  setAlerts: (alerts) => set({ alerts }),
  acknowledge: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)),
    })),
  activeCount: () => get().alerts.filter((a) => a.active && !a.acknowledged).length,
}));
