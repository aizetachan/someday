import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { REGION } from './config';

/**
 * Derecho al olvido (GDPR).
 *
 * - Cartas a uno mismo (cualquier estado): se eliminan.
 * - Cartas selladas a OTRAS personas: se conservan y se entregarán
 *   igualmente — son un compromiso con el destinatario. Se anonimiza la
 *   autoría visible.
 * - Cartas a otros ya entregadas/abiertas: se conservan anonimizadas
 *   (el destinatario puede releerlas para siempre).
 * - Documento de usuario y cuenta de Auth: eliminados.
 */
export const deleteAccount = onCall({ region: REGION }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Necesitas sesión.');

  const db = getFirestore();
  const authored = await db.collection('letters').where('authorUid', '==', uid).get();

  const batch = db.batch();
  for (const doc of authored.docs) {
    const letter = doc.data();
    const isSelf = letter.recipientType === 'self';
    const pendingToOther =
      !isSelf && ['sealed', 'delivering', 'delivered', 'opened'].includes(letter.status);

    if (pendingToOther) {
      // Se entrega/relee igualmente, pero sin vincular al autor borrado
      batch.update(doc.ref, {
        authorUid: `deleted:${uid.slice(0, 8)}`,
        authorDeleted: true,
      });
    } else {
      batch.delete(doc.ref);
    }
  }
  batch.delete(db.collection('users').doc(uid));
  await batch.commit();

  await getAuth().deleteUser(uid);
  logger.info('Cuenta borrada (GDPR)', { uid, letters: authored.size });

  return { ok: true };
});
