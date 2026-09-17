import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Keyboard, StyleSheet, Text } from 'react-native';

import { PrimaryButton } from '@/components/Buttons';
import { DateWheelPicker, DateValue, dateValueToISO, defaultDateValue, defaultTimeValue, TimeValue, TimeWheelPicker } from '@/components/DateWheels';
import { LabeledField, StyledTextInput } from '@/components/Fields';
import { Logo } from '@/components/Logo';
import { Screen } from '@/components/Screen';
import { useProfile } from '@/context/ProfileContext';
import { buildProfile } from '@/lib/buildProfile';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export default function OnboardingScreen() {
  const router = useRouter();
  const { loading, session, saveProfile } = useProfile();
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [lieu, setLieu] = useState('');
  const [date, setDate] = useState<DateValue>(defaultDateValue());
  const [time, setTime] = useState<TimeValue>(defaultTimeValue());
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (!session) return <Redirect href="/welcome" />;

  const handleSubmit = async () => {
    if (!prenom.trim()) {
      setError("Merci d'indiquer ton prénom.");
      return;
    }
    Keyboard.dismiss();
    setError('');
    setSubmitting(true);
    const naissance = dateValueToISO(date);
    const profile = await buildProfile({
      prenom: prenom.trim(),
      nom: nom.trim(),
      naissance,
      heureNaissance: time.hour && time.minute ? `${time.hour}:${time.minute}` : null,
      lieuNaissance: lieu.trim() || null,
    });
    await saveProfile(profile);
    router.replace('/(tabs)');
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <Logo />
      <Text style={styles.title}>Avant de commencer</Text>
      <Text style={styles.subtitle}>Quelques informations pour personnaliser tes lectures.</Text>

      <LabeledField label="Ton prénom">
        <StyledTextInput
          value={prenom}
          onChangeText={setPrenom}
          placeholder="Camille"
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
      </LabeledField>

      <LabeledField label="Ton nom de famille" optional>
        <StyledTextInput
          value={nom}
          onChangeText={setNom}
          placeholder="Martin"
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
      </LabeledField>

      <LabeledField label="Ta date de naissance">
        <DateWheelPicker value={date} onChange={setDate} />
      </LabeledField>

      <LabeledField label="Heure de naissance" optional>
        <TimeWheelPicker value={time} onChange={setTime} />
      </LabeledField>

      <LabeledField label="Lieu de naissance" optional>
        <StyledTextInput
          value={lieu}
          onChangeText={setLieu}
          placeholder="Paris, France"
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
      </LabeledField>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton title="Commencer" onPress={handleSubmit} loading={submitting} />

      <Text style={styles.footnote}>
        Éveil est un espace d’inspiration et de réflexion personnelle, pas une source de vérité absolue.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingBottom: 48, gap: 14 },
  title: { fontFamily: fonts.serifSemiBold, fontSize: 26, color: colors.ink, marginTop: 16, marginBottom: 2 },
  subtitle: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.inkMuted, marginBottom: 6 },
  error: { color: colors.alert, fontFamily: fonts.sans, fontSize: 13 },
  footnote: { fontFamily: fonts.sans, fontSize: 12, color: colors.inkMuted, opacity: 0.7, lineHeight: 18, marginTop: 8 },
});
