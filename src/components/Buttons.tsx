import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: object;
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.primary, isDisabled && styles.primaryDisabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={colors.bg} />
      ) : (
        <Text style={styles.primaryText}>{title}</Text>
      )}
    </Pressable>
  );
}

export function TextButton({
  title,
  onPress,
  color,
  style,
}: {
  title: string;
  onPress: () => void;
  color?: string;
  style?: object;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.textBtn, style]}>
      <Text style={[styles.textBtnLabel, color ? { color } : null]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    width: '100%',
    backgroundColor: colors.gold,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryDisabled: { opacity: 0.45 },
  primaryText: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: '#1b1e3d',
  },
  textBtn: { paddingVertical: 4, marginTop: 10, alignSelf: 'flex-start' },
  textBtnLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 13.5,
    color: colors.gold,
  },
});
