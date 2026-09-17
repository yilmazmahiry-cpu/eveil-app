import { fetchNatalChart } from '@/api/astrology';
import { Profile } from '@/types';

import { getSigne } from './astrology';
import { getCheminVie, getNombreAme, getNombreExpression, getNombrePersonnalite } from './numerology';

/**
 * Construit le profil complet, y compris le thème natal précis (ascendant,
 * signe lunaire) quand l'heure et le lieu de naissance sont renseignés.
 * L'appel réseau est best-effort : en cas d'échec (lieu introuvable, backend
 * indisponible), ascendant/signeLunaire restent simplement à null et le
 * reste de l'app se rabat sur le signe solaire seul.
 */
export async function buildProfile(input: {
  prenom: string;
  nom: string;
  naissance: string;
  heureNaissance: string | null;
  lieuNaissance: string | null;
}): Promise<Profile> {
  const { prenom, nom, naissance, heureNaissance, lieuNaissance } = input;
  const fullName = `${prenom} ${nom}`.trim();
  const [, month, day] = naissance.split('-').map(Number);

  let ascendant: string | null = null;
  let signeLunaire: string | null = null;
  if (heureNaissance && lieuNaissance) {
    const chart = await fetchNatalChart({ date: naissance, time: heureNaissance, place: lieuNaissance });
    if (chart) {
      ascendant = chart.ascendantSign;
      signeLunaire = chart.moonSign;
    }
  }

  return {
    prenom,
    nom,
    naissance,
    heureNaissance,
    lieuNaissance,
    signe: getSigne(month, day),
    cheminVie: getCheminVie(naissance),
    nombreExpression: getNombreExpression(fullName),
    nombreAme: getNombreAme(fullName),
    nombrePersonnalite: getNombrePersonnalite(fullName),
    ascendant,
    signeLunaire,
  };
}
