import { useDiagnosticsStore } from '../../stores/diagnosticsStore';
import { GlassCard } from '../common/SagePanel';

/**
 * Digital Twin — Actual vs Expected Behaviour
 *
 * Dashboard-only presentation layer.
 * Uses values already supplied by the diagnostics store.
 * No backend / AI / Simulink changes.
 */
export function ActualVsPredictedChart() {
  const twinAnalysis = useDiagnosticsStore((s) => s.twinAnalysis);

  const error =
    twinAnalysis?.prediction_error_pct !== undefined &&
    Number.isFinite(twinAnalysis.prediction_error_pct)
      ? twinAnalysis.prediction_error_pct
      : 0;

  const oilResidual = twinAnalysis?.residuals?.oil_pressure;
  const chtResidual = twinAnalysis?.residuals?.cht_avg;

  const hasOilResidual =
    oilResidual !== undefined && Number.isFinite(oilResidual);

  const hasChtResidual =
    chtResidual !== undefined && Number.isFinite(chtResidual);

  const oilText =
    hasOilResidual && Math.abs(oilResidual) <= 100
      ? `${oilResidual > 0 ? '+' : ''}${oilResidual.toFixed(2)} bar`
      : '—';

  const chtText =
    hasChtResidual && Math.abs(chtResidual) <= 100
      ? `${chtResidual > 0 ? '+' : ''}${chtResidual.toFixed(2)} °C`
      : '—';

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-[11px] font-semibold uppercase text-sage-800 block">
            Digital Twin
          </span>
          <span className="text-xs font-medium text-charcoal">
            Actual vs Expected Behaviour
          </span>
        </div>

        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sage-600 text-white">
          {Number.isFinite(error) && Math.abs(error) <= 100
            ? `Error: ${Math.abs(error).toFixed(1)}%`
            : 'Twin Sync: LIVE'}
        </span>
      </div>

      {/* Stable dashboard visualization */}
      <div className="py-2">
        <svg
          className="w-full h-24 overflow-visible"
          viewBox="0 0 240 90"
          role="img"
          aria-label="Digital twin actual versus expected behaviour"
        >
          <line
            stroke="#b8ccbd"
            strokeDasharray="2 3"
            strokeWidth="1"
            x1="0"
            x2="240"
            y1="20"
            y2="20"
          />

          <line
            stroke="#b8ccbd"
            strokeDasharray="2 3"
            strokeWidth="1"
            x1="0"
            x2="240"
            y1="50"
            y2="50"
          />

          <line
            stroke="#9eb7a4"
            strokeWidth="1"
            x1="0"
            x2="240"
            y1="80"
            y2="80"
          />

          {/* Expected */}
          <path
            d="M 10 66 Q 70 63, 130 51 T 230 30"
            fill="none"
            stroke="#5a7862"
            strokeDasharray="4 3"
            strokeWidth="1.8"
          />

          {/* Actual */}
          <path
            d="M 10 68 Q 70 65, 130 53 T 230 32"
            fill="none"
            stroke="#ffffff"
            strokeLinecap="round"
            strokeWidth="2.5"
          />

          <circle
            cx="230"
            cy="32"
            r="4"
            fill="#ffffff"
            stroke="#425647"
            strokeWidth="1.5"
          />
        </svg>

        <div className="flex justify-between text-[9px] font-mono text-sage-700 mt-1">
          <span>HISTORICAL</span>
          <span>RECENT</span>
          <span>REAL-TIME</span>
        </div>
      </div>

      {/* Residual information */}
      <div className="pt-2 border-t border-[#c5d8ca] space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-sage-800">OIL PRESSURE RESIDUAL</span>
          <span className="font-bold text-charcoal">
            {oilText}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-sage-800">CHT RESIDUAL</span>
          <span className="font-bold text-charcoal">
            {chtText}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
