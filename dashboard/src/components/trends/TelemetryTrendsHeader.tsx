import React from 'react';
import { useConnectionStore } from '../../stores/connectionStore';
import { useScenarioStore } from '../../stores/scenarioStore';
import { useTelemetryStore } from '../../stores/telemetryStore';
import { TrendingUp, Activity, Zap, Layers, Radio } from 'lucide-react';

export function TelemetryTrendsHeader() {
  const connectionState = useConnectionStore((s) => s.state);
  const dataSource = useConnectionStore((s) => s.dataSource);
  const activeScenario = useScenarioStore((s) => s.activeScenario);
  const scenarioDefinitions = useScenarioStore((s) => s.definitions);
  const telemetry = useTelemetryStore((s) => s.telemetry);
  const context = useTelemetryStore((s) => s.context);
  const history = useTelemetryStore((s) => s.history);

  const activeDef = scenarioDefinitions.find((def) => def.id === activeScenario);

  const isConnected = connectionState === 'CONNECTED';
  const totalSamples = history.length > 0 && history[0] ? history[0].length : 0;

  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-[#dbe3dc] shadow-sm transition-all duration-300">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sage-100/90 text-sage-800 border border-sage-200">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-charcoal tracking-tight flex items-center gap-2">
              Telemetry Trends
              {isConnected && totalSamples > 0 && (
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                  LIVE
                </span>
              )}
            </h1>
            <p className="text-xs font-mono text-sage-600">
              High-frequency multi-axis sensor time-series telemetry buffer &amp; operational envelope monitoring
            </p>
          </div>
        </div>
      </div>

      {/* Control & Status Badges */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Frame / Buffer Status */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage-50 border border-sage-200/80 text-xs font-mono text-sage-700">
          <Layers className="w-3.5 h-3.5 text-sage-600" />
          <span>BUFFER: {totalSamples} SAMPLES</span>
        </div>

        {/* Mission Phase */}
        {context?.mission_phase && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage-100 text-sage-800 border border-sage-300 text-xs font-mono font-semibold">
            <Activity className="w-3.5 h-3.5 text-sage-700" />
            <span>PHASE: {context.mission_phase.toUpperCase()}</span>
          </div>
        )}

        {/* Active Scenario */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all ${
          activeScenario === 'NORMAL'
            ? 'bg-sage-100 text-sage-800 border-sage-300'
            : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
        }`}>
          <Zap className="w-3.5 h-3.5" />
          <span>SCENARIO: {activeDef?.name || activeScenario}</span>
        </div>

        {/* Stream Source */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
          isConnected
            ? 'bg-emerald-100/90 text-emerald-800 border-emerald-300'
            : 'bg-red-100/90 text-red-800 border-red-300'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span>{dataSource} ({connectionState})</span>
        </div>
      </div>
    </header>
  );
}
