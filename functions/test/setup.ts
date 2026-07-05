import { getApps, initializeApp } from 'firebase-admin/app';

/**
 * Los tests corren SIEMPRE contra el emulador de Firestore (proyecto
 * demo-*, sin credenciales ni red). `npm test` lo arranca vía
 * `firebase emulators:exec`; este guard evita tocar producción por error.
 */
if (!process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error(
    'FIRESTORE_EMULATOR_HOST no está definido. Ejecuta los tests con `npm test` ' +
      '(arranca el emulador de Firestore automáticamente).',
  );
}

export const PROJECT_ID = 'demo-cartas-test';

process.env.GCLOUD_PROJECT = PROJECT_ID;
// Parámetros de las funciones (defineString) durante los tests
process.env.APP_URL = 'https://test.example.com';
process.env.EMAIL_FROM = 'Test <test@example.com>';
process.env.EMAIL_REPLY_TO = '';

if (getApps().length === 0) {
  initializeApp({ projectId: PROJECT_ID });
}

/** Borra todos los documentos del emulador (estado limpio entre tests). */
export async function clearFirestore(): Promise<void> {
  const host = process.env.FIRESTORE_EMULATOR_HOST;
  const res = await fetch(
    `http://${host}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' },
  );
  if (!res.ok) throw new Error(`No se pudo limpiar el emulador: ${res.status}`);
}
