import { create } from 'zustand';
import type { TelemetryData, FlightContext, TelemetrySample } from '../models/telemetry';

const BUFFER_SIZE = 300; // ~2.5 min at 2 Hz

interface TelemetryStore {
  telemetry: TelemetryData | null;
  context: FlightContext | null;
  history: TelemetrySample[][]; // one array per channel index, parallel arrays for uPlot
  setTelemetry: (t: TelemetryData) => void;
  setContext: (c: FlightContext) => void;
  pushSample: (t: TelemetryData) => void;
}

export const useTelemetryStore = create<TelemetryStore>((set) => ({
  telemetry: null,
  context: null,
  history: [],
  setTelemetry: (telemetry) => set({ telemetry }),
  setContext: (context) => set({ context }),
  pushSample: (t) =>
    set((state) => {
      const ts = Date.now() / 1000;
      const prev = state.history.length > 0 ? state.history : Array.from({ length: 11 }, () => []);
      const next = prev.map((arr, i) => {
        const vals: number[] = [t.rpm, t.map, t.oil_pressure, t.oil_temperature,
          t.fuel_flow, t.vibration, t.battery_voltage, t.alternator_current,
          t.injection_timing, t.cht[0], t.egt[0]];
        const newArr = [...arr, { t: ts, value: vals[i] ?? 0 }];
        return newArr.length > BUFFER_SIZE ? newArr.slice(-BUFFER_SIZE) : newArr;
      });
      return { history: next };
    }),
}));
