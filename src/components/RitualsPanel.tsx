import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';

import { loadGratitudeForDate, loadGratitudeHistory, saveGratitudeForToday, useProfile } from '@/context/ProfileContext';
import { useCarteDuJour } from '@/hooks/useCarteDuJour';
import { formatDateShortFR } from '@/lib/format';
import { todayISO } from '@/lib/hash';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { GratitudeEntry, Profile } from '@/types';

import { Card, ErrorPanel, LoadingDots } from './Common';
import { TextButton } from './Buttons';
import { StyledTextInput } from './Fields';

type RitualTab = 'carte' | 'intention' | 'gratitude';

export function RitualsPanel({ profile }: { profile: Profile }) {
  const [tab, setTab] = useState<RitualTab>('carte');

  return (
    <Card>
      <View style={styles.tabRow}>
        <TabButton label="Carte" active={tab === 'carte'} onPress={() => setTab('carte')} />
        <TabButton label="Intention" active={tab === 'intention'} onPress={() => setTab('intention')} />
        <TabButton label="Gratitude" active={tab === 'gratitude'} onPress={() => setTab('gratitude')} />
      </View>
      {tab === 'carte' && <CarteTab profile={profile} />}
      {tab === 'intention' && <IntentionTab />}
      {tab === 'gratitude' && <GratitudeTab />}
    </Card>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function CarteTab({ profile }: { profile: Profile }) {
  const { text, loading, error, regenerate } = useCarteDuJour(profile);
  const router = useRouter();
  return (
    <View>
      {loading && !text ? <LoadingDots /> : null}
      {error && !text ? <ErrorPanel /> : null}
      {text ? <Text style={styles.carteText}>{text}</Text> : null}
      {(text || error) && (
        <View style={styles.carteActions}>
          <TextButton title="Nouvelle carte" onPress={regenerate} style={{ marginTop: 0 }} />
          {text ? (
            <TextButton
              title="Partager"
              onPress={() => router.push({ pathname: '/partage', params: { text } })}
              style={{ marginTop: 0 }}
            />
          ) : null}
        </View>
      )}
    </View>
  );
}

function IntentionTab() {
  const router = useRouter();
  const { getCurrentIntention, toggleRealized } = useProfile();
  const intention = getCurrentIntention();

  if (!intention) {
    return (
      <View>
        <Text style={styles.smallText}>Tu n’as pas encore posé d’intention.</Text>
        <TextButton title="Poser une intention" onPress={() => router.push('/manifestation')} />
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.intentionQuote}>{intention.result}</Text>
      <Text style={styles.intentionInput}>Intention posée : « {intention.input} »</Text>
      {intention.realized ? (
        <Text style={styles.realizedLabel}>✨ Réalisée</Text>
      ) : (
        <TextButton title="Marquer comme réalisée" onPress={() => toggleRealized(intention.id)} style={{ marginTop: 0 }} />
      )}
      <TextButton title="Nouvelle intention" onPress={() => router.push('/manifestation')} />
    </View>
  );
}

function GratitudeTab() {
  const [items, setItems] = useState<[string, string, string]>(['', '', '']);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<GratitudeEntry[]>([]);

  useEffect(() => {
    (async () => {
      const today = todayISO();
      const [entry, past] = await Promise.all([loadGratitudeForDate(today), loadGratitudeHistory(today)]);
      if (entry) setItems(entry.items);
      setHistory(past);
    })();
  }, []);

  const handleSave = async () => {
    Keyboard.dismiss();
    await saveGratitudeForToday(items);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <View>
      <Text style={styles.gratitudeIntro}>3 choses pour lesquelles tu es reconnaissant(e) aujourd’hui :</Text>
      <View style={{ gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <StyledTextInput
            key={i}
            value={items[i]}
            onChangeText={(v) => setItems((prev) => prev.map((it, idx) => (idx === i ? v : it)) as [string, string, string])}
            placeholder={`${i + 1}.`}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        ))}
      </View>
      <Pressable onPress={handleSave} style={styles.saveBtn}>
        <Text style={styles.saveBtnText}>Enregistrer</Text>
      </Pressable>
      {saved ? <Text style={styles.savedMsg}>Enregistré pour aujourd’hui ✨</Text> : null}

      <GratitudeHistory history={history} />
    </View>
  );
}

function GratitudeHistory({ history }: { history: GratitudeEntry[] }) {
  const entries = history
    .map((entry) => ({ ...entry, items: entry.items.filter((it) => it.trim()) }))
    .filter((entry) => entry.items.length > 0)
    .slice(0, 7);

  if (entries.length === 0) {
    return (
      <Text style={styles.historyEmpty}>
        Ton historique de gratitude apparaîtra ici au fil des jours.
      </Text>
    );
  }

  return (
    <View style={styles.historySection}>
      <Text style={styles.historyTitle}>Tes gratitudes précédentes</Text>
      {entries.map((entry) => (
        <View key={entry.date} style={styles.historyItem}>
          <Text style={styles.historyDate}>{formatDateShortFR(entry.date)}</Text>
          {entry.items.map((it, i) => (
            <Text key={i} style={styles.historyText}>
              {it}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 16,
  },
  tabActive: { backgroundColor: colors.goldSoft, borderColor: colors.goldBorderStrong },
  tabLabel: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.inkMuted },
  tabLabelActive: { color: colors.gold },
  carteText: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 18,
    lineHeight: 28,
    color: colors.ink,
  },
  carteActions: { flexDirection: 'row', gap: 18, marginTop: 10 },
  smallText: { fontFamily: fonts.sans, fontSize: 13.5, color: colors.ink, marginBottom: 12 },
  intentionQuote: { fontFamily: fonts.serifItalic, fontStyle: 'italic', fontSize: 16, lineHeight: 24, color: colors.ink, marginBottom: 10 },
  intentionInput: { fontFamily: fonts.sans, fontSize: 12, color: colors.inkMuted, marginBottom: 14 },
  realizedLabel: { color: colors.gold, fontFamily: fonts.sans, fontSize: 13, marginBottom: 4 },
  gratitudeIntro: { fontFamily: fonts.sans, fontSize: 13.5, color: colors.ink, marginBottom: 12 },
  saveBtn: {
    backgroundColor: colors.gold,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnText: { fontFamily: fonts.sansBold, fontSize: 15, color: '#1b1e3d' },
  savedMsg: { color: colors.gold, fontFamily: fonts.sans, fontSize: 12.5, marginTop: 10 },
  historyEmpty: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    color: colors.inkMuted,
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  historySection: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    gap: 14,
  },
  historyTitle: { fontFamily: fonts.sansBold, fontSize: 12.5, color: colors.inkMuted },
  historyItem: { gap: 3 },
  historyDate: { fontFamily: fonts.sansBold, fontSize: 11.5, color: colors.gold, marginBottom: 2 },
  historyText: { fontFamily: fonts.serifItalic, fontStyle: 'italic', fontSize: 13.5, color: colors.ink, lineHeight: 19 },
});
