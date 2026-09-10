import { create } from 'zustand';
import type { ConnectionState } from '../models/diagnostics';
import type { TabId } from '../components/layout/TabNav';

interface ConnectionStore {
  state: ConnectionState;
  dataSource: string;
  schemaVersion: string;
  activeTab: TabId;
  setConnectionState: (s: ConnectionState) => void;
  setDataSource: (d: string) => void;
  setActiveTab: (tab: TabId) => void;
}

export const useConnectionStore = create<ConnectionStore>((set) => ({
  state: 'CONNECTING',
  dataSource: 'LIVE STREAM',
  schemaVersion: '1.0.0',
  activeTab: 'dashboard',
  setConnectionState: (state) => set({ state }),
  setDataSource: (dataSource) => set({ dataSource }),
  setActiveTab: (activeTab) => set({ activeTab }),
}));

