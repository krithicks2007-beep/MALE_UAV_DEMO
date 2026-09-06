const STUBS = [
  { file: 'TelemetryTrendsPage', icon: 'show_chart',  label: 'Telemetry Trends',       note: 'uPlot high-frequency time-series — Phase 3' },
  { file: 'ScenarioControlPage', icon: 'science',     label: 'Scenario Control',       note: '7 fault injection scenarios — Phase 4' },
  { file: 'TwinAnalysisPage',    icon: 'account_tree',label: 'Twin Analysis',           note: 'Physics Expected vs Actual residuals — Phase 5' },
  { file: 'DiagnosticsPage',     icon: 'psychology',  label: 'AI / Diagnostics',       note: 'Anomaly Score, RUL, Fault Classification — Phase 5' },
  { file: 'MaintenancePage',     icon: 'build',       label: 'Maintenance Advisory',   note: 'Operational decision-support advisories — Phase 5' },
  { file: 'MissionReplayPage',   icon: 'replay',      label: 'Mission Replay',         note: 'Circular buffer, scrubber, play/pause — Phase 6' },
  { file: 'TwinViewPage',        icon: 'view_in_ar',  label: 'Twin View',              note: '3D full-screen engine state viewer — Phase 6' },
];

// Individual stub component factory
function StubPage({ icon, label, note }: { icon: string; label: string; note: string }) {
  return (
    <main className="max-w-[1560px] mx-auto px-6 lg:px-10 py-12 flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <span className="material-symbols-outlined text-[48px] text-sage-400">{icon}</span>
        <h2 className="text-xl font-semibold text-charcoal">{label}</h2>
        <p className="text-sm text-sage-600 font-mono">{note}</p>
      </div>
    </main>
  );
}

export function TelemetryTrendsPage() { return <StubPage icon="show_chart"   label="Telemetry Trends"     note="uPlot high-frequency time-series — Phase 3" />; }
export function ScenarioControlPage() { return <StubPage icon="science"      label="Scenario Control"     note="7 fault injection scenarios — Phase 4" />; }
export function TwinAnalysisPage()    { return <StubPage icon="account_tree" label="Twin Analysis"        note="Physics Expected vs Actual residuals — Phase 5" />; }
export function DiagnosticsPage()     { return <StubPage icon="psychology"   label="AI / Diagnostics"    note="Anomaly Score, RUL, Fault Classification — Phase 5" />; }
export function MaintenancePage()     { return <StubPage icon="build"        label="Maintenance Advisory" note="Operational decision-support advisories — Phase 5" />; }
export function MissionReplayPage()   { return <StubPage icon="replay"       label="Mission Replay"      note="Circular buffer, scrubber, play/pause — Phase 6" />; }
export function TwinViewPage()        { return <StubPage icon="view_in_ar"   label="Twin View"           note="3D full-screen engine state viewer — Phase 6" />; }
