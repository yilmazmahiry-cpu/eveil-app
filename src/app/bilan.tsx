import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, LoadingDots, ScreenHeader } from '@/components/Common';
import { Screen } from '@/components/Screen';
import { useProfile } from '@/context/ProfileContext';
import { Bilan, BilanJournalRow, bilanSummary, computeBilan, fetchBilanRows } from '@/lib/bilan';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { GratitudeEntry, JOURNAL_LABELS } from '@/types';

type Period = 7 | 30;

export default function BilanScreen() {
  const { streak } = useProfile();
  const [period, setPeriod] = useState<Period>(7);
  const [rows, setRows] = useState<{ journal: BilanJournalRow[]; gratitudes: GratitudeEntry[] } | null>(null);
  const [error, setError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setError(false);
      // 30 jours couvrent aussi la fenêtre de 7 jours : une seule requête, on filtre ensuite.
      fetchBilanRows(30)
        .then((r) => active && setRows(r))
        .catch(() => active && setError(true));
      return () => {
        active = false;
      };
    }, [])
  );

  const bilan = useMemo(
    () => (rows ? computeBilan(rows.journal, rows.gratitudes, period) : null),
    [rows, period]
  );

  return (
    <Screen contentContainerStyle={styles.content}>
      <ScreenHeader title="Ton bilan" />

      <View style={styles.periodRow}>
        <PeriodTab label="7 jours" active={period === 7} onPress={() => setPeriod(7)} />
        <PeriodTab label="30 jours" active={period === 30} onPress={() => setPeriod(30)} />
      </View>

      {error ? (
        <Text style={styles.muted}>Impossible de charger ton bilan pour l’instant. Réessaie dans un instant.</Text>
      ) : !bilan ? (
        <LoadingDots />
      ) : (
        <BilanContent bilan={bilan} streakCount={streak.count} />
      )}
    </Screen>
  );
}

function BilanContent({ bilan, streakCount }: { bilan: Bilan; streakCount: number }) {
  const maxType = bilan.byType[0]?.count ?? 1;
  const realizedPct = bilan.intentions.total > 0 ? Math.round((bilan.intentions.realized / bilan.intentions.total) * 100) : 0;

  return (
    <>
      <Card style={{ marginBottom: 22 }}>
        <View style={styles.heroRow}>
          <Text style={styles.heroNumber}>{bilan.activeDays}</Text>
          <Text style={styles.heroUnit}>/ {bilan.days} jours</Text>
        </View>
        <Text style={styles.heroText}>{bilanSummary(bilan)}</Text>
      </Card>

      <Text style={styles.sectionTitle}>Tes rituels</Text>
      <StatRow label="Série en cours" value={`${streakCount} ${streakCount > 1 ? 'jours' : 'jour'}`} />
      <StatRow
        label="Gratitudes"
        value={
          bilan.gratitude.items > 0
            ? `${bilan.gratitude.items} ${bilan.gratitude.items > 1 ? 'mercis' : 'merci'} sur ${bilan.gratitude.days} ${
                bilan.gratitude.days > 1 ? 'jours' : 'jour'
              }`
            : '—'
        }
      />
      <StatRow
        label="Intentions réalisées"
        value={bilan.intentions.total > 0 ? `${bilan.intentions.realized} sur ${bilan.intentions.total}` : '—'}
      />
      {bilan.intentions.total > 0 ? (
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${realizedPct}%` }]} />
        </View>
      ) : null}

      <Text style={[styles.sectionTitle, { marginTop: 26 }]}>Les mots qui reviennent</Text>
      {bilan.topWords.length > 0 ? (
        <View style={styles.chips}>
          {bilan.topWords.map((w) => (
            <View key={w.word} style={styles.chip}>
              <Text style={styles.chipWord}>{w.word}</Text>
              <Text style={styles.chipCount}>×{w.count}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.muted}>
          Les mots qui reviennent dans tes gratitudes et tes intentions apparaîtront ici dès que certains se répètent.
        </Text>
      )}

      <Text style={[styles.sectionTitle, { marginTop: 26 }]}>Ce que tu explores</Text>
      {bilan.byType.length > 0 ? (
        bilan.byType.map((t) => (
          <View key={t.type} style={styles.barRow}>
            <Text style={styles.barLabel}>{JOURNAL_LABELS[t.type]}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${Math.max(8, (t.count / maxType) * 100)}%` }]} />
            </View>
            <Text style={styles.barCount}>{t.count}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.muted}>Aucune lecture sur cette période.</Text>
      )}

      <Text style={styles.footnote}>
        Ce bilan est calculé uniquement à partir de ce que tu as écrit dans Éveil, pour t’aider à voir ce qui compte
        pour toi.
      </Text>
    </>
  );
}

function PeriodTab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.periodTab, active && styles.periodTabActive]}>
      <Text style={[styles.periodLabel, active && styles.periodLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingBottom: 60 },
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  periodTab: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 16 },
  periodTabActive: { backgroundColor: colors.goldSoft, borderColor: colors.goldBorderStrong },
  periodLabel: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.inkMuted },
  periodLabelActive: { color: colors.gold },
  muted: { fontFamily: fonts.sans, fontSize: 13.5, lineHeight: 20, color: colors.inkMuted },
  heroRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 10 },
  heroNumber: { fontFamily: fonts.serifSemiBold, fontSize: 44, color: colors.gold },
  heroUnit: { fontFamily: fonts.sans, fontSize: 14, color: colors.inkMuted },
  heroText: { fontFamily: fonts.serifItalic, fontStyle: 'italic', fontSize: 15, lineHeight: 22, color: colors.ink },
  sectionTitle: { fontFamily: fonts.sansBold, fontSize: 14.5, color: colors.inkMuted, marginBottom: 10 },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    paddingVertical: 12,
    gap: 12,
  },
  statLabel: { fontFamily: fonts.sans, fontSize: 13, color: colors.inkMuted },
  statValue: { fontFamily: fonts.serif, fontSize: 14.5, color: colors.ink, textAlign: 'right', flexShrink: 1 },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.hairline, marginTop: 12, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.gold },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.goldSoft,
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 13,
  },
  chipWord: { fontFamily: fonts.serif, fontSize: 14.5, color: colors.ink },
  chipCount: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.gold },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  barLabel: { width: 112, fontFamily: fonts.sans, fontSize: 12.5, color: colors.inkMuted },
  barTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.hairline, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3, backgroundColor: colors.gold },
  barCount: { width: 22, textAlign: 'right', fontFamily: fonts.sansBold, fontSize: 12, color: colors.gold },
  footnote: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, color: colors.inkMuted, opacity: 0.8, marginTop: 28 },
});
