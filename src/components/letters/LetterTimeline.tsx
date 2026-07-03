'use client';

import Link from 'next/link';
import { WaxSeal } from '@/components/opening/WaxSeal';
import { countdownLabel, formatDateEs } from '@/lib/dates';
import type { Letter } from '@/lib/types';

/**
 * Línea temporal de cartas en camino: una línea dorada con un sello de
 * cera por carta, ordenadas por fecha de entrega.
 */
export function LetterTimeline({ letters }: { letters: Letter[] }) {
  const sorted = [...letters].sort(
    (a, b) => a.deliveryDate.toMillis() - b.deliveryDate.toMillis(),
  );

  return (
    <ol className="relative ml-5 border-l border-gold/40 pl-8">
      {sorted.map((letter) => {
        const delivery = letter.deliveryDate.toDate();
        const created = letter.createdAt?.toDate();
        return (
          <li key={letter.id} className="relative pb-8 last:pb-0">
            <span className="absolute -left-[52px] top-0">
              <WaxSeal size={38} />
            </span>
            <Link
              href={`/cartas/${letter.id}`}
              className="paper-surface block rounded-[4px] border border-ink-soft/15 p-4 shadow-[var(--shadow-paper)] transition-transform hover:-translate-y-0.5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="font-serif text-lg text-ink">
                  Para{' '}
                  {letter.recipientType === 'self'
                    ? 'tu futuro yo'
                    : letter.recipientName}
                </p>
                <span className="font-mono text-xs text-gold">
                  {countdownLabel(delivery)}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-ink-soft">
                Se entrega el {formatDateEs(delivery)}
                {created && <> · escrita el {formatDateEs(created)}</>}
              </p>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
