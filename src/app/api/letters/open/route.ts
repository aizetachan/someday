import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

const notFound = () =>
  NextResponse.json({ error: 'not_found' }, { status: 404 });

/**
 * GET /api/letters/open?id={letterId}&t={openToken}
 *
 * Valida el openToken, marca la carta como abierta la primera vez y
 * devuelve el contenido completo. Relectura permitida para siempre.
 * Token inválido → 404 genérico (no revelar existencia).
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const token = req.nextUrl.searchParams.get('t');
  if (!id || !token || token.length < 16) return notFound();

  const db = adminDb();
  const ref = db.collection('letters').doc(id);
  const snap = await ref.get();
  if (!snap.exists) return notFound();

  const letter = snap.data()!;
  if (!letter.openToken || letter.openToken !== token) return notFound();

  // Sellada pero aún no entregada: no revelar contenido bajo ningún concepto
  if (letter.status === 'sealed' || letter.status === 'delivering') {
    return NextResponse.json({ error: 'too_early' }, { status: 425 });
  }
  if (letter.status !== 'delivered' && letter.status !== 'opened') {
    return notFound();
  }

  if (letter.status === 'delivered') {
    await ref.update({ status: 'opened', openedAt: Timestamp.now() });
  }

  // Nombre del autor (para el pie "escrita por…" en cartas a otros)
  let authorName = '';
  try {
    const author = await db.collection('users').doc(letter.authorUid).get();
    authorName = (author.data()?.displayName as string) ?? '';
  } catch {
    // autor borrado (cuenta eliminada): se muestra anónimo
  }

  return NextResponse.json({
    id: snap.id,
    subject: letter.subject ?? '',
    body: letter.body ?? '',
    recipientType: letter.recipientType,
    recipientName: letter.recipientName ?? '',
    authorName,
    createdAt: (letter.createdAt as Timestamp).toDate().toISOString(),
    deliveryDate: (letter.deliveryDate as Timestamp).toDate().toISOString(),
    ...(letter.snapshot?.writtenFrom
      ? { writtenFrom: letter.snapshot.writtenFrom as string }
      : {}),
  });
}
