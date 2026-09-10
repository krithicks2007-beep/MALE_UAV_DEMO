import React from 'react';
import { Gauge, Activity, Thermometer, Flame, Droplets, Zap, ShieldAlert } from 'lucide-react';

interface ReplayFrameData {
  rpm: number | null;
  map: number | null;
  oil_pressure: number | null;
  oil_temperature: number | null;
  fuel_flow: number | null;
  vibration: number | null;
  battery_voltage: number | null;
  alternator_current: number | null;
  injection_timing: number | null;
  cht_avg: number | null;
  egt_avg: number | null;
  timestamp: number | null;
}

interface ReplayTelemetryGridProps {
  frameData: ReplayFrameData | null;
  totalFrames: number;
}

function Cell({
  label,
  value,
  unit,
  decimals = 1,
  warn,
  crit,
  icon,
}: {
  label: string;
  value: number | null;
  unit: string;
  decimals?: number;
  warn?: boolean;
  crit?: boolean;
  icon: React.ReactNode;
}) {
  const hasValue = value !== null && value !== undefined && Number.isFinite(value);
  const statusBadge = !hasValue
    ? 'bg-sage-100 text-sage-600 border-sage-200'
    : crit
    ? 'bg-red-100 text-red-900 border-red-300 animate-pulse'
    : warn
    ? 'bg-amber-100 text-amber-900 border-amber-300'
    : 'bg-emerald-100 text-emerald-800 border-emerald-300';

  return (
    <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-[#dbe3dc] shadow-sm flex flex-col justify-between space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sage-100 text-sage-800">
            {icon}
          </div>
          <span className="text-xs font-bold text-charcoal font-mono uppercase tracking-wider">{label}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${statusBadge}`}>
          {!hasValue ? 'NO DATA' : crit ? 'CRITICAL' : warn ? 'WARNING' : 'NOMINAL'}
        </span>
      </div>

      <div className="flex items-baseline justify-between pt-1">
        <span className="text-[10px] font-mono text-sage-600 uppercase">RECORDED FRAME VALUE</span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-charcoal font-mono tracking-tight">
            {hasValue ? value!.toFixed(decimals) : '—'}
          </span>
          <span className="text-xs font-mono font-bold text-sage-700">{unit}</span>
        </div>
      </div>
    </div>
  );
}

export function ReplayTelemetryGrid({ frameData, totalFrames }: ReplayTelemetryGridProps) {
  if (totalFrames === 0 || !frameData) {
    return (
      <div className="p-12 rounded-3xl bg-white/70 backdrop-blur-md border border-[#dbe3dc] shadow-sm text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-sage-400 mx-auto" />
        <h3 className="text-lg font-bold text-charcoal font-mono uppercase">
          NO RECORDED TELEMETRY HISTORY AVAILABLE
        </h3>
        <p className="text-xs font-mono text-sage-600 max-w-lg mx-auto">
          The telemetry history buffer currently contains no recorded frames. Connect the live stream or execute a test scenario to record telemetry into the circular buffer.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#dbe3dc] pb-3">
        <div>
          <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
            Recorded Telemetry Channel Readouts (Replay Frame)
          </h2>
          <p className="text-xs font-mono text-sage-600">
            Recorded telemetric data values strictly extracted from the selected historical buffer frame
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Cell
          label="Engine Speed"
          value={frameData.rpm}
          unit="rpm"
          decimals={0}
          warn={frameData.rpm !== null && frameData.rpm > 5500}
          crit={frameData.rpm !== null && frameData.rpm > 5800}
          icon={<Gauge className="w-4 h-4 text-sage-800" />}
        />
        <Cell
          label="Manifold Pressure"
          value={frameData.map}
          unit="bar"
          decimals={2}
          warn={frameData.map !== null && frameData.map > 1.25}
          crit={frameData.map !== null && frameData.map > 1.40}
          icon={<Activity className="w-4 h-4 text-sage-800" />}
        />
        <Cell
          label="CHT Average"
          value={frameData.cht_avg}
          unit="°C"
          decimals={1}
          warn={frameData.cht_avg !== null && frameData.cht_avg > 200.0}
          crit={frameData.cht_avg !== null && frameData.cht_avg > 215.0}
          icon={<Thermometer className="w-4 h-4 text-sage-800" />}
        />
        <Cell
          label="EGT Average"
          value={frameData.egt_avg}
          unit="°C"
          decimals={1}
          warn={frameData.egt_avg !== null && frameData.egt_avg > 750.0}
          crit={frameData.egt_avg !== null && frameData.egt_avg > 780.0}
          icon={<Flame className="w-4 h-4 text-sage-800" />}
        />
        <Cell
          label="Oil Pressure"
          value={frameData.oil_pressure}
          unit="bar"
          decimals={2}
          warn={frameData.oil_pressure !== null && frameData.oil_pressure < 3.2}
          crit={frameData.oil_pressure !== null && (frameData.oil_pressure < 2.5 || frameData.oil_pressure > 6.0)}
          icon={<Droplets className="w-4 h-4 text-sage-800" />}
        />
        <Cell
          label="Oil Temperature"
          value={frameData.oil_temperature}
          unit="°C"
          decimals={1}
          warn={frameData.oil_temperature !== null && frameData.oil_temperature > 115.0}
          crit={frameData.oil_temperature !== null && frameData.oil_temperature > 125.0}
          icon={<Thermometer className="w-4 h-4 text-sage-800" />}
        />
        <Cell
          label="Engine Vibration"
          value={frameData.vibration}
          unit="mm/s"
          decimals={2}
          warn={frameData.vibration !== null && frameData.vibration > 5.0}
          crit={frameData.vibration !== null && frameData.vibration > 7.5}
          icon={<Activity className="w-4 h-4 text-sage-800" />}
        />
        <Cell
          label="Fuel Flow Rate"
          value={frameData.fuel_flow}
          unit="L/h"
          decimals={1}
          warn={frameData.fuel_flow !== null && frameData.fuel_flow > 22.0}
          crit={frameData.fuel_flow !== null && frameData.fuel_flow > 25.0}
          icon={<Flame className="w-4 h-4 text-sage-800" />}
        />
        <Cell
          label="Battery Bus Voltage"
          value={frameData.battery_voltage}
          unit="V"
          decimals={1}
          warn={frameData.battery_voltage !== null && frameData.battery_voltage < 24.0}
          crit={frameData.battery_voltage !== null && frameData.battery_voltage < 22.0}
          icon={<Zap className="w-4 h-4 text-sage-800" />}
        />
        <Cell
          label="Alternator Current"
          value={frameData.alternator_current}
          unit="A"
          decimals={1}
          warn={frameData.alternator_current !== null && frameData.alternator_current > 40.0}
          crit={frameData.alternator_current !== null && frameData.alternator_current > 45.0}
          icon={<Zap className="w-4 h-4 text-sage-800" />}
        />
        <Cell
          label="Injection Timing"
          value={frameData.injection_timing}
          unit="°BTDC"
          decimals={1}
          warn={frameData.injection_timing !== null && frameData.injection_timing > 28.0}
          crit={frameData.injection_timing !== null && frameData.injection_timing > 32.0}
          icon={<Gauge className="w-4 h-4 text-sage-800" />}
        />
      </div>
    </section>
  );
}
