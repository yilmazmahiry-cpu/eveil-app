import { ScrollView, StyleSheet, Text } from 'react-native';

import { ScreenHeader } from '@/components/Common';
import { Screen } from '@/components/Screen';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export default function PrivacyScreen() {
  return (
    <Screen contentContainerStyle={styles.container}>
      <ScreenHeader title="Confidentialité" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.paragraph}>
          Cette page sera remplacée par la politique de confidentialité complète d’Éveil avant la publication sur
          les stores.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 40 },
  paragraph: { fontFamily: fonts.sans, fontSize: 13.5, color: colors.inkMuted, lineHeight: 21 },
});
