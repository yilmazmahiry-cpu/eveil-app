import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenHeader, ScreenIntro } from '@/components/Common';
import { Logo } from '@/components/Logo';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export default function PartageScreen() {
  const { text } = useLocalSearchParams<{ text: string }>();
  const dateLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Partager" />
      <View style={styles.shareCard}>
        <Logo size={32} />
        <Text style={styles.date}>{dateLabel}</Text>
        <Text style={styles.quote}>{text}</Text>
        <Text style={styles.brand}>Éveil</Text>
      </View>
      <ScreenIntro center>Fais une capture d’écran de cette carte pour la partager où tu veux.</ScreenIntro>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24, paddingTop: 30 },
  shareCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    backgroundColor: colors.goldSoft,
    marginBottom: 20,
  },
  date: { fontFamily: fonts.sans, fontSize: 12, color: colors.inkMuted, marginTop: 14, marginBottom: 16 },
  quote: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 19,
    lineHeight: 28,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 18,
  },
  brand: { fontFamily: fonts.serif, color: colors.gold, fontSize: 14 },
});
