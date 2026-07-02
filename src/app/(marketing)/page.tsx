import Link from 'next/link';
import { PenLine, CalendarClock, MailOpen } from 'lucide-react';
import { EnvelopeClosed } from '@/components/letters/EnvelopeClosed';

const steps = [
  {
    icon: PenLine,
    title: 'Escribe',
    text: 'Una carta a tu futuro yo, o a alguien que quieres. Con calma, como se escribían antes.',
  },
  {
    icon: CalendarClock,
    title: 'Séllala',
    text: 'Elige la fecha de entrega: en 6 meses, en 10 años. Una vez sellada, nadie puede abrirla. Ni tú.',
  },
  {
    icon: MailOpen,
    title: 'Ábrela cuando llegue',
    text: 'El día elegido, la carta llega a su destino. Romper el sello es un pequeño acontecimiento.',
  },
];

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-5xl px-5">
      <section className="flex flex-col items-center py-16 text-center sm:py-24">
        <h1 className="max-w-2xl font-serif text-4xl leading-tight text-ink sm:text-6xl">
          Escríbele a quien serás
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink-soft">
          Escribe una carta hoy. Nosotros la guardamos, sellada, hasta el día
          que elijas. Entonces llega — y tú la abres.
        </p>
        <Link
          href="/escribir"
          className="mt-10 rounded-[4px] bg-seal px-8 py-4 text-base font-medium text-paper shadow-[var(--shadow-paper)] transition-colors hover:bg-seal-hover"
        >
          Escribe tu primera carta
        </Link>
        <div className="mt-16">
          <EnvelopeClosed width={320} />
        </div>
      </section>

      <section className="grid gap-8 border-t border-ink-soft/15 py-16 sm:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="flex flex-col items-start gap-3">
            <step.icon size={28} strokeWidth={1.5} className="text-gold" />
            <h2 className="font-serif text-xl text-ink">{step.title}</h2>
            <p className="text-sm leading-relaxed text-ink-soft">{step.text}</p>
          </div>
        ))}
      </section>

      <section className="border-t border-ink-soft/15 py-16 text-center">
        <p className="mx-auto max-w-lg font-serif text-2xl italic leading-relaxed text-ink">
          «Una carta sellada es inmutable. No se puede editar, no se puede
          espiar. Solo esperar.»
        </p>
        <Link
          href="/escribir"
          className="mt-8 inline-block text-sm font-medium text-seal underline-offset-4 hover:underline"
        >
          Empezar a escribir →
        </Link>
      </section>
    </div>
  );
}
