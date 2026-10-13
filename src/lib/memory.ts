import { BilanJournalRow, computeBilan, fetchBilanRows } from '@/lib/bilan';
import { supabase } from '@/lib/supabase';
import { GratitudeEntry } from '@/types';

const CACHE_TTL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 3000;
const MAX_LENGTH = 700;
const MAX_INTENTION_LENGTH = 70;

let cache: { uid: string; at: number; text: string } | null = null;

function shorten(s: string): string {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > MAX_INTENTION_LENGTH ? `${t.slice(0, MAX_INTENTION_LENGTH - 1)}…` : t;
}

export function buildMemoryText(
  journal: BilanJournalRow[],
  gratitudes: GratitudeEntry[],
  now: Date = new Date()
): string {
  const intentions = journal
    .filter((e) => e.type === 'manifestation')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  const { topWords } = computeBilan(journal, gratitudes, 30, now);

  const parts: string[] = [];
  if (intentions.length > 0) {
    parts.push(
      `Intentions récentes : ${intentions
        .map((e) => `« ${shorten(e.input)} » (${e.realized ? 'réalisée' : 'en cours'})`)
        .join(' ; ')}.`
    );
  }
  if (topWords.length > 0) {
    parts.push(
      `Mots qui reviennent dans ses gratitudes et ses intentions : ${topWords
        .slice(0, 5)
        .map((w) => w.word)
        .join(', ')}.`
    );
  }
  if (parts.length === 0) return '';

  const text =
    `Contexte personnel (tiré du journal de la personne, à utiliser avec discrétion) : ${parts.join(' ')} ` +
    'Si c’est pertinent, fais un lien discret avec ce contexte (une intention en cours, un mot qui revient) ' +
    'sans le réciter et sans inventer d’événements ; sinon, ignore-le.';
  return text.slice(0, MAX_LENGTH);
}

// Ne doit jamais faire échouer ni ralentir un appel IA : en cas de souci, on renvoie simplement ''.
export async function getMemoryContext(): Promise<string> {
  try {
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user.id;
    if (!uid) return '';
    if (cache && cache.uid === uid && Date.now() - cache.at < CACHE_TTL_MS) return cache.text;

    const rows = await Promise.race([
      fetchBilanRows(30),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), FETCH_TIMEOUT_MS)),
    ]);
    if (!rows) return '';

    const text = buildMemoryText(rows.journal, rows.gratitudes);
    cache = { uid, at: Date.now(), text };
    return text;
  } catch {
    return '';
  }
}
