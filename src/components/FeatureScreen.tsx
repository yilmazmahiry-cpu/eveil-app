import { useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';

import { askIA } from '@/api/ai';
import { SYSTEM_PROMPT_GENERAL } from '@/data/prompts';
import { useProfile } from '@/context/ProfileContext';
import { JournalType } from '@/types';

import { PrimaryButton } from './Buttons';
import { ErrorPanel, FeedbackWidget, LoadingDots, ResultPanel, ScreenHeader, ScreenIntro } from './Common';
import { StyledTextArea, StyledTextInput } from './Fields';
import { Screen } from './Screen';

export function FeatureScreen({
  type,
  title,
  intro,
  placeholder,
  multiline,
  buildPrompt,
  submitLabel,
  footer,
}: {
  type: JournalType;
  title: string;
  intro: string;
  placeholder: string;
  multiline?: boolean;
  buildPrompt: (value: string) => string;
  submitLabel?: string;
  footer?: React.ReactNode;
}) {
  const { profile, addJournalEntry, setFeedback } = useProfile();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id: string; text: string; feedback: 'up' | 'down' | null } | null>(null);
  const [error, setError] = useState(false);

  const handleSubmit = async () => {
    if (!value.trim() || !profile) return;
    Keyboard.dismiss();
    setLoading(true);
    setError(false);
    setResult(null);
    try {
      const text = await askIA(buildPrompt(value.trim()), SYSTEM_PROMPT_GENERAL);
      const entry = await addJournalEntry(type, value.trim(), text);
      setResult({ id: entry.id, text, feedback: null });
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <ScreenHeader title={title} />
      <ScreenIntro>{intro}</ScreenIntro>
      {multiline ? (
        <StyledTextArea value={value} onChangeText={setValue} placeholder={placeholder} />
      ) : (
        <StyledTextInput
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
      )}
      <PrimaryButton
        title={submitLabel ?? 'Découvrir le sens'}
        onPress={handleSubmit}
        disabled={!value.trim()}
        loading={loading}
        style={{ marginTop: 14 }}
      />
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
      {footer}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 40 },
  resultZone: { marginTop: 20, gap: 4 },
});
