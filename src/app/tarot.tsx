import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { askIA } from '@/api/ai';
import { PrimaryButton, TextButton } from '@/components/Buttons';
import { ErrorPanel, FeedbackWidget, LoadingDots, ResultPanel, ScreenHeader, ScreenIntro } from '@/components/Common';
import { OracleCardVisual } from '@/components/OracleCardVisual';
import { Screen } from '@/components/Screen';
import { useProfile } from '@/context/ProfileContext';
import { SYSTEM_PROMPT_GENERAL } from '@/data/prompts';
import { SUIT_LABELS, TAROT_DECK, TarotCard } from '@/data/tarotCards';
import { getDailyCache, setDailyCache } from '@/lib/dailyCache';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

const TAROT_DAILY_LIMIT = 5;

function drawCard(): { card: TarotCard; reversed: boolean } {
  const card = TAROT_DECK[Math.floor(Math.random() * TAROT_DECK.length)];
  const reversed = Math.random() < 0.5;
  return { card, reversed };
}

export default function TarotScreen() {
  const { profile, isPremium, addJournalEntry, setFeedback } = useProfile();
  const router = useRouter();
  const [draw, setDraw] = useState(drawCard);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<{ id: string; text: string; feedback: 'up' | 'down' | null } | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    getDailyCache<number>('tarot').then((cached) => {
      setCount(cached ?? 0);
    });
  }, []);

  const newDraw = useCallback(() => {
    setDraw(drawCard());
    setResult(null);
    setError(false);
  }, []);

  if (!profile) return null;

  const { card, reversed } = draw;
  const meaning = reversed ? card.reversed : card.upright;
  const orientation = reversed ? 'Inversée' : 'Droite';
  const limitReached = count >= TAROT_DAILY_LIMIT;

  const handlePress = async () => {
    if (!isPremium) {
      router.push('/paywall');
      return;
    }
    if (limitReached) return;
    setLoading(true);
    setError(false);
    setResult(null);
    const suitPart = card.suit ? ` (arcane mineur, ${SUIT_LABELS[card.suit]})` : ' (arcane majeur)';
    const prompt = `${profile.prenom} (signe : ${profile.signe}) tire la carte de tarot "${card.name}"${suitPart}, en position ${orientation.toLowerCase()}. Sens traditionnel : ${meaning} Propose une lecture personnalisée de cette carte pour cette personne aujourd'hui.`;
    try {
      const text = await askIA(prompt, SYSTEM_PROMPT_GENERAL);
      const entry = await addJournalEntry('tarot', `${card.name} — ${orientation}`, text);
      setResult({ id: entry.id, text, feedback: null });
      const next = count + 1;
      setCount(next);
      await setDailyCache('tarot', next);
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <ScreenHeader title="Tarot" />
      <ScreenIntro center>Tire une carte et laisse-la éclairer ta journée.</ScreenIntro>

      <OracleCardVisual name={card.name} meta={orientation} description={meaning} italic />

      <TextButton title="Nouveau tirage" onPress={newDraw} style={{ alignSelf: 'center', marginTop: 4 }} />

      <PrimaryButton
        title="Lecture personnalisée"
        onPress={handlePress}
        loading={loading}
        disabled={isPremium && limitReached}
        style={{ marginTop: 18 }}
      />
      <Text style={styles.limitText}>
        {!isPremium
          ? 'Fonctionnalité Premium'
          : limitReached
            ? 'Limite de 5 lectures atteinte pour aujourd’hui — reviens demain.'
            : `${TAROT_DAILY_LIMIT - count} lecture${TAROT_DAILY_LIMIT - count > 1 ? 's' : ''} restante${TAROT_DAILY_LIMIT - count > 1 ? 's' : ''} aujourd’hui`}
      </Text>

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
  resultZone: { marginTop: 20, gap: 4 },
  limitText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});
