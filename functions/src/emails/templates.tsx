import { Button, Heading, Section, Text } from '@react-email/components';
import { formatDateEs, humanDistance } from '../dates';
import {
  EmailLayout,
  PaperSheet,
  SealDot,
  hand,
  mono,
  palette,
  sans,
  serif,
} from './layout';

const h1 = {
  color: palette.ink,
  fontFamily: serif,
  fontSize: 26,
  fontWeight: 500 as const,
  lineHeight: '34px',
  margin: '0 0 16px',
};

const p = {
  color: palette.ink,
  fontFamily: sans,
  fontSize: 15,
  lineHeight: '24px',
  margin: '0 0 14px',
};

const meta = {
  color: palette.gold,
  fontFamily: sans,
  fontSize: 13,
  letterSpacing: '0.02em',
  margin: '0 0 6px',
};

/* etiqueta postal sobre la mesa, encima del papel */
const metaMesa = {
  color: '#6F6455',
  fontFamily: mono,
  fontSize: 10,
  letterSpacing: '0.18em',
  margin: '0 0 18px',
  textAlign: 'center' as const,
  textTransform: 'uppercase' as const,
};

/* CTA principal: la píldora oscura del escritorio */
const ctaPill = {
  backgroundColor: '#241E15',
  borderRadius: 100,
  color: '#F6F1E6',
  display: 'inline-block',
  fontFamily: sans,
  fontSize: 16,
  fontWeight: 600 as const,
  padding: '14px 34px',
  textDecoration: 'none',
};

// ---------------------------------------------------------------------------
// letter-delivery — a ti mismo: el sobre llega, la ceremonia es el enlace
// ---------------------------------------------------------------------------

export function LetterDeliveryEmail({
  recipientName,
  recipientType,
  authorName,
  writtenAt,
  deliveryAt,
  openUrl,
}: {
  recipientName: string;
  recipientType: 'self' | 'other';
  authorName: string;
  writtenAt: Date;
  deliveryAt: Date;
  openUrl: string;
}) {
  const traveled = humanDistance(writtenAt, deliveryAt);
  return (
    <EmailLayout preview="Una carta del pasado ha llegado a su destino.">
      <Text style={metaMesa}>Correo del pasado · {formatDateEs(deliveryAt)}</Text>
      <PaperSheet style={{ textAlign: 'center' as const }}>
        <SealDot />
        <Heading style={{ ...h1, textAlign: 'center' as const }}>
          Ha llegado una carta
        </Heading>
        <Text style={{ ...p, textAlign: 'center' as const, color: palette.inkSoft }}>
          {recipientType === 'self'
            ? `La escribiste tú, el ${formatDateEs(writtenAt)}.`
            : `${authorName || 'Alguien'} la escribió para ti el ${formatDateEs(writtenAt)}.`}
        </Text>
        <Text
          style={{
            color: palette.gold,
            fontFamily: serif,
            fontSize: 17,
            fontStyle: 'italic',
            lineHeight: '26px',
            margin: '0 0 28px',
            textAlign: 'center' as const,
          }}
        >
          Esta carta ha esperado {traveled} para encontrarte
          {recipientType === 'other' && recipientName ? `, ${recipientName}` : ''}.
        </Text>
        <Section style={{ textAlign: 'center' as const, margin: '0 0 8px' }}>
          <Button href={openUrl} style={ctaPill}>
            Abrir la carta
          </Button>
        </Section>
        <Text
          style={{
            color: palette.grisPostal,
            fontFamily: sans,
            fontSize: 12,
            margin: '16px 0 0',
            textAlign: 'center' as const,
          }}
        >
          El sello se rompe una sola vez. Sin prisa: la carta ya es tuya.
        </Text>
      </PaperSheet>
    </EmailLayout>
  );
}

// ---------------------------------------------------------------------------
// letter-content — a otra persona: la carta VA en el email, como una hoja
// de verdad sobre la mesa
// ---------------------------------------------------------------------------

export function LetterContentEmail({
  recipientName,
  authorName,
  subject,
  body,
  writtenAt,
  deliveryAt,
  openUrl,
}: {
  recipientName: string;
  authorName: string;
  subject: string;
  body: string;
  writtenAt: Date;
  deliveryAt: Date;
  openUrl: string;
}) {
  const traveled = humanDistance(writtenAt, deliveryAt);
  return (
    <EmailLayout preview="Una carta del pasado ha llegado a su destino.">
      <Text style={metaMesa}>
        {authorName || 'Alguien'} escribió esta carta hace {traveled}
        {recipientName ? ` para ti, ${recipientName}` : ''}
      </Text>

      <PaperSheet style={{ padding: '40px 36px' }}>
        {/* fecha, arriba a la derecha, como en una carta */}
        <Text
          style={{
            color: palette.gold,
            fontFamily: mono,
            fontSize: 11,
            letterSpacing: '0.04em',
            margin: '0 0 26px',
            textAlign: 'right' as const,
          }}
        >
          {formatDateEs(writtenAt)}
        </Text>

        <Heading
          style={{
            color: palette.ink,
            fontFamily: serif,
            fontSize: 24,
            fontWeight: 500 as const,
            lineHeight: '32px',
            margin: '0 0 24px',
          }}
        >
          {subject || 'Una carta para ti'}
        </Heading>

        <Text
          style={{
            color: palette.ink,
            fontFamily: serif,
            fontSize: 17,
            lineHeight: '29px',
            margin: 0,
            whiteSpace: 'pre-wrap' as const,
          }}
        >
          {body}
        </Text>

        {/* firma manuscrita */}
        <Text
          style={{
            color: palette.tintaPluma,
            fontFamily: hand,
            fontSize: 24,
            lineHeight: '30px',
            margin: '40px 0 0',
          }}
        >
          — {authorName || 'Alguien que pensó en ti'}
        </Text>
        <Text
          style={{
            color: palette.grisPostal,
            fontFamily: sans,
            fontSize: 12,
            margin: '10px 0 0',
          }}
        >
          Puedes responder a este email para escribirle.
        </Text>
      </PaperSheet>

      {/* fuera del papel, sobre la mesa */}
      <Text style={{ margin: '20px 0 0', textAlign: 'center' as const }}>
        <a
          href={openUrl}
          style={{
            color: '#4A4238',
            fontFamily: sans,
            fontSize: 12,
            textDecoration: 'underline',
          }}
        >
          Ver la carta en Cartas al Futuro →
        </a>
      </Text>
    </EmailLayout>
  );
}

