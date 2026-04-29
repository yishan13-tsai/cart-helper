import React from 'react';

export type PillTone = 'success' | 'alert' | 'warn' | 'page' | 'neutral';

interface PillProps {
  tone?: PillTone;
  children: React.ReactNode;
  className?: string;
}

const toneClasses: Record<PillTone, string> = {
  success: 'bg-success-wash text-success',
  alert: 'bg-alert-wash text-alert',
  warn: 'bg-warn-wash text-warn',
  page: 'bg-surface text-page',
  neutral: 'bg-ink-10 text-ink-60',
};

export function Pill({ tone = 'neutral', children, className }: PillProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-2xs font-bold leading-none',
        toneClasses[tone],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
