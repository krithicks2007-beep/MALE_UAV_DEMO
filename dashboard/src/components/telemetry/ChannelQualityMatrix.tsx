import { SectionCard } from '../common/SectionCard';
import type { TelemetryData } from '../../models/telemetry';

interface ChannelQualityMatrixProps {
  telemetry: TelemetryData;
}

export function ChannelQualityMatrix({ telemetry }: ChannelQualityMatrixProps) {
  // Real-time channel sanity checks matching telemetry.gateway.quality rules
  const channels = [
    { name: 'RPM Sensor', pin: 'CH-01', value: `${Math.round(telemetry.rpm)} RPM`, status: telemetry.rpm > 0 && telemetry.rpm < 7000 ? 'GOOD' : 'DEGRADED' },
    { name: 'Manifold Pressure (MAP)', pin: 'CH-02', value: `${telemetry.map.toFixed(2)} bar`, status: telemetry.map > 0.2 && telemetry.map < 2.0 ? 'GOOD' : 'DEGRADED' },
    { name: 'Cyl 1 CHT Head Probe', pin: 'CH-03', value: `${telemetry.cht[0]?.toFixed(1) ?? '--'}°C`, status: (telemetry.cht[0] ?? 0) > 40 && (telemetry.cht[0] ?? 0) < 220 ? 'GOOD' : 'DEGRADED' },
    { name: 'Cyl 2 CHT Head Probe', pin: 'CH-04', value: `${telemetry.cht[1]?.toFixed(1) ?? '--'}°C`, status: (telemetry.cht[1] ?? 0) > 40 && (telemetry.cht[1] ?? 0) < 220 ? 'GOOD' : 'DEGRADED' },
    { name: 'Cyl 3 CHT Head Probe', pin: 'CH-05', value: `${telemetry.cht[2]?.toFixed(1) ?? '--'}°C`, status: (telemetry.cht[2] ?? 0) > 40 && (telemetry.cht[2] ?? 0) < 220 ? 'GOOD' : 'DEGRADED' },
    { name: 'Cyl 4 CHT Head Probe', pin: 'CH-06', value: `${telemetry.cht[3]?.toFixed(1) ?? '--'}°C`, status: (telemetry.cht[3] ?? 0) > 40 && (telemetry.cht[3] ?? 0) < 220 ? 'GOOD' : 'DEGRADED' },
    { name: 'Cyl 1 EGT Thermocouple', pin: 'CH-07', value: `${telemetry.egt[0]?.toFixed(0) ?? '--'}°C`, status: (telemetry.egt[0] ?? 0) > 400 && (telemetry.egt[0] ?? 0) < 850 ? 'GOOD' : (telemetry.egt[0] ?? 0) === 0 ? 'INVALID' : 'DEGRADED' },
    { name: 'Cyl 2 EGT Thermocouple', pin: 'CH-08', value: `${telemetry.egt[1]?.toFixed(0) ?? '--'}°C`, status: (telemetry.egt[1] ?? 0) > 400 && (telemetry.egt[1] ?? 0) < 850 ? 'GOOD' : 'DEGRADED' },
    { name: 'Cyl 3 EGT Thermocouple', pin: 'CH-09', value: `${telemetry.egt[2]?.toFixed(0) ?? '--'}°C`, status: (telemetry.egt[2] ?? 0) > 400 && (telemetry.egt[2] ?? 0) < 850 ? 'GOOD' : 'DEGRADED' },
    { name: 'Cyl 4 EGT Thermocouple', pin: 'CH-10', value: `${telemetry.egt[3]?.toFixed(0) ?? '--'}°C`, status: (telemetry.egt[3] ?? 0) > 400 && (telemetry.egt[3] ?? 0) < 850 ? 'GOOD' : 'DEGRADED' },
    { name: 'Main Oil Pressure Line', pin: 'CH-11', value: `${telemetry.oil_pressure.toFixed(2)} bar`, status: telemetry.oil_pressure >= 2.0 && telemetry.oil_pressure <= 6.5 ? 'GOOD' : 'DEGRADED' },
    { name: 'Oil Sump Thermistor', pin: 'CH-12', value: `${telemetry.oil_temperature.toFixed(1)}°C`, status: telemetry.oil_temperature >= 40 && telemetry.oil_temperature <= 130 ? 'GOOD' : 'DEGRADED' },
    { name: 'Fuel Flow Mass Meter', pin: 'CH-13', value: `${telemetry.fuel_flow.toFixed(1)} L/h`, status: telemetry.fuel_flow >= 0 && telemetry.fuel_flow <= 65 ? 'GOOD' : 'DEGRADED' },
    { name: 'Tri-Axial Accelerometer', pin: 'CH-14', value: `${telemetry.vibration.toFixed(2)} mm/s`, status: telemetry.vibration >= 0 && telemetry.vibration <= 8.5 ? 'GOOD' : 'DEGRADED' },
    { name: 'Main Bus Transducer', pin: 'CH-15', value: `${telemetry.battery_voltage.toFixed(1)} V`, status: telemetry.battery_voltage >= 18 && telemetry.battery_voltage <= 32 ? 'GOOD' : 'DEGRADED' },
    { name: 'Alternator Shunt Meter', pin: 'CH-16', value: `${telemetry.alternator_current.toFixed(1)} A`, status: telemetry.alternator_current >= 0 && telemetry.alternator_current <= 60 ? 'GOOD' : 'DEGRADED' },
  ];

  return (
    <SectionCard className="flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#dbe3dc]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-xl text-sage-800">grid_view</span>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal">
              Telemetry Gateway Sensor Quality Matrix
            </h3>
            <span className="text-xs text-sage-600 font-mono">
              Live Channel Parity & Boundary Verification (Conforming to Telemetry Gateway Section 7)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Good: {channels.filter(c => c.status === 'GOOD').length}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Degraded: {channels.filter(c => c.status === 'DEGRADED').length}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Invalid: {channels.filter(c => c.status === 'INVALID').length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {channels.map((ch, idx) => {
          const isGood = ch.status === 'GOOD';
          const isInvalid = ch.status === 'INVALID';
          const isDegraded = ch.status === 'DEGRADED';

          return (
            <div
              key={idx}
              className={`p-2.5 rounded-2xl border transition-all text-xs font-mono flex flex-col justify-between ${
                isInvalid
                  ? 'bg-red-50/70 border-red-300'
                  : isDegraded
                  ? 'bg-amber-50/70 border-amber-300'
                  : 'bg-white/80 border-[#dce4de]'
              }`}
            >
              <div className="flex items-center justify-between text-[9px] text-sage-600">
                <span>{ch.pin}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isInvalid ? 'bg-red-600 animate-ping' : isDegraded ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
              </div>
              <div className="font-bold text-[11px] text-charcoal truncate mt-1" title={ch.name}>
                {ch.name}
              </div>
              <div className="text-[10px] font-bold text-sage-800 mt-0.5 truncate">
                {ch.value}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
