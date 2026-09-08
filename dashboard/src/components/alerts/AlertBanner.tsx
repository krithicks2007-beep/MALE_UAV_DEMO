import { useAlertStore } from '../../stores/alertStore';
import { useDiagnosticsStore } from '../../stores/diagnosticsStore';
import { useHealthStore } from '../../stores/healthStore';

export function AlertBanner() {
  const alerts = useAlertStore((s) => s.alerts);
  const diagnostics = useDiagnosticsStore((s) => s.diagnostics);
  const health = useHealthStore((s) => s.health);

  const activeAlerts = alerts.filter((a) => a.active);
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'CRITICAL' || a.severity === 'HIGH');
  const isCritical = criticalAlerts.length > 0 || diagnostics?.severity === 'CRITICAL' || health?.engine_state === 'CRITICAL';
  const isWarning = !isCritical && (activeAlerts.some((a) => a.severity === 'WARNING') || diagnostics?.severity === 'WARNING' || health?.engine_state === 'WARNING');

  if (!isCritical && !isWarning) {
    return null;
  }

  const mainAlert = criticalAlerts[0] || activeAlerts[0];
  const title = isCritical
    ? (mainAlert?.title || 'CRITICAL TAPAS DRDO UAV SAFETY LIMIT EXCEEDED')
    : (mainAlert?.title || 'TAPAS DRDO UAV OPERATIONAL WARNING');

  const desc = mainAlert?.description || (diagnostics?.evidence?.[0] ?? 'Engine telemetry parameters deviating from standard flight envelope.');

  return (
    <div
      className={`w-full p-4 rounded-3xl border shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 animate-pulse ${
        isCritical
          ? 'bg-red-950/80 border-red-500 text-white shadow-red-900/40'
          : 'bg-amber-950/80 border-amber-500 text-white shadow-amber-900/30'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${
            isCritical ? 'bg-red-600' : 'bg-amber-500'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">
            {isCritical ? 'emergency' : 'warning'}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isCritical ? 'bg-red-500/30 text-red-200 border border-red-400/40' : 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
              }`}
            >
              {isCritical ? 'RED CRITICAL ALERT • TAPAS DRDO LIMIT' : 'OPERATIONAL WARNING'}
            </span>
            <span className="text-xs font-mono text-slate-300">
              {diagnostics?.primary_fault !== 'NONE' ? diagnostics?.primary_fault : ''}
            </span>
          </div>
          <p className="text-sm font-bold tracking-tight text-white mt-0.5">{title}</p>
          <p className="text-xs text-slate-200 font-mono mt-0.5">{desc}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        <span className="text-xs font-mono text-slate-300 bg-black/40 px-3 py-1 rounded-full border border-white/10">
          Health: {health?.index ? `${Math.round(health.index)}%` : '--'}
        </span>
      </div>
    </div>
  );
}
