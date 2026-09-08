import { useHealthStore } from '../../stores/healthStore';
import { SectionCard, CardHeader } from '../common/SectionCard';

export function DegradationTrendChart() {
  const health = useHealthStore((s) => s.health);
  const currentPct = health ? Math.round(health.index) : 94;

  // Use trend array or generate a realistic degradation baseline
  const trend = health?.degradation_trend && health.degradation_trend.length > 0
    ? health.degradation_trend
    : Array.from({ length: 20 }, (_, i) => 98 - i * 0.22);

  // SVG dimensions & drawing boundaries (500×120 viewBox)
  const W = 420;
  const H = 64;
  const xOff = 48;
  const yOff = 18;

  // Determine dynamic min and max from all data points + current health
  const allVals = [...trend, currentPct].filter((v) => typeof v === 'number' && !isNaN(v));
  const rawMin = allVals.length > 0 ? Math.min(...allVals) : 80;
  const rawMax = allVals.length > 0 ? Math.max(...allVals) : 100;

  // Round scale to clean steps (e.g., 70-100, 80-100, etc.)
  const yMin = Math.max(0, Math.floor((rawMin - 3) / 10) * 10);
  const yMax = Math.min(100, Math.max(yMin + 10, Math.ceil((rawMax + 2) / 10) * 10));
  const range = Math.max(10, yMax - yMin);

  // Coordinate mapping helper with strict boundary clamping
  const getY = (val: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    return yOff + H - ((clamped - yMin) / range) * H;
  };

  const getX = (idx: number, total: number) => {
    if (total <= 1) return xOff + W;
    return xOff + (idx / (total - 1)) * W;
  };

  // Generate SVG path coordinates
  const pts = trend.map((v, i) => ({
    x: getX(i, trend.length),
    y: getY(v),
  }));

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L ${(xOff + W).toFixed(1)},${(yOff + H).toFixed(1)} L ${xOff.toFixed(1)},${(yOff + H).toFixed(1)} Z`;

  // Grid level values
  const yMid = Math.round((yMax + yMin) / 2);
  const yTopPos = getY(yMax);
  const yMidPos = getY(yMid);
  const yBtmPos = getY(yMin);

  // Marker for current operating health
  const markerX = xOff + W;
  const markerY = getY(currentPct);

  // Health color indicator based on current level
  const statusColor = currentPct >= 85 ? '#55705b' : currentPct >= 70 ? '#d97706' : '#dc2626';

  return (
    <SectionCard>
      <CardHeader
        title="Engine Health / Degradation Trend"
        right={<span className="text-xs font-mono text-sage-600">Health % vs Operating Hours</span>}
      />
      <div className="p-4 rounded-2xl bg-sage-50/50 border border-[#e5ede7] overflow-hidden">
        <svg className="w-full h-36" viewBox="0 0 500 120">
          <defs>
            <linearGradient id="degradationAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={statusColor} stopOpacity="0.28" />
              <stop offset="100%" stopColor={statusColor} stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="degradationLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6e8c75" />
              <stop offset="100%" stopColor={statusColor} />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          <line stroke="#d5e0d7" strokeDasharray="3 3" strokeWidth="1" x1={xOff} x2={xOff + W} y1={yTopPos} y2={yTopPos} />
          <line stroke="#d5e0d7" strokeDasharray="3 3" strokeWidth="1" x1={xOff} x2={xOff + W} y1={yMidPos} y2={yMidPos} />
          <line stroke="#c1d0c4" strokeWidth="1.2" x1={xOff} x2={xOff + W} y1={yBtmPos} y2={yBtmPos} />

          {/* Y Axis Labels */}
          <text fill="#6e8c75" fontFamily="JetBrains Mono" fontSize="9.5" textAnchor="end" x={xOff - 6} y={yTopPos + 3.5}>{yMax}%</text>
          <text fill="#6e8c75" fontFamily="JetBrains Mono" fontSize="9.5" textAnchor="end" x={xOff - 6} y={yMidPos + 3.5}>{yMid}%</text>
          <text fill="#6e8c75" fontFamily="JetBrains Mono" fontSize="9.5" textAnchor="end" x={xOff - 6} y={yBtmPos + 3.5}>{yMin}%</text>

          {/* Nominal Safe Baseline guide */}
          <line
            x1={xOff}
            y1={getY(96)}
            x2={xOff + W}
            y2={getY(90)}
            stroke="#b8ccbd"
            strokeDasharray="4 4"
            strokeWidth="1.2"
            opacity="0.8"
          />

          {/* Area Fill */}
          <path d={areaD} fill="url(#degradationAreaGrad)" />

          {/* Degradation Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#degradationLineGrad)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
          />

          {/* Current Operating Point Marker */}
          <circle
            cx={markerX}
            cy={markerY}
            r="8"
            fill={statusColor}
            opacity="0.25"
            className="animate-ping"
          />
          <circle
            cx={markerX}
            cy={markerY}
            r="5"
            fill={statusColor}
            stroke="#ffffff"
            strokeWidth="2"
            filter="url(#glowFilter)"
          />

          {/* X Axis Time Labels */}
          <text fill="#6e8c75" fontFamily="JetBrains Mono" fontSize="9" x={xOff} y="112">0 hrs</text>
          <text fill="#6e8c75" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" x={xOff + W * 0.33} y="112">200 hrs</text>
          <text fill="#6e8c75" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" x={xOff + W * 0.66} y="112">400 hrs</text>
          <text fill="#6e8c75" fontFamily="JetBrains Mono" fontSize="9" textAnchor="end" x={xOff + W} y="112">600 hrs</text>

          {/* Current Health Badge Inset */}
          <text
            fill="#314035"
            fontFamily="JetBrains Mono"
            fontSize="10"
            fontWeight="700"
            textAnchor="end"
            x={xOff + W}
            y={Math.max(14, markerY - 9)}
          >
            {currentPct}% Health
          </text>
        </svg>
      </div>
    </SectionCard>
  );
}
