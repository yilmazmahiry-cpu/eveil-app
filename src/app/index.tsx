import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { useProfile } from '@/context/ProfileContext';
import { colors } from '@/theme/colors';

export default function Index() {
  const { loading, session, profile } = useProfile();

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  if (!session) return <Redirect href="/welcome" />;
  if (!profile) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
