import { create } from 'zustand';
import type { ConnectionState } from '../models/diagnostics';

interface ConnectionStore {
  state: ConnectionState;
  dataSource: string;
  schemaVersion: string;
  setConnectionState: (s: ConnectionState) => void;
  setDataSource: (d: string) => void;
}

export const useConnectionStore = create<ConnectionStore>((set) => ({
  state: 'CONNECTING',
  dataSource: 'LIVE STREAM',
  schemaVersion: '1.0.0',
  setConnectionState: (state) => set({ state }),
  setDataSource: (dataSource) => set({ dataSource }),
}));
