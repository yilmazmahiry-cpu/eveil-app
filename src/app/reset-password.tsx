import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, Text } from 'react-native';

import { PrimaryButton } from '@/components/Buttons';
import { LabeledField, StyledTextInput } from '@/components/Fields';
import { Logo } from '@/components/Logo';
import { Screen } from '@/components/Screen';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const url = Linking.useURL();
  const [status, setStatus] = useState<'checking' | 'invalid' | 'ready'>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!url) return;
    const { params, errorCode } = QueryParams.getQueryParams(url);
    const accessToken = params.access_token;
    const refreshToken = params.refresh_token;
    if (errorCode || !accessToken || !refreshToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the link is missing its tokens, there's nothing to await before we know it's invalid
      setStatus('invalid');
      return;
    }
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ error: sessionError }) => {
      setStatus(sessionError ? 'invalid' : 'ready');
    });
  }, [url]);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setError('');
    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.replace('/');
  };

  if (status === 'checking') {
    return (
      <Screen contentContainerStyle={styles.content}>
        <Logo />
        <Text style={styles.title}>Vérification du lien…</Text>
      </Screen>
    );
  }

  if (status === 'invalid') {
    return (
      <Screen contentContainerStyle={styles.content}>
        <Logo />
        <Text style={styles.title}>Lien invalide ou expiré</Text>
        <Text style={styles.subtitle}>Redemande un lien de réinitialisation depuis l’écran de connexion.</Text>
        {__DEV__ && url ? <Text style={styles.debug}>{url}</Text> : null}
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <Logo />
      <Text style={styles.title}>Choisis un nouveau mot de passe</Text>

      <LabeledField label="Nouveau mot de passe">
        <StyledTextInput
          value={password}
          onChangeText={setPassword}
          placeholder="6 caractères minimum"
          secureTextEntry
          autoCapitalize="none"
          returnKeyType="next"
        />
      </LabeledField>

      <LabeledField label="Confirme le mot de passe">
        <StyledTextInput
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Retape-le"
          secureTextEntry
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
      </LabeledField>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton title="Enregistrer" onPress={handleSubmit} loading={submitting} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingTop: 60, paddingBottom: 48, gap: 14 },
  title: { fontFamily: fonts.serifSemiBold, fontSize: 26, color: colors.ink, marginTop: 16, marginBottom: 2 },
  subtitle: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.inkMuted, marginBottom: 6 },
  error: { color: colors.alert, fontFamily: fonts.sans, fontSize: 13 },
  debug: { color: colors.inkMuted, fontFamily: fonts.sans, fontSize: 10, marginTop: 20 },
});
