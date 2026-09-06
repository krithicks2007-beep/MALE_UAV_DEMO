interface ProgressBarProps {
  label: string;
  value: number; // 0–100
  className?: string;
}

export function ProgressBar({ label, value, className = '' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  const color =
    pct >= 85 ? 'bg-sage-600' : pct >= 65 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className={className}>
      <div className="flex justify-between text-xs font-mono mb-1">
        <span className="text-sage-800 font-medium">{label}</span>
        <span className="font-semibold text-charcoal">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-sage-100 overflow-hidden">
        <div
          className={`h-full rounded-full progress-fill ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
