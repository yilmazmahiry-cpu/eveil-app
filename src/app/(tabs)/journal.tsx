import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, FavoriteButton } from '@/components/Common';
import {
  ArbreVieIcon,
  CompatIcon,
  HeuresIcon,
  LuneIcon,
  ManifestationIcon,
  ReveIcon,
  SigneIcon,
  TarotIcon,
  ThemeIcon,
} from '@/components/icons';
import { LogoGlow } from '@/components/LogoGlow';
import { useProfile } from '@/context/ProfileContext';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { JOURNAL_LABELS, JournalEntry, JournalType } from '@/types';

const JOURNAL_ICONS: Partial<Record<JournalType, (props: { size?: number; color?: string }) => React.JSX.Element>> = {
  heures: HeuresIcon,
  reve: ReveIcon,
  signe: SigneIcon,
  lune: LuneIcon,
  theme: ThemeIcon,
  compat: CompatIcon,
  manifestation: ManifestationIcon,
  sephira: ArbreVieIcon,
  tarot: TarotIcon,
};

type Filter = 'all' | 'fav';

export default function JournalScreen() {
  const { journal, toggleFavorite, toggleRealized } = useProfile();
  const [filter, setFilter] = useState<Filter>('all');

  const stats = useMemo(() => computeStats(journal), [journal]);
  const entries = filter === 'fav' ? journal.filter((e) => e.fav) : journal;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        contentContainerStyle={styles.content}
        data={entries}
        keyExtractor={(e) => e.id}
        ListHeaderComponent={
          <>
            <View style={styles.logoRow}>
              <LogoGlow />
              <Text style={styles.logoWord}>Éveil</Text>
            </View>
            <Text style={styles.title}>Ton journal</Text>
            <Card style={{ marginBottom: 20 }}>
              <Text style={styles.cardTitle}>Ce mois-ci</Text>
              <Text style={styles.cardText}>{stats.text}</Text>
            </Card>
            <View style={styles.tabRow}>
              <FilterTab label="Tout" active={filter === 'all'} onPress={() => setFilter('all')} />
              <FilterTab label="Favoris" active={filter === 'fav'} onPress={() => setFilter('fav')} />
            </View>
          </>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {filter === 'fav'
              ? "Aucun favori pour l'instant. Marque une lecture d'une étoile pour la retrouver ici."
              : 'Ton journal est encore vide. Explore une heure miroir, un rêve ou un signe pour que tes lectures apparaissent ici.'}
          </Text>
        }
        renderItem={({ item }) => (
          <JournalItem entry={item} onToggleFav={() => toggleFavorite(item.id)} onToggleRealized={() => toggleRealized(item.id)} />
        )}
      />
    </SafeAreaView>
  );
}

function FilterTab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.filterTab, active && styles.filterTabActive]}>
      <Text style={[styles.filterTabLabel, active && styles.filterTabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function JournalItem({
  entry,
  onToggleFav,
  onToggleRealized,
}: {
  entry: JournalEntry;
  onToggleFav: () => void;
  onToggleRealized: () => void;
}) {
  const date = new Date(entry.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  const Icon = JOURNAL_ICONS[entry.type];
  return (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <View style={styles.itemTypeRow}>
          {Icon ? (
            <View style={styles.itemIcon}>
              <Icon size={13} />
            </View>
          ) : null}
          <Text style={styles.itemType}>{JOURNAL_LABELS[entry.type]}</Text>
        </View>
        <FavoriteButton active={entry.fav} onPress={onToggleFav} />
      </View>
      <Text style={styles.itemInput}>{entry.input}</Text>
      <Text style={styles.itemResult}>{entry.result}</Text>
      {entry.type === 'manifestation' &&
        (entry.realized ? (
          <Text style={styles.realized}>✨ Réalisée</Text>
        ) : (
          <Pressable onPress={onToggleRealized}>
            <Text style={styles.realizeBtn}>Marquer comme réalisée</Text>
          </Pressable>
        ))}
      <Text style={styles.itemDate}>{date}</Text>
    </View>
  );
}

function computeStats(journal: JournalEntry[]) {
  const now = new Date();
  const monthEntries = journal.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  if (monthEntries.length === 0) {
    return { text: 'Aucune lecture explorée ce mois-ci pour l\'instant.' };
  }
  const counts: Partial<Record<string, number>> = {};
  monthEntries.forEach((e) => {
    counts[e.type] = (counts[e.type] || 0) + 1;
  });
  let topType: string | null = null;
  let topCount = 0;
  Object.entries(counts).forEach(([t, c]) => {
    if ((c || 0) > topCount) {
      topType = t;
      topCount = c || 0;
    }
  });
  const plural = monthEntries.length > 1 ? 's' : '';
  let text = `${monthEntries.length} lecture${plural} explorée${plural} ce mois-ci.`;
  if (topType) text += ` Ton type favori : ${JOURNAL_LABELS[topType as keyof typeof JOURNAL_LABELS]}.`;
  return { text };
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, paddingBottom: 100 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 20 },
  logoWord: { fontFamily: fonts.serif, fontSize: 14.5, color: colors.inkMuted },
  title: { fontFamily: fonts.serifSemiBold, fontSize: 23, color: colors.ink, marginBottom: 18 },
  cardTitle: { fontFamily: fonts.sansBold, fontSize: 14.5, color: colors.inkMuted, marginBottom: 12 },
  cardText: { fontFamily: fonts.serifItalic, fontStyle: 'italic', fontSize: 15, color: colors.ink, lineHeight: 22 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  filterTab: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 16 },
  filterTabActive: { backgroundColor: colors.goldSoft, borderColor: colors.goldBorderStrong },
  filterTabLabel: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.inkMuted },
  filterTabLabelActive: { color: colors.gold },
  empty: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.inkMuted },
  item: { borderBottomWidth: 1, borderBottomColor: colors.hairline, paddingVertical: 15 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  itemIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemType: { fontFamily: fonts.sansBold, fontSize: 12, color: colors.gold },
  itemInput: { fontFamily: fonts.sans, fontSize: 13, color: colors.inkMuted, marginVertical: 7, lineHeight: 18 },
  itemResult: { fontFamily: fonts.serifItalic, fontStyle: 'italic', fontSize: 14, color: colors.ink, lineHeight: 21 },
  realized: { color: colors.gold, fontFamily: fonts.sans, fontSize: 12, marginTop: 8 },
  realizeBtn: { color: colors.gold, fontFamily: fonts.sansBold, fontSize: 12, marginTop: 8 },
  itemDate: { fontFamily: fonts.sans, fontSize: 11, color: colors.inkMuted, opacity: 0.65, marginTop: 7 },
});
