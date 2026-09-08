import { useDiagnosticsStore } from '../../stores/diagnosticsStore';
import { GlassCard } from '../common/SagePanel';
import { PillButton } from '../common/PillButton';

const SEVERITY_COLOR: Record<string, string> = {
  NOMINAL: 'text-emerald-700',
  INFO:    'text-blue-600',
  WARNING: 'text-amber-600',
  HIGH:    'text-amber-700',
  CRITICAL:'text-red-600',
};

export function AIInsightCard() {
  const diagnostics = useDiagnosticsStore((s) => s.diagnostics);

  if (!diagnostics) return <GlassCard className="animate-pulse h-36" />;

  const hasAnomaly = diagnostics.primary_fault !== 'NONE';
  const severityColor = SEVERITY_COLOR[diagnostics.severity] ?? 'text-sage-800';

  return (
    <>
      <GlassCard>
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#c5d8ca]">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${hasAnomaly ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <span className="text-xs font-bold uppercase tracking-wider text-sage-900">AI Engine Insight</span>
          </div>
          {hasAnomaly ? (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                diagnostics.severity === 'CRITICAL'
                  ? 'bg-red-100 text-red-900 border-red-300 animate-pulse'
                  : 'bg-[#faede1] text-amber-900 border-amber-200'
              }`}
            >
              {diagnostics.primary_fault.replace(/_/g, ' ')}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              NOMINAL
            </span>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-sage-700">Anomaly Score</span>
            <span className={`font-bold ${severityColor}`}>{(diagnostics.anomaly_score * 100).toFixed(0)}%</span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-sage-700">Anomaly Confidence</span>
            <span className="font-bold text-charcoal">{diagnostics.confidence}%</span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-sage-700">Failure Risk</span>
            <span className={`font-bold ${diagnostics.failure_risk_pct > 10 ? 'text-amber-700' : 'text-charcoal'}`}>
              {diagnostics.failure_risk_pct.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-sage-700">Predicted Fault</span>
            <span className="font-bold text-charcoal text-right ml-2 leading-tight">
              {diagnostics.primary_fault === 'NONE' ? 'NONE' : diagnostics.primary_fault.replace(/_/g, ' / ')}
            </span>
          </div>
        </div>
      </GlassCard>

      <PillButton
        variant="dark"
        className="mt-1"
        right={<span className="material-symbols-outlined text-[16px]">tune</span>}
      >
        Acknowledge Diagnostic
      </PillButton>
    </>
  );
}
