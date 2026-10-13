// Date ("YYYY-MM-DD") et heure (0-23) qu'il est chez l'utilisateur, d'après son fuseau IANA.
// Sans fuseau, ou si le fuseau est invalide, on retombe sur l'UTC (comportement historique).
export function localDateAndHour(now, timeZone) {
  if (timeZone) {
    try {
      const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-CA', {
          timeZone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          hourCycle: 'h23',
        })
          .formatToParts(now)
          .map((p) => [p.type, p.value])
      );
      return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
    } catch {
      // fuseau inconnu : on utilise l'UTC ci-dessous
    }
  }
  return { date: now.toISOString().slice(0, 10), hour: now.getUTCHours() };
}
