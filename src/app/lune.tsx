import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { askIA } from '@/api/ai';
import { PrimaryButton } from '@/components/Buttons';
import { Card, ErrorPanel, FeedbackWidget, LoadingDots, ResultPanel, ScreenHeader } from '@/components/Common';
import { SYSTEM_PROMPT_GENERAL } from '@/data/prompts';
import { useProfile } from '@/context/ProfileContext';
import { ORACLE_CARDS } from '@/data/oracleCards';
import { simpleHash, todayISO } from '@/lib/hash';
import { getMoonPhaseFraction, getMoonPhaseIndex, MOON_PHASE_NAMES, MOON_RITUALS } from '@/lib/moon';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export default function LuneScreen() {
  const { profile, addJournalEntry, setFeedback } = useProfile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<{ id: string; text: string; feedback: 'up' | 'down' | null } | null>(null);

  const moon = useMemo(() => {
    const now = new Date();
    const frac = getMoonPhaseFraction(now);
    const idx = getMoonPhaseIndex(frac);
    return { idx, phaseName: MOON_PHASE_NAMES[idx], ritual: MOON_RITUALS[idx] };
  }, []);

  const card = useMemo(() => {
    if (!profile) return ORACLE_CARDS[0];
    const idx = simpleHash(todayISO() + profile.prenom) % ORACLE_CARDS.length;
    return ORACLE_CARDS[idx];
  }, [profile]);

  if (!profile) return null;

  const handlePress = async () => {
    setLoading(true);
    setError(false);
    setResult(null);
    const prompt = `${profile.prenom} (signe : ${profile.signe}) consulte l'application aujourd'hui. Phase lunaire du jour : ${moon.phaseName}. Carte oracle tirée : "${card.name}" (${card.sens}). Rédige une lecture personnalisée qui relie la phase de la lune et le message de cette carte pour cette personne aujourd'hui.`;
    try {
      const text = await askIA(prompt, SYSTEM_PROMPT_GENERAL);
      const entry = await addJournalEntry('lune', `${moon.phaseName} — ${card.name}`, text);
      setResult({ id: entry.id, text, feedback: null });
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenHeader title="Lune & Oracle" />
      <View style={styles.center}>
        <Text style={styles.phaseName}>{moon.phaseName}</Text>
        <View style={styles.dotsRow}>
          {MOON_PHASE_NAMES.map((_, i) => (
            <View key={i} style={[styles.dot, i === moon.idx && styles.dotActive]} />
          ))}
        </View>
        <Text style={styles.ritual}>{moon.ritual}</Text>
      </View>

      <Card style={{ marginTop: 22 }}>
        <Text style={styles.cardTitle}>Carte oracle du jour</Text>
        <Text style={styles.oracleName}>{card.name}</Text>
        <Text style={styles.oracleSens}>{card.sens}</Text>
      </Card>

      <PrimaryButton title="Lecture du jour" onPress={handlePress} loading={loading} style={{ marginTop: 18 }} />

      <View style={styles.resultZone}>
        {loading && !result && <LoadingDots />}
        {error && <ErrorPanel />}
        {result && (
          <>
            <ResultPanel text={result.text} />
            <FeedbackWidget
              value={result.feedback}
              onChange={async (v) => {
                setResult({ ...result, feedback: v });
                await setFeedback(result.id, v);
              }}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 30, paddingBottom: 60 },
  center: { alignItems: 'center' },
  phaseName: { fontFamily: fonts.serifSemiBold, fontSize: 19, color: colors.ink, marginBottom: 2 },
  dotsRow: { flexDirection: 'row', gap: 6, marginVertical: 14 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(203,163,92,0.25)' },
  dotActive: { backgroundColor: colors.gold },
  ritual: { fontFamily: fonts.sans, fontSize: 13, color: colors.inkMuted, textAlign: 'center' },
  cardTitle: { fontFamily: fonts.sansBold, fontSize: 14.5, color: colors.inkMuted, marginBottom: 4 },
  oracleName: { fontFamily: fonts.serifSemiBold, fontSize: 19, color: colors.gold, textAlign: 'center', marginVertical: 6 },
  oracleSens: { fontFamily: fonts.sans, fontSize: 13.5, color: colors.inkMuted, textAlign: 'center' },
  resultZone: { marginTop: 20, gap: 4 },
});
