'use client';

import Link from 'next/link';
import { Mailbox, PenLine } from 'lucide-react';
import { LetterCard } from '@/components/letters/LetterCard';
import { LetterTimeline } from '@/components/letters/LetterTimeline';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useLetters } from '@/hooks/useLetters';
import { countdownLabel } from '@/lib/dates';

/**
 * El buzón: cartas en camino en una línea temporal, y las ya enviadas
 * (entregadas o abiertas) debajo, relegibles para siempre.
 */
export default function CartasPage() {
  const { user } = useAuth();
  const { loading, inTransit, delivered, failed } = useLetters();

  if (loading) return <Spinner label="Buscando tus cartas…" />;

  const firstName = (user?.displayName ?? '').split(' ')[0];
  const next = inTransit.length
    ? [...inTransit].sort(
        (a, b) => a.deliveryDate.toMillis() - b.deliveryDate.toMillis(),
      )[0]
    : null;
  const empty = inTransit.length === 0 && delivered.length === 0 && failed.length === 0;

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="font-serif text-3xl text-ink">
        {firstName ? `Tu buzón, ${firstName}` : 'Tu buzón'}
      </h1>

      {empty ? (
        <div className="flex flex-col items-center gap-5 py-24 text-center">
          <Mailbox size={56} strokeWidth={1} className="text-ink-soft/40" />
          <div>
            <p className="font-serif text-xl text-ink">
              Todavía no hay cartas viajando en el tiempo
            </p>
            <p className="mt-1.5 text-sm text-ink-soft">
              La primera es siempre la más difícil de empezar — y la mejor de recibir.
            </p>
          </div>
          <Link
            href="/escribir"
            className="flex items-center gap-2 rounded-[4px] bg-seal px-6 py-3 text-sm font-medium text-paper hover:bg-seal-hover"
          >
            <PenLine size={16} strokeWidth={1.5} /> Escribir mi primera carta
          </Link>
        </div>
      ) : (
        <>
          {/* Resumen */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="paper-surface rounded-[4px] border border-ink-soft/15 p-4">
              <p className="font-mono text-2xl text-seal">{inTransit.length}</p>
              <p className="mt-1 text-xs text-ink-soft">en camino</p>
            </div>
            <div className="paper-surface rounded-[4px] border border-ink-soft/15 p-4">
              <p className="font-mono text-2xl text-success">{delivered.length}</p>
              <p className="mt-1 text-xs text-ink-soft">entregadas</p>
            </div>
            <div className="paper-surface rounded-[4px] border border-ink-soft/15 p-4">
              <p className="truncate font-mono text-2xl text-gold">
                {next ? countdownLabel(next.deliveryDate.toDate()).replace(/^faltan? /, '') : '—'}
              </p>
              <p className="mt-1 text-xs text-ink-soft">próxima entrega</p>
            </div>
          </div>

          {/* En camino */}
          <section className="mt-12">
            <div className="flex items-baseline justify-between">
              <h2 className="font-serif text-xl text-ink">En camino</h2>
              <span className="text-xs text-ink-soft">
                cerradas hasta su fecha — también para ti
              </span>
            </div>
            {inTransit.length ? (
              <div className="mt-6">
                <LetterTimeline letters={inTransit} />
              </div>
            ) : (
              <p className="mt-4 rounded-[4px] border border-dashed border-ink-soft/25 p-5 text-center text-sm text-ink-soft">
                Ninguna carta viajando ahora mismo.{' '}
                <Link href="/escribir" className="text-seal underline-offset-4 hover:underline">
                  Escribe una →
                </Link>
              </p>
            )}
          </section>

          {/* Fallidas (si las hay) */}
          {failed.length > 0 && (
            <section className="mt-12">
              <h2 className="font-serif text-xl text-error">Necesitan tu atención</h2>
              <div className="mt-4 flex flex-col gap-3">
                {failed.map((letter) => (
                  <LetterCard key={letter.id} letter={letter} />
                ))}
              </div>
            </section>
          )}

          {/* Enviadas */}
          <section className="mt-12">
            <div className="flex items-baseline justify-between">
              <h2 className="font-serif text-xl text-ink">Enviadas</h2>
              <span className="text-xs text-ink-soft">relegibles para siempre</span>
            </div>
            {delivered.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {delivered.map((letter) => (
                  <LetterCard key={letter.id} letter={letter} />
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-[4px] border border-dashed border-ink-soft/25 p-5 text-center text-sm text-ink-soft">
                Ninguna carta ha llegado aún a su destino. Llegarán.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
