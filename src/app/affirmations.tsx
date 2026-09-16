import { ScrollView, StyleSheet, View } from 'react-native';

import { TextButton } from '@/components/Buttons';
import { ErrorPanel, LoadingDots, ResultPanel, ScreenHeader, ScreenIntro } from '@/components/Common';
import { useProfile } from '@/context/ProfileContext';
import { useAffirmations } from '@/hooks/useAffirmations';
import { Profile } from '@/types';

export default function AffirmationsScreen() {
  const { profile } = useProfile();
  if (!profile) return null;
  return <AffirmationsBody profile={profile} />;
}

function AffirmationsBody({ profile }: { profile: Profile }) {
  const { list, loading, error, regenerate } = useAffirmations(profile);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenHeader title="Bibliothèque d'affirmations" />
      <ScreenIntro>Des affirmations pensées pour toi.</ScreenIntro>

      {loading && list.length === 0 && <LoadingDots />}
      {error && list.length === 0 && <ErrorPanel />}
      <View style={{ gap: 10 }}>
        {list.map((text, i) => (
          <ResultPanel key={i} text={text} />
        ))}
      </View>

      <TextButton title="Nouvelles affirmations" onPress={() => regenerate()} style={{ marginTop: 16 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 30, paddingBottom: 60 },
});
