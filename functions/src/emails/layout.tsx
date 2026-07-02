import {
  Body,
  Container,
  Head,
  Hr,
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
};

export const serif = "'Iowan Old Style', 'Palatino Linotype', Georgia, serif";
export const sans =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

/** Marco común: fondo papel, contenedor carta, pie discreto. */
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
      <Body style={{ backgroundColor: palette.paper, margin: 0, padding: '32px 12px' }}>
        <Container
          style={{
            backgroundColor: '#FFFFFF',
            border: `1px solid ${palette.paperWarm}`,
            borderRadius: 4,
            maxWidth: 520,
            padding: '40px 36px',
          }}
        >
          {children}
          <Hr style={{ borderColor: palette.paperWarm, margin: '32px 0 16px' }} />
          <Section>
            <Text
              style={{
                color: palette.inkSoft,
                fontFamily: sans,
                fontSize: 12,
                lineHeight: '18px',
                margin: 0,
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

/** Sello de cera simplificado (imagen inline no: círculo CSS). */
export function SealDot() {
  return (
    <div
      style={{
        backgroundColor: palette.seal,
        borderRadius: '50%',
        height: 44,
        margin: '0 auto 24px',
        width: 44,
      }}
    />
  );
}
