import React from 'react';
import { useDiagnosticsStore } from '../../stores/diagnosticsStore';
import { useTwinStore } from '../../stores/twinStore';
import { Brain, ShieldAlert, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export function AnomalyScoreCard() {
  const diagnostics = useDiagnosticsStore((s) => s.diagnostics);
  const twinState = useTwinStore((s) => s.twinState);

  const anomalyScore = diagnostics?.anomaly_score ?? 0;
  const scorePct = Math.round(anomalyScore * 100);
  const confidence = diagnostics?.confidence ?? 95;
  const severity = diagnostics?.severity ?? 'NOMINAL';
  const primaryFault = diagnostics?.primary_fault ?? 'NONE';

  const hasAnomaly = primaryFault !== 'NONE';

  const severityBadgeColor =
    severity === 'CRITICAL'
      ? 'bg-red-100 text-red-900 border-red-300 animate-pulse'
      : severity === 'HIGH'
      ? 'bg-orange-100 text-orange-900 border-orange-300'
      : severity === 'WARNING'
      ? 'bg-amber-100 text-amber-900 border-amber-300'
      : severity === 'INFO'
      ? 'bg-sky-100 text-sky-900 border-sky-300'
      : 'bg-emerald-100 text-emerald-800 border-emerald-300';

  const gaugeColor =
    scorePct > 70 ? '#dc2626' : scorePct > 35 ? '#d97706' : '#10b981';

  return (
    <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-[#dbe3dc] shadow-sm flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between border-b border-[#dbe3dc] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sage-100 text-sage-800">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-charcoal uppercase tracking-wider font-mono">
              AI Anomaly &amp; Fault Classification
            </h3>
            <span className="text-[11px] font-mono text-sage-600">Continuous Neural Fault Classifier</span>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${severityBadgeColor}`}>
          {severity}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Circular Anomaly Score SVG Arc */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-sage-50/70 rounded-2xl border border-sage-100">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#d3dfd5"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={gaugeColor}
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * scorePct) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-light text-charcoal font-sans">{scorePct}%</span>
              <span className="text-[9px] font-mono uppercase font-bold text-sage-600">ANOMALY SCORE</span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <span className="text-xs font-mono text-sage-600 block">Classification Confidence</span>
            <span className="text-sm font-bold font-mono text-sage-800">{confidence}% CONFIDENCE</span>
          </div>
        </div>

        {/* Right: Primary Fault & Subsystem Callouts */}
        <div className="md:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-[#dbe3dc] shadow-2xs space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-sage-600 block">
              PRIMARY FAULT DIAGNOSIS
            </span>
            <div className="flex items-center gap-2">
              {hasAnomaly ? (
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              )}
              <span className="text-lg font-bold text-charcoal font-mono tracking-tight">
                {primaryFault === 'NONE' ? 'NOMINAL / NO FAULT DETECTED' : primaryFault.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-sage-600 font-mono">
              {hasAnomaly
                ? `Active anomaly pattern identified in engine operating parameters. AI confidence rating: ${confidence}%.`
                : 'All engine telemetric signatures remain within trained physics baselines.'}
            </p>
          </div>

          {/* Affected Cylinders readout */}
          {twinState?.affected_cylinders && twinState.affected_cylinders.length > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono">
              <span className="font-semibold">AFFECTED CYLINDERS:</span>
              <span className="font-bold px-2 py-0.5 rounded bg-amber-200">
                CYL {twinState.affected_cylinders.map((c) => c + 1).join(', ')}
              </span>
            </div>
          )}

          {/* Action button */}
          <button className="w-full py-2.5 px-4 rounded-full bg-charcoal hover:bg-charcoal-hover text-white text-xs font-mono font-bold transition-all shadow-sm flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>ACKNOWLEDGE AI DIAGNOSTIC</span>
          </button>
        </div>
      </div>
    </div>
  );
}
