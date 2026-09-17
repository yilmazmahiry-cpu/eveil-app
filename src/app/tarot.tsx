import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { askIA } from '@/api/ai';
import { PrimaryButton, TextButton } from '@/components/Buttons';
import { Card, ErrorPanel, FeedbackWidget, LoadingDots, ResultPanel, ScreenHeader, ScreenIntro } from '@/components/Common';
import { Screen } from '@/components/Screen';
import { useProfile } from '@/context/ProfileContext';
import { SYSTEM_PROMPT_GENERAL } from '@/data/prompts';
import { SUIT_LABELS, TAROT_DECK, TarotCard } from '@/data/tarotCards';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

function drawCard(): { card: TarotCard; reversed: boolean } {
  const card = TAROT_DECK[Math.floor(Math.random() * TAROT_DECK.length)];
  const reversed = Math.random() < 0.5;
  return { card, reversed };
}

export default function TarotScreen() {
  const { profile, addJournalEntry, setFeedback } = useProfile();
  const [draw, setDraw] = useState(drawCard);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<{ id: string; text: string; feedback: 'up' | 'down' | null } | null>(null);

  const newDraw = useCallback(() => {
    setDraw(drawCard());
    setResult(null);
    setError(false);
  }, []);

  if (!profile) return null;

  const { card, reversed } = draw;
  const meaning = reversed ? card.reversed : card.upright;
  const orientation = reversed ? 'Inversée' : 'Droite';

  const handlePress = async () => {
    setLoading(true);
    setError(false);
    setResult(null);
    const suitPart = card.suit ? ` (arcane mineur, ${SUIT_LABELS[card.suit]})` : ' (arcane majeur)';
    const prompt = `${profile.prenom} (signe : ${profile.signe}) tire la carte de tarot "${card.name}"${suitPart}, en position ${orientation.toLowerCase()}. Sens traditionnel : ${meaning} Propose une lecture personnalisée de cette carte pour cette personne aujourd'hui.`;
    try {
      const text = await askIA(prompt, SYSTEM_PROMPT_GENERAL);
      const entry = await addJournalEntry('tarot', `${card.name} — ${orientation}`, text);
      setResult({ id: entry.id, text, feedback: null });
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <ScreenHeader title="Tarot" />
      <ScreenIntro center>Tire une carte et laisse-la éclairer ta journée.</ScreenIntro>

      <Card style={styles.cardBox}>
        <Text style={styles.cardName}>{card.name}</Text>
        <Text style={styles.orientation}>{orientation}</Text>
        <Text style={styles.meaning}>{meaning}</Text>
      </Card>

      <TextButton title="Nouveau tirage" onPress={newDraw} style={{ alignSelf: 'center', marginTop: 4 }} />

      <PrimaryButton title="Lecture personnalisée" onPress={handlePress} loading={loading} style={{ marginTop: 18 }} />

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
  cardBox: { marginTop: 18, alignItems: 'center' },
  cardName: { fontFamily: fonts.serifSemiBold, fontSize: 22, color: colors.gold, textAlign: 'center' },
  orientation: { fontFamily: fonts.sans, fontSize: 12, color: colors.inkMuted, marginTop: 4, marginBottom: 12 },
  meaning: { fontFamily: fonts.serifItalic, fontStyle: 'italic', fontSize: 15, color: colors.ink, textAlign: 'center', lineHeight: 22 },
  resultZone: { marginTop: 20, gap: 4 },
});
