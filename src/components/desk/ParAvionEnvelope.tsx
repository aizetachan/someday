'use client';

import Link from 'next/link';
import { formatDateEs } from '@/lib/dates';
import type { Letter } from '@/lib/types';

/** Cuánto falta, en la unidad natural más grande. */
function remaining(delivery: Date): { n: number; unit: string; stamp: string } {
  const ms = Math.max(0, delivery.getTime() - Date.now());
  if (ms < 3_600_000) {
    const n = Math.max(1, Math.round(ms / 60_000));
    return { n, unit: n === 1 ? 'minuto' : 'minutos', stamp: 'MIN' };
  }
  if (ms < 86_400_000) {
    const n = Math.max(1, Math.round(ms / 3_600_000));
    return { n, unit: n === 1 ? 'hora' : 'horas', stamp: n === 1 ? 'HORA' : 'HORAS' };
  }
  const n = Math.ceil(ms / 86_400_000);
  return { n, unit: n === 1 ? 'día' : 'días', stamp: n === 1 ? 'DÍA' : 'DÍAS' };
}

/** "3 jul 2026" */
function shortDateEs(d: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
    .format(d)
    .replace('.', '');
}

/**
 * El sobre par avion: la próxima carta en entregarse, sellada, sobre la mesa.
 */
export function ParAvionEnvelope({ letter }: { letter: Letter }) {
  const delivery = letter.deliveryDate.toDate();
  const created = letter.createdAt?.toDate();
  const { n, unit, stamp } = remaining(delivery);
  const recipient =
    letter.recipientType === 'self' ? 'Tu futuro yo' : letter.recipientName;

  return (
    <Link
      href={`/cartas/${letter.id}`}
      className="posa mx-auto block w-full max-w-[440px]"
      style={{ '--posa-delay': '0.1s' } as React.CSSProperties}
    >
      <article className="paravion">
        <div className="estampilla">
          <div className="motivo">
            <div className="valor">
              {n} {stamp}
            </div>
          </div>
        </div>
        <div className="ondas">
          <span />
          <span />
          <span />
        </div>

        <div>
          <p className="para">Para</p>
          <p className="direccion">
            {recipient}
            <small>{formatDateEs(delivery)}</small>
          </p>
        </div>

        <div className="nota-fecha">
          <span className="faltan">
            {n === 1 ? 'falta' : 'faltan'} <b>{n}</b> {unit}
          </span>
          {created && (
            <span className="escrita-el">
              escrita el
              <br />
              {shortDateEs(created)}
            </span>
          )}
        </div>

        <div className="lacre" />
      </article>
    </Link>
  );
}
