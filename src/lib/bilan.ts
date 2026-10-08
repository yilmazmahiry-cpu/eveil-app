import { supabase } from '@/lib/supabase';
import { GratitudeEntry, JournalType } from '@/types';

export type BilanJournalRow = { type: JournalType; input: string; date: string; realized: boolean };

export type Bilan = {
  days: number;
  activeDays: number;
  intentions: { total: number; realized: number };
  gratitude: { days: number; items: number };
  byType: { type: JournalType; count: number }[];
  topWords: { word: string; count: number }[];
  busiestWeekday: string | null;
};

const DAY_MS = 86400000;
const WEEKDAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

// Mots courants sans valeur de "thème" (comparés sans accents).
const STOPWORDS = new Set(
  (
    'avec dans pour mais plus tout tous toute toutes cette cela comme etre avoir fait faire sont etait suis tres bien ' +
    'aussi encore alors donc ainsi chaque entre depuis sans sous vers chez leur leurs nous vous elle elles quand dont ' +
    'ceci celui celle ceux rien quelque quelques jour journee aujourd moment chose choses merci grace notre votre ' +
    'cest mes tes ses mon ton son sur par aux des les une que qui pas ete ont ils eux moi toi lui'
  ).split(' ')
);

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function windowStartKey(days: number, now: Date): string {
  return new Date(now.getTime() - (days - 1) * DAY_MS).toISOString().slice(0, 10);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-zàâäçéèêëîïôöùûüÿœæ]+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(normalize(w)));
}

export async function fetchBilanRows(days: number): Promise<{ journal: BilanJournalRow[]; gratitudes: GratitudeEntry[] }> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return { journal: [], gratitudes: [] };

  const since = windowStartKey(days, new Date());
  const [{ data: journalRows }, { data: gratitudeRows }] = await Promise.all([
    supabase
      .from('journal_entries')
      .select('type,input,date,realized')
      .eq('user_id', uid)
      .gte('date', `${since}T00:00:00.000Z`)
      .order('date', { ascending: false })
      .limit(500),
    supabase
      .from('gratitude_entries')
      .select('date,item1,item2,item3')
      .eq('user_id', uid)
      .gte('date', since)
      .limit(100),
  ]);

  return {
    journal: (journalRows ?? []) as BilanJournalRow[],
    gratitudes: (gratitudeRows ?? []).map((r: any) => ({ date: r.date, items: [r.item1, r.item2, r.item3] })),
  };
}

export function computeBilan(
  journal: BilanJournalRow[],
  gratitudes: GratitudeEntry[],
  days: number,
  now: Date = new Date()
): Bilan {
  const start = windowStartKey(days, now);
  const inWindow = journal.filter((e) => e.date.slice(0, 10) >= start);
  const gratitudeInWindow = gratitudes
    .filter((g) => g.date >= start)
    .filter((g) => g.items.some((it) => (it ?? '').trim().length > 0));

  const activeKeys = new Set<string>();
  inWindow.forEach((e) => activeKeys.add(e.date.slice(0, 10)));
  gratitudeInWindow.forEach((g) => activeKeys.add(g.date));

  const intentionEntries = inWindow.filter((e) => e.type === 'manifestation');

  const typeCounts = new Map<JournalType, number>();
  inWindow.forEach((e) => typeCounts.set(e.type, (typeCounts.get(e.type) ?? 0) + 1));
  const byType = [...typeCounts.entries()].map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);

  const texts = [
    ...gratitudeInWindow.flatMap((g) => g.items),
    ...intentionEntries.map((e) => e.input),
  ];
  const wordCounts = new Map<string, { word: string; count: number }>();
  texts.forEach((t) =>
    tokenize(t ?? '').forEach((w) => {
      const key = normalize(w);
      const current = wordCounts.get(key);
      if (current) current.count += 1;
      else wordCounts.set(key, { word: w, count: 1 });
    })
  );
  const topWords = [...wordCounts.values()]
    .filter((w) => w.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  let busiestWeekday: string | null = null;
  if (activeKeys.size >= 3) {
    const perWeekday = new Array(7).fill(0);
    activeKeys.forEach((k) => {
      perWeekday[new Date(`${k}T12:00:00Z`).getUTCDay()] += 1;
    });
    const max = Math.max(...perWeekday);
    if (perWeekday.filter((c) => c === max).length === 1) busiestWeekday = WEEKDAYS[perWeekday.indexOf(max)];
  }

  return {
    days,
    activeDays: activeKeys.size,
    intentions: { total: intentionEntries.length, realized: intentionEntries.filter((e) => e.realized).length },
    gratitude: {
      days: gratitudeInWindow.length,
      items: gratitudeInWindow.reduce((n, g) => n + g.items.filter((it) => (it ?? '').trim().length > 0).length, 0),
    },
    byType,
    topWords,
    busiestWeekday,
  };
}

function plural(n: number, singular: string, pluralForm = `${singular}s`) {
  return n > 1 ? pluralForm : singular;
}

export function bilanSummary(b: Bilan): string {
  if (b.activeDays === 0) {
    return 'Rien sur cette période pour l’instant. Pose une intention ou note tes trois gratitudes pour commencer ton bilan.';
  }
  const parts = [`Tu as pris du temps pour toi ${b.activeDays} ${plural(b.activeDays, 'jour')} sur ${b.days}.`];
  if (b.busiestWeekday) parts.push(`Ton jour le plus actif : ${b.busiestWeekday}.`);
  if (b.intentions.total > 0) {
    const { total, realized } = b.intentions;
    parts.push(
      `${realized} ${plural(realized, 'intention réalisée', 'intentions réalisées')} sur ${total} ${plural(total, 'posée')}.`
    );
  }
  return parts.join(' ');
}
