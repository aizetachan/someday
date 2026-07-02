'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WaxSeal } from '@/components/opening/WaxSeal';

/**
 * Ritual de sellado: la carta se pliega en un sobre, cae el sello de cera
 * y el sobre parte hacia el futuro. ~3s. Este momento ES el producto.
 */
export function SealAnimation({ onComplete }: { onComplete: () => void }) {
  // fases: fold → seal → fly → done
  const [phase, setPhase] = useState<'fold' | 'seal' | 'fly'>('fold');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('seal'), 900);
    const t2 = setTimeout(() => setPhase('fly'), 2100);
    const t3 = setTimeout(onComplete, 3100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-paper">
      <AnimatePresence>
        {phase !== 'fly' ? (
          <motion.div
            key="envelope"
            className="relative"
            initial={{ scaleY: 1.6, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg width={260} height={174} viewBox="0 0 300 200" aria-hidden>
              <rect x="2" y="2" width="296" height="196" rx="4" fill="#EFE7DA" />
              <motion.path
                d="M2 4 L150 108 L298 4 L298 2 L2 2 Z"
                fill="#E7DCC9"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              />
              <path
                d="M2 6 L150 110 L298 6"
                fill="none"
                stroke="#1F1B16"
                strokeOpacity="0.15"
                strokeWidth="1.5"
              />
            </svg>
            {phase === 'seal' && (
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                initial={{ y: -80, scale: 1.6, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 16, stiffness: 260 }}
              >
                <WaxSeal size={64} />
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="fly"
            className="relative"
            initial={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
            animate={{ x: 480, y: -320, rotate: 12, scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.55, 0, 0.7, 0.3] }}
          >
            <svg width={260} height={174} viewBox="0 0 300 200" aria-hidden>
              <rect x="2" y="2" width="296" height="196" rx="4" fill="#EFE7DA" />
              <path d="M2 4 L150 108 L298 4 L298 2 L2 2 Z" fill="#E7DCC9" />
            </svg>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <WaxSeal size={64} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.p
        className="absolute bottom-16 font-serif text-lg italic text-ink-soft"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        Tu carta viaja hacia el futuro…
      </motion.p>
    </div>
  );
}
