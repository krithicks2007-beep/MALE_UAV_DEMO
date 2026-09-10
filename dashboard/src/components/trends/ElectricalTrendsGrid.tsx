import React from 'react';
import { useTelemetryStore } from '../../stores/telemetryStore';
import { TelemetryTrendCard } from './TelemetryTrendCard';
import { Zap, Gauge } from 'lucide-react';

export function ElectricalTrendsGrid() {
  const telemetry = useTelemetryStore((s) => s.telemetry);
  const history = useTelemetryStore((s) => s.history);

  // Channel indexes: 6: battery_voltage, 7: alternator_current, 8: injection_timing
  const batterySamples = history[6] || [];
  const alternatorSamples = history[7] || [];
  const injectionSamples = history[8] || [];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#dbe3dc] pb-3">
        <div>
          <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
            Electrical System &amp; Timing Telemetry Trends
          </h2>
          <p className="text-xs font-mono text-sage-600">
            Avionics bus electrical power metrics &amp; engine fuel injection ignition timing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* 1. Battery Voltage */}
        <TelemetryTrendCard
          title="Battery Bus Voltage"
          unit="V"
          currentValue={telemetry?.battery_voltage}
          samples={batterySamples}
          decimals={1}
          warnThreshold={24.0}
          critThreshold={22.0}
          isLowerThreshold
          icon={<Zap className="w-4 h-4 text-sage-800" />}
        />

        {/* 2. Alternator Current */}
        <TelemetryTrendCard
          title="Alternator Current Output"
          unit="A"
          currentValue={telemetry?.alternator_current}
          samples={alternatorSamples}
          decimals={1}
          warnThreshold={40.0}
          critThreshold={45.0}
          icon={<Zap className="w-4 h-4 text-sage-800" />}
        />

        {/* 3. Fuel Injection Timing */}
        <TelemetryTrendCard
          title="Fuel Injection Timing"
          unit="°BTDC"
          currentValue={telemetry?.injection_timing}
          samples={injectionSamples}
          decimals={1}
          warnThreshold={28.0}
          critThreshold={32.0}
          icon={<Gauge className="w-4 h-4 text-sage-800" />}
        />
      </div>
    </section>
  );
}
