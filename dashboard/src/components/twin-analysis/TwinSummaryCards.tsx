import React from 'react';
import { useDiagnosticsStore } from '../../stores/diagnosticsStore';
import { useTwinStore } from '../../stores/twinStore';
import { useScenarioStore } from '../../stores/scenarioStore';
import { useHealthStore } from '../../stores/healthStore';
import { Cpu, Activity, AlertCircle, Gauge, CheckCircle2, ShieldAlert } from 'lucide-react';

export function TwinSummaryCards() {
  const twinAnalysis = useDiagnosticsStore((s) => s.twinAnalysis);
  const twinState = useTwinStore((s) => s.twinState);
  const activeScenario = useScenarioStore((s) => s.activeScenario);
  const scenarioDefinitions = useScenarioStore((s) => s.definitions);
  const health = useHealthStore((s) => s.health);

  const activeDef = scenarioDefinitions.find((s) => s.id === activeScenario);

  const errorPct = twinAnalysis?.prediction_error_pct;
  const hasErrorPct = errorPct !== undefined && errorPct !== null && Number.isFinite(errorPct);

  // Compute maximum residual magnitude across available residuals
  let maxResidualParam = '—';
  let maxResidualVal = 0;
  if (twinAnalysis?.residuals) {
    let maxAbs = -1;
    for (const [key, val] of Object.entries(twinAnalysis.residuals)) {
      if (val !== undefined && val !== null && Number.isFinite(val)) {
        const absVal = Math.abs(val);
        if (absVal > maxAbs) {
          maxAbs = absVal;
          maxResidualParam = key.toUpperCase().replace(/_/g, ' ');
          maxResidualVal = val;
        }
      }
    }
  }

  const errorBadgeColor =
    !hasErrorPct
      ? 'bg-sage-100 text-sage-700 border-sage-200'
      : errorPct < 2.5
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
      : errorPct < 5.0
      ? 'bg-amber-100 text-amber-900 border-amber-300'
      : 'bg-red-100 text-red-900 border-red-300 animate-pulse';

  const engineHealthVal = health?.index !== undefined && health?.index !== null ? Math.round(health.index) : null;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Twin Sync & State */}
      <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-[#dbe3dc] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sage-600">
            TWIN SYNCHRONIZATION
          </span>
          <div className="p-2 rounded-xl bg-sage-100/80 text-sage-700">
            <Cpu className="w-4 h-4" />
          </div>
        </div>

        <div className="my-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-light text-charcoal font-sans tracking-tight">
              {twinState?.twin_sync_status || 'SYNCED'}
            </span>
          </div>
          <p className="text-xs font-mono text-sage-600 mt-1">
            Engine State: <span className="font-semibold text-charcoal">{twinState?.engine_state || 'NOMINAL'}</span>
          </p>
        </div>

        <div className="pt-3 border-t border-[#e2e8e3] flex items-center justify-between text-[11px] font-mono text-sage-600">
          <span>Health Index: {engineHealthVal !== null ? `${engineHealthVal}%` : '—'}</span>
          <span className="text-emerald-700 font-medium">REAL-TIME</span>
        </div>
      </div>

      {/* 2. Active Scenario */}
      <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-[#dbe3dc] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sage-600">
            OPERATING SCENARIO
          </span>
          <div className={`p-2 rounded-xl ${activeScenario === 'NORMAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            <Activity className="w-4 h-4" />
          </div>
        </div>

        <div className="my-3">
          <span className="text-lg font-bold text-charcoal block truncate">
            {activeDef?.name || activeScenario}
          </span>
          <p className="text-xs text-sage-600 line-clamp-2 mt-1 leading-snug">
            {activeDef?.description || 'Engine running under normal operating envelope.'}
          </p>
        </div>

        <div className="pt-3 border-t border-[#e2e8e3] flex items-center justify-between text-[11px] font-mono text-sage-600">
          <span>Subsystem: {activeDef?.affected_subsystem || 'ALL NOMINAL'}</span>
          <span className={`font-semibold ${activeScenario === 'NORMAL' ? 'text-emerald-700' : 'text-amber-700'}`}>
            {activeDef?.severity || 'NONE'}
          </span>
        </div>
      </div>

      {/* 3. Prediction Error / Residual Score */}
      <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-[#dbe3dc] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sage-600">
            PREDICTION ERROR
          </span>
          <div className="p-2 rounded-xl bg-sage-100/80 text-sage-700">
            <Gauge className="w-4 h-4" />
          </div>
        </div>

        <div className="my-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-light text-charcoal font-sans">
              {hasErrorPct ? `${errorPct.toFixed(2)}` : '—'}
            </span>
            <span className="text-sm font-mono text-sage-600">%</span>
          </div>

          {/* Progress bar visualizer */}
          <div className="w-full h-2 bg-sage-100 rounded-full overflow-hidden mt-2 border border-sage-200">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                !hasErrorPct
                  ? 'w-0'
                  : errorPct < 2.5
                  ? 'bg-emerald-500 w-[20%]'
                  : errorPct < 5.0
                  ? 'bg-amber-500 w-[55%]'
                  : 'bg-red-500 w-[90%]'
              }`}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-[#e2e8e3] flex items-center justify-between text-[11px] font-mono">
          <span className="text-sage-600">Fidelity Condition</span>
          <span className={`px-2 py-0.5 rounded-md border font-semibold text-[10px] ${errorBadgeColor}`}>
            {!hasErrorPct ? 'NO DATA' : errorPct < 2.5 ? 'NOMINAL' : errorPct < 5.0 ? 'ELEVATED' : 'HIGH VARIANCE'}
          </span>
        </div>
      </div>

      {/* 4. Peak Parameter Residual */}
      <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-[#dbe3dc] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sage-600">
            PEAK PARAMETER RESIDUAL
          </span>
          <div className="p-2 rounded-xl bg-sage-100/80 text-sage-700">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>

        <div className="my-3">
          <span className="text-base font-bold text-charcoal block truncate">
            {maxResidualParam}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-light text-charcoal font-sans">
              {maxResidualVal !== 0 ? (maxResidualVal > 0 ? `+${maxResidualVal.toFixed(2)}` : maxResidualVal.toFixed(2)) : '—'}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#e2e8e3] flex items-center justify-between text-[11px] font-mono text-sage-600">
          <span>Deviation Status</span>
          <span className={`font-semibold ${Math.abs(maxResidualVal) > 10 ? 'text-amber-700' : 'text-emerald-700'}`}>
            {maxResidualVal === 0 ? 'NOMINAL' : Math.abs(maxResidualVal) > 20 ? 'HIGH' : 'ELEVATED'}
          </span>
        </div>
      </div>
    </section>
  );
}
