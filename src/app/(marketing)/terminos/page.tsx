export const metadata = { title: 'Términos' };

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-serif text-3xl text-ink">Términos de uso</h1>
      <div className="mt-8 space-y-5 text-sm leading-relaxed text-ink-soft">
        <p>
          <strong className="text-ink">El trato:</strong> escribes una carta,
          la sellas, y nosotros la entregamos en la fecha que elijas. Una carta
          sellada es inmutable: no se puede leer ni editar hasta su entrega.
          Puedes cancelarla (sin leerla) hasta 24 horas antes.
        </p>
        <p>
          <strong className="text-ink">Edad mínima:</strong> 16 años.
        </p>
        <p>
          <strong className="text-ink">Uso aceptable:</strong> las cartas son
          privadas y de persona a persona. No uses el servicio para spam,
          acoso o contenido ilegal. Máximo 20 cartas al día por usuario. Las
          cartas recibidas incluyen la opción de reportar.
        </p>
        <p>
          <strong className="text-ink">Entrega:</strong> hacemos todo lo
          posible por entregar cada carta en su fecha. Si una entrega falla
          repetidamente (por ejemplo, un email que rebota), te avisaremos para
          resolverlo.
        </p>
        <p>
          <strong className="text-ink">Tu contenido es tuyo.</strong> Solo lo
          usamos para prestar el servicio.
        </p>
      </div>
    </div>
  );
}
