'use client';

import { WaxSeal } from '@/components/opening/WaxSeal';

/**
 * Sobre cerrado con sello de cera. Elemento central de los estados
 * "en camino" y de la ceremonia de apertura.
 */
export function EnvelopeClosed({
  width = 280,
  sealed = true,
}: {
  width?: number; // ancho máximo — en pantallas estrechas se adapta
  sealed?: boolean;
}) {
  return (
    <div
      className="relative inline-block w-full"
      style={{ maxWidth: width, aspectRatio: '3 / 2' }}
    >
      <svg
        viewBox="0 0 300 200"
        className="h-full w-full drop-shadow-[0_8px_24px_rgb(31_27_22_/_0.12)]"
        aria-hidden
      >
        <rect x="2" y="2" width="296" height="196" rx="4" fill="#EFE7DA" />
        <rect
          x="2"
          y="2"
          width="296"
          height="196"
          rx="4"
          fill="none"
          stroke="#1F1B16"
          strokeOpacity="0.12"
        />
        {/* Solapa */}
        <path
          d="M2 6 L150 110 L298 6"
          fill="none"
          stroke="#1F1B16"
          strokeOpacity="0.15"
          strokeWidth="1.5"
        />
        <path d="M2 4 L150 108 L298 4 L298 2 L2 2 Z" fill="#E7DCC9" />
        {/* Pliegues inferiores */}
        <path
          d="M2 198 L110 120 M298 198 L190 120"
          stroke="#1F1B16"
          strokeOpacity="0.08"
          strokeWidth="1.5"
        />
      </svg>
      {sealed && (
        <div className="absolute left-1/2 top-1/2 w-[24%] -translate-x-1/2 -translate-y-1/2">
          <WaxSeal size={undefined} />
        </div>
      )}
    </div>
  );
}
