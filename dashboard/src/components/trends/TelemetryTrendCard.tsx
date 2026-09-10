import React, { useState } from 'react';
import type { TelemetrySample } from '../../models/telemetry';
import { Activity } from 'lucide-react';

interface TelemetryTrendCardProps {
  title: string;
  unit: string;
  currentValue: number | null | undefined;
  samples: TelemetrySample[];
  decimals?: number;
  warnThreshold?: number;
  critThreshold?: number;
  isLowerThreshold?: boolean;
  icon?: React.ReactNode;
  isPrimary?: boolean;
}

export function TelemetryTrendCard({
  title,
  unit,
  currentValue,
  samples,
  decimals = 1,
  warnThreshold,
  critThreshold,
  isLowerThreshold = false,
  icon,
  isPrimary = false,
}: TelemetryTrendCardProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const hasCurrent = currentValue !== null && currentValue !== undefined && Number.isFinite(currentValue);
  const hasHistory = samples && samples.length > 0;

  // Determine warning/critical status
  let isWarn = false;
  let isCrit = false;

  if (hasCurrent && currentValue !== null) {
    if (isLowerThreshold) {
      if (critThreshold !== undefined && currentValue < critThreshold) isCrit = true;
      else if (warnThreshold !== undefined && currentValue < warnThreshold) isWarn = true;
    } else {
      if (critThreshold !== undefined && currentValue > critThreshold) isCrit = true;
      else if (warnThreshold !== undefined && currentValue > warnThreshold) isWarn = true;
    }
  }

  const statusBadgeClass = !hasCurrent
    ? 'bg-sage-100 text-sage-600 border-sage-200'
    : isCrit
    ? 'bg-red-100 text-red-900 border-red-300 animate-pulse'
    : isWarn
    ? 'bg-amber-100 text-amber-900 border-amber-300'
    : 'bg-emerald-100 text-emerald-800 border-emerald-300';

  const statusLabel = !hasCurrent ? 'NO DATA' : isCrit ? 'CRITICAL' : isWarn ? 'WARNING' : 'NOMINAL';

  // Compute chart bounds & path points
  const W = 460;
  const H = isPrimary ? 130 : 90;
  const xOff = 30;
  const yOff = 15;

  let pathD = '';
  let areaD = '';
  let rawMin = 0;
  let rawMax = 0;
  let avgVal = 0;
  let chartMin = 0;
  let chartMax = 100;
  let points: { x: number; y: number; sample: TelemetrySample }[] = [];

  if (hasHistory) {
    const rawVals = samples.map((s) => s.value);
    rawMin = Math.min(...rawVals);
    rawMax = Math.max(...rawVals);
    avgVal = rawVals.reduce((a, b) => a + b, 0) / rawVals.length;

    // Use separate chartMin/chartMax variables for visualization scaling and threshold lines
    chartMin = rawMin;
    chartMax = rawMax;

    if (warnThreshold !== undefined) {
      chartMin = Math.min(chartMin, warnThreshold);
      chartMax = Math.max(chartMax, warnThreshold);
    }
    if (critThreshold !== undefined) {
      chartMin = Math.min(chartMin, critThreshold);
      chartMax = Math.max(chartMax, critThreshold);
    }

    const pad = (chartMax - chartMin) * 0.1 || 1;
    chartMin -= pad;
    chartMax += pad;

    const count = samples.length;
    points = samples.map((s, i) => {
      const x = count === 1 ? xOff + W / 2 : xOff + (i / (count - 1)) * W;
      const normY = (s.value - chartMin) / (chartMax - chartMin);
      const y = yOff + H - normY * H;
      return { x, y, sample: s };
    });

    if (points.length === 1) {
      pathD = `M ${points[0].x - 10} ${points[0].y} L ${points[0].x + 10} ${points[0].y}`;
    } else {
      pathD = `M ${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`;
      const lastP = points[points.length - 1];
      const firstP = points[0];
      areaD = `${pathD} L ${lastP.x.toFixed(1)},${yOff + H} L ${firstP.x.toFixed(1)},${yOff + H} Z`;
    }
  }

  const hoverPoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  return (
    <div
      className={`bg-white/70 backdrop-blur-md rounded-3xl border border-[#dbe3dc] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between ${
        isPrimary ? 'p-6 space-y-4' : 'p-5 space-y-3'
      } ${isCrit ? 'border-red-300 bg-red-50/30' : isWarn ? 'border-amber-300 bg-amber-50/20' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#dbe3dc] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sage-100 text-sage-800 shrink-0">
            {icon || <Activity className="w-4 h-4 text-sage-800" />}
          </div>
          <div>
            <h3 className={`font-bold text-charcoal font-mono uppercase tracking-wider ${isPrimary ? 'text-sm' : 'text-xs'}`}>
              {title}
            </h3>
            <span className="text-[10px] font-mono text-sage-600">TIME-SERIES STREAM ({unit})</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${statusBadgeClass}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Readout Summary */}
      <div className="flex items-baseline justify-between px-1">
        <div>
          <span className="text-[10px] font-mono uppercase text-sage-600 block">CURRENT VALUE</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className={`${isPrimary ? 'text-3xl' : 'text-2xl'} font-bold text-charcoal font-mono tracking-tight`}>
              {hasCurrent ? currentValue!.toFixed(decimals) : '—'}
            </span>
            <span className="text-xs font-mono font-bold text-sage-700">{unit}</span>
          </div>
        </div>

        {hasHistory && (
          <div className="flex items-center gap-4 text-right font-mono text-[10px]">
            <div>
              <span className="text-sage-500 block">MIN</span>
              <span className="font-semibold text-sage-700">{rawMin !== undefined && Number.isFinite(rawMin) ? rawMin.toFixed(decimals) : '—'}</span>
            </div>
            <div>
              <span className="text-sage-500 block">AVG</span>
              <span className="font-semibold text-sage-800">{avgVal !== undefined && Number.isFinite(avgVal) ? avgVal.toFixed(decimals) : '—'}</span>
            </div>
            <div>
              <span className="text-sage-500 block">MAX</span>
              <span className="font-semibold text-charcoal">{rawMax !== undefined && Number.isFinite(rawMax) ? rawMax.toFixed(decimals) : '—'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Time-Series Canvas */}
      <div className="relative pt-1">
        {hasHistory ? (
          <div
            className="w-full relative cursor-crosshair"
            onMouseLeave={() => setHoverIndex(null)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const relX = e.clientX - rect.left;
              const pct = relX / rect.width;
              const idx = Math.min(points.length - 1, Math.max(0, Math.round(pct * (points.length - 1))));
              setHoverIndex(idx);
            }}
          >
            <svg
              className={`w-full overflow-visible ${isPrimary ? 'h-36' : 'h-24'}`}
              viewBox={`0 0 500 ${H + yOff + 20}`}
            >
              <defs>
                <linearGradient id={`grad-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isCrit ? '#ef4444' : isWarn ? '#f59e0b' : '#6e8c75'} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={isCrit ? '#ef4444' : isWarn ? '#f59e0b' : '#6e8c75'} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line stroke="#e2eae3" strokeDasharray="3 3" strokeWidth="1" x1={xOff} x2={xOff + W} y1={yOff} y2={yOff} />
              <line stroke="#e2eae3" strokeDasharray="3 3" strokeWidth="1" x1={xOff} x2={xOff + W} y1={yOff + H / 2} y2={yOff + H / 2} />
              <line stroke="#c8d6cb" strokeWidth="1" x1={xOff} x2={xOff + W} y1={yOff + H} y2={yOff + H} />

              {/* Warning Threshold Reference Line */}
              {warnThreshold !== undefined && (
                <g>
                  <line
                    stroke="#d97706"
                    strokeDasharray="4 4"
                    strokeWidth="1.2"
                    x1={xOff}
                    x2={xOff + W}
                    y1={yOff + H - ((warnThreshold - chartMin) / (chartMax - chartMin)) * H}
                  />
                </g>
              )}

              {/* Critical Threshold Reference Line */}
              {critThreshold !== undefined && (
                <g>
                  <line
                    stroke="#dc2626"
                    strokeDasharray="4 4"
                    strokeWidth="1.2"
                    x1={xOff}
                    x2={xOff + W}
                    y1={yOff + H - ((critThreshold - chartMin) / (chartMax - chartMin)) * H}
                  />
                </g>
              )}

              {/* Gradient Fill */}
              {areaD && (
                <path
                  d={areaD}
                  fill={`url(#grad-${title.replace(/\s+/g, '')})`}
                />
              )}

              {/* Time Series Trend Path Line */}
              <path
                d={pathD}
                fill="none"
                stroke={isCrit ? '#dc2626' : isWarn ? '#d97706' : '#425647'}
                strokeWidth={isPrimary ? '2.5' : '2'}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />

              {/* End Point Indicator */}
              {points.length > 0 && (
                <g>
                  <circle
                    cx={points[points.length - 1].x}
                    cy={points[points.length - 1].y}
                    r="4"
                    fill={isCrit ? '#dc2626' : isWarn ? '#d97706' : '#10b981'}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                </g>
              )}

              {/* Hover Indicator Line & Point */}
              {hoverPoint && (
                <g>
                  <line
                    x1={hoverPoint.x}
                    x2={hoverPoint.x}
                    y1={yOff}
                    y2={yOff + H}
                    stroke="#1f2421"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <circle
                    cx={hoverPoint.x}
                    cy={hoverPoint.y}
                    r="5"
                    fill="#1f2421"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </g>
              )}

              {/* Axis Timestamp Labels */}
              <text fill="#6e8c75" fontFamily="JetBrains Mono" fontSize="9" x={xOff} y={H + yOff + 14}>
                {samples[0]?.t ? new Date(samples[0].t * 1000).toISOString().substring(11, 19) : '—'}
              </text>
              <text fill="#6e8c75" fontFamily="JetBrains Mono" fontSize="9" x={xOff + W / 2 - 20} y={H + yOff + 14}>
                BUFFER HISTORY
              </text>
              <text fill="#314035" fontFamily="JetBrains Mono" fontSize="9" fontWeight="600" x={xOff + W - 35} y={H + yOff + 14}>
                NOW
              </text>
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoverPoint && (
              <div
                className="absolute top-0 transform -translate-x-1/2 -translate-y-full bg-charcoal text-white text-[10px] font-mono py-1 px-2.5 rounded-lg shadow-lg border border-sage-700 pointer-events-none z-20"
                style={{ left: `${(hoverPoint.x / 500) * 100}%` }}
              >
                <div>{new Date(hoverPoint.sample.t * 1000).toISOString().substring(11, 19)} UTC</div>
                <div className="font-bold text-emerald-400">
                  {hoverPoint.sample.value.toFixed(decimals)} {unit}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-24 bg-sage-50/60 rounded-2xl border border-sage-200/80 flex flex-col items-center justify-center text-sage-500 font-mono text-xs space-y-1">
            <span className="font-bold text-sage-600">NO TELEMETRY HISTORY AVAILABLE</span>
            <span className="text-[10px] text-sage-400">Awaiting live telemetry stream frames</span>
          </div>
        )}
      </div>
    </div>
  );
}
