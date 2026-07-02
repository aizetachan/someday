'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mailbox } from 'lucide-react';
import { LetterCard } from '@/components/letters/LetterCard';
import { Spinner } from '@/components/ui/Spinner';
import { useLetters } from '@/hooks/useLetters';
import type { Letter } from '@/lib/types';

type Tab = 'transit' | 'delivered' | 'received';

const TABS: { key: Tab; label: string }[] = [
  { key: 'transit', label: 'En camino' },
  { key: 'delivered', label: 'Entregadas' },
  { key: 'received', label: 'Recibidas' },
];

const EMPTY_COPY: Record<Tab, string> = {
  transit: 'Todavía no hay cartas viajando en el tiempo.',
  delivered: 'Ninguna carta ha llegado aún a su destino.',
  received: 'Nadie te ha enviado una carta todavía.',
};

export default function CartasPage() {
  const { loading, inTransit, delivered, received, failed } = useLetters();
  const [tab, setTab] = useState<Tab>('transit');

  const lists: Record<Tab, Letter[]> = {
    transit: [...inTransit, ...failed],
    delivered,
    received,
  };
  const letters = lists[tab];

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-ink">Mis cartas</h1>
        <Link
          href="/escribir"
          className="rounded-[4px] bg-seal px-4 py-2 text-sm font-medium text-paper hover:bg-seal-hover"
        >
          Escribir
        </Link>
      </div>

      <div className="mt-8 flex gap-1 border-b border-ink-soft/15">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors ${
              tab === t.key
                ? 'border-seal font-medium text-ink'
                : 'border-transparent text-ink-soft hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner label="Buscando tus cartas…" />
      ) : letters.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Mailbox size={48} strokeWidth={1} className="text-ink-soft/40" />
          <p className="text-ink-soft">{EMPTY_COPY[tab]}</p>
          <Link
            href="/escribir"
            className="text-sm font-medium text-seal underline-offset-4 hover:underline"
          >
            Escribe una carta →
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {letters.map((letter) => (
            <LetterCard key={letter.id} letter={letter} />
          ))}
        </div>
      )}
    </div>
  );
}
