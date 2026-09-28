import { makeRedirectUri } from 'expo-auth-session';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Keyboard, StyleSheet, Text } from 'react-native';

import { PrimaryButton } from '@/components/Buttons';
import { LabeledField, StyledTextInput } from '@/components/Fields';
import { Logo } from '@/components/Logo';
import { Screen } from '@/components/Screen';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!email.trim()) {
      setError('Renseigne ton email.');
      return;
    }
    setError('');
    setSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: makeRedirectUri({ path: 'reset-password' }),
    });
    setSubmitting(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <Screen contentContainerStyle={styles.content}>
        <Logo />
        <Text style={styles.title}>Vérifie ta boîte mail</Text>
        <Text style={styles.subtitle}>
          On t’a envoyé un lien à {email.trim()} pour choisir un nouveau mot de passe.
        </Text>
        <Link href="/login" replace style={styles.link}>
          Retour à la connexion
        </Link>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <Logo />
      <Text style={styles.title}>Mot de passe oublié</Text>
      <Text style={styles.subtitle}>On t’enverra un lien par email pour en choisir un nouveau.</Text>

      <LabeledField label="Email">
        <StyledTextInput
          value={email}
          onChangeText={setEmail}
          placeholder="toi@exemple.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
      </LabeledField>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton title="Envoyer le lien" onPress={handleSubmit} loading={submitting} />

      <Link href="/login" replace style={styles.link}>
        Retour à la connexion
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingTop: 60, paddingBottom: 48, gap: 14 },
  title: { fontFamily: fonts.serifSemiBold, fontSize: 26, color: colors.ink, marginTop: 16, marginBottom: 2 },
  subtitle: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.inkMuted, marginBottom: 6 },
  error: { color: colors.alert, fontFamily: fonts.sans, fontSize: 13 },
  link: { fontFamily: fonts.sansBold, fontSize: 13.5, color: colors.gold, marginTop: 8, textAlign: 'center' },
});
