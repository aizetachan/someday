import { render } from '@react-email/render';
import { Resend } from 'resend';
import type { ReactElement } from 'react';
import { EMAIL_FROM, EMAIL_REPLY_TO, RESEND_API_KEY } from './config';

/** Envía un email transaccional renderizando una plantilla React Email. */
export async function sendEmail(options: {
  to: string;
  subject: string;
  template: ReactElement;
  replyTo?: string;
}): Promise<void> {
  const resend = new Resend(RESEND_API_KEY.value());
  const html = await render(options.template);
  const replyTo = options.replyTo || EMAIL_REPLY_TO.value() || undefined;
  const { error } = await resend.emails.send({
    from: EMAIL_FROM.value(),
    to: options.to,
    subject: options.subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });
  if (error) throw new Error(`Resend: ${error.name} ${error.message}`);
}
