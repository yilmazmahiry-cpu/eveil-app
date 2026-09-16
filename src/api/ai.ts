// Client IA — appelle TOUJOURS un backend, jamais l'API Anthropic directement.
// La clé API doit vivre uniquement côté serveur (voir cahier des charges §5 et §7).
// Tant que le backend n'est pas branché, configure EXPO_PUBLIC_API_URL dans .env
// pour pointer vers ton serveur (ex: petit serveur Node/Express qui reçoit
// { systemPrompt, userPrompt } et renvoie { text }, en appelant l'API Anthropic
// avec la clé stockée en variable d'environnement serveur).

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function askIA(userPrompt: string, systemPrompt: string): Promise<string> {
  if (!API_URL) {
    throw new Error(
      "Aucun backend configuré (EXPO_PUBLIC_API_URL manquant). Voir README pour brancher le serveur."
    );
  }
  const response = await fetch(`${API_URL}/api/ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userPrompt }),
  });
  if (!response.ok) {
    throw new Error(`Erreur serveur (${response.status})`);
  }
  const data = await response.json();
  if (!data || typeof data.text !== 'string') {
    throw new Error('Réponse invalide');
  }
  return data.text.trim();
}
