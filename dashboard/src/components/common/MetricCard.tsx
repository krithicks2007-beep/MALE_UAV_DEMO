import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon: ReactNode;
  iconBg?: string;
  valueClass?: string;
}

export function MetricCard({ label, value, unit, icon, iconBg = 'bg-sage-100/70 text-sage-700', valueClass = 'text-charcoal' }: MetricCardProps) {
  return (
    <div className="flex items-center justify-between px-4 border-r last:border-0 border-[#dce4de]/80">
      <div>
        <span className="block text-xs font-medium text-sage-600 tracking-normal">{label}</span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className={`text-3xl lg:text-4xl font-light tracking-tight font-sans ${valueClass}`}>
            {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : value}
          </span>
          <span className="text-xs font-mono font-medium text-sage-600">{unit}</span>
        </div>
      </div>
      <div className={`w-11 h-11 rounded-full flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
    </div>
  );
}
