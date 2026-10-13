// Client IA — appelle TOUJOURS un backend, jamais l'API Anthropic directement.
// La clé API vit uniquement côté serveur (voir server/), ainsi que les prompts système.
// L'app envoie : le type de prompt, ses consignes complémentaires, la demande de la personne, et son jeton de
// connexion (le serveur n'accepte que les comptes connectés et vérifie l'abonnement pour les lectures).
// Tant que le backend n'est pas branché, configure EXPO_PUBLIC_API_URL dans .env.

import type { PromptType } from '@/data/prompts';
import { getMemoryContext } from '@/lib/memory';
import { getRecentTextsContext, rememberText } from '@/lib/recentTexts';
import { supabase } from '@/lib/supabase';
import { cleanAIText } from '@/lib/textClean';
import { buildVarietyDirective, VarietyKind } from '@/lib/variety';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Le serveur refuse des consignes complémentaires de plus de 3000 caractères : on garde une marge.
const MAX_EXTRAS_LENGTH = 2800;

type AskOptions = {
  withMemory?: boolean;
  // Par défaut déduit du type de prompt (lectures → 'reading', carte du jour → 'card') ; false pour désactiver.
  variety?: VarietyKind | false;
};

export class AIRequestError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'AIRequestError';
  }
}

function defaultVarietyKind(promptType: PromptType): VarietyKind | null {
  if (promptType === 'general') return 'reading';
  if (promptType === 'carte') return 'card';
  return null;
}

// Ajoute les blocs dans l'ordre de priorité, tant que la limite du serveur est respectée.
function composeExtras(blocks: string[]): string {
  let out = '';
  for (const block of blocks) {
    if (!block) continue;
    const next = out ? `${out}\n\n${block}` : block;
    if (next.length <= MAX_EXTRAS_LENGTH) out = next;
  }
  return out;
}

async function accessToken(forceRefresh: boolean): Promise<string | null> {
  if (forceRefresh) {
    const { data } = await supabase.auth.refreshSession();
    return data.session?.access_token ?? null;
  }
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function askIA(userPrompt: string, promptType: PromptType, options: AskOptions = {}): Promise<string> {
  if (!API_URL) {
    throw new Error(
      "Aucun backend configuré (EXPO_PUBLIC_API_URL manquant). Voir README pour brancher le serveur."
    );
  }
  const kind = options.variety === false ? null : (options.variety ?? defaultVarietyKind(promptType));
  const [memory, recent] = await Promise.all([
    options.withMemory === false ? '' : getMemoryContext(),
    kind ? getRecentTextsContext(kind) : '',
  ]);
  const extras = composeExtras([kind ? buildVarietyDirective(kind) : '', recent, memory]);
  const body = JSON.stringify({ promptType, extras, userPrompt });

  const send = async (forceRefresh: boolean) => {
    const token = await accessToken(forceRefresh);
    return fetch(`${API_URL}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body,
    });
  };

  let response = await send(false);
  // Jeton expiré ou refusé : on en demande un nouveau une seule fois, puis on réessaie.
  if (response.status === 401) response = await send(true);
  if (!response.ok) {
    throw new AIRequestError(response.status, `Erreur serveur (${response.status})`);
  }
  const data = await response.json();
  if (!data || typeof data.text !== 'string') {
    throw new Error('Réponse invalide');
  }
  const text = cleanAIText(data.text);
  if (kind) rememberText(kind, text);
  return text;
}
