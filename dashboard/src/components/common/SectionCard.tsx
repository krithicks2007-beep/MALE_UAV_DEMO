import type { ReactNode } from 'react';

interface SectionCardProps {
  children?: ReactNode;
  className?: string;
  noPad?: boolean;
}

export function SectionCard({ children, className = '', noPad = false }: SectionCardProps) {
  return (
    <div
      className={`rounded-3xl bg-white border border-[#dce4de] shadow-subtle ${noPad ? '' : 'p-6'} ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  right?: ReactNode;
  className?: string;
}

export function CardHeader({ title, right, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-4 pb-3 border-b border-[#e9efe9] ${className}`}>
      <span className="text-xs font-semibold tracking-wider text-sage-700 uppercase">{title}</span>
      {right}
    </div>
  );
}
