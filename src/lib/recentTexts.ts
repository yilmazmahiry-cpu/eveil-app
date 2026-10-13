import { supabase } from '@/lib/supabase';
import type { VarietyKind } from '@/lib/variety';

const MAX_TEXTS = 3;
const FETCH_TIMEOUT_MS = 3000;
const MAX_FRAGMENT_LENGTH = 70;

type Store = {
  uid: string;
  dbLoaded: boolean;
  db: Record<VarietyKind, string[]>;
  session: Record<VarietyKind, string[]>;
};

let store: Store | null = null;

function sentences(text: string): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  return (clean.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) ?? []).map((s) => s.trim()).filter(Boolean);
}

function clip(s: string): string {
  return s.length > MAX_FRAGMENT_LENGTH ? `${s.slice(0, MAX_FRAGMENT_LENGTH - 1)}…` : s;
}

// Début et fin d'un texte : c'est là que les répétitions se voient le plus.
export function excerpt(text: string): string | null {
  const parts = sentences(text);
  if (parts.length === 0) return null;
  if (parts.length === 1) return `« ${clip(parts[0])} »`;
  return `début « ${clip(parts[0])} » ; fin « ${clip(parts[parts.length - 1])} »`;
}

async function loadFromDb(uid: string): Promise<Record<VarietyKind, string[]>> {
  const [journal, cards] = await Promise.all([
    supabase
      .from('journal_entries')
      .select('result')
      .eq('user_id', uid)
      .order('date', { ascending: false })
      .limit(MAX_TEXTS),
    supabase
      .from('daily_cache')
      .select('content')
      .eq('user_id', uid)
      .eq('kind', 'carte')
      .order('date', { ascending: false })
      .limit(MAX_TEXTS),
  ]);
  return {
    reading: (journal.data ?? []).map((r: any) => r.result).filter((t): t is string => typeof t === 'string'),
    card: (cards.data ?? []).map((r: any) => r.content).filter((t): t is string => typeof t === 'string'),
  };
}

// Ne doit jamais faire échouer ni ralentir un appel IA : en cas de souci, on renvoie simplement ''.
export async function getRecentTextsContext(kind: VarietyKind): Promise<string> {
  try {
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user.id;
    if (!uid) return '';

    if (!store || store.uid !== uid) {
      store = { uid, dbLoaded: false, db: { reading: [], card: [] }, session: { reading: [], card: [] } };
    }
    if (!store.dbLoaded) {
      const loaded = await Promise.race([
        loadFromDb(uid),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), FETCH_TIMEOUT_MS)),
      ]);
      if (loaded && store && store.uid === uid) {
        store.db = loaded;
        store.dbLoaded = true;
      }
    }

    const texts = [...(store?.session[kind] ?? []), ...(store?.db[kind] ?? [])];
    const lines: string[] = [];
    for (const t of texts) {
      const e = excerpt(t);
      if (e && !lines.includes(e)) lines.push(e);
      if (lines.length >= MAX_TEXTS) break;
    }
    if (lines.length === 0) return '';

    return (
      'Textes déjà reçus récemment par cette personne :\n' +
      lines.map((l, i) => `${i + 1}. ${l}`).join('\n') +
      '\nNe reprends ni leurs ouvertures, ni leurs fins, ni leurs images, ni leurs tournures : ' +
      'écris quelque chose de clairement différent.'
    );
  } catch {
    return '';
  }
}

// À appeler avec chaque texte généré, pour que la demande suivante évite de le répéter
// (sans attendre que la base soit relue).
export function rememberText(kind: VarietyKind, text: string): void {
  if (!store) return;
  store.session[kind] = [text, ...store.session[kind]].slice(0, MAX_TEXTS);
}
