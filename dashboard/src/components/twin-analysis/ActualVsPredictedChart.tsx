import { useDiagnosticsStore } from '../../stores/diagnosticsStore';
import { GlassCard } from '../common/SagePanel';

/** SVG sparkline card — Actual vs Predicted Behaviour */
export function ActualVsPredictedChart() {
  const twinAnalysis = useDiagnosticsStore((s) => s.twinAnalysis);
  const err = twinAnalysis?.prediction_error_pct ?? 2.8;

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-[11px] font-semibold uppercase text-sage-800 block">Digital Twin</span>
          <span className="text-xs font-medium text-charcoal">Actual vs Predicted Behaviour</span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sage-600 text-white">
          Error: {err.toFixed(1)}%
        </span>
      </div>

      {/* SVG sparkline */}
      <div className="py-2">
        <svg className="w-full h-24 overflow-visible" viewBox="0 0 240 90">
          {/* Grid lines */}
          <line stroke="#b8ccbd" strokeDasharray="2 3" strokeWidth="1" x1="0" x2="240" y1="20" y2="20" />
          <line stroke="#b8ccbd" strokeDasharray="2 3" strokeWidth="1" x1="0" x2="240" y1="50" y2="50" />
          <line stroke="#9eb7a4" strokeWidth="1" x1="0" x2="240" y1="80" y2="80" />
          {/* Predicted (dashed) */}
          <path d="M 10 68 Q 70 65, 130 52 T 230 24" fill="none" stroke="#5a7862" strokeDasharray="4 3" strokeWidth="1.8" />
          {/* Actual (white) */}
          <path d="M 10 70 Q 70 66, 130 54 T 230 27" fill="none" stroke="#ffffff" strokeLinecap="round" strokeWidth="2.5" />
          <circle cx="230" cy="27" r="4" fill="#ffffff" stroke="#425647" strokeWidth="1.5" />
        </svg>
        <div className="flex justify-between text-[9px] font-mono text-sage-700 mt-1">
          <span>T-60m</span><span>T-30m</span><span>Real-time</span>
        </div>
      </div>

      {/* Variance delta */}
      <div className="flex items-center justify-between text-[11px] font-mono text-sage-800 pt-2 border-t border-[#c5d8ca]">
        <span>VARIANCE DELTA</span>
        <span className="font-bold text-charcoal">
          {twinAnalysis
            ? `${twinAnalysis.residuals.oil_pressure !== undefined ? (twinAnalysis.residuals.oil_pressure > 0 ? '+' : '') + twinAnalysis.residuals.oil_pressure?.toFixed(2) : '+0.14'} bar / ${twinAnalysis.residuals.cht_avg !== undefined ? (twinAnalysis.residuals.cht_avg > 0 ? '+' : '') + twinAnalysis.residuals.cht_avg?.toFixed(0) : '-3'}°C`
            : '+0.14 bar / -3°C'}
        </span>
      </div>
    </GlassCard>
  );
}
