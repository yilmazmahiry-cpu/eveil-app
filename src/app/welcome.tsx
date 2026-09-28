import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, SecondaryButton } from '@/components/Buttons';
import { LogoGlow } from '@/components/LogoGlow';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

const STARS = [
  { top: '9%', left: '18%', size: 3 },
  { top: '6%', left: '72%', size: 2.5 },
  { top: '15%', left: '86%', size: 2 },
  { top: '22%', left: '8%', size: 2 },
  { top: '4%', left: '46%', size: 2.5 },
  { top: '19%', left: '62%', size: 2 },
] as const;

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.screen}>
      {STARS.map((star, i) => (
        <View
          key={i}
          style={[
            styles.star,
            { top: star.top, left: star.left, width: star.size, height: star.size, borderRadius: star.size },
          ]}
        />
      ))}

      <View style={styles.top}>
        <LogoGlow size={46} />
        <Text style={styles.title}>Éveil</Text>
        <Text style={styles.subtitle}>
          Ton espace quotidien pour explorer les signes, les cycles et les messages qui t’entourent.
        </Text>
        <View style={styles.ornament}>
          <View style={styles.ornamentLine} />
          <View style={styles.ornamentDot} />
          <View style={styles.ornamentLine} />
        </View>
      </View>

      <View style={styles.rings} pointerEvents="none">
        <View style={[styles.ring, { width: 176, height: 176, borderRadius: 88 }]} />
        <View style={[styles.ring, { width: 122, height: 122, borderRadius: 61, position: 'absolute' }]} />
      </View>

      <View style={styles.spacer} />

      <View style={styles.actions}>
        <PrimaryButton title="Créer un compte" onPress={() => router.push('/signup')} />
        <SecondaryButton title="J'ai déjà un compte" onPress={() => router.push('/login')} style={styles.loginBtn} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 24, paddingBottom: 32 },
  star: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.4)' },
  top: { alignItems: 'center', paddingTop: '12%' },
  title: { fontFamily: fonts.serifSemiBold, fontSize: 36, color: colors.ink, marginTop: 12, marginBottom: 12 },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.inkMuted,
    maxWidth: 250,
    textAlign: 'center',
  },
  ornament: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 22 },
  ornamentLine: { width: 26, height: 1, backgroundColor: colors.goldBorderStrong },
  ornamentDot: { width: 4, height: 4, backgroundColor: colors.gold, transform: [{ rotate: '45deg' }] },
  rings: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  ring: { borderWidth: 1, borderColor: 'rgba(203,163,92,0.1)' },
  spacer: { flex: 1 },
  actions: { gap: 12 },
  loginBtn: { marginTop: 0 },
});
