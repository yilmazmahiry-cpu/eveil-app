import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Keyboard, StyleSheet, Text } from 'react-native';

import { PrimaryButton } from '@/components/Buttons';
import { LabeledField, StyledTextInput } from '@/components/Fields';
import { Logo } from '@/components/Logo';
import { Screen } from '@/components/Screen';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!email.trim() || !password) {
      setError('Renseigne ton email et ton mot de passe.');
      return;
    }
    setError('');
    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (signInError) {
      const translations: Record<string, string> = {
        'Invalid login credentials': 'Email ou mot de passe incorrect.',
        'Email not confirmed': 'Ton email n’est pas encore confirmé. Vérifie ta boîte mail et clique sur le lien reçu.',
      };
      setError(translations[signInError.message] ?? signInError.message);
      return;
    }
    router.replace('/');
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <Logo />
      <Text style={styles.title}>Content de te revoir</Text>
      <Text style={styles.subtitle}>Connecte-toi pour retrouver ton profil.</Text>

      <LabeledField label="Email">
        <StyledTextInput
          value={email}
          onChangeText={setEmail}
          placeholder="toi@exemple.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          returnKeyType="next"
        />
      </LabeledField>

      <LabeledField label="Mot de passe">
        <StyledTextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Ton mot de passe"
          secureTextEntry
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
      </LabeledField>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton title="Se connecter" onPress={handleSubmit} loading={submitting} />

      <Link href="/signup" replace style={styles.link}>
        Créer un compte
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
