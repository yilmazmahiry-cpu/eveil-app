import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';

import { askIA } from '@/api/ai';
import { PrimaryButton } from '@/components/Buttons';
import { DateValue, DateWheelPicker, defaultDateValue } from '@/components/DateWheels';
import { ErrorPanel, FeedbackWidget, LoadingDots, ResultPanel, ScreenHeader, ScreenIntro } from '@/components/Common';
import { LabeledField, StyledTextInput } from '@/components/Fields';
import { Screen } from '@/components/Screen';
import { SYSTEM_PROMPT_GENERAL } from '@/data/prompts';
import { useProfile } from '@/context/ProfileContext';
import { getSigne } from '@/lib/astrology';
import { colors } from '@/theme/colors';

export default function CompatScreen() {
  const { profile, isPremium, addJournalEntry, setFeedback } = useProfile();
  const router = useRouter();
  const [autrePrenom, setAutrePrenom] = useState('');
  const [date, setDate] = useState<DateValue>(defaultDateValue());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id: string; text: string; feedback: 'up' | 'down' | null } | null>(null);
  const [resultError, setResultError] = useState(false);

  if (!profile) return null;

  const handleSubmit = async () => {
    if (!autrePrenom.trim()) {
      setError("Merci d'indiquer un prénom.");
      return;
    }
    if (!isPremium) {
      router.push('/paywall');
      return;
    }
    Keyboard.dismiss();
    setError('');
    setLoading(true);
    setResultError(false);
    setResult(null);
    const autreSigne = getSigne(date.month, date.day);
    const prompt = `${profile.prenom} (signe : ${profile.signe}) souhaite connaître sa compatibilité avec ${autrePrenom.trim()} (signe : ${autreSigne}). Rédige une lecture de compatibilité entre ces deux signes, en évoquant à la fois les affinités naturelles et les points de vigilance possibles dans la relation.`;
    try {
      const text = await askIA(prompt, SYSTEM_PROMPT_GENERAL);
      const entry = await addJournalEntry('compat', `${profile.prenom} & ${autrePrenom.trim()}`, text);
      setResult({ id: entry.id, text, feedback: null });
    } catch {
      setResultError(true);
    }
    setLoading(false);
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <ScreenHeader title="Compatibilité" />
      <ScreenIntro>Renseigne les informations de l’autre personne.</ScreenIntro>

      <LabeledField label="Son prénom">
        <StyledTextInput
          value={autrePrenom}
          onChangeText={setAutrePrenom}
          placeholder="Alex"
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
      </LabeledField>

      <LabeledField label="Sa date de naissance">
        <DateWheelPicker value={date} onChange={setDate} />
      </LabeledField>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton title="Voir la compatibilité" onPress={handleSubmit} loading={loading} style={{ marginTop: 16 }} />

      <View style={styles.resultZone}>
        {loading && !result && <LoadingDots />}
        {resultError && <ErrorPanel />}
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

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 40, gap: 14 },
  error: { color: colors.alert, fontSize: 13 },
  resultZone: { marginTop: 6, gap: 4 },
});
