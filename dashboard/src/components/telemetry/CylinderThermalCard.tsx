import { useState } from 'react';
import { SectionCard, CardHeader } from '../common/SectionCard';

interface CylinderThermalCardProps {
  cht: number[];
  egt: number[];
}

export function CylinderThermalCard({ cht, egt }: CylinderThermalCardProps) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'CHT' | 'EGT'>('ALL');
  const tempUnit = '°C';

  // Calculate spreads
  const validCht = cht && cht.length > 0 ? cht : [176.5, 180.2, 179.8, 175.5];
  const validEgt = egt && egt.length > 0 ? egt : [681.0, 690.5, 688.0, 680.5];

  const maxCht = Math.max(...validCht);
  const minCht = Math.min(...validCht);
  const spreadCht = maxCht - minCht;
  const avgCht = validCht.reduce((a, b) => a + b, 0) / validCht.length;

  const maxEgt = Math.max(...validEgt);
  const minEgt = Math.min(...validEgt);
  const spreadEgt = maxEgt - minEgt;
  const avgEgt = validEgt.reduce((a, b) => a + b, 0) / validEgt.length;

  // CHT threshold limits in °C
  const CHT_WARN = 200;
  const CHT_CRIT = 215;

  // EGT threshold limits in °C
  const EGT_WARN = 750;
  const EGT_CRIT = 780;

  return (
    <SectionCard className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#dbe3dc]">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-2xl text-sage-800">thermostat</span>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal">
              4-Cylinder Thermal Head & Exhaust Management
            </h3>
            <span className="text-xs text-sage-600 font-mono">
              Independent Combustion Chambers (Cylinders 1 – 4)
            </span>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-sage-100/70 p-1 rounded-full border border-sage-200">
          {(['ALL', 'CHT', 'EGT'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveTab(mode)}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-full transition-all ${
                activeTab === mode
                  ? 'bg-charcoal text-white shadow-xs'
                  : 'text-sage-700 hover:text-charcoal'
              }`}
            >
              {mode === 'ALL' ? 'Dual View' : mode}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Spread Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-sage-50/70 border border-[#dce4de]">
          <span className="text-[10px] font-mono text-sage-600 block uppercase">CHT Average</span>
          <div className="text-lg font-bold font-mono text-charcoal mt-0.5">
            {avgCht.toFixed(1)} <span className="text-xs text-sage-600">°C</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-sage-50/70 border border-[#dce4de]">
          <span className="text-[10px] font-mono text-sage-600 block uppercase">CHT Spread (Δ)</span>
          <div className={`text-lg font-bold font-mono mt-0.5 ${spreadCht > 35 ? 'text-red-600' : spreadCht > 25 ? 'text-amber-600' : 'text-emerald-700'}`}>
            ±{spreadCht.toFixed(1)} <span className="text-xs text-sage-600">°C</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-sage-50/70 border border-[#dce4de]">
          <span className="text-[10px] font-mono text-sage-600 block uppercase">EGT Average</span>
          <div className="text-lg font-bold font-mono text-charcoal mt-0.5">
            {avgEgt.toFixed(0)} <span className="text-xs text-sage-600">°C</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-sage-50/70 border border-[#dce4de]">
          <span className="text-[10px] font-mono text-sage-600 block uppercase">EGT Spread (Δ)</span>
          <div className={`text-lg font-bold font-mono mt-0.5 ${spreadEgt > 90 ? 'text-red-600' : spreadEgt > 60 ? 'text-amber-600' : 'text-emerald-700'}`}>
            ±{spreadEgt.toFixed(0)} <span className="text-xs text-sage-600">°C</span>
          </div>
        </div>
      </div>

      {/* 4-Cylinder Detailed Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {validCht.map((cVal, idx) => {
          const eVal = validEgt[idx] ?? 680;
          const isChtCrit = cVal >= CHT_CRIT;
          const isChtWarn = !isChtCrit && cVal >= CHT_WARN;

          const isEgtCrit = eVal >= EGT_CRIT;
          const isEgtWarn = !isEgtCrit && eVal >= EGT_WARN;

          const hasCritThermal = isChtCrit || isEgtCrit;
          const hasWarnThermal = isChtWarn || isEgtWarn;

          // Percentage fills for visual meter bars (CHT 50 - 250 °C, EGT 400 - 900 °C)
          const chtPercent = Math.min(100, Math.max(0, ((cVal - 50) / (250 - 50)) * 100));
          const egtPercent = Math.min(100, Math.max(0, ((eVal - 400) / (900 - 400)) * 100));

          return (
            <div
              key={idx}
              className={`p-4 rounded-3xl border transition-all duration-300 flex flex-col justify-between gap-4 ${
                hasCritThermal
                  ? 'bg-gradient-to-br from-red-50/95 via-rose-100/70 to-red-50/90 border-red-500 shadow-[0_0_24px_rgba(239,68,68,0.45)] ring-2 ring-red-500/50'
                  : hasWarnThermal
                  ? 'bg-gradient-to-br from-amber-50/90 via-orange-100/60 to-amber-50/80 border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/40'
                  : 'bg-white/80 border-[#dce4de] shadow-subtle hover:border-sage-300'
              }`}
            >
              {/* Cylinder Title Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-[#e5ede7]">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      hasCritThermal
                        ? 'bg-red-600 shadow-[0_0_10px_#ef4444] animate-ping'
                        : hasWarnThermal
                        ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse'
                        : 'bg-emerald-600'
                    }`}
                  />
                  <span className="font-bold text-xs font-mono uppercase tracking-wider text-charcoal">
                    Cylinder #{idx + 1}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                    hasCritThermal
                      ? 'bg-red-200 text-red-800'
                      : hasWarnThermal
                      ? 'bg-amber-200 text-amber-800'
                      : 'text-sage-600 bg-sage-100'
                  }`}
                >
                  Port {idx % 2 === 0 ? 'Left' : 'Right'}
                </span>
              </div>

              {/* CHT Section */}
              {(activeTab === 'ALL' || activeTab === 'CHT') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-sage-700 font-medium">Head Temp (CHT)</span>
                    <span
                      className={`font-bold text-sm ${
                        isChtCrit
                          ? 'text-red-600 font-mono tracking-tight drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]'
                          : isChtWarn
                          ? 'text-amber-700 font-mono'
                          : 'text-charcoal'
                      }`}
                    >
                      {cVal.toFixed(1)} °C
                    </span>
                  </div>

                  {/* CHT Progress Bar with Threshold Markers */}
                  <div
                    className={`relative w-full h-3 rounded-full overflow-hidden border ${
                      isChtCrit
                        ? 'bg-red-100 border-red-300 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                        : isChtWarn
                        ? 'bg-amber-100 border-amber-300'
                        : 'bg-sage-100 border-sage-200'
                    }`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isChtCrit
                          ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_12px_#ef4444]'
                          : isChtWarn
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      }`}
                      style={{ width: `${chtPercent}%` }}
                    />
                    {/* Redline reference marker at 215°C (~82.5%) */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-red-600/70"
                      style={{ left: '82.5%' }}
                      title="Redline Limit (215°C)"
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-sage-500">
                    <span>50°C</span>
                    <span>180°C Nom</span>
                    <span className="text-red-600 font-bold">215°C Max</span>
                  </div>
                </div>
              )}

              {/* EGT Section */}
              {(activeTab === 'ALL' || activeTab === 'EGT') && (
                <div className="space-y-1.5 pt-2 border-t border-[#edf2ee]">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-sage-700 font-medium">Exhaust Gas (EGT)</span>
                    <span
                      className={`font-bold text-sm ${
                        isEgtCrit
                          ? 'text-red-600 font-mono tracking-tight drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]'
                          : isEgtWarn
                          ? 'text-amber-700 font-mono'
                          : 'text-charcoal'
                      }`}
                    >
                      {eVal.toFixed(0)} °C
                    </span>
                  </div>

                  {/* EGT Flame Bar */}
                  <div
                    className={`relative w-full h-3 rounded-full overflow-hidden border ${
                      isEgtCrit
                        ? 'bg-red-100 border-red-300 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                        : isEgtWarn
                        ? 'bg-amber-100 border-amber-300'
                        : 'bg-sage-100 border-sage-200'
                    }`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isEgtCrit
                          ? 'bg-gradient-to-r from-red-600 to-rose-700 shadow-[0_0_12px_#ef4444]'
                          : isEgtWarn
                          ? 'bg-gradient-to-r from-orange-500 to-amber-600'
                          : 'bg-gradient-to-r from-cyan-600 to-blue-600'
                      }`}
                      style={{ width: `${egtPercent}%` }}
                    />
                    {/* Redline reference marker at 780°C (~76%) */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-red-600/70"
                      style={{ left: '76%' }}
                      title="EGT Redline (780°C)"
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-sage-500">
                    <span>400°</span>
                    <span>700° Nom</span>
                    <span className="text-red-600 font-bold">780° Max</span>
                  </div>
                </div>
              )}

              {/* Cylinder Thermal Status Pill */}
              <div className="pt-2 border-t border-[#edf2ee] flex items-center justify-between text-[10px] font-mono text-sage-600">
                <span>COMBUSTION:</span>
                <span
                  className={`font-bold uppercase ${
                    hasCritThermal
                      ? 'text-red-600 drop-shadow-xs'
                      : hasWarnThermal
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }`}
                >
                  {hasCritThermal ? 'EXCURSION (HOT)' : hasWarnThermal ? 'ELEVATED' : 'NOMINAL'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
