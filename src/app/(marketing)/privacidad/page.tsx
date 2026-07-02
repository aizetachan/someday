export const metadata = { title: 'Privacidad' };

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-serif text-3xl text-ink">Política de privacidad</h1>
      <div className="mt-8 space-y-5 text-sm leading-relaxed text-ink-soft">
        <p>
          <strong className="text-ink">Lo esencial:</strong> nadie, ni siquiera
          nosotros por proceso normal, lee tus cartas selladas. El contenido de
          una carta solo se muestra a su destinatario, en la fecha elegida.
        </p>
        <p>
          <strong className="text-ink">Qué guardamos:</strong> tu email, tu
          nombre, tu zona horaria y tus cartas. Las cartas se almacenan
          cifradas en reposo en Google Cloud Firestore (región UE).
        </p>
        <p>
          <strong className="text-ink">Emails:</strong> usamos Resend como
          encargado de tratamiento para enviar los emails de entrega y avisos.
          El cuerpo de una carta nunca viaja por email: solo el enlace de
          apertura.
        </p>
        <p>
          <strong className="text-ink">Tus derechos (RGPD):</strong> puedes
          borrar tu cuenta desde Ajustes. Tus cartas a ti mismo se eliminan;
          las cartas selladas para otras personas se entregan igualmente (son
          un compromiso con quien las espera) con la autoría anonimizada.
        </p>
        <p>
          <strong className="text-ink">Analítica:</strong> mínima y sin
          rastrear entre sitios.
        </p>
        <p>
          Para cualquier consulta: responde a cualquiera de nuestros emails.
        </p>
      </div>
    </div>
  );
}
