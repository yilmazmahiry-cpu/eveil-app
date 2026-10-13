// Client IA — appelle TOUJOURS un backend, jamais l'API Anthropic directement.
// La clé API doit vivre uniquement côté serveur (voir cahier des charges §5 et §7).
// Tant que le backend n'est pas branché, configure EXPO_PUBLIC_API_URL dans .env
// pour pointer vers ton serveur (ex: petit serveur Node/Express qui reçoit
// { systemPrompt, userPrompt } et renvoie { text }, en appelant l'API Anthropic
// avec la clé stockée en variable d'environnement serveur).

import { SYSTEM_PROMPT_CARTE, SYSTEM_PROMPT_GENERAL } from '@/data/prompts';
import { getMemoryContext } from '@/lib/memory';
import { getRecentTextsContext, rememberText } from '@/lib/recentTexts';
import { cleanAIText } from '@/lib/textClean';
import { buildVarietyDirective, VarietyKind } from '@/lib/variety';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Le serveur refuse les prompts de plus de 4000 caractères : on garde une marge.
const MAX_SYSTEM_LENGTH = 3900;

type AskOptions = {
  withMemory?: boolean;
  // Par défaut déduit du prompt système (lectures → 'reading', carte du jour → 'card') ; false pour désactiver.
  variety?: VarietyKind | false;
};

function defaultVarietyKind(systemPrompt: string): VarietyKind | null {
  if (systemPrompt === SYSTEM_PROMPT_GENERAL) return 'reading';
  if (systemPrompt === SYSTEM_PROMPT_CARTE) return 'card';
  return null;
}

// Ajoute les blocs optionnels dans l'ordre de priorité, tant que la limite du serveur est respectée.
function composeSystemPrompt(base: string, extras: string[]): string {
  let out = base;
  for (const extra of extras) {
    if (!extra) continue;
    const next = `${out}\n\n${extra}`;
    if (next.length <= MAX_SYSTEM_LENGTH) out = next;
  }
  return out;
}

export async function askIA(userPrompt: string, systemPrompt: string, options: AskOptions = {}): Promise<string> {
  if (!API_URL) {
    throw new Error(
      "Aucun backend configuré (EXPO_PUBLIC_API_URL manquant). Voir README pour brancher le serveur."
    );
  }
  const kind = options.variety === false ? null : (options.variety ?? defaultVarietyKind(systemPrompt));
  const [memory, recent] = await Promise.all([
    options.withMemory === false ? '' : getMemoryContext(),
    kind ? getRecentTextsContext(kind) : '',
  ]);
  const response = await fetch(`${API_URL}/api/ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemPrompt: composeSystemPrompt(systemPrompt, [kind ? buildVarietyDirective(kind) : '', recent, memory]),
      userPrompt,
    }),
  });
  if (!response.ok) {
    throw new Error(`Erreur serveur (${response.status})`);
  }
  const data = await response.json();
  if (!data || typeof data.text !== 'string') {
    throw new Error('Réponse invalide');
  }
  const text = cleanAIText(data.text);
  if (kind) rememberText(kind, text);
  return text;
}
