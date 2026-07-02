import { defineSecret, defineString } from 'firebase-functions/params';

export const RESEND_API_KEY = defineSecret('RESEND_API_KEY');

export const APP_URL = defineString('APP_URL', {
  default: 'http://localhost:3000',
  description: 'URL pública de la app (sin barra final)',
});

export const EMAIL_FROM = defineString('EMAIL_FROM', {
  default: 'Cartas <hola@cartas.app>',
  description: 'Remitente de los emails transaccionales',
});

export const REGION = 'europe-west1';

export const MAX_DELIVERY_ATTEMPTS = 5;
