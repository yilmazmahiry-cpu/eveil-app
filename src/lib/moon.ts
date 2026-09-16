export const MOON_PHASE_NAMES = [
  'Nouvelle lune',
  'Premier croissant',
  'Premier quartier',
  'Lune gibbeuse croissante',
  'Pleine lune',
  'Lune gibbeuse décroissante',
  'Dernier quartier',
  'Dernier croissant',
];

export const MOON_RITUALS = [
  "Pose une intention claire à l'écrit pour le cycle qui commence.",
  'Fais un premier petit geste concret vers cette intention.',
  'Un obstacle se présente peut-être : ajuste sans abandonner.',
  'Affine ce qui est en cours, sans te précipiter.',
  "Observe ce qui arrive à maturité, et ce qu'il est temps de célébrer.",
  'Fais le tri : garde ce qui te sert encore.',
  'Lâche consciemment ce qui doit se terminer.',
  'Repose-toi avant que le prochain cycle ne commence.',
];

export function getMoonPhaseFraction(date: Date): number {
  const synodic = 29.53058867;
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14, 0);
  const diffDays = (date.getTime() - knownNewMoon) / 86400000;
  let frac = (diffDays % synodic) / synodic;
  if (frac < 0) frac += 1;
  return frac;
}

export function getMoonPhaseIndex(frac: number): number {
  if (frac < 0.03 || frac >= 0.97) return 0;
  if (frac < 0.22) return 1;
  if (frac < 0.28) return 2;
  if (frac < 0.47) return 3;
  if (frac < 0.53) return 4;
  if (frac < 0.72) return 5;
  if (frac < 0.78) return 6;
  return 7;
}
