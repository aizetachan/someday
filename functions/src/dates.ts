/** "3 años y 2 meses" / "8 meses" / "247 días" — siempre positivo. */
export function humanDistance(from: Date, to: Date): string {
  const a = from < to ? from : to;
  const b = from < to ? to : from;

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
  if (months >= 3) return `${months} meses`;

  const days = Math.max(1, Math.round((b.getTime() - a.getTime()) / 86_400_000));
  return days === 1 ? '1 día' : `${days} días`;
}

/** "3 de julio de 2027" */
export function formatDateEs(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Madrid',
  }).format(date);
}
