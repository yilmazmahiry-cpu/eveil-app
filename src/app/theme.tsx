import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { askIA } from '@/api/ai';
import { PrimaryButton } from '@/components/Buttons';
import { ErrorPanel, FeedbackWidget, LoadingDots, ResultPanel, ScreenHeader } from '@/components/Common';
import { Screen } from '@/components/Screen';
import { SYSTEM_PROMPT_GENERAL } from '@/data/prompts';
import { useProfile } from '@/context/ProfileContext';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export default function ThemeScreen() {
  const { profile, addJournalEntry, setFeedback } = useProfile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<{ id: string; text: string; feedback: 'up' | 'down' | null } | null>(null);

  if (!profile) return null;

  const infoParts: string[] = [];
  if (profile.heureNaissance) infoParts.push(`né(e) à ${profile.heureNaissance}`);
  if (profile.lieuNaissance) infoParts.push(profile.lieuNaissance);
  const infoText = infoParts.length
    ? infoParts.join(', ')
    : "Ajoute ton heure et ton lieu de naissance dans ton profil pour une lecture encore plus riche.";

  const handlePress = async () => {
    setLoading(true);
    setError(false);
    setResult(null);
    let details = `Prénom : ${profile.prenom}. Signe solaire : ${profile.signe}.`;
    if (profile.heureNaissance) details += ` Heure de naissance indiquée : ${profile.heureNaissance}.`;
    if (profile.lieuNaissance) details += ` Lieu de naissance indiqué : ${profile.lieuNaissance}.`;
    details +=
      " Rédige une lecture de thème astral inspirée pour cette personne à partir de ces informations. Précise dès la première phrase qu'il s'agit d'une interprétation générale et non d'un calcul astronomique précis de la carte du ciel.";
    try {
      const text = await askIA(details, SYSTEM_PROMPT_GENERAL);
      const entry = await addJournalEntry('theme', 'Thème astral', text);
      setResult({ id: entry.id, text, feedback: null });
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <ScreenHeader title="Thème astral" />
      <Text style={styles.intro}>
        Basé sur ton signe solaire : <Text style={styles.signe}>{profile.signe}</Text>
      </Text>
      <Text style={styles.infoText}>{infoText}</Text>

      <PrimaryButton title="Découvrir mon thème" onPress={handlePress} loading={loading} style={{ marginTop: 10 }} />

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

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 40 },
  intro: { fontFamily: fonts.sans, fontSize: 14, color: colors.inkMuted, textAlign: 'center', marginBottom: 4 },
  signe: { fontFamily: fonts.serif, color: colors.gold },
  infoText: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.inkMuted, textAlign: 'center', marginBottom: 8 },
  resultZone: { marginTop: 20, gap: 4 },
});
