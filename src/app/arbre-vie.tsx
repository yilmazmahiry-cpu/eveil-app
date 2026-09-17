import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';

import { askIA } from '@/api/ai';
import { PrimaryButton } from '@/components/Buttons';
import { Card, ErrorPanel, FeedbackWidget, LoadingDots, ResultPanel, ScreenHeader, ScreenIntro } from '@/components/Common';
import { Screen } from '@/components/Screen';
import { SYSTEM_PROMPT_GENERAL } from '@/data/prompts';
import { useProfile } from '@/context/ProfileContext';
import { Sephira, SEPHIROT, SEPHIROT_PATHS } from '@/data/sephirot';
import { simpleHash, todayISO } from '@/lib/hash';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export default function ArbreVieScreen() {
  const { profile, addJournalEntry, setFeedback } = useProfile();
  const defaultSephira = useMemo(() => {
    if (!profile) return SEPHIROT[0];
    const idx = simpleHash(todayISO() + profile.prenom) % SEPHIROT.length;
    return SEPHIROT[idx];
  }, [profile]);
  const [selected, setSelected] = useState<Sephira>(defaultSephira);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<{ id: string; text: string; feedback: 'up' | 'down' | null } | null>(null);

  if (!profile) return null;

  const nodeByKey: Record<string, Sephira> = {};
  SEPHIROT.forEach((s) => (nodeByKey[s.key] = s));

  const handlePress = async () => {
    setLoading(true);
    setError(false);
    setResult(null);
    const prompt = `${profile.prenom} (signe : ${profile.signe}) explore aujourd'hui la séphira ${selected.name} (${selected.trad}) de l'arbre de vie kabbalistique, associée à : ${selected.theme} En t'inspirant de cette énergie et de la loi de l'attraction, propose une lecture personnalisée pour cette personne aujourd'hui.`;
    try {
      const text = await askIA(prompt, SYSTEM_PROMPT_GENERAL);
      const entry = await addJournalEntry('sephira', selected.name, text);
      setResult({ id: entry.id, text, feedback: null });
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <ScreenHeader title="Arbre de vie" />
      <ScreenIntro center>Explore les dix séphiroth et découvre celle qui résonne avec toi aujourd’hui.</ScreenIntro>

      <View style={styles.svgWrap}>
        <Svg width={260} height={277} viewBox="0 0 300 320">
          {SEPHIROT_PATHS.map(([a, b], i) => {
            const pa = nodeByKey[a];
            const pb = nodeByKey[b];
            return (
              <Line
                key={i}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke="rgba(203,163,92,0.35)"
                strokeWidth={1.2}
              />
            );
          })}
          {SEPHIROT.map((s) => {
            const isSelected = selected.key === s.key;
            const isLeft = s.x === 100;
            const labelX = isLeft ? s.x - 16 : s.x + 16;
            return (
              <G key={s.key} onPress={() => setSelected(s)}>
                <Circle
                  cx={s.x}
                  cy={s.y}
                  r={13}
                  fill={isSelected ? colors.gold : '#1b1e3d'}
                  stroke={colors.gold}
                  strokeWidth={1.3}
                />
                <SvgText
                  x={labelX}
                  y={s.y + 4}
                  textAnchor={isLeft ? 'end' : 'start'}
                  fontFamily="Karla"
                  fontSize={11}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fill={isSelected ? colors.gold : colors.inkMuted}
                >
                  {s.name}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </View>

      <Card>
        <Text style={styles.sephiraTitle}>
          {selected.name} — {selected.trad}
        </Text>
        <Text style={styles.sephiraTheme}>{selected.theme}</Text>
      </Card>

      <PrimaryButton title="Lecture personnalisée" onPress={handlePress} loading={loading} style={{ marginTop: 14 }} />

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
  svgWrap: { alignItems: 'center', marginBottom: 16 },
  sephiraTitle: { fontFamily: fonts.sansBold, fontSize: 14.5, color: colors.inkMuted, marginBottom: 8 },
  sephiraTheme: { fontFamily: fonts.serifItalic, fontStyle: 'italic', fontSize: 15, color: colors.ink, lineHeight: 22 },
  resultZone: { marginTop: 20, gap: 4 },
});
