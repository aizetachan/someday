'use client';

import { Suspense, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  OpeningCeremony,
  type OpenedLetter,
} from '@/components/opening/OpeningCeremony';
import { AvatarMenu } from '@/components/ui/AvatarMenu';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';

/**
 * Marco de la ceremonia: la carta se abre sobre la misma mesa que el resto
 * de la app. Con sesión hay vuelta al buzón; sin ella, la marca lleva al
 * inicio.
 */
function AbrirShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="desk-bg min-h-dvh">
      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 pb-1 pt-[calc(20px+env(safe-area-inset-top))]">
        <Link
          href={user ? '/cartas' : '/'}
          className="text-[13px] font-medium uppercase tracking-[0.22em] text-gris-postal transition-colors hover:text-ink"
        >
          Cartas al Futuro
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <Link
              href="/cartas"
              className="text-sm text-[#6f6455] transition-colors hover:text-ink"
            >
              ← Mis cartas
            </Link>
          )}
          <AvatarMenu />
        </div>
      </header>
      <main className="relative z-[1]">{children}</main>
    </div>
  );
}

function AbrirContent() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const token = params.get('t') ?? '';

  const [letter, setLetter] = useState<OpenedLetter | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'notfound' | 'early'>(
    'loading',
  );

  useEffect(() => {
    if (!id || !token) {
      setState('notfound');
      return;
    }
    let cancelled = false;
    fetch(`/api/letters/open?id=${encodeURIComponent(id)}&t=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 425) {
          setState('early');
          return;
        }
        if (!res.ok) {
          setState('notfound');
          return;
        }
        setLetter((await res.json()) as OpenedLetter);
        setState('ok');
      })
      .catch(() => !cancelled && setState('notfound'));
    return () => {
      cancelled = true;
    };
  }, [id, token]);

  if (state === 'loading') return <Spinner label="Buscando la carta…" />;

  if (state === 'early') {
    return (
      <div className="flex min-h-[calc(100dvh-88px)] flex-col items-center justify-center px-5 text-center">
        <h1 className="font-serif text-2xl text-ink">Todavía no es el momento</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
          Esta carta sigue sellada. Llegará cuando tenga que llegar.
        </p>
      </div>
    );
  }

  if (state === 'notfound' || !letter) {
    return (
      <div className="flex min-h-[calc(100dvh-88px)] flex-col items-center justify-center px-5 text-center">
        <h1 className="font-serif text-2xl text-ink">Aquí no hay ninguna carta</h1>
        <p className="mt-3 max-w-md text-sm text-ink-soft">
          El enlace no es válido o la carta ya no existe.
        </p>
        <Link
          href="/"
          className="mt-6 text-sm font-medium text-seal underline-offset-4 hover:underline"
        >
          Ir al inicio →
        </Link>
      </div>
    );
  }

  return <OpeningCeremony letter={letter} />;
}

export default function AbrirPage() {
  return (
    <AbrirShell>
      <Suspense fallback={<Spinner label="Buscando la carta…" />}>
        <AbrirContent />
      </Suspense>
    </AbrirShell>
  );
}
