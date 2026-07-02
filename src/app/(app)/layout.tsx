'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';

/**
 * Shell autenticado. /escribir queda exento del guard: el onboarding
 * permite escribir antes de registrarse (el registro llega al sellar).
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isEditor = pathname?.startsWith('/escribir');

  useEffect(() => {
    if (!loading && !user && !isEditor) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname ?? '/cartas')}`);
    }
  }, [loading, user, isEditor, pathname, router]);

  if (!isEditor && (loading || !user)) {
    return <Spinner label="Abriendo el buzón…" />;
  }

  return (
    <div className="min-h-dvh">
      {/* En el editor la nav desaparece: pantalla completa, cero chrome */}
      {!isEditor && (
        <header className="sticky top-0 z-40 border-b border-ink-soft/10 bg-paper/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-5 py-4">
            <Link href="/cartas" className="font-serif text-lg text-ink">
              Cartas al Futuro
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              <Link
                href="/escribir"
                className="font-medium text-seal transition-colors hover:text-seal-hover"
              >
                Escribir
              </Link>
              <Link
                href="/cartas"
                className={
                  pathname?.startsWith('/cartas')
                    ? 'text-ink'
                    : 'text-ink-soft hover:text-ink'
                }
              >
                Mis cartas
              </Link>
              <Link
                href="/ajustes"
                className={
                  pathname?.startsWith('/ajustes')
                    ? 'text-ink'
                    : 'text-ink-soft hover:text-ink'
                }
              >
                Ajustes
              </Link>
            </nav>
          </div>
        </header>
      )}
      <main>{children}</main>
    </div>
  );
}
