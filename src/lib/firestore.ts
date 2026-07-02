import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { db } from './firebase';
import { userTimezone } from './dates';
import type { AppUser, Letter, RecipientType, UserSettings } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function letterFromSnap(snap: QueryDocumentSnapshot): Letter {
  return { ...(snap.data() as Omit<Letter, 'id'>), id: snap.id };
}

/** Token aleatorio de 32 chars para el enlace de apertura. */
export function generateOpenToken(): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

/** Crea el documento de usuario si no existe (primer login). */
export async function ensureUserDoc(user: FirebaseUser): Promise<void> {
  const ref = doc(db(), 'users', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  const appUser: Omit<AppUser, 'createdAt'> & { createdAt: unknown } = {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? user.email?.split('@')[0] ?? '',
    ...(user.photoURL ? { photoURL: user.photoURL } : {}),
    createdAt: serverTimestamp(),
    timezone: userTimezone(),
    settings: {
      reminderBeforeDelivery: true,
      marketingEmails: false,
    },
    stats: {
      lettersWritten: 0,
      lettersDelivered: 0,
      lettersPending: 0,
    },
  };
  await setDoc(ref, appUser);
}

export function subscribeUser(
  uid: string,
  cb: (user: AppUser | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db(), 'users', uid), (snap) => {
    cb(snap.exists() ? (snap.data() as AppUser) : null);
  });
}

export async function updateUserSettings(
  uid: string,
  settings: Partial<UserSettings>,
): Promise<void> {
  const patch: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(settings)) patch[`settings.${k}`] = v;
  await updateDoc(doc(db(), 'users', uid), patch);
}

export async function updateDisplayNameDoc(uid: string, displayName: string) {
  await updateDoc(doc(db(), 'users', uid), { displayName });
}

// ---------------------------------------------------------------------------
// Letters — drafts
// ---------------------------------------------------------------------------

export interface DraftInput {
  subject: string;
  body: string;
  recipientType: RecipientType;
  recipientEmail: string;
  recipientName: string;
}

export async function createDraft(
  authorUid: string,
  input: DraftInput,
): Promise<string> {
  const ref = await addDoc(collection(db(), 'letters'), {
    authorUid,
    ...input,
    status: 'draft',
    createdAt: serverTimestamp(),
    deliveryDate: Timestamp.now(), // se fija de verdad al sellar
    deliveryAttempts: 0,
    openToken: '',
  });
  return ref.id;
}

export async function updateDraft(
  letterId: string,
  input: Partial<DraftInput>,
): Promise<void> {
  await updateDoc(doc(db(), 'letters', letterId), { ...input });
}

export async function deleteDraft(letterId: string): Promise<void> {
  await deleteDoc(doc(db(), 'letters', letterId));
}

// ---------------------------------------------------------------------------
// Letters — seal / cancel
// ---------------------------------------------------------------------------

export interface SealInput {
  recipientType: RecipientType;
  recipientEmail: string;
  recipientName: string;
  deliveryDate: Date; // ya convertida a UTC (00:00 tz del autor)
}

/** Sella un draft existente. Irreversible. */
export async function sealLetter(letterId: string, input: SealInput): Promise<void> {
  await updateDoc(doc(db(), 'letters', letterId), {
    recipientType: input.recipientType,
    recipientEmail: input.recipientEmail,
    recipientName: input.recipientName,
    deliveryDate: Timestamp.fromDate(input.deliveryDate),
    status: 'sealed',
    sealedAt: serverTimestamp(),
    openToken: generateOpenToken(),
  });
}

/** Cancela una carta sellada (solo hasta 24h antes de la entrega). */
export async function cancelLetter(letterId: string): Promise<void> {
  await updateDoc(doc(db(), 'letters', letterId), { status: 'cancelled' });
}

// ---------------------------------------------------------------------------
// Letters — queries
// ---------------------------------------------------------------------------

export function subscribeAuthoredLetters(
  authorUid: string,
  cb: (letters: Letter[]) => void,
): Unsubscribe {
  const q = query(
    collection(db(), 'letters'),
    where('authorUid', '==', authorUid),
    orderBy('deliveryDate', 'asc'),
  );
  return onSnapshot(q, (snap) => cb(snap.docs.map(letterFromSnap)));
}

export function subscribeReceivedLetters(
  email: string,
  cb: (letters: Letter[]) => void,
): Unsubscribe {
  const q = query(
    collection(db(), 'letters'),
    where('recipientEmail', '==', email),
    where('status', 'in', ['delivered', 'opened']),
  );
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map(letterFromSnap)),
    // Las recibidas de otros pueden fallar por reglas si no somos autor;
    // en v1 el archivo "Recibidas" solo muestra cartas self ya entregadas
    // + las de otros llegan por email. No romper la UI si falla.
    () => cb([]),
  );
}

export function subscribeLetter(
  letterId: string,
  cb: (letter: Letter | null) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db(), 'letters', letterId),
    (snap) =>
      cb(snap.exists() ? { ...(snap.data() as Omit<Letter, 'id'>), id: snap.id } : null),
    () => cb(null),
  );
}
