import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { loadGratitudeForDate } from '@/context/ProfileContext';
import { getDailyCache } from '@/lib/dailyCache';
import { todayISO } from '@/lib/hash';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { JournalEntry } from '@/types';

export function RitualsProgress({ journal }: { journal: JournalEntry[] }) {
  const [carteDone, setCarteDone] = useState(false);
  const [gratitudeDone, setGratitudeDone] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [carte, gratitude] = await Promise.all([
          getDailyCache<string>('carte'),
          loadGratitudeForDate(todayISO()),
        ]);
        setCarteDone(!!carte);
        setGratitudeDone(!!gratitude && gratitude.items.some((it) => it.trim().length > 0));
      })();
    }, [])
  );

  const today = todayISO();
  const intentionDone = journal.some((e) => e.type === 'manifestation' && e.date.slice(0, 10) === today);

  const items = [
    { label: 'Carte', done: carteDone },
    { label: 'Intention', done: intentionDone },
    { label: 'Gratitude', done: gratitudeDone },
  ];

  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <View style={[styles.dot, item.done && styles.dotDone]} />
          <Text style={[styles.label, item.done && styles.labelDone]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1,
    borderColor: colors.inkMuted,
    backgroundColor: 'transparent',
  },
  dotDone: { borderColor: colors.gold, backgroundColor: colors.gold },
  label: { fontFamily: fonts.sans, fontSize: 12, color: colors.inkMuted },
  labelDone: { color: colors.gold },
});
