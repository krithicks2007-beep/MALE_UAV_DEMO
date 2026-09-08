import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'dark' | 'glass' | 'danger';
  right?: ReactNode;
  size?: 'sm' | 'md';
}

const variantMap = {
  dark:   'bg-charcoal text-white hover:bg-charcoal-hover shadow-pill-dark',
  glass:  'bg-white/60 border border-[#d3ded6] text-charcoal hover:bg-white',
  danger: 'bg-charcoal text-white hover:bg-red-900',
};

const sizeMap = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-3.5 text-xs',
};

export function PillButton({ children, variant = 'dark', right, size = 'md', className = '', ...props }: PillButtonProps) {
  return (
    <button
      className={`rounded-full flex items-center gap-2 font-medium transition-all ${variantMap[variant]} ${sizeMap[size]} ${right ? 'justify-between w-full' : 'justify-center'} ${className}`}
      {...props}
    >
      <span>{children}</span>
      {right && <span>{right}</span>}
    </button>
  );
}
