interface SemiArcGaugeProps {
  value: number;      // 0–100
  size?: number;      // px
  strokeWidth?: number;
  label?: string;
}

/**
 * SVG semicircular arc gauge.
 * Renders a half-circle track with a filled arc proportional to value.
 */
export function SemiArcGauge({ value, size = 128, strokeWidth = 8, label }: SemiArcGaugeProps) {
  const r = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  // Arc goes from 180° to 0° (left to right, bottom half only for semi-circle)
  const circumference = Math.PI * r; // half circumference
  const pct = Math.min(100, Math.max(0, value)) / 100;
  const dash = pct * circumference;
  const gap = circumference - dash;

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width={size}
        height={size / 2 + strokeWidth}
        viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
        className="overflow-visible"
      >
        {/* Track */}
        <path
          d={`M ${strokeWidth} ${cy} A ${r} ${r} 0 0 1 ${size - strokeWidth} ${cy}`}
          fill="none"
          stroke="#d3dfd5"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={`M ${strokeWidth} ${cy} A ${r} ${r} 0 0 1 ${size - strokeWidth} ${cy}`}
          fill="none"
          stroke="#55705b"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap + 0.01}`}
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      {label && (
        <span className="text-2xs font-mono text-sage-600 mt-0.5 absolute bottom-0">{label}</span>
      )}
    </div>
  );
}
