import { Timestamp, getFirestore } from 'firebase-admin/firestore';

const HOUR = 3_600_000;

export function hoursFromNow(h: number): Timestamp {
  return Timestamp.fromMillis(Date.now() + h * HOUR);
}

/** Crea un usuario mínimo (autor o destinatario con cuenta). */
export async function seedUser(
  uid: string,
  data: Record<string, unknown> = {},
): Promise<void> {
  await getFirestore()
    .collection('users')
    .doc(uid)
    .set({ email: `${uid}@example.com`, displayName: `Nombre de ${uid}`, ...data });
}

/** Crea una carta con valores por defecto razonables (a uno mismo, vencida). */
export async function seedLetter(
  id: string,
  overrides: Record<string, unknown> = {},
): Promise<void> {
  await getFirestore()
    .collection('letters')
    .doc(id)
    .set({
      authorUid: 'autor',
      recipientType: 'self',
      recipientName: 'Yo del futuro',
      recipientEmail: 'autor@example.com',
      subject: 'Asunto de prueba',
      body: 'Cuerpo de prueba',
      status: 'sealed',
      createdAt: hoursFromNow(-48),
      deliveryDate: hoursFromNow(-1),
      openToken: 'token-secreto-de-prueba-123',
      ...overrides,
    });
}

export async function getLetter(id: string): Promise<Record<string, unknown>> {
  const snap = await getFirestore().collection('letters').doc(id).get();
  if (!snap.exists) throw new Error(`La carta ${id} no existe`);
  return snap.data() as Record<string, unknown>;
}

export async function getUser(uid: string): Promise<Record<string, unknown> | undefined> {
  const snap = await getFirestore().collection('users').doc(uid).get();
  return snap.data() as Record<string, unknown> | undefined;
}
