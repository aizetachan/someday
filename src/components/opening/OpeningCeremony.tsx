'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDateEs, humanDistance } from '@/lib/dates';
import { WaxSeal } from './WaxSeal';

export interface OpenedLetter {
  id: string;
  subject: string;
  body: string;
  recipientType: 'self' | 'other';
  recipientName: string;
  authorName: string;
  createdAt: string; // ISO
  deliveryDate: string; // ISO
  writtenFrom?: string;
}

const HOLD_MS = 1100;

/**
 * Ceremonia de apertura: sobre cerrado → mantener el sello → la cera se
 * rompe → la carta se despliega.
 */
export function OpeningCeremony({ letter }: { letter: OpenedLetter }) {
  const [phase, setPhase] = useState<'closed' | 'breaking' | 'open'>('closed');
  const [progress, setProgress] = useState(0);
  const holdStart = useRef<number | null>(null);
  const raf = useRef<number | null>(null);

  const written = new Date(letter.createdAt);
  const delivered = new Date(letter.deliveryDate);
  const traveled = humanDistance(written, delivered);

  // La cera se va agrietando a medida que se mantiene pulsado
  const crackStage: 0 | 1 | 2 = progress >= 0.7 ? 2 : progress >= 0.35 ? 1 : 0;

  const stopHold = useCallback(() => {
    holdStart.current = null;
    if (raf.current) cancelAnimationFrame(raf.current);
    setProgress((p) => (p >= 1 ? p : 0));
  }, []);

  const tick = useCallback(() => {
    if (holdStart.current == null) return;
    const p = Math.min(1, (performance.now() - holdStart.current) / HOLD_MS);
    setProgress(p);
    if (p >= 1) {
      setPhase('breaking');
      return;
    }
    raf.current = requestAnimationFrame(tick);
  }, []);

  // breaking → open como efecto: si el frame del temporizador se pierde,
  // el efecto lo vuelve a programar y la carta nunca se queda a medias.
  useEffect(() => {
    if (phase !== 'breaking') return;
    const t = setTimeout(() => setPhase('open'), 700);
    return () => clearTimeout(t);
  }, [phase]);

  const startHold = useCallback(() => {
    if (phase !== 'closed') return;
    holdStart.current = performance.now();
    raf.current = requestAnimationFrame(tick);
  }, [phase, tick]);

  useEffect(() => () => stopHold(), [stopHold]);

  return (
    <div className="flex min-h-[calc(100dvh-88px)] flex-col items-center justify-center px-5 py-10">
      <AnimatePresence mode="wait">
        {phase !== 'open' ? (
          <motion.div
            key="envelope"
            className="flex w-full max-w-sm flex-col items-center text-center"
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-mono text-xs text-gold">
              Escrita el {formatDateEs(written)}
            </p>
            <p className="mt-1 font-serif text-lg italic text-ink-soft">
              Ha viajado {traveled} para llegar hasta aquí.
            </p>

            <div
              className="relative mt-10 w-full"
              style={{ maxWidth: 300, aspectRatio: '3 / 2' }}
            >
              <svg
                viewBox="0 0 300 200"
                className="h-full w-full drop-shadow-[0_12px_32px_rgb(31_27_22_/_0.15)]"
                aria-hidden
              >
                <rect x="2" y="2" width="296" height="196" rx="4" fill="#EFE7DA" />
                <path d="M2 4 L150 108 L298 4 L298 2 L2 2 Z" fill="#E7DCC9" />
                <path
                  d="M2 6 L150 110 L298 6"
                  fill="none"
                  stroke="#1F1B16"
                  strokeOpacity="0.15"
                  strokeWidth="1.5"
                />
              </svg>
              <button
                type="button"
                aria-label="Mantén pulsado para romper el sello"
                onPointerDown={startHold}
                onPointerUp={stopHold}
                onPointerLeave={stopHold}
                onContextMenu={(e) => e.preventDefault()}
                className="absolute left-1/2 top-[54%] cursor-pointer touch-none select-none rounded-full outline-none"
                style={{
                  transform: `translate(-50%, -50%) scale(${1 + progress * 0.08})`,
                }}
              >
                <WaxSeal
                  size={84}
                  broken={phase === 'breaking'}
                  crack={phase === 'closed' ? crackStage : 2}
                />
                {/* Anillo de progreso */}
                {progress > 0 && phase === 'closed' && (
                  <svg
                    className="pointer-events-none absolute -inset-2"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      fill="none"
                      stroke="#B0894B"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray={`${progress * 289} 289`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                )}
              </button>
            </div>

            <p className="mt-10 text-sm text-ink-soft">
              Mantén pulsado el sello para abrir la carta
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            className="w-full max-w-[68ch] pb-6"
            initial={{ opacity: 0, y: 32, scaleY: 0.96 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* La carta: una hoja de verdad sobre la mesa */}
            <article
              className="hoja-carta px-6 py-10 sm:px-12 sm:py-12"
              style={{ transform: 'rotate(-0.35deg)' }}
            >
              <p className="text-right font-mono text-xs text-gold">
                {letter.writtenFrom ? `${letter.writtenFrom}, ` : ''}
                {formatDateEs(written)}
              </p>
              <h1 className="mt-6 font-serif text-2xl text-ink sm:text-3xl">
                {letter.subject || 'Una carta para ti'}
              </h1>

              <div className="letter-body mt-8 text-ink">{letter.body}</div>

              <p className="mt-14 font-hand text-[26px] leading-none text-tinta-pluma">
                — {letter.recipientType === 'self'
                  ? `tu yo de hace ${traveled}`
                  : letter.authorName || 'alguien que pensó en ti'}
              </p>
            </article>

            {/* Fuera del papel: la invitación a responder */}
            <div className="mt-12 text-center">
              <Link
                href="/escribir"
                className="inline-block whitespace-nowrap rounded-full bg-gradient-to-b from-[#3a3226] to-[#241e15] px-8 pb-4 pt-3 font-hand text-[22px] font-semibold leading-none text-[#f6f1e6] shadow-[0_2px_4px_rgba(36,30,21,0.3),0_12px_26px_rgba(36,30,21,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] transition-transform hover:-translate-y-0.5"
              >
                {letter.recipientType === 'self'
                  ? '✎ Respóndete: escribe a tu futuro yo'
                  : '✎ Escribe tu propia carta al futuro'}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
