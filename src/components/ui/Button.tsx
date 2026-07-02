'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'bg-seal text-paper hover:bg-seal-hover active:bg-seal-hover disabled:opacity-50',
  secondary:
    'border border-ink-soft/30 text-ink hover:border-ink hover:bg-paper-warm disabled:opacity-50',
  ghost: 'text-ink-soft hover:text-ink hover:bg-paper-warm disabled:opacity-50',
  danger:
    'border border-error/40 text-error hover:bg-error hover:text-paper disabled:opacity-50',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[4px] font-medium transition-colors disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
