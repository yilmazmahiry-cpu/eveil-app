import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export function TileGrid({ children }: { children: React.ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

export function Tile({
  icon,
  title,
  subtitle,
  bigValue,
  onPress,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  bigValue?: string | number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
    >
      {bigValue !== undefined ? (
        <Text style={styles.bigValue}>{bigValue}</Text>
      ) : (
        icon
      )}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 2 },
  tile: {
    width: '47.5%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    minHeight: 108,
    gap: 10,
    justifyContent: 'flex-start',
  },
  tilePressed: { backgroundColor: colors.goldSoft },
  title: { fontFamily: fonts.serif, fontSize: 15.5, color: colors.ink },
  subtitle: { fontFamily: fonts.sans, fontSize: 12, color: colors.inkMuted, lineHeight: 16 },
  bigValue: { fontFamily: fonts.serif, fontSize: 26, color: colors.gold, lineHeight: 28 },
});
