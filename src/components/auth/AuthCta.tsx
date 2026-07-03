'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from './AuthModal';

/**
 * CTA de la landing: si hay sesión navega directo; si no, abre el popup
 * de registro/login. `mode` decide la pestaña inicial del popup.
 */
export function AuthCta({
  children,
  className = '',
  style,
  redirectTo,
  mode = 'register',
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  redirectTo: string;
  mode?: 'login' | 'register';
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (user) {
    return (
      <Link href={redirectTo} className={className} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
        style={style}
      >
        {children}
      </button>
      <AuthModal
        open={open}
        onClose={() => setOpen(false)}
        redirectTo={redirectTo}
        initialMode={mode}
      />
    </>
  );
}
