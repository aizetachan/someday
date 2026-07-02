'use client';

import Link from 'next/link';
import { Clock, Mail, MailOpen, AlertTriangle } from 'lucide-react';
import { countdownLabel, formatDateEs, humanDistance } from '@/lib/dates';
import type { Letter } from '@/lib/types';

const statusMeta: Record<
  string,
  { label: string; className: string }
> = {
  sealed: { label: 'En camino', className: 'text-gold' },
  delivering: { label: 'Entregando…', className: 'text-gold' },
  delivered: { label: 'Entregada, sin abrir', className: 'text-success' },
  opened: { label: 'Abierta', className: 'text-success' },
  failed: { label: 'Error de entrega', className: 'text-error' },
  cancelled: { label: 'Cancelada', className: 'text-ink-soft' },
  draft: { label: 'Borrador', className: 'text-ink-soft' },
};

export function LetterCard({ letter }: { letter: Letter }) {
  const delivery = letter.deliveryDate?.toDate();
  const created = letter.createdAt?.toDate();
  const meta = statusMeta[letter.status] ?? statusMeta.draft;
  const inTransit = letter.status === 'sealed' || letter.status === 'delivering';
  const readable = letter.status === 'opened' || letter.status === 'delivered';

  return (
    <Link
      href={`/cartas/${letter.id}`}
      className="paper-surface block rounded-[4px] border border-ink-soft/15 p-5 shadow-[var(--shadow-paper)] transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-ink-soft">
            Para {letter.recipientType === 'self' ? 'tu futuro yo' : letter.recipientName}
          </p>
          <h3 className="mt-1 truncate font-serif text-lg text-ink">
            {inTransit ? 'Carta sellada' : letter.subject || 'Sin asunto'}
          </h3>
          {created && (
            <p className="mt-1 text-sm text-ink-soft">
              Escrita el {formatDateEs(created)}
            </p>
          )}
        </div>
        <span className="shrink-0 text-ink-soft/70">
          {inTransit ? (
            <Mail size={20} strokeWidth={1.5} />
          ) : letter.status === 'failed' ? (
            <AlertTriangle size={20} strokeWidth={1.5} />
          ) : (
            <MailOpen size={20} strokeWidth={1.5} />
          )}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-ink-soft/10 pt-3">
        <span className={`text-xs font-medium ${meta.className}`}>{meta.label}</span>
        {inTransit && delivery && (
          <span className="flex items-center gap-1.5 font-mono text-xs text-gold">
            <Clock size={13} strokeWidth={1.5} />
            {countdownLabel(delivery)}
          </span>
        )}
        {readable && created && delivery && (
          <span className="text-xs text-ink-soft">
            viajó {humanDistance(created, delivery)}
          </span>
        )}
      </div>
    </Link>
  );
}
