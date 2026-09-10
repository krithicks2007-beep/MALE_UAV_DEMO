import React from 'react';
import { useTelemetryStore } from '../../stores/telemetryStore';
import { TelemetryTrendCard } from './TelemetryTrendCard';
import { Gauge, Activity, Thermometer, Flame } from 'lucide-react';

export function PrimaryEngineTrendsGrid() {
  const telemetry = useTelemetryStore((s) => s.telemetry);
  const history = useTelemetryStore((s) => s.history);

  // Channel indexes in telemetryStore history:
  // 0: rpm, 1: map, 2: oil_press, 3: oil_temp, 4: fuel_flow, 5: vibration, 6: batt_v, 7: alt_curr, 8: inj_timing, 9: cht[0], 10: egt[0]

  const rpmSamples = history[0] || [];
  const mapSamples = history[1] || [];

  // Compute live CHT and EGT averages
  const chtAvg = telemetry?.cht ? telemetry.cht.reduce((a, b) => a + b, 0) / telemetry.cht.length : null;
  const egtAvg = telemetry?.egt ? telemetry.egt.reduce((a, b) => a + b, 0) / telemetry.egt.length : null;

  const chtSamples = history[9] || [];
  const egtSamples = history[10] || [];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#dbe3dc] pb-3">
        <div>
          <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
            Primary Engine Performance Telemetry Trends
          </h2>
          <p className="text-xs font-mono text-sage-600">
            Dominant propulsion telemetry parameters: RPM, Manifold Air Pressure, Thermal Profiles
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Engine Speed RPM */}
        <TelemetryTrendCard
          title="Engine Speed"
          unit="rpm"
          currentValue={telemetry?.rpm}
          samples={rpmSamples}
          decimals={0}
          warnThreshold={5500}
          critThreshold={5800}
          icon={<Gauge className="w-4 h-4 text-sage-800" />}
          isPrimary
        />

        {/* 2. Manifold Pressure MAP */}
        <TelemetryTrendCard
          title="Manifold Absolute Pressure"
          unit="bar"
          currentValue={telemetry?.map}
          samples={mapSamples}
          decimals={2}
          warnThreshold={1.25}
          critThreshold={1.40}
          icon={<Activity className="w-4 h-4 text-sage-800" />}
          isPrimary
        />

        {/* 3. CHT Average */}
        <TelemetryTrendCard
          title="Cylinder Head Temperature (CHT Avg)"
          unit="°C"
          currentValue={chtAvg}
          samples={chtSamples}
          decimals={1}
          warnThreshold={200.0}
          critThreshold={215.0}
          icon={<Thermometer className="w-4 h-4 text-sage-800" />}
          isPrimary
        />

        {/* 4. EGT Average */}
        <TelemetryTrendCard
          title="Exhaust Gas Temperature (EGT Avg)"
          unit="°C"
          currentValue={egtAvg}
          samples={egtSamples}
          decimals={1}
          warnThreshold={750.0}
          critThreshold={780.0}
          icon={<Flame className="w-4 h-4 text-sage-800" />}
          isPrimary
        />
      </div>
    </section>
  );
}
