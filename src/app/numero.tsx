import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { askIA } from '@/api/ai';
import { PrimaryButton } from '@/components/Buttons';
import { ErrorPanel, FeedbackWidget, LoadingDots, ResultPanel, ScreenHeader } from '@/components/Common';
import { Screen } from '@/components/Screen';
import { SYSTEM_PROMPT_GENERAL } from '@/data/prompts';
import { useProfile } from '@/context/ProfileContext';
import { CHEMIN_VIE_TEXTS } from '@/lib/numerology';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export default function NumeroScreen() {
  const { profile, addJournalEntry, setFeedback } = useProfile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<{ id: string; text: string; feedback: 'up' | 'down' | null } | null>(null);

  if (!profile) return null;

  const handlePress = async () => {
    setLoading(true);
    setError(false);
    setResult(null);
    const prompt = `${profile.prenom}, signe ${profile.signe}. Chemin de vie : ${profile.cheminVie}. Nombre d'expression : ${profile.nombreExpression}. Nombre de l'âme : ${profile.nombreAme}. Nombre de personnalité : ${profile.nombrePersonnalite}. Rédige une lecture numérologique complète et personnalisée qui relie ces quatre nombres entre eux.`;
    try {
      const text = await askIA(prompt, SYSTEM_PROMPT_GENERAL);
      const entry = await addJournalEntry('numero', 'Lecture complète', text);
      setResult({ id: entry.id, text, feedback: null });
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <ScreenHeader title="Numérologie" />
      <View style={styles.bigWrap}>
        <Text style={styles.big}>{profile.cheminVie}</Text>
      </View>
      <Text style={styles.text}>{CHEMIN_VIE_TEXTS[profile.cheminVie] || ''}</Text>

      <View style={styles.grid}>
        <NumRow label="Nombre d'expression" value={profile.nombreExpression} />
        <NumRow label="Nombre de l'âme" value={profile.nombreAme} />
        <NumRow label="Nombre de personnalité" value={profile.nombrePersonnalite} />
      </View>

      <PrimaryButton title="Lecture numérologique complète" onPress={handlePress} loading={loading} />

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
    </Screen>
  );
}

function NumRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.numRow}>
      <Text style={styles.numLabel}>{label}</Text>
      <Text style={styles.numValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 40 },
  bigWrap: { alignItems: 'center', marginBottom: 6 },
  big: { fontFamily: fonts.serifSemiBold, fontSize: 52, color: colors.gold, lineHeight: 58 },
  text: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.inkMuted, textAlign: 'center', marginBottom: 16 },
  grid: { gap: 10, marginBottom: 18 },
  numRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    paddingBottom: 10,
  },
  numLabel: { fontFamily: fonts.sans, fontSize: 13.5, color: colors.inkMuted },
  numValue: { fontFamily: fonts.serif, fontSize: 20, color: colors.gold },
  resultZone: { marginTop: 20, gap: 4 },
});
