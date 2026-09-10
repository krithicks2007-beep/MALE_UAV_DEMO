import React from 'react';
import { useTwinStore } from '../../stores/twinStore';
import { useScenarioStore } from '../../stores/scenarioStore';
import { useConnectionStore } from '../../stores/connectionStore';
import { useDiagnosticsStore } from '../../stores/diagnosticsStore';
import { Activity, Cpu, ShieldCheck, Zap, AlertTriangle, Layers } from 'lucide-react';

export function TwinAnalysisHeader() {
  const twinState = useTwinStore((s) => s.twinState);
  const activeScenario = useScenarioStore((s) => s.activeScenario);
  const scenarioDefinitions = useScenarioStore((s) => s.definitions);
  const connectionState = useConnectionStore((s) => s.state);
  const twinAnalysis = useDiagnosticsStore((s) => s.twinAnalysis);

  const activeDef = scenarioDefinitions.find((def) => def.id === activeScenario);

  const syncStatus = twinState?.twin_sync_status || (connectionState === 'CONNECTED' ? 'SYNCED' : 'DISCONNECTED');
  const engineState = twinState?.engine_state || 'NOMINAL';
  const modelVersion = twinAnalysis?.model_version || twinState?.model_version || 'v2.4 Physics Core';

  const syncBadgeColor =
    syncStatus === 'SYNCED'
      ? 'bg-emerald-100/90 text-emerald-800 border-emerald-300'
      : syncStatus === 'DELAYED'
      ? 'bg-amber-100/90 text-amber-800 border-amber-300'
      : 'bg-red-100/90 text-red-800 border-red-300';

  const engineStateBadgeColor =
    engineState === 'NOMINAL'
      ? 'bg-emerald-100/90 text-emerald-800 border-emerald-300'
      : engineState === 'WARNING'
      ? 'bg-amber-100/90 text-amber-800 border-amber-300'
      : engineState === 'DEGRADED'
      ? 'bg-orange-100/90 text-orange-800 border-orange-300'
      : 'bg-red-100/90 text-red-800 border-red-300';

  const scenarioBadgeColor =
    activeScenario === 'NORMAL'
      ? 'bg-sage-100 text-sage-800 border-sage-300'
      : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse';

  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-[#dbe3dc] shadow-sm transition-all duration-300">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sage-100/90 text-sage-800 border border-sage-200">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-charcoal tracking-tight flex items-center gap-2">
              Digital Twin Analysis
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-700 border border-sage-200">
                PHYSICS VS ACTUAL
              </span>
            </h1>
            <p className="text-xs font-mono text-sage-600">
              Live physics model expected telemetry state &amp; actual sensor residual comparison
            </p>
          </div>
        </div>
      </div>

      {/* Control & Status Badges */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Model Version */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage-50 border border-sage-200/80 text-xs font-mono text-sage-700">
          <Layers className="w-3.5 h-3.5 text-sage-600" />
          <span>MODEL: {modelVersion}</span>
        </div>

        {/* Active Scenario */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all ${scenarioBadgeColor}`}>
          <Zap className="w-3.5 h-3.5" />
          <span>SCENARIO: {activeDef?.name || activeScenario}</span>
        </div>

        {/* Sync Status */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all ${syncBadgeColor}`}>
          <Activity className="w-3.5 h-3.5" />
          <span>TWIN: {syncStatus}</span>
        </div>

        {/* Engine State */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${engineStateBadgeColor}`}>
          {engineState === 'NOMINAL' ? (
            <ShieldCheck className="w-3.5 h-3.5" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5" />
          )}
          <span>STATE: {engineState}</span>
        </div>
      </div>
    </header>
  );
}
