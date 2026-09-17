// Le package est du CommonJS avec des exports générés dynamiquement que
// l'analyseur statique de Node (cjs-module-lexer) ne détecte pas : on importe
// donc l'objet par défaut puis on déstructure, plutôt que `import { X }`.
import pkg from 'circular-natal-horoscope-js';
const { Horoscope, Origin } = pkg;

// La librairie ne fournit pas de libellés français fiables (le paramètre
// language: 'fr' plante faute de données de traduction complètes) — on
// demande l'anglais et on traduit nous-mêmes les 12 signes.
const SIGN_FR = {
  Aries: 'Bélier',
  Taurus: 'Taureau',
  Gemini: 'Gémeaux',
  Cancer: 'Cancer',
  Leo: 'Lion',
  Virgo: 'Vierge',
  Libra: 'Balance',
  Scorpio: 'Scorpion',
  Sagittarius: 'Sagittaire',
  Capricorn: 'Capricorne',
  Aquarius: 'Verseau',
  Pisces: 'Poissons',
};

// Géocodage via Nominatim (OpenStreetMap) : gratuit, mais avec une politique
// d'usage stricte (1 req/s, User-Agent obligatoire). Pour une vraie mise à
// l'échelle, remplacer par un fournisseur payant (LocationIQ, Google, etc).
async function geocode(place) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(place)}`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'eveil-app (personal project, contact via app)' },
  });
  if (!response.ok) throw new Error(`Géocodage échoué (${response.status})`);
  const results = await response.json();
  if (!results.length) return null;
  return { latitude: parseFloat(results[0].lat), longitude: parseFloat(results[0].lon) };
}

/**
 * @param {{ date: string, time: string, place: string }} params
 *   date: "YYYY-MM-DD", time: "HH:MM" (heure locale au lieu de naissance)
 * @returns {Promise<{ sunSign: string, moonSign: string, ascendantSign: string, latitude: number, longitude: number } | null>}
 *   null si le lieu n'a pas pu être géocodé.
 */
export async function computeNatalChart({ date, time, place }) {
  const coords = await geocode(place);
  if (!coords) return null;

  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);

  const origin = new Origin({
    year,
    month: month - 1, // la librairie attend un mois 0-indexé
    date: day,
    hour,
    minute,
    latitude: coords.latitude,
    longitude: coords.longitude,
  });

  const horoscope = new Horoscope({
    origin,
    houseSystem: 'placidus',
    zodiac: 'tropical',
    aspectPoints: [],
    aspectWithPoints: [],
    aspectTypes: [],
    language: 'en',
  });

  const toFr = (label) => SIGN_FR[label] || label;

  return {
    sunSign: toFr(horoscope.CelestialBodies.sun.Sign.label),
    moonSign: toFr(horoscope.CelestialBodies.moon.Sign.label),
    ascendantSign: toFr(horoscope.Ascendant.Sign.label),
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
}
