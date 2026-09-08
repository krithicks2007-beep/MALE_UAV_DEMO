import { SectionCard } from '../common/SectionCard';

interface PropulsionGaugeCardProps {
  rpm: number;
  map: number;
  fuelFlow: number;
  vibration: number;
  injectionTiming: number;
}

export function PropulsionGaugeCard({
  rpm,
  map,
  fuelFlow,
  vibration,
  injectionTiming,
}: PropulsionGaugeCardProps) {
  // SI Units Calculations
  const mapKpa = (map * 100).toFixed(1);
  const mapBar = map.toFixed(2);
  const vibMs2 = (vibration * 0.001 * 9.81).toFixed(2); // vibration velocity in m/s or mm/s


  // RPM percentage of redline (5800 RPM)
  const MAX_RPM = 5800;
  const rpmPct = Math.min(100, Math.max(0, (rpm / MAX_RPM) * 100));
  const isRpmCrit = rpm >= 5800;
  const isRpmWarn = !isRpmCrit && rpm >= 5500;

  // Vibration thresholds (5.0 mm/s warn, 7.5 mm/s crit)
  const isVibCrit = vibration >= 7.5;
  const isVibWarn = !isVibCrit && vibration >= 5.0;
  const vibPercent = Math.min(100, Math.max(0, (vibration / 10.0) * 100));

  return (
    <SectionCard className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#dbe3dc]">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-2xl text-sage-800">speed</span>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal">
              Propulsion Dynamics & FADEC Manifold
            </h3>
            <span className="text-xs text-sage-600 font-mono">
              Engine Core Speed, Boost Delivery & Mechanical Load
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-sage-100 border border-sage-200 px-2.5 py-1 rounded-full text-sage-800 font-bold">
          4-STROKE ROTAX AERO-PISTON
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Engine RPM Radial Card */}
        <div className="p-4 rounded-3xl bg-white/80 border border-[#dce4de] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-sage-700">
              Engine Speed
            </span>
            <span
              className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                isRpmCrit
                  ? 'bg-red-100 text-red-900 border-red-300'
                  : isRpmWarn
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              {isRpmCrit ? 'REDLINE' : isRpmWarn ? 'HIGH POWER' : 'NOMINAL'}
            </span>
          </div>

          <div className="my-3 text-center">
            <div
              className={`text-3xl lg:text-4xl font-extrabold font-mono tracking-tight ${
                isRpmCrit ? 'text-red-600' : isRpmWarn ? 'text-amber-700' : 'text-charcoal'
              }`}
            >
              {Math.round(rpm).toLocaleString()}
            </div>
            <span className="text-xs font-mono text-sage-600 font-medium">REVOLUTIONS / MIN</span>
          </div>

          {/* RPM Bar */}
          <div className="space-y-1">
            <div className="relative w-full h-2.5 bg-sage-100 rounded-full overflow-hidden border border-sage-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isRpmCrit ? 'bg-red-600' : isRpmWarn ? 'bg-amber-500' : 'bg-sage-800'
                }`}
                style={{ width: `${rpmPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-sage-500">
              <span>0</span>
              <span>2850 Cruise</span>
              <span className="text-red-600 font-bold">5800 Redline</span>
            </div>
          </div>
        </div>

        {/* 2. Manifold Absolute Pressure (MAP) */}
        <div className="p-4 rounded-3xl bg-white/80 border border-[#dce4de] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-sage-700">
              Manifold Pressure
            </span>
            <span className="text-[10px] font-mono text-sage-600 bg-sage-100 px-2 py-0.5 rounded-full border border-sage-200">
              MAP Sensor
            </span>
          </div>

          <div className="my-3 text-center">
            <div className="text-3xl lg:text-4xl font-extrabold font-mono text-charcoal tracking-tight">
              {mapKpa}
            </div>
            <span className="text-xs font-mono text-sage-600 font-medium">kPa ({mapBar} bar)</span>
          </div>

          <div className="p-2 rounded-2xl bg-sage-50/70 border border-[#dce4de] flex items-center justify-between text-xs font-mono">
            <span className="text-sage-600">Atmosphere Ratio:</span>
            <span className="font-bold text-charcoal">{(map / 1.013).toFixed(2)}x ATM</span>
          </div>
        </div>

        {/* 3. Fuel Flow Rate & Injection Timing */}
        <div className="p-4 rounded-3xl bg-white/80 border border-[#dce4de] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-sage-700">
              Fuel Flow & Timing
            </span>
            <span className="text-[10px] font-mono text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200 font-bold">
              FADEC Closed-Loop
            </span>
          </div>

          <div className="my-3 text-center">
            <div className="text-3xl lg:text-4xl font-extrabold font-mono text-charcoal tracking-tight">
              {fuelFlow.toFixed(1)}
            </div>
            <span className="text-xs font-mono text-sage-600 font-medium">L/h</span>
          </div>

          <div className="p-2 rounded-2xl bg-sage-50/70 border border-[#dce4de] flex items-center justify-between text-xs font-mono">
            <span className="text-sage-600">Advance Angle:</span>
            <span className="font-bold text-charcoal">{injectionTiming.toFixed(1)}° BTDC</span>
          </div>
        </div>

        {/* 4. Mechanical Engine Vibration Spectrum */}
        <div className="p-4 rounded-3xl bg-white/80 border border-[#dce4de] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-sage-700">
              Vibration Magnitude
            </span>
            <span
              className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                isVibCrit
                  ? 'bg-red-100 text-red-900 border-red-300'
                  : isVibWarn
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              {isVibCrit ? 'CRITICAL' : isVibWarn ? 'ELEVATED' : 'SMOOTH'}
            </span>
          </div>

          <div className="my-3 text-center">
            <div
              className={`text-3xl lg:text-4xl font-extrabold font-mono tracking-tight ${
                isVibCrit ? 'text-red-600' : isVibWarn ? 'text-amber-700' : 'text-charcoal'
              }`}
            >
              {vibration.toFixed(2)}
            </div>
            <span className="text-xs font-mono text-sage-600 font-medium">mm/s ({(vibration / 9.81).toFixed(2)} g)</span>
          </div>

          {/* Vibration Bar */}
          <div className="space-y-1">
            <div className="relative w-full h-2.5 bg-sage-100 rounded-full overflow-hidden border border-sage-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isVibCrit ? 'bg-red-600' : isVibWarn ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${vibPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-sage-500">
              <span>0.0</span>
              <span>5.0 Warn</span>
              <span className="text-red-600 font-bold">7.5 Limit</span>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
