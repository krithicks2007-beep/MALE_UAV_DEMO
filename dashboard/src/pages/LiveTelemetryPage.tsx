import { useTelemetryStore } from '../stores/telemetryStore';
import { useHealthStore } from '../stores/healthStore';
import { PropulsionGaugeCard } from '../components/telemetry/PropulsionGaugeCard';
import { CylinderThermalCard } from '../components/telemetry/CylinderThermalCard';
import { FluidElectricalCard } from '../components/telemetry/FluidElectricalCard';
import { ChannelQualityMatrix } from '../components/telemetry/ChannelQualityMatrix';
import { MissionFeasibilityCard } from '../components/diagnostics/MissionFeasibilityCard';
import { MetricCard } from '../components/common/MetricCard';

export function LiveTelemetryPage() {
  const telemetry = useTelemetryStore((s) => s.telemetry);
  const context = useTelemetryStore((s) => s.context);
  const health = useHealthStore((s) => s.health);

  if (!telemetry) {
    return (
      <main className="max-w-[1560px] mx-auto px-6 lg:px-10 py-12 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-sage-300 border-t-sage-700 animate-spin" />
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-charcoal">Connecting to Telemetry Stream...</h2>
          <p className="text-xs text-sage-600 font-mono">
            Waiting for live WebSocket frames from Telemetry Gateway
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[1560px] mx-auto px-6 lg:px-10 py-7 space-y-6">
      {/* ── Top Header Bar: Frame Sequence, Flight Phase & SI Standard Indicator ─ */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-[#dbe3dc] shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage-100/80 border border-sage-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-charcoal">
              FRAME #{telemetry.frame_id}
            </span>
          </div>

          <div className="text-xs font-mono text-sage-600 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-sage-700">schedule</span>
            <span>{telemetry.timestamp.includes('T') ? telemetry.timestamp.split('T')[1].slice(0, 8) : telemetry.timestamp} UTC</span>
          </div>

          <span className="text-xs font-mono px-3 py-1 rounded-full bg-sage-50 text-sage-800 border border-sage-200 font-semibold uppercase">
            Phase: {context?.mission_phase ?? 'CRUISE'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* SI Standard Badge */}
          <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sage-100/90 border border-sage-300">
            <span className="material-symbols-outlined text-sm text-sage-800">straighten</span>
            <span className="text-xs font-mono font-bold text-charcoal tracking-wide">
              SI UNITS (ISO 80000)
            </span>
          </div>

          <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
            HEALTH: {health?.index != null ? `${Math.round(health.index)}%` : '93%'}
          </span>
        </div>
      </div>

      {/* ── Flight Context Atmospheric Strip ─────────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-white/60 backdrop-blur-sm p-5 rounded-3xl border border-[#dbe3dc] shadow-sm">
        <MetricCard
          label="Flight Altitude"
          value={context?.altitude_m != null ? Math.round(context.altitude_m).toLocaleString() : '8,467'}
          unit="m"
          icon={<span className="material-symbols-outlined text-[20px]">flight</span>}
          iconBg="bg-sage-100/70 text-sage-700"
        />
        <MetricCard
          label="Indicated Airspeed"
          value={context?.airspeed_kmh != null ? Math.round(context.airspeed_kmh) : '195'}
          unit="km/h"
          icon={<span className="material-symbols-outlined text-[20px]">air</span>}
          iconBg="bg-sage-100/70 text-sage-700"
        />
        <MetricCard
          label="Ambient Temperature"
          value={context?.ambient_temp_c != null ? Math.round(context.ambient_temp_c) : '14'}
          unit="°C"
          icon={<span className="material-symbols-outlined text-[20px]">ac_unit</span>}
          iconBg="bg-[#f3eae1] text-amber-700"
        />
        <MetricCard
          label="Fuel Quantity"
          value={context?.fuel_quantity_pct != null ? Math.round(context.fuel_quantity_pct) : '72'}
          unit="%"
          icon={<span className="material-symbols-outlined text-[20px]">local_gas_station</span>}
          iconBg="bg-[#dceee0] text-emerald-700"
        />
      </section>

      {/* ── Section 1: Mission Completion & Safe Return Predictor ─────────── */}
      <MissionFeasibilityCard />

      {/* ── Section 2: Propulsion & Core Power Dynamics ───────────────────── */}
      <PropulsionGaugeCard
        rpm={telemetry.rpm}
        map={telemetry.map}
        fuelFlow={telemetry.fuel_flow}
        vibration={telemetry.vibration}
        injectionTiming={telemetry.injection_timing}
      />

      {/* ── Section 3: 4-Cylinder Thermal Head & Exhaust Management ───────── */}
      <CylinderThermalCard
        cht={telemetry.cht}
        egt={telemetry.egt}
      />

      {/* ── Section 4: Lubrication & Electrical Power Subsystems ─────────── */}
      <FluidElectricalCard
        oilPressure={telemetry.oil_pressure}
        oilTemperature={telemetry.oil_temperature}
        batteryVoltage={telemetry.battery_voltage}
        alternatorCurrent={telemetry.alternator_current}
        flightContext={context}
      />

      {/* ── Section 5: Telemetry Gateway Channel Quality Matrix ───────────── */}
      <ChannelQualityMatrix telemetry={telemetry} />
    </main>
  );
}
