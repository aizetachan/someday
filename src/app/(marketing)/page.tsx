import { PenLine, CalendarClock, MailOpen, Lock, Users, Clock } from 'lucide-react';
import { AuthCta } from '@/components/auth/AuthCta';

const steps = [
  {
    icon: PenLine,
    title: 'Escribe',
    text: 'Una carta a tu futuro yo, o a alguien que quieres. Con calma, sin distracciones, como se escribían antes.',
  },
  {
    icon: CalendarClock,
    title: 'Séllala',
    text: 'Elige el día — y hasta la hora — de entrega: en 6 meses, en 10 años. Una vez sellada, nadie puede abrirla. Ni tú.',
  },
  {
    icon: MailOpen,
    title: 'Ábrela cuando llegue',
    text: 'El momento elegido, la carta llega a su destino. Romper el sello de cera es un pequeño acontecimiento.',
  },
];

const reasons = [
  {
    icon: Lock,
    title: 'Sellada de verdad',
    text: 'Una carta sellada es inmutable: no se puede editar, ni espiar, ni adelantar. Nadie lee su contenido — tampoco nosotros — hasta que su destinatario rompe el sello.',
  },
  {
    icon: Users,
    title: 'Para ti o para alguien más',
    text: 'Escríbete a los 40. Deja una carta para el cumpleaños de tu madre. Un «ábrela cuando tengas 30» para tu hijo. La carta espera lo que haga falta.',
  },
  {
    icon: Clock,
    title: 'La espera es el regalo',
    text: 'Entre escribir y abrir pasan meses o años. Lo que escribiste madura contigo, y al abrirla te encuentras con quien eras.',
  },
];

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-5xl px-5">
      <section className="flex flex-col items-center py-14 text-center sm:py-20">
        <h1 className="posa max-w-2xl font-serif text-4xl leading-tight text-ink sm:text-6xl">
          Escríbele a quien serás
        </h1>
        <p
          className="posa mt-6 max-w-xl text-lg text-[#5c5346]"
          style={{ '--posa-delay': '0.08s' } as React.CSSProperties}
        >
          Escribe una carta hoy. Nosotros la guardamos, sellada, hasta el día
          que elijas. Entonces llega — y tú la abres.
        </p>
        <AuthCta
          redirectTo="/escribir"
          mode="register"
          className="posa mt-10 rounded-full bg-gradient-to-b from-[#3a3226] to-[#241e15] px-8 pb-4 pt-3 font-hand text-[22px] font-semibold leading-none text-[#f6f1e6] shadow-[0_2px_4px_rgba(36,30,21,0.3),0_12px_26px_rgba(36,30,21,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] transition-transform hover:-translate-y-0.5"
          style={{ '--posa-delay': '0.16s' } as React.CSSProperties}
        >
          ✎ Escribe tu primera carta
        </AuthCta>

        {/* El sobre par avion, posado en la mesa */}
        <div
          className="posa mt-16 w-full max-w-[440px]"
          style={{ '--posa-delay': '0.26s' } as React.CSSProperties}
        >
          <article className="paravion">
            <div className="estampilla">
              <div className="motivo">
                <div className="valor">10 AÑOS</div>
              </div>
            </div>
            <div className="ondas">
              <span />
              <span />
              <span />
            </div>
            <div>
              <p className="para">Para</p>
              <p className="direccion">
                Quien serás
                <small>dentro de diez años</small>
              </p>
            </div>
            <div className="nota-fecha">
              <span className="faltan">
                faltan <b>10</b> años
              </span>
              <span className="escrita-el">
                escrita
                <br />
                hoy
              </span>
            </div>
            <div className="lacre" />
          </article>
        </div>
      </section>

      <section className="border-t border-ink-soft/15 py-16">
        <p className="grupo">Cómo funciona</p>
        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="flex flex-col items-start gap-3">
              <step.icon size={28} strokeWidth={1.5} className="text-gold" />
              <h2 className="font-serif text-xl text-ink">{step.title}</h2>
              <p className="text-sm leading-relaxed text-[#5c5346]">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-ink-soft/15 py-16">
        <h2 className="text-center font-serif text-3xl text-ink">
          Un ritual, no una app más
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="hoja-escritura flex flex-col gap-3 p-6"
            >
              <reason.icon size={24} strokeWidth={1.5} className="text-seal" />
              <h3 className="font-serif text-lg text-ink">{reason.title}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{reason.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-ink-soft/15 py-16 text-center">
        <p className="mx-auto max-w-lg font-serif text-2xl italic leading-relaxed text-ink">
          «Una carta sellada es inmutable. No se puede editar, no se puede
          espiar. Solo esperar.»
        </p>
        <AuthCta
          redirectTo="/escribir"
          mode="register"
          className="mt-8 inline-block font-hand text-xl font-semibold text-seal underline-offset-4 hover:underline"
        >
          Empezar a escribir →
        </AuthCta>
      </section>
    </div>
  );
}
