import type { ReactNode } from 'react';

type Variant = 'nominal' | 'warning' | 'critical' | 'info' | 'active' | 'muted' | 'egt-anomaly';

const variantClasses: Record<Variant, string> = {
  nominal:     'bg-emerald-100 text-emerald-800 border-emerald-200',
  warning:     'bg-amber-100 text-amber-900 border-amber-200',
  critical:    'bg-red-100 text-red-800 border-red-200',
  info:        'bg-blue-100 text-blue-800 border-blue-200',
  active:      'bg-sage-600 text-white border-transparent',
  muted:       'bg-sage-100 text-sage-800 border-sage-200',
  'egt-anomaly': 'bg-[#faede1] text-amber-900 border-amber-200',
};

interface StatusPillProps {
  label: string;
  variant?: Variant;
  dot?: boolean;
  animate?: boolean;
  children?: ReactNode;
  className?: string;
}

export function StatusPill({ label, variant = 'nominal', dot = false, animate = false, className = '' }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold tracking-wider uppercase ${variantClasses[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${variant === 'nominal' ? 'bg-emerald-500' : variant === 'warning' ? 'bg-amber-500' : variant === 'critical' ? 'bg-red-500' : variant === 'active' ? 'bg-white' : 'bg-sage-500'} ${animate ? 'animate-pulse' : ''}`}
        />
      )}
      {label}
    </span>
  );
}