// ---------------------------------------------------------------------------
// letter-sealed — confirmación al sellar
// ---------------------------------------------------------------------------

export function LetterSealedEmail({
  authorName,
  deliveryAt,
  recipientLabel,
}: {
  authorName: string;
  deliveryAt: Date;
  recipientLabel: string; // "tu futuro yo" / "Mamá"
}) {
  const wait = humanDistance(new Date(), deliveryAt);
  return (
    <EmailLayout preview="Tu carta ya viaja hacia el futuro.">
      <PaperSheet>
        <SealDot />
        <Heading style={h1}>Tu carta está sellada{authorName ? `, ${authorName}` : ''}</Heading>
        <Text style={p}>
          Viaja hacia el <strong>{formatDateEs(deliveryAt)}</strong> — faltan{' '}
          {wait} — con destino a {recipientLabel}.
        </Text>
        <Text style={p}>
          Desde este momento ya no se puede abrir ni editar. Ni siquiera tú
          podrás leerla hasta que llegue. Así funciona una carta de verdad.
        </Text>
        <Text style={{ ...p, color: palette.inkSoft }}>
          Si cambias de opinión, puedes cancelarla (sin leerla) hasta 24 horas
          antes de la entrega, desde tu archivo de cartas.
        </Text>
      </PaperSheet>
    </EmailLayout>
  );
}

// ---------------------------------------------------------------------------
// welcome
// ---------------------------------------------------------------------------

export function WelcomeEmail({
  name,
  writeUrl,
}: {
  name: string;
  writeUrl: string;
}) {
  return (
    <EmailLayout preview="Bienvenido. Tu primera carta te está esperando.">
      <PaperSheet>
        <Heading style={h1}>Hola{name ? `, ${name}` : ''} 👋</Heading>
        <Text style={p}>
          Esto es Cartas al Futuro: un lugar para escribir cartas que se
          entregan más adelante. A tu futuro yo, o a alguien que quieres.
        </Text>
        <Text style={p}>
          Se escriben con calma, se sellan, y no pueden abrirse hasta la fecha
          elegida. La espera es parte del regalo.
        </Text>
        <Section style={{ margin: '24px 0 8px' }}>
          <Button href={writeUrl} style={ctaPill}>
            Escribe tu primera carta
          </Button>
        </Section>
      </PaperSheet>
    </EmailLayout>
  );
}

// ---------------------------------------------------------------------------
// reminder-24h
// ---------------------------------------------------------------------------

export function Reminder24hEmail({
  authorName,
  writtenAt,
  recipientLabel,
}: {
  authorName: string;
  writtenAt: Date;
  recipientLabel: string;
}) {
  return (
    <EmailLayout preview="Mañana llega una carta.">
      <PaperSheet>
        <Heading style={h1}>Mañana llega una carta</Heading>
        <Text style={meta}>Sin spoilers. Solo un aviso.</Text>
        <Text style={p}>
          {authorName ? `${authorName}, mañana` : 'Mañana'} se entrega una carta
          que escribiste el <strong>{formatDateEs(writtenAt)}</strong>, con
          destino a {recipientLabel}.
        </Text>
        <Text style={{ ...p, color: palette.inkSoft }}>
          No te decimos nada más: el contenido sigue sellado hasta el momento de
          abrirla.
        </Text>
      </PaperSheet>
    </EmailLayout>
  );
}

// ---------------------------------------------------------------------------
// delivery-failed
// ---------------------------------------------------------------------------

export function DeliveryFailedEmail({
  authorName,
  recipientEmail,
  writtenAt,
}: {
  authorName: string;
  recipientEmail: string;
  writtenAt: Date;
}) {
  return (
    <EmailLayout preview="No pudimos entregar tu carta.">
      <PaperSheet>
        <Heading style={h1}>No pudimos entregar tu carta</Heading>
        <Text style={p}>
          {authorName ? `${authorName}, la` : 'La'} carta que escribiste el{' '}
          {formatDateEs(writtenAt)} no pudo entregarse en{' '}
          <strong>{recipientEmail}</strong> tras varios intentos.
        </Text>
        <Text style={p}>
          La carta sigue guardada, sellada e intacta. Responde a este email y lo
          resolvemos juntos — por ejemplo, corrigiendo la dirección de entrega.
        </Text>
      </PaperSheet>
    </EmailLayout>
  );
}
