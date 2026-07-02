import { getFirestore } from 'firebase-admin/firestore';

/**
 * Recalcula las estadísticas desnormalizadas del usuario a partir de
 * queries de agregación (barato a escala MVP y siempre consistente).
 */
export async function updateUserStats(authorUid: string): Promise<void> {
  const db = getFirestore();
  const letters = db.collection('letters').where('authorUid', '==', authorUid);

  const [written, delivered, pending] = await Promise.all([
    letters
      .where('status', 'in', ['sealed', 'delivering', 'delivered', 'opened', 'failed'])
      .count()
      .get(),
    letters.where('status', 'in', ['delivered', 'opened']).count().get(),
    letters.where('status', 'in', ['sealed', 'delivering']).count().get(),
  ]);

  await db
    .collection('users')
    .doc(authorUid)
    .set(
      {
        stats: {
          lettersWritten: written.data().count,
          lettersDelivered: delivered.data().count,
          lettersPending: pending.data().count,
        },
      },
      { merge: true },
    )
    .catch(() => {
      // usuario borrado: las stats ya no importan
    });
}
