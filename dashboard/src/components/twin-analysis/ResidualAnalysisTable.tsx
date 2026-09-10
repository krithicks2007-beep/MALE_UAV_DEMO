import React, { useState } from 'react';
import { useTelemetryStore } from '../../stores/telemetryStore';
import { useDiagnosticsStore } from '../../stores/diagnosticsStore';

interface ResidualRow {
  id: string;
  parameter: string;
  subsystem: 'THERMAL' | 'COMBUSTION' | 'LUBRICATION' | 'MECHANICAL' | 'ELECTRICAL';
  expected: number | null;
  actual: number | null;
  residual: number | null;
  unit: string;
  severity: 'NOMINAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
}

export function ResidualAnalysisTable() {
  const telemetry = useTelemetryStore((s) => s.telemetry);
  const twinAnalysis = useDiagnosticsStore((s) => s.twinAnalysis);
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('ALL');

  const exp = twinAnalysis?.expected || {};
  const res = twinAnalysis?.residuals || {};

  // Build canonical rows array dynamically from telemetry and twinAnalysis
  const rows: ResidualRow[] = [
    {
      id: 'rpm',
      parameter: 'Engine RPM',
      subsystem: 'MECHANICAL',
      actual: telemetry?.rpm ?? null,
      expected: exp.rpm ?? (telemetry?.rpm !== undefined && res.rpm !== undefined ? telemetry.rpm - res.rpm : null),
      residual: res.rpm ?? (telemetry?.rpm !== undefined && exp.rpm !== undefined ? telemetry.rpm - exp.rpm : null),
      unit: 'rpm',
      severity: Math.abs(res.rpm ?? 0) > 150 ? 'CRITICAL' : Math.abs(res.rpm ?? 0) > 50 ? 'ELEVATED' : 'NOMINAL',
    },
    {
      id: 'map',
      parameter: 'Manifold Absolute Pressure (MAP)',
      subsystem: 'COMBUSTION',
      actual: telemetry?.map ?? null,
      expected: exp.map ?? (telemetry?.map !== undefined && res.map !== undefined ? telemetry.map - res.map : null),
      residual: res.map ?? null,
      unit: 'bar',
      severity: Math.abs(res.map ?? 0) > 0.3 ? 'HIGH' : Math.abs(res.map ?? 0) > 0.1 ? 'ELEVATED' : 'NOMINAL',
    },
    {
      id: 'cht_avg',
      parameter: 'Cylinder Head Temp (Avg CHT)',
      subsystem: 'THERMAL',
      actual: telemetry?.cht ? telemetry.cht.reduce((a, b) => a + b, 0) / 4 : null,
      expected: exp.cht_avg ?? null,
      residual: res.cht_avg ?? null,
      unit: '°C',
      severity: Math.abs(res.cht_avg ?? 0) > 12 ? 'CRITICAL' : Math.abs(res.cht_avg ?? 0) > 5 ? 'ELEVATED' : 'NOMINAL',
    },
    {
      id: 'egt_avg',
      parameter: 'Exhaust Gas Temp (Avg EGT)',
      subsystem: 'THERMAL',
      actual: telemetry?.egt ? telemetry.egt.reduce((a, b) => a + b, 0) / 4 : null,
      expected: exp.egt_avg ?? null,
      residual: res.egt_avg ?? null,
      unit: '°C',
      severity: Math.abs(res.egt_avg ?? 0) > 25 ? 'CRITICAL' : Math.abs(res.egt_avg ?? 0) > 10 ? 'ELEVATED' : 'NOMINAL',
    },
    {
      id: 'oil_pressure',
      parameter: 'Oil Pressure',
      subsystem: 'LUBRICATION',
      actual: telemetry?.oil_pressure ?? null,
      expected: exp.oil_pressure ?? (telemetry?.oil_pressure !== undefined && res.oil_pressure !== undefined ? telemetry.oil_pressure - res.oil_pressure : null),
      residual: res.oil_pressure ?? null,
      unit: 'bar',
      severity: Math.abs(res.oil_pressure ?? 0) > 0.8 ? 'CRITICAL' : Math.abs(res.oil_pressure ?? 0) > 0.3 ? 'ELEVATED' : 'NOMINAL',
    },
    {
      id: 'oil_temperature',
      parameter: 'Oil Temperature',
      subsystem: 'LUBRICATION',
      actual: telemetry?.oil_temperature ?? null,
      expected: exp.oil_temperature ?? null,
      residual: res.oil_temperature ?? null,
      unit: '°C',
      severity: Math.abs(res.oil_temperature ?? 0) > 10 ? 'HIGH' : Math.abs(res.oil_temperature ?? 0) > 4 ? 'ELEVATED' : 'NOMINAL',
    },
    {
      id: 'fuel_flow',
      parameter: 'Fuel Flow Rate',
      subsystem: 'COMBUSTION',
      actual: telemetry?.fuel_flow ?? null,
      expected: exp.fuel_flow ?? null,
      residual: res.fuel_flow ?? null,
      unit: 'L/h',
      severity: Math.abs(res.fuel_flow ?? 0) > 2.5 ? 'HIGH' : Math.abs(res.fuel_flow ?? 0) > 1.0 ? 'ELEVATED' : 'NOMINAL',
    },
    {
      id: 'vibration',
      parameter: 'Engine Vibration Magnitude',
      subsystem: 'MECHANICAL',
      actual: telemetry?.vibration ?? null,
      expected: exp.vibration ?? null,
      residual: res.vibration ?? null,
      unit: 'mm/s',
      severity: Math.abs(res.vibration ?? 0) > 4.0 ? 'CRITICAL' : Math.abs(res.vibration ?? 0) > 1.5 ? 'ELEVATED' : 'NOMINAL',
    },
    {
      id: 'battery_voltage',
      parameter: 'Electrical Battery Voltage',
      subsystem: 'ELECTRICAL',
      actual: telemetry?.battery_voltage ?? null,
      expected: exp.battery_voltage ?? null,
      residual: res.battery_voltage ?? null,
      unit: 'V',
      severity: Math.abs(res.battery_voltage ?? 0) > 2.0 ? 'HIGH' : Math.abs(res.battery_voltage ?? 0) > 0.5 ? 'ELEVATED' : 'NOMINAL',
    },
    {
      id: 'alternator_current',
      parameter: 'Alternator Current Output',
      subsystem: 'ELECTRICAL',
      actual: telemetry?.alternator_current ?? null,
      expected: exp.alternator_current ?? null,
      residual: res.alternator_current ?? null,
      unit: 'A',
      severity: Math.abs(res.alternator_current ?? 0) > 5.0 ? 'HIGH' : Math.abs(res.alternator_current ?? 0) > 2.0 ? 'ELEVATED' : 'NOMINAL',
    },
  ];

  const filteredRows = selectedSubsystem === 'ALL' ? rows : rows.filter((r) => r.subsystem === selectedSubsystem);

  const subsystems = ['ALL', 'THERMAL', 'COMBUSTION', 'LUBRICATION', 'MECHANICAL', 'ELECTRICAL'];

  return (
    <section className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-[#dbe3dc] shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dbe3dc] pb-4">
        <div>
          <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
            Physics Residual Delta Engineering Audit
          </h2>
          <p className="text-xs font-mono text-sage-600">
            Computed parameter variance magnitude (Δ = Actual - Expected) &amp; severity status
          </p>
        </div>

        {/* Subsystem filter tabs */}
        <div className="flex items-center gap-1 bg-sage-100/80 p-1 rounded-2xl border border-sage-200/80 overflow-x-auto">
          {subsystems.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubsystem(sub)}
              className={`px-3 py-1 rounded-xl text-[11px] font-mono font-bold transition-all whitespace-nowrap ${
                selectedSubsystem === sub
                  ? 'bg-charcoal text-white shadow-sm'
                  : 'text-sage-700 hover:text-charcoal hover:bg-sage-200/60'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#dbe3dc] text-[10px] font-mono uppercase text-sage-600 tracking-wider">
              <th className="py-3 px-3">Subsystem</th>
              <th className="py-3 px-3">Parameter</th>
              <th className="py-3 px-3 text-right">Expected</th>
              <th className="py-3 px-3 text-right">Actual</th>
              <th className="py-3 px-3 text-right">Residual (Δ)</th>
              <th className="py-3 px-3 text-center">Center-Zero Delta Bar</th>
              <th className="py-3 px-3 text-right">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage-100 text-xs font-mono">
            {filteredRows.map((row) => {
              const hasAct = row.actual !== null && Number.isFinite(row.actual);
              const hasExp = row.expected !== null && Number.isFinite(row.expected);
              const hasRes = row.residual !== null && Number.isFinite(row.residual);

              const delta = hasRes ? row.residual! : hasAct && hasExp ? row.actual! - row.expected! : null;

              // Center-zero bar calculation (-100% to +100% normalized range)
              const maxScale = row.id.includes('rpm') ? 250 : row.id.includes('oil_pressure') ? 1.0 : row.id.includes('temp') ? 25 : 10;
              const normalizedPct = delta !== null ? Math.min(100, Math.max(-100, (delta / maxScale) * 100)) : 0;

              const severityBadge =
                delta === null
                  ? 'bg-sage-100 text-sage-600 border-sage-200'
                  : row.severity === 'CRITICAL'
                  ? 'bg-red-100 text-red-900 border-red-300'
                  : row.severity === 'HIGH'
                  ? 'bg-orange-100 text-orange-900 border-orange-300'
                  : row.severity === 'ELEVATED'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300';

              return (
                <tr key={row.id} className="hover:bg-sage-50/50 transition-colors">
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-sage-100 text-sage-800 text-[10px] font-bold">
                      {row.subsystem}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-charcoal">{row.parameter}</td>
                  <td className="py-3 px-3 text-right text-sage-700 font-semibold">
                    {hasExp ? `${row.expected!.toFixed(2)} ${row.unit}` : '—'}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-charcoal">
                    {hasAct ? `${row.actual!.toFixed(2)} ${row.unit}` : '—'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className={`font-bold ${delta !== null && delta !== 0 ? (delta > 0 ? 'text-amber-800' : 'text-sky-800') : 'text-sage-700'}`}>
                      {delta !== null ? `${delta > 0 ? '+' : ''}${delta.toFixed(2)} ${row.unit}` : '—'}
                    </span>
                  </td>

                  {/* Center Zero Visual Delta Bar */}
                  <td className="py-3 px-3">
                    <div className="w-36 mx-auto h-3 bg-sage-100 rounded-full relative flex items-center overflow-hidden border border-sage-200">
                      <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-sage-400 z-10" />
                      {delta !== null && delta !== 0 && (
                        <div
                          className={`h-full transition-all duration-500 ${delta > 0 ? 'bg-amber-500' : 'bg-sky-500'}`}
                          style={{
                            left: delta > 0 ? '50%' : `${50 + normalizedPct / 2}%`,
                            width: `${Math.abs(normalizedPct) / 2}%`,
                            position: 'absolute',
                          }}
                        />
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${severityBadge}`}>
                      {delta === null ? 'NO DATA' : row.severity}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
