'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createDraft, updateDraft } from '@/lib/firestore';
import type { RecipientType } from '@/lib/types';
import { useAuth } from './useAuth';

export interface DraftState {
  subject: string;
  body: string;
  recipientType: RecipientType;
  recipientEmail: string;
  recipientName: string;
  deliveryYmd: string; // "2027-07-03" — fecha elegida (tz del autor)
}

const EMPTY: DraftState = {
  subject: '',
  body: '',
  recipientType: 'self',
  recipientEmail: '',
  recipientName: '',
  deliveryYmd: '',
};

const LS_KEY = 'cartas.draft.v1';
const LS_ID_KEY = 'cartas.draft.firestoreId';
const AUTOSAVE_MS = 3000;

/**
 * Borrador con autosave: siempre en localStorage (permite escribir sin
 * cuenta); si hay sesión, también en Firestore cada 3s de inactividad.
 */
export function useDraft() {
  const { user } = useAuth();
  const [draft, setDraft] = useState<DraftState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const firestoreId = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRemote = useRef(false);

  // Hidratar desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setDraft({ ...EMPTY, ...(JSON.parse(raw) as Partial<DraftState>) });
      firestoreId.current = localStorage.getItem(LS_ID_KEY);
    } catch {
      // localStorage no disponible
    }
    setHydrated(true);
  }, []);

  const persistRemote = useCallback(
    async (d: DraftState) => {
      if (!user) return;
      const input = {
        subject: d.subject,
        body: d.body,
        recipientType: d.recipientType,
        recipientEmail:
          d.recipientType === 'self' ? (user.email ?? '') : d.recipientEmail,
        recipientName: d.recipientName,
      };
      try {
        if (firestoreId.current) {
          await updateDraft(firestoreId.current, input);
        } else {
          firestoreId.current = await createDraft(user.uid, input);
          localStorage.setItem(LS_ID_KEY, firestoreId.current);
        }
        setSavedAt(new Date());
      } catch {
        // reintento en el próximo autosave
      }
    },
    [user],
  );

  const update = useCallback(
    (patch: Partial<DraftState>) => {
      setDraft((prev) => {
        const next = { ...prev, ...patch };
        try {
          localStorage.setItem(LS_KEY, JSON.stringify(next));
        } catch {
          // sin persistencia local
        }
        if (timer.current) clearTimeout(timer.current);
        pendingRemote.current = true;
        timer.current = setTimeout(() => {
          pendingRemote.current = false;
          void persistRemote(next);
        }, AUTOSAVE_MS);
        return next;
      });
    },
    [persistRemote],
  );

  /** Garantiza que el draft existe en Firestore y devuelve su id (para sellar). */
  const ensureRemote = useCallback(async (): Promise<string> => {
    if (!user) throw new Error('Necesitas sesión para sellar');
    if (timer.current) clearTimeout(timer.current);
    await persistRemote(draft);
    if (!firestoreId.current) throw new Error('No se pudo guardar el borrador');
    return firestoreId.current;
  }, [user, draft, persistRemote]);

  const clear = useCallback(() => {
    setDraft(EMPTY);
    firestoreId.current = null;
    try {
      localStorage.removeItem(LS_KEY);
      localStorage.removeItem(LS_ID_KEY);
    } catch {
      // nada
    }
  }, []);

  return { draft, update, clear, ensureRemote, hydrated, savedAt };
}
