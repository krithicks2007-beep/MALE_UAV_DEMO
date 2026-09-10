import { useTelemetryStore } from '../stores/telemetryStore';
import { useHealthStore } from '../stores/healthStore';
import { useConnectionStore } from '../stores/connectionStore';
import { MetricCard } from '../components/common/MetricCard';
import { EngineHealthCard } from '../components/health/EngineHealthCard';
import { OperationalTelemetryCard } from '../components/telemetry/OperationalTelemetryCard';
import { TwinStagePanel } from '../components/twin/TwinStagePanel';
import { SagePanel, SagePanelHeader } from '../components/common/SagePanel';
import { ActualVsPredictedChart } from '../components/twin-analysis/ActualVsPredictedChart';
import { AIInsightCard } from '../components/diagnostics/AIInsightCard';
import { RULCard } from '../components/diagnostics/RULCard';
import { MissionFeasibilityCard } from '../components/diagnostics/MissionFeasibilityCard';
import { DegradationTrendChart } from '../components/trends/DegradationTrendChart';
import { MissionTimeline } from '../components/mission/MissionTimeline';

export function MainDashboardPage() {
  const telemetry = useTelemetryStore((s) => s.telemetry);
  const context = useTelemetryStore((s) => s.context);
  const health = useHealthStore((s) => s.health);
  const setActiveTab = useConnectionStore((s) => s.setActiveTab);

  return (
    <main className="max-w-[1560px] mx-auto px-6 lg:px-10 py-7 space-y-6">

      {/* ── Row 1: Top Summary Cards ─────────────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-white/60 backdrop-blur-sm p-5 rounded-3xl border border-[#dbe3dc] shadow-sm">
        <MetricCard
          label="Altitude"
          value={context?.altitude_m != null ? Math.round(context.altitude_m).toLocaleString() : '—'}
          unit="m"
          icon={<span className="material-symbols-outlined text-[20px]">arrow_upward</span>}
          iconBg="bg-sage-100/70 text-sage-700"
        />
        <MetricCard
          label="Fuel"
          value={context?.fuel_quantity_pct != null ? Math.round(context.fuel_quantity_pct) : '—'}
          unit="%"
          icon={<span className="material-symbols-outlined text-[20px]">local_gas_station</span>}
          iconBg="bg-sage-100/70 text-sage-700"
        />
        <MetricCard
          label="Ambient Temperature"
          value={context?.ambient_temp_c != null ? Math.round(context.ambient_temp_c) : '—'}
          unit="°C"
          icon={<span className="material-symbols-outlined text-[20px]">thermostat</span>}
          iconBg="bg-[#f3eae1] text-amber-700"
        />
        <MetricCard
          label="Engine Health"
          value={health?.index != null ? Math.round(health.index) : '—'}
          unit="%"
          icon={<span className="material-symbols-outlined text-[20px]">check_circle</span>}
          iconBg="bg-[#dceee0] text-emerald-700"
          valueClass="text-sage-800"
        />
      </section>

      {/* ── Predictive AI Mission Completion & Safe Return Predictor ──── */}
      <MissionFeasibilityCard />

      {/* ── Row 2: Main 3-Panel Bento ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* Left Column: Health + Telemetry */}
        <section className="lg:col-span-3 flex flex-col gap-6">
          <EngineHealthCard />
          <OperationalTelemetryCard />
        </section>

        {/* Center: 3D Twin Stage */}
        <TwinStagePanel />

        {/* Right: Sage Tinted Panel */}
        <SagePanel className="lg:col-span-3 justify-between">
          <SagePanelHeader
            title="Digital Twin Telemetry"
            icon={<span className="material-symbols-outlined text-[18px] text-sage-800">analytics</span>}
            right={
              <button
                onClick={() => setActiveTab('twin-analysis')}
                className="px-2.5 py-1 rounded-xl bg-charcoal text-white text-[11px] font-mono hover:bg-black transition-colors flex items-center gap-1"
                title="Open Deep Twin Analysis"
              >
                <span>Residuals</span>
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </button>
            }
          />
          <ActualVsPredictedChart />
          <AIInsightCard />
          <RULCard />
        </SagePanel>
      </div>

      {/* ── Row 3: Bottom Charts ──────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DegradationTrendChart />
        <MissionTimeline />
      </section>

    </main>
  );
}
