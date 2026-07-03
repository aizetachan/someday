'use client';

/**
 * Sello de cera. `crack` (0-2) lo va agrietando mientras se mantiene
 * pulsado; `broken` lo parte en dos mitades separadas.
 */
export function WaxSeal({
  size,
  broken = false,
  crack = 0,
}: {
  size?: number; // sin tamaño: llena el ancho del contenedor (responsive)
  broken?: boolean;
  crack?: 0 | 1 | 2;
}) {
  const halfTransition = 'transform 0.3s cubic-bezier(0.3, 1.2, 0.4, 1)';
  const leftTransform = broken
    ? 'translate(-9px, 2px) rotate(-8deg)'
    : crack >= 2
      ? 'translate(-1.4px, 0.3px) rotate(-1.2deg)'
      : undefined;
  const rightTransform = broken
    ? 'translate(9px, -2px) rotate(7deg)'
    : crack >= 2
      ? 'translate(1.4px, -0.3px) rotate(1deg)'
      : undefined;

  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden
      style={{
        overflow: 'visible',
        ...(size ? { width: size, height: size } : { width: '100%', height: 'auto' }),
      }}
    >
      <defs>
        <radialGradient id="wax" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#A63A22" />
          <stop offset="70%" stopColor="#8C2F1B" />
          <stop offset="100%" stopColor="#6E2414" />
        </radialGradient>
      </defs>
      <g
        className={crack >= 2 && !broken ? 'tiembla' : undefined}
        style={{ transformOrigin: '50% 50%' }}
      >
        <g
          style={{
            transform: leftTransform,
            transformOrigin: '50% 50%',
            transition: halfTransition,
          }}
        >
          <clipPath id="left-half">
            <path d="M53 -5 Q44 25 55 50 Q46 75 51 105 L-10 105 L-10 -5 Z" />
          </clipPath>
          <g clipPath="url(#left-half)">
            <SealBody />
          </g>
        </g>
        <g
          style={{
            transform: rightTransform,
            transformOrigin: '50% 50%',
            transition: halfTransition,
          }}
        >
          <clipPath id="right-half">
            <path d="M53 -5 Q44 25 55 50 Q46 75 51 105 L110 105 L110 -5 Z" />
          </clipPath>
          <g clipPath="url(#right-half)">
            <SealBody />
          </g>
        </g>

        {/* Grietas: primero una fisura, luego la grieta completa con ramas */}
        {!broken && crack >= 1 && (
          <path
            d="M54 28 Q48 39 55 50 Q47 62 52 74"
            fill="none"
            stroke="#4A130A"
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.65"
          />
        )}
        {!broken && crack >= 2 && (
          <>
            <path
              d="M53 8 Q44 25 55 50 Q46 75 51 94"
              fill="none"
              stroke="#3E0F07"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.8"
            />
            <path
              d="M52 34 L44 29 M54 58 L61 63"
              fill="none"
              stroke="#4A130A"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.7"
            />
          </>
        )}
      </g>
    </svg>
  );
}

function SealBody() {
  return (
    <>
      <path
        d="M50 4
           C62 2 70 8 78 12 C88 17 96 24 95 36
           C94 44 98 52 95 62 C92 74 86 84 74 90
           C64 95 54 98 44 95 C32 92 20 88 12 76
           C5 66 4 56 6 46 C8 36 6 26 14 18
           C24 8 38 6 50 4 Z"
        fill="url(#wax)"
      />
      <circle
        cx="50"
        cy="50"
        r="30"
        fill="none"
        stroke="#F7F3EC"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      {/* Reloj de arena — marca del sello */}
      <path
        d="M42 36 H58 M42 64 H58 M43 37 C43 46 57 46 57 50 C57 54 43 54 43 63 M57 37 C57 46 43 46 43 50 C43 54 57 54 57 63"
        fill="none"
        stroke="#F7F3EC"
        strokeOpacity="0.7"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  );
}
