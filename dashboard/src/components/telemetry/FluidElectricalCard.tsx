import { SectionCard } from '../common/SectionCard';
import type { FlightContext } from '../../models/telemetry';

interface FluidElectricalCardProps {
  oilPressure: number;
  oilTemperature: number;
  batteryVoltage: number;
  alternatorCurrent: number;
  flightContext: FlightContext | null;
}

export function FluidElectricalCard({
  oilPressure,
  oilTemperature,
  batteryVoltage,
  alternatorCurrent,
  flightContext,
}: FluidElectricalCardProps) {
  // SI Units Calculations
  const oilPressKpa = (oilPressure * 100).toFixed(0);
  const oilPressBar = oilPressure.toFixed(2);

  // Oil Pressure Limits (2.5 bar redline minimum, 3.2 bar warn, 4.0 - 5.5 nominal)
  const isOilPressCrit = oilPressure < 2.5 || oilPressure > 6.0;
  const isOilPressWarn = !isOilPressCrit && (oilPressure < 3.2 || oilPressure > 5.5);

  // Oil Temperature Limits (80 - 105 °C nominal, 115 °C warn, 125 °C crit)
  const isOilTempCrit = oilTemperature >= 125 || oilTemperature < 40;
  const isOilTempWarn = !isOilTempCrit && (oilTemperature >= 115 || oilTemperature < 60);

  // Electrical Limits (24V nominal, 28V charge)
  const isVoltCrit = batteryVoltage < 21.0 || batteryVoltage > 30.0;
  const isVoltWarn = !isVoltCrit && (batteryVoltage < 23.0 || batteryVoltage > 29.0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Lubrication & Fluid Dynamics Subsystem */}
      <SectionCard className="flex flex-col justify-between gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#dbe3dc]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-sage-800">oil_barrel</span>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal">
                Lubrication & Hydraulic Subsystem
              </h3>
              <span className="text-xs text-sage-600 font-mono">
                Dry-Sump Scavenge & Pressure Matrix
              </span>
            </div>
          </div>
          <span
            className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
              isOilPressCrit || isOilTempCrit
                ? 'bg-red-100 text-red-900 border-red-300'
                : isOilPressWarn || isOilTempWarn
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-emerald-100 text-emerald-800 border-emerald-200'
            }`}
          >
            {isOilPressCrit || isOilTempCrit ? 'LUBRICATION FAULT' : isOilPressWarn || isOilTempWarn ? 'ADVISORY' : 'NORMAL CIRCULATION'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Oil Pressure */}
          <div className="p-4 rounded-2xl bg-white/80 border border-[#dce4de] shadow-subtle flex flex-col justify-between">
            <span className="text-xs font-mono font-bold text-sage-700 uppercase">Oil Pressure</span>
            <div className="my-2">
              <span
                className={`text-3xl font-extrabold font-mono ${
                  isOilPressCrit ? 'text-red-600' : isOilPressWarn ? 'text-amber-700' : 'text-charcoal'
                }`}
              >
                {oilPressBar}
              </span>
              <span className="text-xs font-mono text-sage-600 ml-1.5 font-medium">bar ({oilPressKpa} kPa)</span>
            </div>
            <div className="space-y-1">
              <div className="w-full h-2 bg-sage-100 rounded-full overflow-hidden border border-sage-200">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOilPressCrit ? 'bg-red-600' : isOilPressWarn ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, (oilPressure / 7.0) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-sage-500">
                <span className="text-red-600 font-bold">&lt; 2.5 bar Crit</span>
                <span>4.5 Nom</span>
                <span>7.0 Max</span>
              </div>
            </div>
          </div>

          {/* Oil Sump Temperature */}
          <div className="p-4 rounded-2xl bg-white/80 border border-[#dce4de] shadow-subtle flex flex-col justify-between">
            <span className="text-xs font-mono font-bold text-sage-700 uppercase">Sump Temperature</span>
            <div className="my-2">
              <span
                className={`text-3xl font-extrabold font-mono ${
                  isOilTempCrit ? 'text-red-600' : isOilTempWarn ? 'text-amber-700' : 'text-charcoal'
                }`}
              >
                {oilTemperature.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-sage-600 ml-1.5 font-medium">°C</span>
            </div>
            <div className="space-y-1">
              <div className="w-full h-2 bg-sage-100 rounded-full overflow-hidden border border-sage-200">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOilTempCrit ? 'bg-red-600' : isOilTempWarn ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, (oilTemperature / 150.0) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-sage-500">
                <span>40°C</span>
                <span>95°C Nom</span>
                <span className="text-red-600 font-bold">&gt; 125°C Crit</span>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* 2. Electrical & Avionics DC Power Bus */}
      <SectionCard className="flex flex-col justify-between gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#dbe3dc]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-sage-800">bolt</span>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal">
                Electrical Power & Avionics Bus
              </h3>
              <span className="text-xs text-sage-600 font-mono">
                28V DC Generation & Battery Backup
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-sage-100 border border-sage-200 px-2.5 py-0.5 rounded-full text-sage-800 font-bold">
            DUAL ALTERNATOR
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Main Bus Voltage */}
          <div className="p-4 rounded-2xl bg-white/80 border border-[#dce4de] shadow-subtle flex flex-col justify-between">
            <span className="text-xs font-mono font-bold text-sage-700 uppercase">Bus Voltage</span>
            <div className="my-2">
              <span
                className={`text-3xl font-extrabold font-mono ${
                  isVoltCrit ? 'text-red-600' : isVoltWarn ? 'text-amber-700' : 'text-charcoal'
                }`}
              >
                {batteryVoltage.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-sage-600 ml-1.5 font-medium">Volts DC</span>
            </div>
            <div className="p-2 rounded-xl bg-sage-50/70 border border-[#dce4de] flex items-center justify-between text-xs font-mono">
              <span className="text-sage-600">Bus State:</span>
              <span className="font-bold text-emerald-700">REGULATED</span>
            </div>
          </div>

          {/* Alternator Current */}
          <div className="p-4 rounded-2xl bg-white/80 border border-[#dce4de] shadow-subtle flex flex-col justify-between">
            <span className="text-xs font-mono font-bold text-sage-700 uppercase">Alternator Output</span>
            <div className="my-2">
              <span className="text-3xl font-extrabold font-mono text-charcoal">
                {alternatorCurrent.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-sage-600 ml-1.5 font-medium">Amperes</span>
            </div>
            <div className="p-2 rounded-xl bg-sage-50/70 border border-[#dce4de] flex items-center justify-between text-xs font-mono">
              <span className="text-sage-600">Load Factor:</span>
              <span className="font-bold text-charcoal">{((alternatorCurrent / 35.0) * 100).toFixed(0)}% LOAD</span>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
