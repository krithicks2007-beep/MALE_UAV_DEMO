import { useHealthStore } from '../../stores/healthStore';
import { SectionCard, CardHeader } from '../common/SectionCard';

export function DegradationTrendChart() {
  const health = useHealthStore((s) => s.health);
  const trend = health?.degradation_trend ?? Array.from({ length: 20 }, (_, i) => 94 + i * 0.06);

  // Map trend array to SVG path (500×110 viewBox)
  const W = 440; const H = 70; const xOff = 40; const yOff = 15;
  const min = 88; const max = 102;
  const pts = trend.map((v, i) => {
    const x = xOff + (i / (trend.length - 1)) * W;
    const y = yOff + H - ((v - min) / (max - min)) * H;
    return `${x},${y}`;
  });
  const pathD = `M ${pts.join(' L ')}`;
  const currentPct = health ? Math.round(health.index) : 94;

  return (
    <SectionCard>
      <CardHeader
        title="Engine Health / Degradation Trend"
        right={<span className="text-xs font-mono text-sage-600">Health % vs Operating Hours</span>}
      />
      <div className="p-4 rounded-2xl bg-sage-50/50 border border-[#e5ede7]">
        <svg className="w-full h-32 overflow-visible" viewBox="0 0 500 110">
          {/* Grid lines */}
          <line stroke="#d5e0d7" strokeDasharray="3 3" strokeWidth="1" x1="40" x2="480" y1="15" y2="15" />
          <line stroke="#d5e0d7" strokeDasharray="3 3" strokeWidth="1" x1="40" x2="480" y1="50" y2="50" />
          <line stroke="#c1d0c4" strokeWidth="1" x1="40" x2="480" y1="85" y2="85" />
          {/* Y labels */}
          <text fill="#6e8c75" fontFamily="JetBrains Mono" fontSize="10" x="5" y="20">100%</text>
          <text fill="#6e8c75" fontFamily="JetBrains Mono" fontSize="10" x="12" y="55">95%</text>
          <text fill="#6e8c75" fontFamily="JetBrains Mono" fontSize="10" x="12" y="90">90%</text>
          {/* Safe baseline */}
          <path d="M 40 20 L 480 50" fill="none" stroke="#c4d6c7" strokeDasharray="4 4" strokeWidth="1.2" />
          {/* Degradation curve */}
          <path d={pathD} fill="none" stroke="#55705b" strokeLinecap="round" strokeWidth="2.5" />
          {/* Current marker */}
          <circle cx={xOff + W} cy={yOff + H - ((health?.index ?? 94 - min) / (max - min)) * H} r="5" fill="#314035" stroke="#ffffff" strokeWidth="2" />
          {/* X labels */}
          <text fill="#6e8c75" fontFamily="JetBrains Mono" fontSize="9" x="40" y="102">0 hrs</text>
          <text fill="#6e8c75" fontFamily="JetBrains Mono" fontSize="9" x="170" y="102">300 hrs</text>
          <text fill="#6e8c75" fontFamily="JetBrains Mono" fontSize="9" x="300" y="102">600 hrs</text>
          <text fill="#314035" fontFamily="JetBrains Mono" fontSize="10" fontWeight="600" x="390" y="102">
            Current: {currentPct}%
          </text>
        </svg>
      </div>
    </SectionCard>
  );
}
