const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type NatalChart = {
  sunSign: string;
  moonSign: string;
  ascendantSign: string;
  latitude: number;
  longitude: number;
};

/**
 * Calcule le thème natal précis (ascendant + lune) via le backend.
 * Retourne null si le backend n'est pas configuré, le lieu est introuvable,
 * ou l'appel échoue — appelant responsable d'un repli gracieux (signe
 * solaire seul, déjà calculé côté client).
 */
export async function fetchNatalChart(params: { date: string; time: string; place: string }): Promise<NatalChart | null> {
  if (!API_URL) return null;
  try {
    const response = await fetch(`${API_URL}/api/natal-chart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
