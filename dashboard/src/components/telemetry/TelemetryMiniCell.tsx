interface TelemetryMiniCellProps {
  label: string;
  value: number | string;
  unit: string;
  warn?: boolean;
  crit?: boolean;
  decimals?: number;
}

export function TelemetryMiniCell({
  label,
  value,
  unit,
  warn,
  crit,
  decimals = 1
}: TelemetryMiniCellProps) {
  const valueColor = crit ? 'text-red-600' : warn ? 'text-amber-600' : 'text-charcoal';
  const displayValue = typeof value === 'number' ? value.toFixed(decimals) : value;

  return (
    <div className="p-3 rounded-2xl bg-sage-50/60 border border-[#e2eae3] transition-colors duration-200">
      <span className="text-[10px] font-mono text-sage-600 block">{label}</span>
      <div className={`font-mono text-base font-bold mt-0.5 ${valueColor}`}>
        {displayValue}
      </div>
      <span className="text-[10px] font-mono text-sage-500">{unit}</span>
    </div>
  );
}
