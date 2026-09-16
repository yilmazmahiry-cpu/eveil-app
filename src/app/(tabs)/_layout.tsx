import { Redirect, Tabs } from 'expo-router';

import { HomeNavIcon, JournalNavIcon, ProfilNavIcon } from '@/components/icons';
import { useProfile } from '@/context/ProfileContext';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export default function TabsLayout() {
  const { loading, profile } = useProfile();

  if (loading) return null;
  if (!profile) return <Redirect href="/welcome" />;

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
          height: 84,
          paddingTop: 10,
          paddingBottom: 22,
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
