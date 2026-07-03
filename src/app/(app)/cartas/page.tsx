'use client';

import Link from 'next/link';
import { DeskEmpty } from '@/components/desk/DeskEmpty';
import { DeskEnvelope } from '@/components/desk/DeskEnvelope';
import { ParAvionEnvelope } from '@/components/desk/ParAvionEnvelope';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useLetters } from '@/hooks/useLetters';

/**
 * El escritorio: las cartas reposan sobre la mesa. La próxima en llegar es
 * un sobre par avion sellado; las entregadas, sobres C6 — solo las abiertas
 * dejan asomar su primera línea.
 */
export default function CartasPage() {
  const { user } = useAuth();
  const { loading, inTransit, delivered, failed } = useLetters();

  if (loading) return <Spinner label="Buscando tus cartas…" />;

  const firstName = (user?.displayName ?? '').split(' ')[0];

  const sortedTransit = [...inTransit].sort(
    (a, b) => a.deliveryDate.toMillis() - b.deliveryDate.toMillis(),
  );
  const next = sortedTransit[0] ?? null;
  const restTransit = sortedTransit.slice(1);
  const sortedDelivered = [...delivered].sort(
    (a, b) =>
      (b.deliveredAt?.toMillis() ?? b.deliveryDate.toMillis()) -
      (a.deliveredAt?.toMillis() ?? a.deliveryDate.toMillis()),
  );
  const empty = !inTransit.length && !delivered.length && !failed.length;

  const resumen = empty
    ? 'tu escritorio te espera'
    : [
        inTransit.length
          ? `${inTransit.length} ${inTransit.length === 1 ? 'carta en camino' : 'cartas en camino'}`
          : null,
        delivered.length
          ? `${delivered.length} ${delivered.length === 1 ? 'entregada' : 'entregadas'}`
          : null,
        failed.length
          ? `${failed.length} ${failed.length === 1 ? 'devuelta' : 'devueltas'}`
          : null,
      ]
        .filter(Boolean)
        .join(' · ');

  const hasTransitColumn = Boolean(next);

  return (
    <div className="mx-auto w-full max-w-[560px] px-6 pb-[calc(120px+env(safe-area-inset-bottom))] lg:max-w-5xl">
      <h1 className="posa mt-6 font-hand text-[38px] font-semibold leading-none text-[#2e2820]">
        Hola{firstName ? `, ${firstName}` : ''}
      </h1>
      <p
        className="posa mt-1.5 font-hand text-xl text-gris-postal"
        style={{ '--posa-delay': '0.05s' } as React.CSSProperties}
      >
        {resumen}
      </p>

      {empty ? (
        <DeskEmpty />
      ) : (
        <div
          className={
            hasTransitColumn
              ? 'mt-10 lg:grid lg:grid-cols-[440px_minmax(0,1fr)] lg:items-start lg:gap-16'
              : 'mt-10'
          }
        >
          {hasTransitColumn && (
            <div>
              <section>
                <p className="grupo">Próximo envío</p>
                <ParAvionEnvelope letter={next!} />
              </section>

              {restTransit.length > 0 && (
                <section className="mt-16">
                  <p className="grupo">También en camino</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-2">
                    {restTransit.map((letter, i) => (
                      <DeskEnvelope key={letter.id} letter={letter} index={i} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          <div>
            {failed.length > 0 && (
              <section className={hasTransitColumn ? 'mt-16 lg:mt-0' : ''}>
                <p className="grupo !text-[#a23325]">
                  Devueltas — necesitan tu atención
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3">
                  {failed.map((letter, i) => (
                    <DeskEnvelope key={letter.id} letter={letter} index={i} />
                  ))}
                </div>
              </section>
            )}

            {sortedDelivered.length > 0 && (
              <section
                className={
                  failed.length > 0
                    ? 'mt-16'
                    : hasTransitColumn
                      ? 'mt-16 lg:mt-0'
                      : ''
                }
              >
                <p className="grupo">Entregadas — relegibles para siempre</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3">
                  {sortedDelivered.map((letter, i) => (
                    <DeskEnvelope key={letter.id} letter={letter} index={i} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}

      {/* CTA flotante: la pluma siempre a mano */}
      <Link
        href="/escribir"
        className="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-b from-[#3a3226] to-[#241e15] px-8 pb-4 pt-3 font-hand text-[22px] font-semibold leading-none text-[#f6f1e6] shadow-[0_2px_4px_rgba(36,30,21,0.3),0_12px_26px_rgba(36,30,21,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] transition-transform hover:-translate-y-0.5"
      >
        ✎ Escribir una carta
      </Link>
    </div>
  );
}
