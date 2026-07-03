'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AvatarMenu } from '@/components/ui/AvatarMenu';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';

/**
 * Shell autenticado. La plataforma requiere cuenta: sin sesión se vuelve
 * a la landing (donde vive el popup de registro/login).
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

  return (
    <div className="min-h-dvh">
      {/* En el editor la nav desaparece: pantalla completa, cero chrome */}
      {!isEditor && (
        <header className="sticky top-0 z-40 border-b border-ink-soft/10 bg-paper/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-5 py-3.5">
            <Link href="/cartas" className="font-serif text-lg text-ink">
              Cartas al Futuro
            </Link>
            <nav className="flex items-center gap-5">
              <Link
                href="/escribir"
                className="rounded-[4px] bg-seal px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-seal-hover"
              >
                Escribir
              </Link>
              <AvatarMenu />
            </nav>
          </div>
        </header>
      )}
      <main>{children}</main>
    </div>
  );
}
