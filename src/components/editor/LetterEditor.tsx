'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatDateEs } from '@/lib/dates';
import { LIMITS } from '@/lib/types';

const PROMPTS = [
  '¿Qué te preocupa hoy que quieres recordar?',
  '¿Qué le prometes a tu futuro yo?',
  'Describe un día normal de tu vida ahora.',
  '¿Qué esperas haber logrado cuando leas esto?',
  '¿A quién quieres cerca cuando llegue esta carta?',
];

/**
 * Editor ritual: pantalla completa, papel, serif, sin distracciones.
 */
export function LetterEditor({
  subject,
  body,
  onSubjectChange,
  onBodyChange,
}: {
  subject: string;
  body: string;
  onSubjectChange: (v: string) => void;
  onBodyChange: (v: string) => void;
}) {
  const [promptIndex, setPromptIndex] = useState(0);

  useEffect(() => {
    if (body) return;
    const t = setInterval(
      () => setPromptIndex((i) => (i + 1) % PROMPTS.length),
      6000,
    );
    return () => clearInterval(t);
  }, [body]);

  const wordCount = useMemo(
    () => (body.trim() ? body.trim().split(/\s+/).length : 0),
    [body],
  );

  return (
    <div className="mx-auto w-full max-w-[72ch] px-4 pb-24 pt-4 sm:px-6 sm:pt-6">
      <div className="hoja-escritura min-h-[72dvh] px-5 py-8 sm:px-10 sm:py-10">
        <p className="mb-8 font-mono text-xs text-gold">
          {formatDateEs(new Date())}
        </p>

        <input
          value={subject}
          maxLength={LIMITS.subjectMax}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="Asunto de la carta"
          className="w-full border-none bg-transparent font-serif text-2xl text-ink outline-none placeholder:text-ink-soft/40"
        />

        <textarea
          value={body}
          maxLength={LIMITS.bodyMax}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder={PROMPTS[promptIndex]}
          className="letter-textarea mt-6 min-h-[55dvh] w-full text-ink placeholder:text-ink-soft/40"
          autoFocus
        />
      </div>

      <p
        className="fixed right-5 font-mono text-xs text-[#6f6455] sm:right-8"
        style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        {wordCount} {wordCount === 1 ? 'palabra' : 'palabras'}
      </p>
    </div>
  );
}
