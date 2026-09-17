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

  const hasPreciseChart = !!(profile.ascendant && profile.signeLunaire);

  const handlePress = async () => {
    setLoading(true);
    setError(false);
    setResult(null);
    let details = `Prénom : ${profile.prenom}. Signe solaire : ${profile.signe}.`;
    if (hasPreciseChart) {
      details += ` Signe lunaire : ${profile.signeLunaire}. Ascendant : ${profile.ascendant}.`;
      details +=
        ' Rédige une lecture de thème astral personnalisée pour cette personne à partir de ces trois éléments (soleil, lune, ascendant), calculés précisément à partir de sa date, heure et lieu de naissance.';
    } else {
      if (profile.heureNaissance) details += ` Heure de naissance indiquée : ${profile.heureNaissance}.`;
      if (profile.lieuNaissance) details += ` Lieu de naissance indiqué : ${profile.lieuNaissance}.`;
      details +=
        " Rédige une lecture de thème astral inspirée pour cette personne à partir de ces informations. Précise dès la première phrase qu'il s'agit d'une interprétation générale et non d'un calcul astronomique précis de la carte du ciel.";
    }
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
      {hasPreciseChart ? (
        <View style={styles.bigThreeRow}>
          <BigThreeItem label="Soleil" value={profile.signe} />
          <BigThreeItem label="Lune" value={profile.signeLunaire!} />
          <BigThreeItem label="Ascendant" value={profile.ascendant!} />
        </View>
      ) : (
        <>
          <Text style={styles.intro}>
            Basé sur ton signe solaire : <Text style={styles.signe}>{profile.signe}</Text>
          </Text>
          <Text style={styles.infoText}>
            Ajoute ton heure et ton lieu de naissance dans ton profil pour un thème précis (lune, ascendant).
          </Text>
        </>
      )}

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

function BigThreeItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.bigThreeItem}>
      <Text style={styles.bigThreeValue}>{value}</Text>
      <Text style={styles.bigThreeLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 40 },
  intro: { fontFamily: fonts.sans, fontSize: 14, color: colors.inkMuted, textAlign: 'center', marginBottom: 4 },
  signe: { fontFamily: fonts.serif, color: colors.gold },
  infoText: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.inkMuted, textAlign: 'center', marginBottom: 8 },
  bigThreeRow: { flexDirection: 'row', justifyContent: 'center', gap: 22, marginBottom: 10 },
  bigThreeItem: { alignItems: 'center' },
  bigThreeValue: { fontFamily: fonts.serifSemiBold, fontSize: 16, color: colors.gold },
  bigThreeLabel: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.inkMuted, marginTop: 3 },
  resultZone: { marginTop: 20, gap: 4 },
});
