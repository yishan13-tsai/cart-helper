import React from 'react';
import { TIcon, TIconName } from './TIcon';

export type RoundButtonTone = 'surface' | 'white';

interface RoundButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: TIconName;
  tone?: RoundButtonTone;
}

const toneClasses: Record<RoundButtonTone, string> = {
  surface: 'bg-surface text-page',
  white: 'bg-white text-ink',
};

export function RoundButton({ icon, tone = 'surface', className, ...rest }: RoundButtonProps) {
  return (
    <button
      className={[
        'flex h-9 w-9 items-center justify-center rounded-full border-none cursor-pointer transition active:scale-95',
        toneClasses[tone],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <TIcon name={icon} size={16} />
    </button>
  );
}
