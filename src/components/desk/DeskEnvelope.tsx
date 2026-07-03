'use client';

import Link from 'next/link';
import { countdownLabel, humanDistance } from '@/lib/dates';
import type { Letter } from '@/lib/types';

/**
 * Sobre C6 sobre la mesa. Cuatro estados:
 *  - abierta: la carta asoma por detrás con su primera línea y el lacre roto
 *  - entregada sin abrir: sobre cerrado, lacre intacto
 *  - en camino: sobre cerrado, lacre intacto y cuenta atrás
 *  - devuelta: tampón DEVUELTA
 *
 * Regla de oro: la primera línea solo se enseña si la carta está `opened`.
 */
export function DeskEnvelope({ letter, index }: { letter: Letter; index: number }) {
  const opened = letter.status === 'opened';
  const failed = letter.status === 'failed';
  const inTransit = letter.status === 'sealed' || letter.status === 'delivering';
  const created = letter.createdAt?.toDate();
  const delivery = letter.deliveryDate?.toDate();

  const recipient =
    letter.recipientType === 'self' ? 'Tu futuro yo' : letter.recipientName;

  const firstLine = opened
    ? (letter.body ?? '')
        .split('\n')
        .map((l) => l.trim())
        .find(Boolean) ?? ''
    : '';

  const statusLine = failed
    ? 'no pudimos entregarla'
    : inTransit && delivery
      ? countdownLabel(delivery)
      : opened && created && delivery
        ? `viajó ${humanDistance(created, delivery)}`
        : letter.recipientType === 'self'
          ? 'entregada · sin abrir'
          : 'entregada';

  const rotation = index % 2 === 0 ? 0.9 : -0.8;
  const delay = Math.min(0.18 + index * 0.08, 0.6);

  return (
    <Link
      href={`/cartas/${letter.id}`}
      className="posa block"
      style={{ '--posa-delay': `${delay}s` } as React.CSSProperties}
    >
      <article className="sobre-c6" style={{ transform: `rotate(${rotation}deg)` }}>
        {opened && firstLine && (
          <div className="hoja">
            <p className="primera-linea">{firstLine}</p>
            <div className="lineas">
              <i />
              <i />
            </div>
          </div>
        )}
        <div className="bolsillo">
          {opened ? (
            <div className="lacre-roto">
              <i />
              <i />
            </div>
          ) : failed ? (
            <span className="sello-devuelta">Devuelta</span>
          ) : (
            <div className="lacre-mini" />
          )}
          <span className="para-mini">Para</span>
          <span className="titulo">{recipient}</span>
          <span className="viajo">{statusLine}</span>
        </div>
      </article>
    </Link>
  );
}
