'use client';

/**
 * Estado vacío del escritorio: una hoja en blanco con la pluma encima,
 * esperando la primera carta.
 */
export function DeskEmpty() {
  return (
    <div className="posa mx-auto mt-14 max-w-[420px]">
      <div className="hoja-vacia px-8 pb-20 pt-9">
        <p className="font-hand text-[26px] font-medium leading-none text-tinta-pluma">
          Querido futuro…
        </p>
        <i className="renglon" />
        <i className="renglon" />
        <i className="renglon" />

        {/* La pluma, posada en diagonal sobre la hoja */}
        <svg
          viewBox="0 0 200 26"
          className="absolute -bottom-2 right-4 w-44 rotate-[24deg] drop-shadow-[0_5px_6px_rgba(46,40,32,0.35)]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="pluma-cuerpo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4a4238" />
              <stop offset="0.45" stopColor="#2e2820" />
              <stop offset="1" stopColor="#1a1510" />
            </linearGradient>
            <linearGradient id="pluma-oro" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e8c97e" />
              <stop offset="1" stopColor="#b0894b" />
            </linearGradient>
          </defs>
          {/* plumín */}
          <polygon points="2,13 30,7 30,19" fill="url(#pluma-oro)" />
          <line x1="6" y1="13" x2="28" y2="13" stroke="#8a6a38" strokeWidth="0.8" />
          {/* anilla */}
          <rect x="30" y="6" width="7" height="14" rx="2" fill="url(#pluma-oro)" />
          {/* cuerpo */}
          <rect x="37" y="5.5" width="112" height="15" rx="7" fill="url(#pluma-cuerpo)" />
          {/* capuchón */}
          <rect x="147" y="4.5" width="50" height="17" rx="8" fill="url(#pluma-cuerpo)" />
          <rect x="150" y="7" width="3" height="11" rx="1.5" fill="url(#pluma-oro)" />
          {/* brillo */}
          <rect x="40" y="7.5" width="104" height="2.5" rx="1.2" fill="#ffffff" opacity="0.14" />
        </svg>
      </div>

      <p
        className="posa mt-12 text-center font-hand text-xl leading-snug text-[#6f6455]"
        style={{ '--posa-delay': '0.15s' } as React.CSSProperties}
      >
        Todavía no hay cartas viajando en el tiempo.
        <br />
        La primera es siempre la mejor de recibir.
      </p>
    </div>
  );
}
