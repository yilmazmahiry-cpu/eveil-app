import { simpleHash } from '@/lib/hash';

// Tirage quotidien propre à chaque personne, sans aucun stockage :
// - le jeu est mélangé dans un ordre qui dépend du compte (identifiant), pas du prénom ;
// - chaque jour donne la carte suivante de ce mélange, donc aucune répétition avant d'avoir vu tout le jeu ;
// - à la fin du jeu, un nouveau mélange commence (et ne reprend jamais la dernière carte en première).
// IMPORTANT : server/src/dailyDraw.js est une copie exacte de cet algorithme (la notification annonce la
// carte que la personne verra). Toute modification ici doit être reportée là-bas.

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(n: number, seed: string): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  const rand = mulberry32(simpleHash(seed));
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// Numéro du jour depuis 1970 pour une date locale "YYYY-MM-DD" (indépendant du fuseau).
function dayNumber(localDate: string): number {
  const [y, m, d] = localDate.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}

// Au changement de cycle, les premières cartes du nouveau mélange ne reprennent pas les dernières de l'ancien :
// une même carte ne revient donc jamais avant plusieurs jours. Les échanges ne touchent que le début et le
// milieu du cycle : les `guard` dernières cartes restent celles du mélange brut, ce qui permet de les
// retrouver sans recalculer tous les cycles précédents.
function cycleOrder(n: number, seedKey: string, cycle: number): number[] {
  const order = shuffled(n, `${seedKey}:${cycle}`);
  if (cycle > 0) {
    const guard = Math.min(7, Math.floor(n / 3));
    const recent = new Set(shuffled(n, `${seedKey}:${cycle - 1}`).slice(n - guard));
    for (let i = 0; i < guard; i++) {
      if (!recent.has(order[i])) continue;
      for (let j = guard; j < n - guard; j++) {
        if (!recent.has(order[j])) {
          [order[i], order[j]] = [order[j], order[i]];
          break;
        }
      }
    }
  }
  return order;
}

/** Indice (0..n-1) de la carte du jour pour cette personne, à cette date locale. */
export function dailyIndex(userKey: string, localDate: string, n: number, salt: string): number {
  const day = dayNumber(localDate);
  const cycle = Math.floor(day / n);
  const position = day - cycle * n;
  return cycleOrder(n, `${salt}:${userKey}`, cycle)[position];
}
