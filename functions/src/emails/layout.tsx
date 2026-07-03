import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

export const palette = {
  paper: '#F7F3EC',
  paperWarm: '#EFE7DA',
  ink: '#1F1B16',
  inkSoft: '#5A5248',
  seal: '#8C2F1B',
  gold: '#B0894B',
  // El escritorio
  madera: '#D8CCBA',
  tintaPluma: '#2B3A5C',
  grisPostal: '#93887A',
  hoja: '#FBF8EF',
};

export const serif = "'Iowan Old Style', 'Palatino Linotype', Georgia, serif";
export const sans =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
export const mono =
  "'SF Mono', 'Menlo', 'Consolas', 'Courier New', monospace";
/** Manuscrita: los clientes de correo no cargan webfonts — caligráficas del sistema. */
export const hand =
  "'Snell Roundhand', 'Apple Chancery', 'Segoe Script', 'Comic Sans MS', cursive";

/**
 * Marco común: la mesa de madera del escritorio. Cada plantilla pone su
 * papel encima (PaperSheet).
 */
export function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{ backgroundColor: palette.madera, margin: 0, padding: '36px 14px' }}
      >
        <Container style={{ maxWidth: 560 }}>
          {children}
          <Section>
            <Text
              style={{
                color: '#6F6455',
                fontFamily: sans,
                fontSize: 11,
                lineHeight: '17px',
                margin: '22px 0 0',
                textAlign: 'center' as const,
              }}
            >
              Cartas al Futuro · Nadie lee tus cartas selladas, ni siquiera
              nosotros.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/** Hoja de papel posada sobre la mesa. */
export function PaperSheet({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <Section
      style={{
        backgroundColor: palette.hoja,
        border: '1px solid #E8E0CE',
        borderRadius: 4,
        boxShadow: '0 12px 28px rgba(46, 40, 32, 0.25)',
        padding: '36px 32px',
        ...style,
      }}
    >
      {children}
    </Section>
  );
}

/** Sello de cera simplificado (imagen inline no: círculo CSS). */
export function SealDot() {
  return (
    <div
      style={{
        backgroundColor: palette.seal,
        borderRadius: '50%',
        boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.2), inset 0 -3px 5px rgba(0,0,0,0.25)',
        height: 44,
        margin: '0 auto 24px',
        width: 44,
      }}
    />
  );
}
