import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { useProfile } from '@/context/ProfileContext';
import { colors } from '@/theme/colors';

export default function Index() {
  const { loading, profile } = useProfile();

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return <Redirect href={profile ? '/(tabs)' : '/welcome'} />;
}
