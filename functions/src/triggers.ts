import {
  onDocumentCreated,
  onDocumentUpdated,
} from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions/v2';
import { Timestamp } from 'firebase-admin/firestore';
import * as React from 'react';
import { APP_URL, REGION, RESEND_API_KEY } from './config';
import { enqueueExactDelivery } from './deliverLetters';
import { WelcomeEmail } from './emails/templates';
import { sendEmail } from './mail';
import { updateUserStats } from './stats';

/** Bienvenida al crear el documento de usuario (primer registro). */
export const onUserCreated = onDocumentCreated(
  { document: 'users/{uid}', region: REGION, secrets: [RESEND_API_KEY] },
  async (event) => {
    const data = event.data?.data();
    if (!data?.email) return;
    try {
      await sendEmail({
        to: data.email as string,
        subject: 'Bienvenido a Cartas al Futuro',
        template: React.createElement(WelcomeEmail, {
          name: (data.displayName as string) ?? '',
          writeUrl: `${APP_URL.value()}/escribir`,
        }),
      });
    } catch (err) {
      logger.error('Fallo enviando welcome', { uid: event.params.uid, err: String(err) });
    }
  },
);

/**
 * Al sellar (draft → sealed): stats + programación de la entrega exacta.
 * Sin email de confirmación: la plataforma ya informa al autor.
 */
export const onLetterSealed = onDocumentUpdated(
  { document: 'letters/{letterId}', region: REGION },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;
    if (!(before.status === 'draft' && after.status === 'sealed')) return;

    await updateUserStats(after.authorUid as string);

    // Entrega cercana (<25h): programar ya la tarea a la hora exacta.
    // Las lejanas las programa el cron cuando entran en su horizonte.
    const deliveryAt = (after.deliveryDate as Timestamp).toDate();
    if (deliveryAt.getTime() - Date.now() < 25 * 3_600_000) {
      try {
        await enqueueExactDelivery(event.params.letterId, deliveryAt);
        await event.data!.after.ref.update({ taskScheduled: true });
      } catch (err) {
        logger.warn('No se pudo programar entrega exacta al sellar', {
          id: event.params.letterId,
          err: String(err),
        });
      }
    }
  },
);
