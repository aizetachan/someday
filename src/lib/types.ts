import type { Timestamp } from 'firebase/firestore';

export type LetterStatus =
  | 'draft'
  | 'sealed'
  | 'delivering'
  | 'delivered'
  | 'opened'
  | 'failed'
  | 'cancelled';

export type RecipientType = 'self' | 'other';

export interface Letter {
  id: string;
  authorUid: string;

  // Destinatario
  recipientType: RecipientType;
  recipientEmail: string;
  recipientName: string;

  // Contenido
  subject: string; // máx 120 chars
  body: string; // texto plano, máx 20.000 chars
  attachedPhotoURL?: string;

  // Tiempo
  createdAt: Timestamp;
  sealedAt?: Timestamp;
  deliveryDate: Timestamp;
  deliveredAt?: Timestamp;
  openedAt?: Timestamp;

  // Estado y entrega
  status: LetterStatus;
  deliveryAttempts: number;
  lastDeliveryError?: string;
  openToken: string;

  snapshot?: {
    writtenFrom?: string;
    userAge?: number;
  };
}

export interface UserSettings {
  reminderBeforeDelivery: boolean;
  marketingEmails: boolean;
}

export interface UserStats {
  lettersWritten: number;
  lettersDelivered: number;
  lettersPending: number;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  timezone: string; // IANA
  settings: UserSettings;
  stats: UserStats;
}

export const LIMITS = {
  subjectMax: 120,
  bodyMax: 20_000,
  maxYearsAhead: 25,
  cancelWindowHours: 24,
} as const;
