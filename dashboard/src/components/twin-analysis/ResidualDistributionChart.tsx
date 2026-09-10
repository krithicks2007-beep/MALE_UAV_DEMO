import React from 'react';
import { useDiagnosticsStore } from '../../stores/diagnosticsStore';
import { BarChart3 } from 'lucide-react';

export function ResidualDistributionChart() {
  const twinAnalysis = useDiagnosticsStore((s) => s.twinAnalysis);

  const res = twinAnalysis?.residuals || {};

  const items = [
    { label: 'RPM', val: res.rpm ?? 0, unit: 'rpm', normMax: 200 },
    { label: 'MAP', val: res.map ?? 0, unit: 'bar', normMax: 0.5 },
    { label: 'CHT (Avg)', val: res.cht_avg ?? 0, unit: '°C', normMax: 20 },
    { label: 'EGT (Avg)', val: res.egt_avg ?? 0, unit: '°C', normMax: 30 },
    { label: 'Oil Pressure', val: res.oil_pressure ?? 0, unit: 'bar', normMax: 1.0 },
    { label: 'Oil Temp', val: res.oil_temperature ?? 0, unit: '°C', normMax: 15 },
    { label: 'Fuel Flow', val: res.fuel_flow ?? 0, unit: 'L/h', normMax: 3.0 },
    { label: 'Vibration', val: res.vibration ?? 0, unit: 'mm/s', normMax: 5.0 },
  ];

  return (
    <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-[#dbe3dc] shadow-sm flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between border-b border-[#dbe3dc] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sage-100 text-sage-800">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-charcoal font-mono uppercase tracking-wider">
              Residual Deviation Distribution
            </h3>
            <span className="text-[11px] font-mono text-sage-600">Normalized deviation magnitude per telemetry axis</span>
          </div>
        </div>
        <span className="text-xs font-mono font-semibold text-sage-700 bg-sage-100 px-3 py-1 rounded-full border border-sage-200">
          PHYSICS MODEL OUTPUT
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-2">
        {items.map((item, idx) => {
          const absVal = Math.abs(item.val);
          const pct = Math.min(100, (absVal / item.normMax) * 100);
          const isHigh = pct > 60;
          const isElevated = pct > 25;

          return (
            <div key={idx} className="p-3.5 rounded-2xl bg-sage-50/60 border border-sage-200/80 space-y-2">
              <div className="flex justify-between items-baseline font-mono text-xs">
                <span className="font-bold text-sage-800">{item.label}</span>
                <span className={`font-bold ${isHigh ? 'text-red-700' : isElevated ? 'text-amber-800' : 'text-emerald-800'}`}>
                  {item.val > 0 ? `+${item.val.toFixed(2)}` : item.val.toFixed(2)} {item.unit}
                </span>
              </div>

              {/* Bar */}
              <div className="w-full h-2.5 bg-sage-200/70 rounded-full overflow-hidden border border-sage-300/60">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isHigh ? 'bg-red-500' : isElevated ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex justify-between text-[9px] font-mono text-sage-600">
                <span>0</span>
                <span>{item.normMax} {item.unit} (Max Envelope)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
