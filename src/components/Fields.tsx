import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export function LabeledField({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {optional ? <Text style={styles.optionalTag}> (facultatif)</Text> : null}
      </Text>
      {children}
    </View>
  );
}

export function StyledTextInput(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.inkMuted}
      style={styles.input}
      {...props}
    />
  );
}

export function StyledTextArea(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.inkMuted}
      style={[styles.input, styles.textarea]}
      multiline
      textAlignVertical="top"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  field: { gap: 7 },
  label: { fontFamily: fonts.sans, fontSize: 13.5, color: colors.inkMuted },
  optionalTag: { fontSize: 11, opacity: 0.7 },
  input: {
    backgroundColor: colors.fieldBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 15,
  },
  textarea: { borderRadius: 14, minHeight: 110, paddingTop: 14 },
});
