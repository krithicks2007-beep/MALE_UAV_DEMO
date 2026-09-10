import React from 'react';
import { useTwinStore } from '../../stores/twinStore';
import { useTelemetryStore } from '../../stores/telemetryStore';
import { Thermometer, Flame, Droplets, Activity } from 'lucide-react';

export function SubsystemHealthMatrix() {
  const twinState = useTwinStore((s) => s.twinState);
  const telemetry = useTelemetryStore((s) => s.telemetry);

  const thermalState = twinState?.thermal_state || 'NOMINAL';
  const combustionState = twinState?.combustion_state || 'NOMINAL';
  const lubricationState = twinState?.lubrication_state || 'NOMINAL';
  const vibrationState = twinState?.vibration_state || 'NOMINAL';

  const affectedCyls = twinState?.affected_cylinders || [];

  // Helper for styling status pills
  const getPillColor = (st: string) => {
    if (st === 'CRITICAL' || st === 'MISFIRE') return 'bg-red-100 text-red-900 border-red-300 animate-pulse';
    if (st === 'HIGH' || st === 'ABNORMAL' || st === 'DEGRADED') return 'bg-orange-100 text-orange-900 border-orange-300';
    if (st === 'ELEVATED') return 'bg-amber-100 text-amber-900 border-amber-300';
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  };

  const chtAvg = telemetry?.cht ? (telemetry.cht.reduce((a, b) => a + b, 0) / 4).toFixed(1) : '—';
  const egtAvg = telemetry?.egt ? (telemetry.egt.reduce((a, b) => a + b, 0) / 4).toFixed(1) : '—';
  const oilPressBar = telemetry?.oil_pressure ? telemetry.oil_pressure.toFixed(2) : '—';
  const oilTempC = telemetry?.oil_temperature ? telemetry.oil_temperature.toFixed(1) : '—';
  const vibVal = telemetry?.vibration ? telemetry.vibration.toFixed(2) : '—';

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#dbe3dc] pb-3">
        <div>
          <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
            Engine Subsystem Diagnostic Matrix
          </h2>
          <p className="text-xs font-mono text-sage-600">
            Isolated health state evaluation across physical engine operational domains
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. THERMAL STATE */}
        <div className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${thermalState !== 'NOMINAL' ? 'bg-amber-50/70 border-amber-300 shadow-md' : 'bg-white/70 border-[#dbe3dc] shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-100 text-orange-800">
                <Thermometer className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase text-charcoal tracking-wider">
                THERMAL STATE
              </span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getPillColor(thermalState)}`}>
              {thermalState}
            </span>
          </div>

          <div className="my-3 space-y-1 font-mono text-xs">
            <div className="flex justify-between text-sage-600">
              <span>Avg CHT:</span>
              <span className="font-bold text-charcoal">{chtAvg} °C</span>
            </div>
            <div className="flex justify-between text-sage-600">
              <span>Avg EGT:</span>
              <span className="font-bold text-charcoal">{egtAvg} °C</span>
            </div>
          </div>

          <div className="pt-3 border-t border-sage-200/60 flex items-center justify-between text-[11px] font-mono text-sage-600">
            <span>Thermal Margin</span>
            <span className={`font-semibold ${thermalState !== 'NOMINAL' ? 'text-amber-800' : 'text-emerald-700'}`}>
              {thermalState === 'NOMINAL' ? 'STABLE' : 'ELEVATED'}
            </span>
          </div>
        </div>

        {/* 2. COMBUSTION STATE */}
        <div className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${combustionState !== 'NOMINAL' ? 'bg-amber-50/70 border-amber-300 shadow-md' : 'bg-white/70 border-[#dbe3dc] shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-100 text-red-800">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase text-charcoal tracking-wider">
                COMBUSTION STATE
              </span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getPillColor(combustionState)}`}>
              {combustionState}
            </span>
          </div>

          <div className="my-3 space-y-1 font-mono text-xs">
            <div className="flex justify-between text-sage-600">
              <span>Firing Balance:</span>
              <span className="font-bold text-charcoal">{combustionState === 'NOMINAL' ? 'BALANCED' : 'IMBALANCE'}</span>
            </div>
            <div className="flex justify-between text-sage-600">
              <span>Affected Cylinders:</span>
              <span className="font-bold text-charcoal">
                {affectedCyls.length > 0 ? `Cyl ${affectedCyls.map((c) => c + 1).join(', ')}` : 'NONE'}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-sage-200/60 flex items-center justify-between text-[11px] font-mono text-sage-600">
            <span>Ignition Stability</span>
            <span className={`font-semibold ${combustionState !== 'NOMINAL' ? 'text-amber-800' : 'text-emerald-700'}`}>
              {combustionState === 'NOMINAL' ? 'OPTIMAL' : 'DISTURBED'}
            </span>
          </div>
        </div>

        {/* 3. LUBRICATION STATE */}
        <div className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${lubricationState !== 'NOMINAL' ? 'bg-amber-50/70 border-amber-300 shadow-md' : 'bg-white/70 border-[#dbe3dc] shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-100 text-sky-800">
                <Droplets className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase text-charcoal tracking-wider">
                LUBRICATION STATE
              </span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getPillColor(lubricationState)}`}>
              {lubricationState}
            </span>
          </div>

          <div className="my-3 space-y-1 font-mono text-xs">
            <div className="flex justify-between text-sage-600">
              <span>Oil Pressure:</span>
              <span className="font-bold text-charcoal">{oilPressBar} bar</span>
            </div>
            <div className="flex justify-between text-sage-600">
              <span>Oil Temperature:</span>
              <span className="font-bold text-charcoal">{oilTempC} °C</span>
            </div>
          </div>

          <div className="pt-3 border-t border-sage-200/60 flex items-center justify-between text-[11px] font-mono text-sage-600">
            <span>Fluid Film Margin</span>
            <span className={`font-semibold ${lubricationState !== 'NOMINAL' ? 'text-amber-800' : 'text-emerald-700'}`}>
              {lubricationState === 'NOMINAL' ? 'ADEQUATE' : 'DEGRADED'}
            </span>
          </div>
        </div>

        {/* 4. VIBRATION STATE */}
        <div className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${vibrationState !== 'NOMINAL' ? 'bg-amber-50/70 border-amber-300 shadow-md' : 'bg-white/70 border-[#dbe3dc] shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase text-charcoal tracking-wider">
                VIBRATION STATE
              </span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getPillColor(vibrationState)}`}>
              {vibrationState}
            </span>
          </div>

          <div className="my-3 space-y-1 font-mono text-xs">
            <div className="flex justify-between text-sage-600">
              <span>Vibration:</span>
              <span className="font-bold text-charcoal">{vibVal} mm/s</span>
            </div>
            <div className="flex justify-between text-sage-600">
              <span>FFT Peak Energy:</span>
              <span className="font-bold text-charcoal">{vibrationState === 'NOMINAL' ? 'BASELINE' : 'ELEVATED'}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-sage-200/60 flex items-center justify-between text-[11px] font-mono text-sage-600">
            <span>Mechanical Balance</span>
            <span className={`font-semibold ${vibrationState !== 'NOMINAL' ? 'text-amber-800' : 'text-emerald-700'}`}>
              {vibrationState === 'NOMINAL' ? 'NOMINAL' : 'CHECK BEARING'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
