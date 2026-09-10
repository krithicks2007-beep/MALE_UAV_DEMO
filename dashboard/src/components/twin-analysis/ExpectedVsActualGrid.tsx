import React from 'react';
import { useTelemetryStore } from '../../stores/telemetryStore';
import { useDiagnosticsStore } from '../../stores/diagnosticsStore';
import { Gauge, Thermometer, Flame, Activity, Zap, Droplets } from 'lucide-react';

interface ParameterCardProps {
  label: string;
  actual: number | null | undefined;
  expected: number | null | undefined;
  residual: number | null | undefined;
  unit: string;
  decimals?: number;
  icon: React.ReactNode;
}

function SingleParameterCard({ label, actual, expected, residual, unit, decimals = 1, icon }: ParameterCardProps) {
  const hasActual = actual !== null && actual !== undefined && Number.isFinite(actual);
  const hasExpected = expected !== null && expected !== undefined && Number.isFinite(expected);
  const hasResidual = residual !== null && residual !== undefined && Number.isFinite(residual);

  const calcResidual = hasResidual
    ? residual
    : hasActual && hasExpected
    ? actual! - expected!
    : null;

  const resText = calcResidual !== null
    ? `${calcResidual > 0 ? '+' : ''}${calcResidual.toFixed(decimals)}`
    : '—';

  const isSevere = calcResidual !== null && Math.abs(calcResidual) > (label.includes('RPM') ? 150 : label.includes('Oil') ? 1.0 : 5);
  const isWarn = calcResidual !== null && Math.abs(calcResidual) > (label.includes('RPM') ? 50 : label.includes('Oil') ? 0.4 : 2);

  const statusBadge =
    calcResidual === null
      ? 'bg-sage-100 text-sage-600 border-sage-200'
      : isSevere
      ? 'bg-red-100 text-red-800 border-red-300 animate-pulse'
      : isWarn
      ? 'bg-amber-100 text-amber-900 border-amber-300'
      : 'bg-emerald-100 text-emerald-800 border-emerald-300';

  return (
    <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-[#dbe3dc] shadow-sm hover:border-[#b8ccbd] transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sage-100 text-sage-800">
              {icon}
            </div>
            <span className="text-xs font-bold text-charcoal font-mono uppercase tracking-wider">{label}</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${statusBadge}`}>
            {calcResidual === null ? 'NO DATA' : isSevere ? 'HIGH RESIDUAL' : isWarn ? 'ELEVATED' : 'NOMINAL'}
          </span>
        </div>

        {/* Expected vs Actual Readouts */}
        <div className="grid grid-cols-2 gap-2 my-2 py-2 px-3 rounded-xl bg-sage-50/70 border border-sage-100">
          <div>
            <span className="text-[10px] font-mono uppercase text-sage-600 block">EXPECTED</span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-semibold text-sage-800 font-mono">
                {hasExpected ? expected!.toFixed(decimals) : '—'}
              </span>
              <span className="text-[10px] font-mono text-sage-600">{unit}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-sage-600 block">ACTUAL</span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-charcoal font-mono">
                {hasActual ? actual!.toFixed(decimals) : '—'}
              </span>
              <span className="text-[10px] font-mono text-sage-600">{unit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delta bar */}
      <div className="pt-2 border-t border-sage-200/60 flex items-center justify-between text-xs font-mono">
        <span className="text-sage-600 text-[11px]">RESIDUAL (Δ):</span>
        <span className={`font-bold ${calcResidual !== null && Math.abs(calcResidual) > 0 ? (calcResidual > 0 ? 'text-amber-800' : 'text-sky-800') : 'text-sage-700'}`}>
          {resText} {unit}
        </span>
      </div>
    </div>
  );
}

export function ExpectedVsActualGrid() {
  const telemetry = useTelemetryStore((s) => s.telemetry);
  const twinAnalysis = useDiagnosticsStore((s) => s.twinAnalysis);

  const exp = twinAnalysis?.expected || {};
  const res = twinAnalysis?.residuals || {};

  // Single Telemetry parameter mappings
  const parameters: ParameterCardProps[] = [
    {
      label: 'Engine RPM',
      actual: telemetry?.rpm,
      expected: exp.rpm ?? (telemetry?.rpm !== undefined && res.rpm !== undefined ? telemetry.rpm - res.rpm : null),
      residual: res.rpm,
      unit: 'rpm',
      decimals: 0,
      icon: <Gauge className="w-4 h-4 text-sage-800" />,
    },
    {
      label: 'Manifold Pressure (MAP)',
      actual: telemetry?.map,
      expected: exp.map ?? (telemetry?.map !== undefined && res.map !== undefined ? telemetry.map - res.map : null),
      residual: res.map,
      unit: 'bar',
      decimals: 2,
      icon: <Activity className="w-4 h-4 text-sage-800" />,
    },
    {
      label: 'Oil Pressure',
      actual: telemetry?.oil_pressure,
      expected: exp.oil_pressure ?? (telemetry?.oil_pressure !== undefined && res.oil_pressure !== undefined ? telemetry.oil_pressure - res.oil_pressure : null),
      residual: res.oil_pressure,
      unit: 'bar',
      decimals: 2,
      icon: <Droplets className="w-4 h-4 text-sage-800" />,
    },
    {
      label: 'Oil Temperature',
      actual: telemetry?.oil_temperature,
      expected: exp.oil_temperature ?? (telemetry?.oil_temperature !== undefined && res.oil_temperature !== undefined ? telemetry.oil_temperature - res.oil_temperature : null),
      residual: res.oil_temperature,
      unit: '°C',
      decimals: 1,
      icon: <Thermometer className="w-4 h-4 text-sage-800" />,
    },
    {
      label: 'Fuel Flow Rate',
      actual: telemetry?.fuel_flow,
      expected: exp.fuel_flow ?? (telemetry?.fuel_flow !== undefined && res.fuel_flow !== undefined ? telemetry.fuel_flow - res.fuel_flow : null),
      residual: res.fuel_flow,
      unit: 'L/h',
      decimals: 1,
      icon: <Flame className="w-4 h-4 text-sage-800" />,
    },
    {
      label: 'Engine Vibration',
      actual: telemetry?.vibration,
      expected: exp.vibration ?? (telemetry?.vibration !== undefined && res.vibration !== undefined ? telemetry.vibration - res.vibration : null),
      residual: res.vibration,
      unit: 'mm/s',
      decimals: 2,
      icon: <Activity className="w-4 h-4 text-sage-800" />,
    },
    {
      label: 'Battery Voltage',
      actual: telemetry?.battery_voltage,
      expected: exp.battery_voltage ?? (telemetry?.battery_voltage !== undefined && res.battery_voltage !== undefined ? telemetry.battery_voltage - res.battery_voltage : null),
      residual: res.battery_voltage,
      unit: 'V',
      decimals: 1,
      icon: <Zap className="w-4 h-4 text-sage-800" />,
    },
    {
      label: 'Alternator Current',
      actual: telemetry?.alternator_current,
      expected: exp.alternator_current ?? (telemetry?.alternator_current !== undefined && res.alternator_current !== undefined ? telemetry.alternator_current - res.alternator_current : null),
      residual: res.alternator_current,
      unit: 'A',
      decimals: 1,
      icon: <Zap className="w-4 h-4 text-sage-800" />,
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#dbe3dc] pb-3">
        <div>
          <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
            Expected vs Actual Operational Parameters
          </h2>
          <p className="text-xs font-mono text-sage-600">
            Real-time sensor telemetric readouts side-by-side with physics Digital Twin target outputs
          </p>
        </div>
      </div>

      {/* Single parameter card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {parameters.map((p, idx) => (
          <SingleParameterCard key={idx} {...p} />
        ))}
      </div>

      {/* Multi-cylinder CHT & EGT Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        {/* CHT 4-Cylinder Card */}
        <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-[#dbe3dc] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-100 text-orange-800">
                <Thermometer className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-charcoal uppercase tracking-wider font-mono">
                  CHT Multi-Cylinder Thermal Profile
                </h3>
                <span className="text-[11px] font-mono text-sage-600">Cylinder Head Temperatures (C1 - C4)</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-sage-100 text-sage-800 border border-sage-200">
              4 CYLINDERS
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2">
            {[0, 1, 2, 3].map((cylIdx) => {
              const act = telemetry?.cht?.[cylIdx];
              const key = `cht_c${cylIdx + 1}`;
              const resVal = res[key] ?? res['cht_avg'];
              const expVal = exp[key] ?? (act !== undefined && resVal !== undefined ? act - resVal : null);

              const delta = resVal !== undefined ? resVal : act !== undefined && expVal !== null && expVal !== undefined ? act - expVal : null;
              const isHigh = delta !== null && Math.abs(delta) > 8;

              return (
                <div key={cylIdx} className={`p-3 rounded-2xl border transition-all ${isHigh ? 'bg-amber-50/80 border-amber-300' : 'bg-sage-50/60 border-sage-200/80'}`}>
                  <span className="text-[10px] font-mono font-bold uppercase text-sage-700 block mb-1">
                    CYLINDER {cylIdx + 1}
                  </span>
                  <div className="space-y-1 font-mono text-xs">
                    <div className="flex justify-between text-sage-600 text-[10px]">
                      <span>EXP:</span>
                      <span className="font-semibold text-sage-800">{expVal !== null && expVal !== undefined ? `${expVal.toFixed(1)} °C` : '—'}</span>
                    </div>
                    <div className="flex justify-between text-charcoal">
                      <span className="text-[10px] font-bold">ACT:</span>
                      <span className="font-bold">{act !== undefined && act !== null ? `${act.toFixed(1)} °C` : '—'}</span>
                    </div>
                    <div className="pt-1 border-t border-sage-200/60 flex justify-between text-[10px]">
                      <span className="text-sage-600">Δ:</span>
                      <span className={`font-bold ${delta !== null && delta > 0 ? 'text-amber-800' : 'text-emerald-800'}`}>
                        {delta !== null ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)} °C` : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* EGT 4-Cylinder Card */}
        <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-[#dbe3dc] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-100 text-red-800">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-charcoal uppercase tracking-wider font-mono">
                  EGT Multi-Cylinder Exhaust Profile
                </h3>
                <span className="text-[11px] font-mono text-sage-600">Exhaust Gas Temperatures (C1 - C4)</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-sage-100 text-sage-800 border border-sage-200">
              4 CYLINDERS
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2">
            {[0, 1, 2, 3].map((cylIdx) => {
              const act = telemetry?.egt?.[cylIdx];
              const key = `egt_c${cylIdx + 1}`;
              const resVal = res[key] ?? res['egt_avg'];
              const expVal = exp[key] ?? (act !== undefined && resVal !== undefined ? act - resVal : null);

              const delta = resVal !== undefined ? resVal : act !== undefined && expVal !== null && expVal !== undefined ? act - expVal : null;
              const isHigh = delta !== null && Math.abs(delta) > 15;

              return (
                <div key={cylIdx} className={`p-3 rounded-2xl border transition-all ${isHigh ? 'bg-amber-50/80 border-amber-300' : 'bg-sage-50/60 border-sage-200/80'}`}>
                  <span className="text-[10px] font-mono font-bold uppercase text-sage-700 block mb-1">
                    CYLINDER {cylIdx + 1}
                  </span>
                  <div className="space-y-1 font-mono text-xs">
                    <div className="flex justify-between text-sage-600 text-[10px]">
                      <span>EXP:</span>
                      <span className="font-semibold text-sage-800">{expVal !== null && expVal !== undefined ? `${expVal.toFixed(1)} °C` : '—'}</span>
                    </div>
                    <div className="flex justify-between text-charcoal">
                      <span className="text-[10px] font-bold">ACT:</span>
                      <span className="font-bold">{act !== undefined && act !== null ? `${act.toFixed(1)} °C` : '—'}</span>
                    </div>
                    <div className="pt-1 border-t border-sage-200/60 flex justify-between text-[10px]">
                      <span className="text-sage-600">Δ:</span>
                      <span className={`font-bold ${delta !== null && delta > 0 ? 'text-amber-800' : 'text-emerald-800'}`}>
                        {delta !== null ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)} °C` : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
