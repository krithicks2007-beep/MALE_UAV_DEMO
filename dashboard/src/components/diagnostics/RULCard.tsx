import { useDiagnosticsStore } from '../../stores/diagnosticsStore';
import { GlassCard } from '../common/SagePanel';

export function RULCard() {
  const diagnostics = useDiagnosticsStore((s) => s.diagnostics);

  const rul = diagnostics?.rul_value ?? 1240;
  const conf = diagnostics?.rul_confidence ?? 87;

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-sage-800 uppercase tracking-wider">
          Remaining Useful Life
        </span>
        <span className="material-symbols-outlined text-[16px] text-sage-700">hourglass_bottom</span>
      </div>
      <div className="flex items-baseline justify-between mt-1">
        <div>
          <span className="text-[10px] font-mono uppercase text-sage-600 block">Estimated Service</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-light text-charcoal font-sans">
              {rul !== null ? rul.toLocaleString() : '—'}
            </span>
            <span className="text-xs font-mono text-sage-600">h</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono uppercase text-sage-600 block">Confidence</span>
          <span className="text-xl font-bold text-sage-800 font-sans">{conf ?? '—'}%</span>
        </div>
      </div>
      <p className="text-[9px] font-mono text-sage-500 mt-2 italic">
        Demo estimate only — not validated AI prediction
      </p>
    </GlassCard>
  );
}
