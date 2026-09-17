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

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checkEmail, setCheckEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!email.trim() || !password) {
      setError('Renseigne un email et un mot de passe.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.');
      return;
    }
    setError('');
    setSubmitting(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data.session) {
      router.replace('/');
    } else {
      setCheckEmail(true);
    }
  };

  if (checkEmail) {
    return (
      <Screen contentContainerStyle={styles.content}>
        <Logo />
        <Text style={styles.title}>Vérifie ta boîte mail</Text>
        <Text style={styles.subtitle}>
          On t’a envoyé un lien de confirmation à {email.trim()}. Clique dessus, puis reviens te connecter.
        </Text>
        <Link href="/login" replace style={styles.link}>
          Aller à la connexion
        </Link>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <Logo />
      <Text style={styles.title}>Créer ton compte</Text>
      <Text style={styles.subtitle}>Pour retrouver ton profil sur n’importe quel appareil.</Text>

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
          placeholder="6 caractères minimum"
          secureTextEntry
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
      </LabeledField>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton title="Créer mon compte" onPress={handleSubmit} loading={submitting} />

      <Link href="/login" replace style={styles.link}>
        J’ai déjà un compte
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
