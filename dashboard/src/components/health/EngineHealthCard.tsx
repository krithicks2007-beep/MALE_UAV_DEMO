import { useHealthStore } from '../../stores/healthStore';
import { SectionCard, CardHeader } from '../common/SectionCard';
import { StatusPill } from '../common/StatusPill';
import { SemiArcGauge } from '../common/SemiArcGauge';
import { ProgressBar } from '../common/ProgressBar';

const STATE_PILL: Record<string, { label: string; variant: 'nominal' | 'warning' | 'critical' }> = {
  NOMINAL:  { label: 'NOMINAL',  variant: 'nominal' },
  WARNING:  { label: 'WARNING',  variant: 'warning' },
  DEGRADED: { label: 'DEGRADED', variant: 'warning' },
  CRITICAL: { label: 'CRITICAL', variant: 'critical' },
};

export function EngineHealthCard() {
  const health = useHealthStore((s) => s.health);
  if (!health) return <SectionCard className="animate-pulse h-72" />;

  const pill = STATE_PILL[health.engine_state] ?? STATE_PILL.NOMINAL;
  const idx = Math.round(health.index);

  return (
    <SectionCard>
      <CardHeader
        title="Engine Health"
        right={<StatusPill label={pill.label} variant={pill.variant} />}
      />

      {/* Overall gauge */}
      <div className="p-5 rounded-2xl bg-sage-50/70 border border-[#e2eae3] mb-5 text-center relative overflow-hidden">
        <span className="text-xs text-sage-600 font-medium block">Overall Engine Health</span>
        <div className="mt-1 flex items-baseline justify-center gap-0.5">
          <span className="text-4xl font-light text-charcoal font-sans">{idx}</span>
          <span className="text-base text-sage-600 font-light">%</span>
        </div>
        <div className="flex justify-center mt-2">
          <SemiArcGauge value={health.index} size={128} strokeWidth={8} />
        </div>
      </div>

      {/* Subsystem breakdown */}
      <div className="space-y-3.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-sage-600 block">
          Subsystem Health Breakdown
        </span>
        <ProgressBar label="Mechanical Health" value={health.subsystems.mechanical} />
        <ProgressBar label="Thermal Health"    value={health.subsystems.thermal} />
        <ProgressBar label="Lubrication Health" value={health.subsystems.lubrication} />
        <ProgressBar label="Combustion Health"  value={health.subsystems.combustion} />
      </div>
    </SectionCard>
  );
}
