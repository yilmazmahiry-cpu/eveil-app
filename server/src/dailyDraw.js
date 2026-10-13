// Copie exacte de src/lib/dailyDraw.ts (côté app) — garder les deux en phase :
// c'est ce qui permet à la notification d'annoncer exactement la carte que la personne verra ce jour-là.

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(n, seed) {
  const order = Array.from({ length: n }, (_, i) => i);
  const rand = mulberry32(simpleHash(seed));
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function dayNumber(localDate) {
  const [y, m, d] = localDate.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}

function cycleOrder(n, seedKey, cycle) {
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

export function dailyIndex(userKey, localDate, n, salt) {
  const day = dayNumber(localDate);
  const cycle = Math.floor(day / n);
  const position = day - cycle * n;
  return cycleOrder(n, `${salt}:${userKey}`, cycle)[position];
}
