const MOIS_LABELS_MIN = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

const MOIS_ABBR = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];

export function formatDateLongFR(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} ${MOIS_LABELS_MIN[m - 1]} ${y}`;
}

/** dateStr is "YYYY-MM-DD"; parsed manually to avoid UTC/local timezone day-shift. */
export function formatDateShortFR(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number);
  return `${d} ${MOIS_ABBR[m - 1]}`;
}
