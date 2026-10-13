export function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

// Les "jours" de l'app (carte du jour, gratitudes, série) suivent l'heure locale de l'appareil,
// pas l'UTC : sinon le jour changerait à 1h ou 2h du matin en France.
export function dateKey(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export function todayISO(): string {
  return dateKey(new Date());
}

export function daysAgoISO(days: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() - days);
  return dateKey(d);
}
