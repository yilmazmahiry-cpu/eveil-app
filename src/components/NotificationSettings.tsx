import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { useProfile } from '@/context/ProfileContext';
import { cancelDailyReminder, getExpoPushToken, requestNotificationPermission, scheduleDailyReminder } from '@/lib/notifications';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

import { Card } from './Common';

const PRESETS = [
  { label: 'Matin · 9h', hour: 9 },
  { label: 'Midi · 13h', hour: 13 },
  { label: 'Soir · 19h', hour: 19 },
];

export function NotificationSettings() {
  const { profile, saveProfile, savePushToken } = useProfile();
  const [denied, setDenied] = useState(false);

  if (!profile) return null;

  const handleToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setDenied(true);
        return;
      }
      setDenied(false);
      await scheduleDailyReminder(profile.notifHour, 0);
      const token = await getExpoPushToken();
      if (token) await savePushToken(token);
    } else {
      await cancelDailyReminder();
    }
    await saveProfile({ ...profile, notifEnabled: enabled });
  };

  const handlePickHour = async (hour: number) => {
    await saveProfile({ ...profile, notifHour: hour });
    if (profile.notifEnabled) await scheduleDailyReminder(hour, 0);
  };

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={styles.title}>Rappel quotidien</Text>
          <Text style={styles.subtitle}>Une notification pour ne pas manquer ta carte du jour.</Text>
        </View>
        <Switch
          value={profile.notifEnabled}
          onValueChange={handleToggle}
          trackColor={{ false: 'rgba(255,255,255,0.15)', true: colors.goldBorderStrong }}
          thumbColor={profile.notifEnabled ? colors.gold : '#9295B5'}
        />
      </View>

      {denied ? (
        <Text style={styles.denied}>
          Notifications refusées. Autorise-les dans les réglages de ton téléphone pour activer le rappel.
        </Text>
      ) : null}

      {profile.notifEnabled ? (
        <View style={styles.presetRow}>
          {PRESETS.map((p) => (
            <Pressable
              key={p.hour}
              onPress={() => handlePickHour(p.hour)}
              style={[styles.preset, profile.notifHour === p.hour && styles.presetActive]}
            >
              <Text style={[styles.presetLabel, profile.notifHour === p.hour && styles.presetLabelActive]}>{p.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 4, marginBottom: 22 },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { fontFamily: fonts.sansBold, fontSize: 14.5, color: colors.ink, marginBottom: 3 },
  subtitle: { fontFamily: fonts.sans, fontSize: 12, color: colors.inkMuted, lineHeight: 17 },
  denied: { fontFamily: fonts.sans, fontSize: 12, color: colors.alert, marginTop: 12, lineHeight: 17 },
  presetRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  preset: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 12 },
  presetActive: { backgroundColor: colors.goldSoft, borderColor: colors.goldBorderStrong },
  presetLabel: { fontFamily: fonts.sans, fontSize: 12, color: colors.inkMuted },
  presetLabelActive: { color: colors.gold },
});
