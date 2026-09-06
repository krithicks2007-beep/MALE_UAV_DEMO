import type { ReactNode } from 'react';

interface SagePanelProps {
  children?: ReactNode;
  className?: string;
}

/** Frosted sage-green right-column panel matching the design reference */
export function SagePanel({ children, className = '' }: SagePanelProps) {
  return (
    <section
      className={`flex flex-col gap-5 bg-[#d3e2d6]/80 p-6 rounded-3xl border border-[#c4d6c8] shadow-subtle ${className}`}
    >
      {children}
    </section>
  );
}

interface SagePanelHeaderProps {
  title: string;
  icon?: ReactNode;
  right?: ReactNode;
}

export function SagePanelHeader({ title, icon, right }: SagePanelHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-[#bdcfc1]">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider text-sage-900">{title}</span>
      </div>
      {right ?? <span className="w-2.5 h-2.5 rounded-full bg-sage-700" />}
    </div>
  );
}

/** Frosted white inner card for use inside SagePanel */
export function GlassCard({ children, className = '' }: SagePanelProps) {
  return (
    <div className={`rounded-2xl p-4 bg-white/70 backdrop-blur-sm border border-[#c5d8ca] ${className}`}>
      {children}
    </div>
  );
}
