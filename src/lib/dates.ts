import { LIMITS } from './types';

/** Offset (ms) de una zona horaria IANA en un instante dado. */
function tzOffsetMs(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts: Record<string, string> = {};
  for (const p of dtf.formatToParts(date)) parts[p.type] = p.value;
  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  );
  return asUTC - date.getTime();
}

/** Medianoche (00:00) del día y-m-d en la tz dada, como instante UTC. */
export function zonedMidnightToUtc(
  year: number,
  month: number, // 1-12
  day: number,
  timeZone: string,
): Date {
  const guess = Date.UTC(year, month - 1, day, 0, 0, 0);
  const offset = tzOffsetMs(new Date(guess), timeZone);
  return new Date(guess - offset);
}

export function userTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export interface DatePreset {
  key: string;
  label: string;
  months: number;
}

export const DATE_PRESETS: DatePreset[] = [
  { key: '6m', label: 'En 6 meses', months: 6 },
  { key: '1y', label: 'En 1 año', months: 12 },
  { key: '3y', label: 'En 3 años', months: 36 },
  { key: '5y', label: 'En 5 años', months: 60 },
  { key: '10y', label: 'En 10 años', months: 120 },
];

/** Fecha (y, m, d) local resultante de sumar `months` meses a hoy. */
export function presetToYmd(months: number): { y: number; m: number; d: number } {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + months, now.getDate());
  return { y: target.getFullYear(), m: target.getMonth() + 1, d: target.getDate() };
}

export function minDeliveryYmd(): string {
  const min = new Date();
  min.setDate(min.getDate() + LIMITS.minDaysAhead);
  return toYmdString(min);
}

export function maxDeliveryYmd(): string {
  const max = new Date();
  max.setFullYear(max.getFullYear() + LIMITS.maxYearsAhead);
  return toYmdString(max);
}

export function toYmdString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "3 de julio de 2027" */
export function formatDateEs(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
}

/**
 * Distancia humana entre dos instantes: "3 años y 2 meses", "8 meses",
 * "247 días". Siempre en positivo.
 */
export function humanDistance(from: Date, to: Date): string {
  let a = from < to ? from : to;
  let b = from < to ? to : from;

  let years = b.getFullYear() - a.getFullYear();
  let months = b.getMonth() - a.getMonth();
  if (b.getDate() < a.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years > 0) {
    if (months === 0) return years === 1 ? '1 año' : `${years} años`;
    const y = years === 1 ? '1 año' : `${years} años`;
    const m = months === 1 ? '1 mes' : `${months} meses`;
    return `${y} y ${m}`;
  }
  if (months >= 3) return months === 1 ? '1 mes' : `${months} meses`;

  const days = Math.max(1, Math.round((b.getTime() - a.getTime()) / 86_400_000));
  return days === 1 ? '1 día' : `${days} días`;
}

/** "faltan 247 días" / "faltan 3 años y 2 meses" */
export function countdownLabel(deliveryDate: Date): string {
  const now = new Date();
  if (deliveryDate <= now) return 'llegando…';
  const days = Math.ceil((deliveryDate.getTime() - now.getTime()) / 86_400_000);
  if (days === 1) return 'falta 1 día';
  if (days < 400) return `faltan ${days} días`;
  return `faltan ${humanDistance(now, deliveryDate)}`;
}

/** Edad que tendrá una persona nacida en `birthDate` cuando llegue `at`. */
export function ageAt(birthDate: Date, at: Date): number {
  let age = at.getFullYear() - birthDate.getFullYear();
  const m = at.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && at.getDate() < birthDate.getDate())) age -= 1;
  return age;
}
