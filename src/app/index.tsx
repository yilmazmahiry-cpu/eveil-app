import { Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, TextButton } from '@/components/Buttons';
import { useProfile } from '@/context/ProfileContext';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export default function Index() {
  const { loading, session, profile, profileError, reloadProfile, signOut } = useProfile();

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  if (!session) return <Redirect href="/welcome" />;

  if (!profile && profileError) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Impossible de charger ton profil</Text>
        <Text style={styles.text}>
          Vérifie ta connexion internet, puis réessaie. Tes informations sont en sécurité, rien n’a été perdu.
        </Text>
        <PrimaryButton title="Réessayer" onPress={reloadProfile} />
        <TextButton title="Se déconnecter" onPress={() => signOut()} style={{ marginTop: 14, alignSelf: 'center' }} />
      </View>
    );
  }

  if (!profile) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: 'center', gap: 14 },
  title: { fontFamily: fonts.serifSemiBold, fontSize: 24, color: colors.ink, textAlign: 'center' },
  text: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.inkMuted, textAlign: 'center', marginBottom: 8 },
});
