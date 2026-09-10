import React from 'react';
import { useTelemetryStore } from '../../stores/telemetryStore';
import { TelemetryTrendCard } from './TelemetryTrendCard';
import { Droplets, Thermometer, Activity, Flame } from 'lucide-react';

export function SecondaryHealthTrendsGrid() {
  const telemetry = useTelemetryStore((s) => s.telemetry);
  const history = useTelemetryStore((s) => s.history);

  // Channel indexes: 2: oil_pressure, 3: oil_temperature, 4: fuel_flow, 5: vibration
  const oilPressSamples = history[2] || [];
  const oilTempSamples = history[3] || [];
  const fuelFlowSamples = history[4] || [];
  const vibrationSamples = history[5] || [];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#dbe3dc] pb-3">
        <div>
          <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
            Secondary Subsystem Health Telemetry Trends
          </h2>
          <p className="text-xs font-mono text-sage-600">
            Mechanical &amp; fluid subsystem integrity telemetry: Lubrication, Thermal Fluid, Mechanical Vibration, Fuel
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Oil Pressure */}
        <TelemetryTrendCard
          title="Oil Pressure"
          unit="bar"
          currentValue={telemetry?.oil_pressure}
          samples={oilPressSamples}
          decimals={2}
          warnThreshold={3.2}
          critThreshold={2.5}
          isLowerThreshold
          icon={<Droplets className="w-4 h-4 text-sage-800" />}
        />

        {/* 2. Oil Temperature */}
        <TelemetryTrendCard
          title="Oil Temperature"
          unit="°C"
          currentValue={telemetry?.oil_temperature}
          samples={oilTempSamples}
          decimals={1}
          warnThreshold={115.0}
          critThreshold={125.0}
          icon={<Thermometer className="w-4 h-4 text-sage-800" />}
        />

        {/* 3. Engine Vibration */}
        <TelemetryTrendCard
          title="Engine Vibration"
          unit="mm/s"
          currentValue={telemetry?.vibration}
          samples={vibrationSamples}
          decimals={2}
          warnThreshold={5.0}
          critThreshold={7.5}
          icon={<Activity className="w-4 h-4 text-sage-800" />}
        />

        {/* 4. Fuel Flow */}
        <TelemetryTrendCard
          title="Fuel Flow Rate"
          unit="L/h"
          currentValue={telemetry?.fuel_flow}
          samples={fuelFlowSamples}
          decimals={1}
          warnThreshold={22.0}
          critThreshold={25.0}
          icon={<Flame className="w-4 h-4 text-sage-800" />}
        />
      </div>
    </section>
  );
}
