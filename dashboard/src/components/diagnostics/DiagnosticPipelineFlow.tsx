import React from 'react';
import { useDiagnosticsStore } from '../../stores/diagnosticsStore';
import { useTwinStore } from '../../stores/twinStore';
import { Activity, ShieldAlert, Cpu, Brain, Flame, Hourglass, AlertOctagon, ArrowRight, CheckCircle2 } from 'lucide-react';

export function DiagnosticPipelineFlow() {
  const diagnostics = useDiagnosticsStore((s) => s.diagnostics);
  const twinAnalysis = useDiagnosticsStore((s) => s.twinAnalysis);
  const twinState = useTwinStore((s) => s.twinState);

  const hasAnomaly = diagnostics?.primary_fault && diagnostics.primary_fault !== 'NONE';
  const anomalyScorePct = diagnostics?.anomaly_score !== undefined ? Math.round(diagnostics.anomaly_score * 100) : 0;
  const failureRisk = diagnostics?.failure_risk_pct !== undefined ? diagnostics.failure_risk_pct : 0;
  const rulVal = diagnostics?.rul_value;

  // Pipeline stage nodes definition
  const stages = [
    {
      id: 'telemetry',
      label: '1. TELEMETRY',
      subtext: '20-50 Hz Sensors',
      status: 'NOMINAL',
      icon: <Activity className="w-4 h-4" />,
      activeVal: 'STREAMING',
    },
    {
      id: 'residual',
      label: '2. RESIDUAL',
      subtext: 'Physics Model Δ',
      status: (twinAnalysis?.prediction_error_pct ?? 0) > 3.0 ? 'ELEVATED' : 'NOMINAL',
      icon: <Cpu className="w-4 h-4" />,
      activeVal: twinAnalysis?.prediction_error_pct !== undefined ? `Error: ${twinAnalysis.prediction_error_pct.toFixed(1)}%` : 'Synced',
    },
    {
      id: 'anomaly',
      label: '3. ANOMALY',
      subtext: 'Isolation Filter',
      status: anomalyScorePct > 60 ? 'CRITICAL' : anomalyScorePct > 20 ? 'WARNING' : 'NOMINAL',
      icon: <ShieldAlert className="w-4 h-4" />,
      activeVal: `Score: ${anomalyScorePct}%`,
    },
    {
      id: 'classification',
      label: '4. FAULT CLASSIFICATION',
      subtext: 'AI Neural Net',
      status: hasAnomaly ? (diagnostics?.severity || 'WARNING') : 'NOMINAL',
      icon: <Brain className="w-4 h-4" />,
      activeVal: diagnostics?.primary_fault ? diagnostics.primary_fault.replace(/_/g, ' ') : 'NONE',
    },
    {
      id: 'degradation',
      label: '5. DEGRADATION',
      subtext: 'Health State',
      status: diagnostics?.degradation_status || 'NOMINAL',
      icon: <Flame className="w-4 h-4" />,
      activeVal: diagnostics?.degradation_status || 'NOMINAL',
    },
    {
      id: 'rul',
      label: '6. RUL',
      subtext: 'Useful Life',
      status: rulVal !== null && rulVal !== undefined ? (rulVal < 100 ? 'WARNING' : 'NOMINAL') : 'UNAVAILABLE',
      icon: <Hourglass className="w-4 h-4" />,
      activeVal: rulVal !== null && rulVal !== undefined ? `${rulVal} ${diagnostics?.rul_unit || 'HOURS'}` : 'UNAVAILABLE',
    },
    {
      id: 'risk',
      label: '7. MISSION RISK',
      subtext: 'Decision Gate',
      status: failureRisk > 15 ? 'CRITICAL' : failureRisk > 5 ? 'WARNING' : 'NOMINAL',
      icon: <AlertOctagon className="w-4 h-4" />,
      activeVal: `Risk: ${failureRisk.toFixed(1)}%`,
    },
  ];

  return (
    <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-[#dbe3dc] shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-[#dbe3dc] pb-2">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-sage-800" />
          <h2 className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
            AI Diagnostic Pipeline Chain
          </h2>
        </div>
        <span className="text-[10px] font-mono text-sage-600">
          End-to-End Fault Detection to Mission Risk Assessment Pipeline
        </span>
      </div>

      {/* Stage Flow Nodes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 py-1">
        {stages.map((stg, idx) => {
          const isCrit = stg.status === 'CRITICAL' || stg.status === 'HIGH';
          const isWarn = stg.status === 'WARNING' || stg.status === 'ELEVATED' || stg.status === 'MODERATE' || stg.status === 'SLIGHT';

          const nodeBg = isCrit
            ? 'bg-red-100/90 text-red-900 border-red-300 ring-2 ring-red-200 animate-pulse'
            : isWarn
            ? 'bg-amber-100/90 text-amber-900 border-amber-300'
            : 'bg-sage-50/90 text-sage-800 border-sage-200/80 hover:border-sage-300';

          const iconBg = isCrit
            ? 'bg-red-200 text-red-900'
            : isWarn
            ? 'bg-amber-200 text-amber-900'
            : 'bg-sage-200/80 text-sage-800';

          return (
            <div
              key={stg.id}
              className={`p-3 rounded-2xl border transition-all duration-300 flex flex-col justify-between relative ${nodeBg}`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`p-1.5 rounded-lg ${iconBg}`}>
                    {stg.icon}
                  </div>
                  {idx < stages.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-sage-400 hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10" />
                  )}
                </div>

                <span className="text-[10px] font-mono font-bold uppercase tracking-wider block text-sage-700">
                  {stg.label}
                </span>
                <span className="text-[9px] font-mono text-sage-500 block">
                  {stg.subtext}
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-sage-200/60 font-mono text-[10px] font-bold truncate">
                {stg.activeVal}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
