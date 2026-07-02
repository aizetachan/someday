'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { DatePicker, parseYmd } from '@/components/editor/DatePicker';
import { LetterEditor } from '@/components/editor/LetterEditor';
import { SealAnimation } from '@/components/editor/SealAnimation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import { useDraft } from '@/hooks/useDraft';
import { sealLetter } from '@/lib/firestore';
import {
  formatDateEs,
  humanDistance,
  userTimezone,
  zonedMidnightToUtc,
} from '@/lib/dates';

type Step = 'write' | 'recipient' | 'date' | 'review';

const STEPS: Step[] = ['write', 'recipient', 'date', 'review'];

export default function EscribirPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { draft, update, clear, ensureRemote, hydrated } = useDraft();

  const [step, setStep] = useState<Step>('write');
  const [authModal, setAuthModal] = useState(false);
  const [sealing, setSealing] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [error, setError] = useState('');

  if (!hydrated) return null;

  const stepIndex = STEPS.indexOf(step);
  const deliveryDate = draft.deliveryYmd ? parseYmd(draft.deliveryYmd) : null;

  function canContinue(): boolean {
    if (step === 'write') return draft.body.trim().length > 0;
    if (step === 'recipient') {
      if (draft.recipientType === 'self') return true;
      return (
        /.+@.+\..+/.test(draft.recipientEmail) && draft.recipientName.trim().length > 0
      );
    }
    if (step === 'date') return Boolean(draft.deliveryYmd);
    return true;
  }

  async function seal() {
    if (!user) {
      setAuthModal(true);
      return;
    }
    setError('');
    setSealing(true);
    try {
      const [y, m, d] = draft.deliveryYmd.split('-').map(Number);
      const id = await ensureRemote();
      await sealLetter(id, {
        recipientType: draft.recipientType,
        recipientEmail:
          draft.recipientType === 'self' ? (user.email ?? '') : draft.recipientEmail,
        recipientName:
          draft.recipientType === 'self'
            ? (user.displayName ?? 'Tu futuro yo')
            : draft.recipientName,
        deliveryDate: zonedMidnightToUtc(y, m, d, userTimezone()),
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
        {stepIndex > 0 ? (
          <button
            type="button"
            onClick={() => setStep(STEPS[stepIndex - 1])}
            className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
          >
            <ArrowLeft size={16} strokeWidth={1.5} /> Atrás
          </button>
        ) : (
          <Link
            href={user ? '/cartas' : '/'}
            className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
          >
            <ArrowLeft size={16} strokeWidth={1.5} /> Salir
          </Link>
        )}
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`h-1.5 w-6 rounded-full ${i <= stepIndex ? 'bg-seal' : 'bg-ink-soft/20'}`}
            />
          ))}
        </div>
        {step !== 'review' ? (
          <button
            type="button"
            disabled={!canContinue()}
            onClick={() => setStep(STEPS[stepIndex + 1])}
            className="flex items-center gap-1.5 text-sm font-medium text-seal disabled:opacity-40"
          >
            Seguir <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        ) : (
          <span className="w-14" />
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

      {step === 'recipient' && (
        <div className="mx-auto max-w-xl px-5 py-12">
          <h1 className="font-serif text-2xl text-ink">¿Para quién es esta carta?</h1>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => update({ recipientType: 'self' })}
              className={`rounded-[4px] border p-5 text-left transition-colors ${
                draft.recipientType === 'self'
                  ? 'border-seal bg-seal/5'
                  : 'border-ink-soft/20 hover:border-ink-soft/50'
              }`}
            >
              <span className="block font-serif text-lg text-ink">Para mi futuro yo</span>
              <span className="mt-1 block text-sm text-ink-soft">
                Te la enviaremos a ti, cuando llegue el día.
              </span>
            </button>
            <button
              type="button"
              onClick={() => update({ recipientType: 'other' })}
              className={`rounded-[4px] border p-5 text-left transition-colors ${
                draft.recipientType === 'other'
                  ? 'border-seal bg-seal/5'
                  : 'border-ink-soft/20 hover:border-ink-soft/50'
              }`}
            >
              <span className="block font-serif text-lg text-ink">Para otra persona</span>
              <span className="mt-1 block text-sm text-ink-soft">
                Un cumpleaños, un aniversario, un «ábrela cuando…».
              </span>
            </button>
          </div>

          {draft.recipientType === 'other' && (
            <div className="mt-8 flex flex-col gap-4">
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
        </div>
      )}

      {step === 'date' && (
        <div className="mx-auto max-w-xl px-5 py-12">
          <h1 className="font-serif text-2xl text-ink">¿Cuándo debe llegar?</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Mínimo dentro de 7 días. Máximo, 25 años.
          </p>
          <div className="mt-8">
            <DatePicker
              value={draft.deliveryYmd}
              onChange={(ymd) => update({ deliveryYmd: ymd })}
            />
          </div>
        </div>
      )}

      {step === 'review' && deliveryDate && (
        <div className="mx-auto max-w-xl px-5 py-12">
          <h1 className="font-serif text-2xl text-ink">Última mirada</h1>
          <div className="paper-surface mt-8 rounded-[4px] border border-ink-soft/15 p-6 shadow-[var(--shadow-paper)]">
            <p className="text-xs uppercase tracking-wide text-ink-soft">
              Para{' '}
              {draft.recipientType === 'self'
                ? 'tu futuro yo'
                : `${draft.recipientName} (${draft.recipientEmail})`}
            </p>
            <h2 className="mt-2 font-serif text-xl text-ink">
              {draft.subject || 'Una carta para ti'}
            </h2>
            <p className="mt-3 line-clamp-3 font-serif text-ink-soft">
              {draft.body}
            </p>
            <p className="mt-4 border-t border-ink-soft/10 pt-3 font-mono text-xs text-gold">
              Entrega: {formatDateEs(deliveryDate)} · dentro de{' '}
              {humanDistance(new Date(), deliveryDate)}
            </p>
          </div>

          <div className="mt-8 rounded-[4px] bg-paper-warm p-5 text-sm leading-relaxed text-ink">
            Vas a sellar esta carta. <strong>No podrás leerla ni editarla</strong>{' '}
            hasta el {formatDateEs(deliveryDate)} — faltan{' '}
            {humanDistance(new Date(), deliveryDate)}. ¿Seguro?
          </div>

          {error && <p className="mt-4 text-sm text-error">{error}</p>}

          <div className="safe-bottom mt-8 flex flex-col gap-3">
            <Button size="lg" onClick={() => void seal()} disabled={sealing}>
              {sealing ? 'Sellando…' : 'Sellar la carta'}
            </Button>
            <Button variant="ghost" onClick={() => setStep('write')}>
              Volver a leerla
            </Button>
          </div>
        </div>
      )}

      <Modal open={authModal} onClose={() => setAuthModal(false)} title="Un momento">
        <p className="text-sm leading-relaxed text-ink-soft">
          Para sellar la carta necesitas una cuenta: es lo que le permite saber
          volver a ti. Tu borrador queda guardado en este dispositivo.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/auth/registro?next=/escribir"
            className="rounded-[4px] bg-seal px-5 py-2.5 text-center text-sm font-medium text-paper hover:bg-seal-hover"
          >
            Crear cuenta
          </Link>
          <Link
            href="/auth/login?next=/escribir"
            className="rounded-[4px] border border-ink-soft/30 px-5 py-2.5 text-center text-sm text-ink hover:bg-paper-warm"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </Modal>
    </div>
  );
}
