'use client';

/**
 * Sello de cera. `broken` lo parte en dos mitades separadas.
 */
export function WaxSeal({
  size = 72,
  broken = false,
}: {
  size?: number;
  broken?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden
      style={{ overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="wax" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#A63A22" />
          <stop offset="70%" stopColor="#8C2F1B" />
          <stop offset="100%" stopColor="#6E2414" />
        </radialGradient>
      </defs>
      <g
        style={{
          transform: broken ? 'translate(-9px, 2px) rotate(-8deg)' : undefined,
          transformOrigin: '50% 50%',
          transition: 'transform 0.45s cubic-bezier(0.3, 1.2, 0.4, 1)',
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
          transform: broken ? 'translate(9px, -2px) rotate(7deg)' : undefined,
          transformOrigin: '50% 50%',
          transition: 'transform 0.45s cubic-bezier(0.3, 1.2, 0.4, 1)',
        }}
      >
        <clipPath id="right-half">
          <path d="M53 -5 Q44 25 55 50 Q46 75 51 105 L110 105 L110 -5 Z" />
        </clipPath>
        <g clipPath="url(#right-half)">
          <SealBody />
        </g>
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
