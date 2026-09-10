import React from 'react';
import { useDiagnosticsStore } from '../../stores/diagnosticsStore';
import { useHealthStore } from '../../stores/healthStore';
import { useScenarioStore } from '../../stores/scenarioStore';
import { Radio, Database, ShieldCheck, AlertTriangle } from 'lucide-react';

interface ReplayStatusPanelProps {
  currentTimestamp: number | null;
  currentFrame: number;
  totalFrames: number;
}

export function ReplayStatusPanel({ currentTimestamp, currentFrame, totalFrames }: ReplayStatusPanelProps) {
  const diagnostics = useDiagnosticsStore((s) => s.diagnostics);
  const health = useHealthStore((s) => s.health);
  const activeScenario = useScenarioStore((s) => s.activeScenario);

  const timestampText = currentTimestamp
    ? new Date(currentTimestamp * 1000).toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
    : '—';

  const hasFault = diagnostics?.primary_fault && diagnostics.primary_fault !== 'NONE';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Card: RECORDED REPLAY BUFFER METADATA */}
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-[#dbe3dc] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#dbe3dc] pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-700" />
            <h3 className="text-xs font-bold text-charcoal font-mono uppercase tracking-wider">
              RECORDED REPLAY BUFFER DATA
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-100 text-cyan-800 border border-cyan-300">
            BUFFER HISTORY
          </span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          <div className="flex justify-between py-1 border-b border-sage-100">
            <span className="text-sage-600">Selected Frame Timestamp:</span>
            <span className="font-bold text-charcoal">{timestampText}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-sage-100">
            <span className="text-sage-600">Selected Frame Index:</span>
            <span className="font-bold text-charcoal">{totalFrames > 0 ? `${currentFrame + 1} of ${totalFrames}` : '—'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-sage-100">
            <span className="text-sage-600">Buffer Architecture:</span>
            <span className="font-bold text-sage-800">Circular Buffer (~300 Samples @ 2 Hz)</span>
          </div>
        </div>

        <p className="text-[10px] font-mono text-sage-500 italic">
          Recorded telemetry buffer preserves historical sensor frames for post-flight telemetry analysis.
        </p>
      </div>

      {/* Right Card: LIVE SYSTEM STATE (Explicitly labeled LIVE) */}
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-[#dbe3dc] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#dbe3dc] pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-600 animate-pulse" />
            <h3 className="text-xs font-bold text-charcoal font-mono uppercase tracking-wider">
              LIVE SYSTEM STATE
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            LIVE SYSTEM
          </span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          <div className="flex justify-between py-1 border-b border-sage-100">
            <span className="text-sage-600">Current Health Index:</span>
            <span className="font-bold text-emerald-700">
              {health?.index != null ? `${health.index.toFixed(1)}%` : '—'}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-sage-100">
            <span className="text-sage-600">Active Scenario:</span>
            <span className="font-bold text-charcoal">{activeScenario}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-sage-100">
            <span className="text-sage-600">Current AI Fault Diagnosis:</span>
            <span className={`font-bold ${hasFault ? 'text-amber-800' : 'text-emerald-800'}`}>
              {diagnostics?.primary_fault ? diagnostics.primary_fault.replace(/_/g, ' ') : 'NOMINAL'}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-sage-100">
            <span className="text-sage-600">Current Failure Risk:</span>
            <span className={`font-bold ${diagnostics?.failure_risk_pct && diagnostics.failure_risk_pct > 15 ? 'text-red-700' : 'text-sage-800'}`}>
              {diagnostics?.failure_risk_pct != null ? `${diagnostics.failure_risk_pct.toFixed(1)}%` : '—'}
            </span>
          </div>
        </div>

        <p className="text-[10px] font-mono text-sage-500 italic">
          Live AI diagnostics, health, and scenario state represent current real-time hardware status.
        </p>
      </div>
    </div>
  );
}
