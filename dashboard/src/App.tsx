import { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { TabNav, type TabId } from './components/layout/TabNav';
import { MainDashboardPage } from './pages/MainDashboardPage';
import { LiveTelemetryPage } from './pages/LiveTelemetryPage';
import { ScenarioControlPage } from './pages/ScenarioControlPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { TwinAnalysisPage } from './pages/TwinAnalysisPage';
import { DiagnosticsPage } from './pages/DiagnosticsPage';
import { MissionReplayPage } from './pages/MissionReplayPage';
import { TelemetryTrendsPage } from './pages/TelemetryTrendsPage';
import { TwinViewPage } from './pages/TwinViewPage';
import { FloatingAlertModal } from './components/alerts/FloatingAlertModal';
import { connect, disconnect } from './adapters';
import { useConnectionStore } from './stores/connectionStore';

const PAGE_MAP: Record<TabId, React.ComponentType> = {
  dashboard:      MainDashboardPage,
  telemetry:      LiveTelemetryPage,
  trends:         TelemetryTrendsPage,
  scenario:       ScenarioControlPage,
  'twin-analysis': TwinAnalysisPage,
  diagnostics:    DiagnosticsPage,
  maintenance:    MaintenancePage,
  replay:         MissionReplayPage,
  'twin-view':    TwinViewPage,
};

export default function App() {
  const activeTab = useConnectionStore((s) => s.activeTab);
  const setActiveTab = useConnectionStore((s) => s.setActiveTab);

  useEffect(() => {
    connect();
    return () => { disconnect(); };
  }, []);

  const ActivePage = PAGE_MAP[activeTab] || MainDashboardPage;

  return (
    <div className="min-h-screen bg-canvas relative">
      <Header />
      <TabNav active={activeTab} onChange={setActiveTab} />
      <ActivePage />
      <FloatingAlertModal />
      {/* Footer */}
      <footer className="max-w-[1560px] mx-auto px-6 lg:px-10 py-5 text-center text-xs font-mono text-sage-600 border-t border-[#d8e0da] mt-8">
        MALE UAV DIGITAL TWIN DASHBOARD • SIH 2026 • SCHEMA v1.0.0 • SOURCE: LIVE STREAM / TWIN CORE
      </footer>
    </div>
  );
}
