'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { DatePicker, parseYmdTime } from '@/components/editor/DatePicker';
import { LetterEditor } from '@/components/editor/LetterEditor';
import { SealAnimation } from '@/components/editor/SealAnimation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useDraft } from '@/hooks/useDraft';
import { sealLetter } from '@/lib/firestore';
import {
  formatDateEs,
  humanDistance,
  userTimezone,
  zonedTimeToUtc,
} from '@/lib/dates';

/**
 * Escribir y sellar en dos actos:
 *  1. La carta — pantalla completa, sin distracciones.
 *  2. El sellado — destinatario, momento de entrega y sello, unificados.
 */
export default function EscribirPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { draft, update, clear, ensureRemote, hydrated } = useDraft();

  const [step, setStep] = useState<'write' | 'seal'>('write');
  const [sealing, setSealing] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [error, setError] = useState('');

  if (!hydrated) return null;

  const deliveryDate = draft.deliveryYmd
    ? parseYmdTime(draft.deliveryYmd, draft.deliveryTime)
    : null;

  const recipientReady =
    draft.recipientType === 'self' ||
    (/.+@.+\..+/.test(draft.recipientEmail) && draft.recipientName.trim().length > 0);
  const canSeal = Boolean(draft.body.trim() && recipientReady && deliveryDate);

  async function seal() {
    if (!user || !deliveryDate) return;
    setError('');
    setSealing(true);
    try {
      const [y, m, d] = draft.deliveryYmd.split('-').map(Number);
      const [hh, mm] = draft.deliveryTime.split(':').map(Number);
      const id = await ensureRemote();
      await sealLetter(id, {
        recipientType: draft.recipientType,
        recipientEmail:
          draft.recipientType === 'self' ? (user.email ?? '') : draft.recipientEmail,
        recipientName:
          draft.recipientType === 'self'
            ? (user.displayName ?? 'Tu futuro yo')
            : draft.recipientName,
        deliveryDate: zonedTimeToUtc(y, m, d, hh || 0, mm || 0, userTimezone()),
      });
      setAnimating(true);
    } catch {
      setError('No se pudo sellar la carta. Inténtalo de nuevo.');
      setSealing(false);
    }
  }

  if (animating) {
    return (
      <SealAnimation
        onComplete={() => {
          clear();
          router.push('/cartas');
        }}
      />
    );
  }

  return (
    <div className="min-h-dvh">
      {/* Barra mínima del ritual */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-paper/90 px-5 py-3 backdrop-blur">
        {step === 'seal' ? (
          <button
            type="button"
            onClick={() => setStep('write')}
            className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
          >
            <ArrowLeft size={16} strokeWidth={1.5} /> Volver a la carta
          </button>
        ) : (
          <Link
            href="/cartas"
            className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
          >
            <ArrowLeft size={16} strokeWidth={1.5} /> Salir
          </Link>
        )}
        <div className="flex gap-1.5">
          <span className="h-1.5 w-6 rounded-full bg-seal" />
          <span
            className={`h-1.5 w-6 rounded-full ${step === 'seal' ? 'bg-seal' : 'bg-ink-soft/20'}`}
          />
        </div>
        {step === 'write' ? (
          <button
            type="button"
            disabled={!draft.body.trim()}
            onClick={() => setStep('seal')}
            className="flex items-center gap-1.5 text-sm font-medium text-seal disabled:opacity-40"
          >
            Sellar <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        ) : (
          <span className="w-20" />
        )}
      </div>

      {step === 'write' && (
        <LetterEditor
          subject={draft.subject}
          body={draft.body}
          onSubjectChange={(v) => update({ subject: v })}
          onBodyChange={(v) => update({ body: v })}
        />
      )}

      {step === 'seal' && (
        <div className="mx-auto max-w-xl px-5 py-10 pb-24">
          <h1 className="font-serif text-2xl text-ink">Sellar la carta</h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            Elige a quién viaja y cuándo debe llegar. Después, el sello.
          </p>

          {/* Destinatario */}
          <section className="mt-8">
            <h2 className="text-xs font-medium uppercase tracking-wide text-ink-soft">
              Para quién
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => update({ recipientType: 'self' })}
                className={`rounded-[4px] border p-4 text-left transition-colors ${
                  draft.recipientType === 'self'
                    ? 'border-seal bg-seal/5'
                    : 'border-ink-soft/20 hover:border-ink-soft/50'
                }`}
              >
                <span className="block font-serif text-lg text-ink">Mi futuro yo</span>
                <span className="mt-0.5 block text-xs text-ink-soft">
                  Te la enviaremos a ti, cuando llegue el momento.
                </span>
              </button>
              <button
                type="button"
                onClick={() => update({ recipientType: 'other' })}
                className={`rounded-[4px] border p-4 text-left transition-colors ${
                  draft.recipientType === 'other'
                    ? 'border-seal bg-seal/5'
                    : 'border-ink-soft/20 hover:border-ink-soft/50'
                }`}
              >
                <span className="block font-serif text-lg text-ink">Otra persona</span>
                <span className="mt-0.5 block text-xs text-ink-soft">
                  Un cumpleaños, un aniversario, un «ábrela cuando…».
                </span>
              </button>
            </div>

            {draft.recipientType === 'other' && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input
                  label="Su nombre"
                  value={draft.recipientName}
                  onChange={(e) => update({ recipientName: e.target.value })}
                  placeholder="Mamá"
                />
                <Input
                  label="Su email"
                  type="email"
                  value={draft.recipientEmail}
                  onChange={(e) => update({ recipientEmail: e.target.value })}
                  placeholder="ella@ejemplo.com"
                />
              </div>
            )}
          </section>

          {/* Momento de entrega */}
          <section className="mt-10">
            <h2 className="text-xs font-medium uppercase tracking-wide text-ink-soft">
              Cuándo debe llegar
            </h2>
            <p className="mt-1 text-xs text-ink-soft">
              Mínimo dentro de 7 días · máximo 25 años.
            </p>
            <div className="mt-3">
              <DatePicker
                ymd={draft.deliveryYmd}
                time={draft.deliveryTime}
                onChange={(patch) => update(patch)}
              />
            </div>
          </section>

          {/* Sello */}
          <section className="mt-10 border-t border-ink-soft/15 pt-8">
            {deliveryDate && (
              <div className="rounded-[4px] bg-paper-warm p-5 text-sm leading-relaxed text-ink">
                Vas a sellar «{draft.subject || 'Una carta para ti'}» para{' '}
                <strong>
                  {draft.recipientType === 'self' ? 'tu futuro yo' : draft.recipientName || '…'}
                </strong>
                . <strong>No podrás leerla ni editarla</strong> hasta el{' '}
                {formatDateEs(deliveryDate)} a las {draft.deliveryTime} — faltan{' '}
                {humanDistance(new Date(), deliveryDate)}. ¿Seguro?
              </div>
            )}

            {error && <p className="mt-4 text-sm text-error">{error}</p>}

            <div className="safe-bottom mt-6 flex flex-col gap-3">
              <Button size="lg" onClick={() => void seal()} disabled={!canSeal || sealing}>
                {sealing ? 'Sellando…' : 'Sellar la carta'}
              </Button>
              <Button variant="ghost" onClick={() => setStep('write')}>
                Volver a leerla
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
