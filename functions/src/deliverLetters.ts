import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions/v2';
import {
  FieldValue,
  Timestamp,
  getFirestore,
  type QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import * as React from 'react';
import { APP_URL, MAX_DELIVERY_ATTEMPTS, REGION, RESEND_API_KEY } from './config';
import { DeliveryFailedEmail, LetterDeliveryEmail } from './emails/templates';
import { sendEmail } from './mail';
import { updateUserStats } from './stats';

/**
 * Cron de entrega — cada 15 minutos.
 *
 * - Lotes de 100: el resto cae en la siguiente ejecución.
 * - Entrega secuencial (amable con el rate limit de Resend).
 * - Idempotencia: transacción sealed→delivering evita el doble envío si dos
 *   ejecuciones se solapan.
 * - Recuperación: cartas atascadas en 'delivering' más de 1h vuelven a
 *   'sealed' para reintentarse.
 */
export const deliverLetters = onSchedule(
  {
    schedule: 'every 15 minutes',
    timeZone: 'UTC',
    region: REGION,
    secrets: [RESEND_API_KEY],
  },
  async () => {
    const db = getFirestore();
    const now = Timestamp.now();

    // Recuperar entregas atascadas por un crash anterior
    const stuck = await db
      .collection('letters')
      .where('status', '==', 'delivering')
      .where('deliveringSince', '<=', Timestamp.fromMillis(now.toMillis() - 3_600_000))
      .limit(20)
      .get();
    for (const doc of stuck.docs) {
      await doc.ref.update({ status: 'sealed' });
      logger.warn('Carta atascada en delivering, devuelta a sealed', { id: doc.id });
    }

    const due = await db
      .collection('letters')
      .where('status', '==', 'sealed')
      .where('deliveryDate', '<=', now)
      .limit(100)
      .get();

    logger.info(`deliverLetters: ${due.size} cartas por entregar`);

    for (const doc of due.docs) {
      await deliverOne(doc);
    }
  },
);

async function deliverOne(doc: QueryDocumentSnapshot): Promise<void> {
  const db = doc.ref.firestore;
  const letter = doc.data();

  try {
    // 1. Lock optimista
    await db.runTransaction(async (tx) => {
      const fresh = await tx.get(doc.ref);
      if (fresh.data()?.status !== 'sealed') throw new Error('ALREADY_PROCESSED');
      tx.update(doc.ref, {
        status: 'delivering',
        deliveringSince: Timestamp.now(),
      });
    });

    // 2. Nombre y email del autor para el email de entrega
    let authorName = '';
    let authorEmail = '';
    try {
      const author = await db.collection('users').doc(letter.authorUid).get();
      authorName = (author.data()?.displayName as string) ?? '';
      authorEmail = (author.data()?.email as string) ?? '';
    } catch {
      // autor borrado — carta a otro que se entrega igualmente
    }

    // 3. Enviar. El email NUNCA contiene el cuerpo: solo el enlace de apertura.
    const writtenAt = (letter.createdAt as Timestamp).toDate();
    const deliveryAt = (letter.deliveryDate as Timestamp).toDate();
    await sendEmail({
      to: letter.recipientEmail,
      subject:
        letter.recipientType === 'self'
          ? '📮 Tu yo del pasado te escribió una carta'
          : `📮 ${letter.recipientName}, tienes una carta escrita hace tiempo`,
      template: React.createElement(LetterDeliveryEmail, {
        recipientName: letter.recipientName ?? '',
        recipientType: letter.recipientType,
        authorName,
        writtenAt,
        deliveryAt,
        openUrl: `${APP_URL.value()}/abrir/${doc.id}?t=${letter.openToken}`,
      }),
      // Cartas a otros: responder al email escribe al autor real
      ...(letter.recipientType === 'other' && authorEmail
        ? { replyTo: authorEmail }
        : {}),
    });

    // 4. Confirmar entrega
    await doc.ref.update({
      status: 'delivered',
      deliveredAt: Timestamp.now(),
      deliveringSince: FieldValue.delete(),
    });
    await updateUserStats(letter.authorUid);
    logger.info('Carta entregada', { id: doc.id });
  } catch (err) {
    if ((err as Error).message === 'ALREADY_PROCESSED') return;

    const attempts = ((letter.deliveryAttempts as number) ?? 0) + 1;
    const failed = attempts >= MAX_DELIVERY_ATTEMPTS;
    await doc.ref.update({
      status: failed ? 'failed' : 'sealed', // reintenta en el próximo tick
      deliveryAttempts: attempts,
      lastDeliveryError: String(err),
      deliveringSince: FieldValue.delete(),
    });
    logger.error('Fallo de entrega', { id: doc.id, attempts, err: String(err) });

    if (failed) await notifyAuthorOfFailure(doc.id, letter);
  }
}

async function notifyAuthorOfFailure(
  letterId: string,
  letter: FirebaseFirestore.DocumentData,
): Promise<void> {
  try {
    const db = getFirestore();
    const author = await db.collection('users').doc(letter.authorUid).get();
    const email = author.data()?.email as string | undefined;
    if (!email) return;
    await sendEmail({
      to: email,
      subject: 'No pudimos entregar tu carta',
      template: React.createElement(DeliveryFailedEmail, {
        authorName: (author.data()?.displayName as string) ?? '',
        recipientEmail: letter.recipientEmail as string,
        writtenAt: (letter.createdAt as Timestamp).toDate(),
      }),
    });
  } catch (err) {
    logger.error('No se pudo avisar al autor del fallo', { letterId, err: String(err) });
  }
}
