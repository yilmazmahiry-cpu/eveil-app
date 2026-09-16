import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/Buttons';
import { Logo } from '@/components/Logo';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.center}>
        <Logo size={46} />
        <Text style={styles.title}>Éveil</Text>
        <Text style={styles.subtitle}>
          Ton espace quotidien pour explorer les signes, les cycles et les messages qui t’entourent.
        </Text>
      </View>
      <PrimaryButton title="Découvrir Éveil" onPress={() => router.push('/onboarding')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 24, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.serifSemiBold, fontSize: 36, color: colors.ink, marginTop: 22, marginBottom: 12 },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.inkMuted,
    maxWidth: 250,
    textAlign: 'center',
  },
});
