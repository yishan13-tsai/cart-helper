import React from 'react';
import { TIcon, TIconName } from './TIcon';

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: TIconName;
  size?: 'lg' | 'md';
  fill?: boolean;
  children?: React.ReactNode;
}

export function Btn({
  icon,
  size = 'lg',
  fill = true,
  children,
  className,
  ...rest
}: BtnProps) {
  const isLg = size === 'lg';

  const baseClasses = [
    'w-full flex items-center justify-center gap-2 font-bold transition active:scale-[0.98] cursor-pointer',
    isLg ? 'h-14 rounded-[28px] text-base' : 'h-11 rounded-[22px] text-sm',
    fill
      ? 'bg-page text-white border-none shadow-cta'
      : 'bg-transparent text-ink-60 border border-ink/15',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={[baseClasses, className].filter(Boolean).join(' ')} {...rest}>
      {icon && (
        <TIcon
          name={icon}
          size={18}
          className={fill ? 'text-white' : 'text-ink-60'}
        />
      )}
      {children}
    </button>
  );
}
