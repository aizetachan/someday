'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AvatarMenu } from '@/components/ui/AvatarMenu';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';

/** "3 · jul · 2026" — la fecha del día, como un matasellos. */
function todayLabel(): string {
  const d = new Date();
  const month = new Intl.DateTimeFormat('es-ES', { month: 'short' })
    .format(d)
    .replace('.', '');
  return `${d.getDate()} · ${month} · ${d.getFullYear()}`;
}

/**
 * Shell autenticado. La plataforma requiere cuenta: sin sesión se vuelve
 * a la landing (donde vive el popup de registro/login).
 *
 * Todo el escritorio vive sobre la mesa de madera — salvo el editor, que
 * es papel a pantalla completa, sin chrome.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isEditor = pathname?.startsWith('/escribir');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <Spinner label="Abriendo el buzón…" />;
  }

  if (isEditor) {
    // El editor también escribe sobre la mesa — pero sin cabecera: la hoja
    // y nada más.
    return (
      <div className="desk-bg min-h-dvh">
        <div className="relative z-[1]">{children}</div>
      </div>
    );
  }

  return (
    <div className="desk-bg min-h-dvh">
      <header className="relative z-10">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 pb-1 pt-[calc(20px+env(safe-area-inset-top))]">
          <Link
            href="/cartas"
            className="text-[13px] font-medium uppercase tracking-[0.22em] text-gris-postal transition-colors hover:text-ink"
          >
            Cartas al Futuro
          </Link>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] tracking-[0.05em] text-gris-postal">
              {todayLabel()}
            </span>
            <AvatarMenu />
          </div>
        </div>
      </header>
      <main className="relative z-[1]">{children}</main>
    </div>
  );
}
