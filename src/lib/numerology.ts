const LETTER_GROUPS = [
  ['A', 'J', 'S'],
  ['B', 'K', 'T'],
  ['C', 'L', 'U'],
  ['D', 'M', 'V'],
  ['E', 'N', 'W'],
  ['F', 'O', 'X'],
  ['G', 'P', 'Y'],
  ['H', 'Q', 'Z'],
  ['I', 'R'],
];
const LETTER_VALUES: Record<string, number> = {};
LETTER_GROUPS.forEach((group, i) => {
  group.forEach((l) => {
    LETTER_VALUES[l] = i + 1;
  });
});
const VOYELLES = ['A', 'E', 'I', 'O', 'U'];

export function reduceNumber(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n)
      .split('')
      .reduce((a, b) => a + Number(b), 0);
  }
  return n;
}

/** dateStr is "YYYY-MM-DD" */
export function getCheminVie(dateStr: string): number {
  const digits = dateStr
    .replace(/-/g, '')
    .split('')
    .map(Number);
  return reduceNumber(digits.reduce((a, b) => a + b, 0));
}

function normalizeName(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

export function getNombreExpression(fullName: string): number {
  const letters = normalizeName(fullName).split('');
  const sum = letters.reduce((a, l) => a + (LETTER_VALUES[l] || 0), 0);
  return reduceNumber(sum);
}

export function getNombreAme(fullName: string): number {
  const letters = normalizeName(fullName)
    .split('')
    .filter((l) => VOYELLES.includes(l));
  const sum = letters.reduce((a, l) => a + (LETTER_VALUES[l] || 0), 0);
  return reduceNumber(sum);
}

export function getNombrePersonnalite(fullName: string): number {
  const letters = normalizeName(fullName)
    .split('')
    .filter((l) => !VOYELLES.includes(l));
  const sum = letters.reduce((a, l) => a + (LETTER_VALUES[l] || 0), 0);
  return reduceNumber(sum);
}

export const CHEMIN_VIE_TEXTS: Record<number, string> = {
  1: "Le chemin de l'initiateur : indépendance, leadership et besoin de tracer sa propre voie.",
  2: 'Le chemin du diplomate : sensibilité, écoute et goût pour l\'harmonie avec les autres.',
  3: 'Le chemin du créatif : expression, joie de vivre et communication.',
  4: 'Le chemin du bâtisseur : rigueur, sens du concret et besoin de stabilité.',
  5: "Le chemin du libre : soif de changement, curiosité et goût de l'aventure.",
  6: 'Le chemin du protecteur : attachement aux proches, sens des responsabilités.',
  7: 'Le chemin du chercheur : introspection, spiritualité et quête de sens.',
  8: 'Le chemin du bâtisseur ambitieux : réussite, organisation et sens du pouvoir personnel.',
  9: "Le chemin de l'humaniste : générosité, ouverture au monde et idéal élevé.",
  11: "Un chemin maître : intuition puissante et mission d'inspirer les autres.",
  22: 'Un chemin maître : la capacité de bâtir grand et de concrétiser des idéaux.',
  33: 'Un chemin maître : une vocation à guider et transmettre par l\'amour inconditionnel.',
};
