import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions/v2';
import { Timestamp, getFirestore } from 'firebase-admin/firestore';
import * as React from 'react';
import { REGION, RESEND_API_KEY } from './config';
import { Reminder24hEmail } from './emails/templates';
import { sendEmail } from './mail';

/**
 * Recordatorio previo — diario a las 09:00 (Europe/Madrid).
 * Busca cartas selladas que se entregan entre +24h y +48h y avisa al AUTOR
 * (si lo tiene activado en ajustes). Sin spoilers de contenido.
 */
export const dailyReminders = onSchedule(
  {
    schedule: 'every day 09:00',
    timeZone: 'Europe/Madrid',
    region: REGION,
    secrets: [RESEND_API_KEY],
  },
  async () => {
    const db = getFirestore();
    const now = Date.now();

    const upcoming = await db
      .collection('letters')
      .where('status', '==', 'sealed')
      .where('deliveryDate', '>=', Timestamp.fromMillis(now + 24 * 3_600_000))
      .where('deliveryDate', '<', Timestamp.fromMillis(now + 48 * 3_600_000))
      .limit(200)
      .get();

    logger.info(`dailyReminders: ${upcoming.size} cartas inminentes`);

    for (const doc of upcoming.docs) {
      const letter = doc.data();
      try {
        const author = await db.collection('users').doc(letter.authorUid).get();
        const data = author.data();
        if (!data?.email || data.settings?.reminderBeforeDelivery === false) continue;

        await sendEmail({
          to: data.email as string,
          subject: 'Mañana llega una carta que escribiste',
          template: React.createElement(Reminder24hEmail, {
            authorName: (data.displayName as string) ?? '',
            writtenAt: (letter.createdAt as Timestamp).toDate(),
            recipientLabel:
              letter.recipientType === 'self'
                ? 'tu futuro yo'
                : (letter.recipientName as string),
          }),
        });
      } catch (err) {
        logger.error('Fallo enviando recordatorio', { id: doc.id, err: String(err) });
      }
    }
  },
);
