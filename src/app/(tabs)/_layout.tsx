import { Redirect, Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeNavIcon, JournalNavIcon, ProfilNavIcon } from '@/components/icons';
import { useProfile } from '@/context/ProfileContext';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export default function TabsLayout() {
  const { loading, session, profile } = useProfile();
  const insets = useSafeAreaInsets();

  if (loading) return null;
  if (!session) return <Redirect href="/welcome" />;
  if (!profile) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopWidth: 1,
          borderTopColor: 'rgba(203,163,92,0.12)',
          height: 60 + insets.bottom,
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 10),
        },
        tabBarLabelStyle: { fontFamily: fonts.sans, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Accueil', tabBarIcon: ({ color }) => <HomeNavIcon color={String(color)} /> }}
      />
      <Tabs.Screen
        name="journal"
        options={{ title: 'Journal', tabBarIcon: ({ color }) => <JournalNavIcon color={String(color)} /> }}
      />
      <Tabs.Screen
        name="profil"
        options={{ title: 'Profil', tabBarIcon: ({ color }) => <ProfilNavIcon color={String(color)} /> }}
      />
    </Tabs>
  );
}
