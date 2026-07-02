'use client';

import type { InputHTMLAttributes } from 'react';

export function Input({
  label,
  error,
  className = '',
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  const inputId = id ?? rest.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-[4px] border border-ink-soft/30 bg-white/60 px-3.5 py-2.5 text-ink placeholder:text-ink-soft/50 focus:border-seal focus:outline-none ${error ? 'border-error' : ''} ${className}`}
        {...rest}
      />
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
