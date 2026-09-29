import { todayISO } from './hash';
import { supabase } from './supabase';

type CacheKind = 'carte' | 'affirmations' | 'tarot';

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/** Renvoie le contenu mis en cache pour AUJOURD'HUI, ou null s'il n'y en a pas. */
export async function getDailyCache<T>(kind: CacheKind): Promise<T | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data } = await supabase
    .from('daily_cache')
    .select('content')
    .eq('user_id', uid)
    .eq('kind', kind)
    .eq('date', todayISO())
    .maybeSingle();
  return data ? (data.content as T) : null;
}

export async function setDailyCache<T>(kind: CacheKind, content: T): Promise<void> {
  const uid = await currentUserId();
  if (!uid) return;
  await supabase
    .from('daily_cache')
    .upsert({ user_id: uid, kind, date: todayISO(), content }, { onConflict: 'user_id,kind,date' });
}
