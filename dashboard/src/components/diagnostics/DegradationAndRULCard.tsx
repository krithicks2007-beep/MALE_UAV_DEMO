import React from 'react';
import { useDiagnosticsStore } from '../../stores/diagnosticsStore';
import { Hourglass, AlertOctagon } from 'lucide-react';

export function DegradationAndRULCard() {
  const diagnostics = useDiagnosticsStore((s) => s.diagnostics);

  const rulVal = diagnostics?.rul_value ?? null;
  const rulUnit = diagnostics?.rul_unit ?? 'HOURS';
  const rulConf = diagnostics?.rul_confidence ?? null;
  const failureRisk = diagnostics?.failure_risk_pct ?? null;
  const degradation = diagnostics?.degradation_status ?? 'NOMINAL';

  const degBadgeColor =
    degradation === 'SEVERE'
      ? 'bg-red-100 text-red-900 border-red-300 animate-pulse'
      : degradation === 'MODERATE'
      ? 'bg-orange-100 text-orange-900 border-orange-300'
      : degradation === 'SLIGHT'
      ? 'bg-amber-100 text-amber-900 border-amber-300'
      : 'bg-emerald-100 text-emerald-800 border-emerald-300';

  const riskBadgeColor =
    failureRisk === null
      ? 'bg-sage-100 text-sage-600 border-sage-200'
      : failureRisk > 20
      ? 'bg-red-100 text-red-900 border-red-300 animate-pulse'
      : failureRisk > 8
      ? 'bg-amber-100 text-amber-900 border-amber-300'
      : 'bg-emerald-100 text-emerald-800 border-emerald-300';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* RUL Card */}
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-[#dbe3dc] shadow-sm flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between border-b border-[#dbe3dc] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sage-100 text-sage-800">
              <Hourglass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal uppercase tracking-wider font-mono">
                Remaining Useful Life (RUL)
              </h3>
              <span className="text-[11px] font-mono text-sage-600">Prognostic Maintenance Horizon</span>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-sage-100 text-sage-800 border border-sage-200">
            {rulConf !== null ? `${rulConf}% CONFIDENCE` : '—'}
          </span>
        </div>

        <div className="my-2 flex items-baseline justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-sage-600 block">ESTIMATED SERVICE TIME</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-light text-charcoal font-sans tracking-tight">
                {rulVal !== null ? rulVal.toLocaleString() : '—'}
              </span>
              <span className="text-sm font-mono font-bold text-sage-700 uppercase">{rulVal !== null ? rulUnit : ''}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-sage-600 block">DEGRADATION STATE</span>
            <span className={`inline-block px-3 py-1 mt-1 rounded-full text-xs font-mono font-bold border ${degBadgeColor}`}>
              {degradation}
            </span>
          </div>
        </div>

        {/* Visual RUL countdown progress track */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-sage-600">
            <span>CONSUMED LIFE</span>
            <span>REMAINING: {rulVal !== null ? `${rulVal} ${rulUnit}` : '—'}</span>
          </div>
          <div className="w-full h-3 bg-sage-100 rounded-full overflow-hidden border border-sage-200">
            <div
              className={`h-full transition-all duration-700 rounded-full ${
                rulVal !== null && rulVal < 100 ? 'bg-red-500' : rulVal !== null && rulVal < 500 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: rulVal !== null ? `${Math.min(100, Math.max(10, (rulVal / 2000) * 100))}%` : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Failure Risk Card */}
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-[#dbe3dc] shadow-sm flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between border-b border-[#dbe3dc] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-100 text-red-800">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal uppercase tracking-wider font-mono">
                Catastrophic Failure Risk
              </h3>
              <span className="text-[11px] font-mono text-sage-600 font-normal">Mission Reliability Metric</span>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${riskBadgeColor}`}>
            {failureRisk === null ? 'NO DATA' : failureRisk > 15 ? 'HIGH RISK' : failureRisk > 5 ? 'ELEVATED' : 'NOMINAL'}
          </span>
        </div>

        <div className="my-2 flex items-baseline justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-sage-600 block">PROBABILITY OF FAILURE</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-light text-charcoal font-sans tracking-tight">
                {failureRisk !== null ? failureRisk.toFixed(1) : '—'}
              </span>
              <span className="text-sm font-mono font-bold text-sage-700">%</span>
            </div>
          </div>

          <div className="text-right max-w-[160px]">
            <span className="text-[10px] font-mono uppercase text-sage-600 block">RECOMMENDED ACTION</span>
            <span className="text-xs font-mono font-bold text-charcoal block truncate mt-1">
              {failureRisk === null ? '—' : failureRisk > 15 ? 'IMMEDIATE LANDING' : failureRisk > 5 ? 'MONITOR CLOSELY' : 'CONTINUE MISSION'}
            </span>
          </div>
        </div>

        {/* Failure risk progress meter */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-sage-600">
            <span>SAFE THRESHOLD (&lt; 5%)</span>
            <span>CRITICAL (&gt; 15%)</span>
          </div>
          <div className="w-full h-3 bg-sage-100 rounded-full overflow-hidden border border-sage-200">
            <div
              className={`h-full transition-all duration-700 rounded-full ${
                failureRisk !== null && failureRisk > 15 ? 'bg-red-500' : failureRisk !== null && failureRisk > 5 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: failureRisk !== null ? `${Math.min(100, Math.max(5, failureRisk * 4))}%` : '0%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
