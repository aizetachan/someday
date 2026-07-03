import { onTaskDispatched } from 'firebase-functions/v2/tasks';
import { logger } from 'firebase-functions/v2';
import { getFirestore, type QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { REGION, RESEND_API_KEY } from './config';
import { deliverOne } from './deliverLetters';

/**
 * Entrega exacta: Cloud Tasks dispara esta función en el segundo elegido
 * por el autor. Idempotente frente al cron (transacción sealed→delivering
 * en deliverOne): si el cron llegó antes, esto es un no-op.
 */
export const deliverLetterAt = onTaskDispatched(
  {
    region: REGION,
    secrets: [RESEND_API_KEY],
    retryConfig: { maxAttempts: 3, minBackoffSeconds: 60 },
    rateLimits: { maxConcurrentDispatches: 5 },
  },
  async (req) => {
    const letterId = (req.data as { letterId?: string }).letterId;
    if (!letterId) return;

    const doc = await getFirestore().collection('letters').doc(letterId).get();
    if (!doc.exists || doc.data()?.status !== 'sealed') {
      logger.info('deliverLetterAt: nada que entregar', { letterId });
      return;
    }
    await deliverOne(doc as QueryDocumentSnapshot);
  },
);
