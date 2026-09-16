import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

import { BackIcon, StarIcon, ThumbIcon } from './icons';

export function ScreenHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  const router = useRouter();
  return (
    <View style={styles.headerRow}>
      <Pressable style={styles.backBtn} onPress={onBack ?? (() => router.back())} hitSlop={10}>
        <BackIcon />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

export function ScreenIntro({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return <Text style={[styles.intro, center && { textAlign: 'center' }]}>{children}</Text>;
}

export function LoadingDots() {
  const [values] = useState(() => [0, 1, 2].map(() => new Animated.Value(0.3)));

  useEffect(() => {
    const animations = values.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 180),
          Animated.timing(v, { toValue: 1, duration: 420, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0.3, duration: 420, useNativeDriver: true }),
          Animated.delay((2 - i) * 180),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [values]);

  return (
    <View style={styles.dotsRow}>
      {values.map((v, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: v }]} />
      ))}
    </View>
  );
}

export function ResultPanel({ text }: { text: string }) {
  return (
    <View style={styles.resultPanel}>
      <Text style={styles.resultPanelText}>{text}</Text>
    </View>
  );
}

export function ErrorPanel() {
  return (
    <View style={styles.resultPanel}>
      <Text style={[styles.resultPanelText, { fontStyle: 'normal', color: colors.inkMuted }]}>
        Une petite interférence dans les signaux… réessaie dans un instant.
      </Text>
    </View>
  );
}

export function FeedbackWidget({
  value,
  onChange,
}: {
  value: 'up' | 'down' | null;
  onChange: (v: 'up' | 'down') => void;
}) {
  return (
    <View style={styles.feedbackRow}>
      <Text style={styles.feedbackLabel}>Cette lecture t’a parlé ?</Text>
      <View style={styles.feedbackBtns}>
        <Pressable
          style={[styles.feedbackBtn, value === 'up' && styles.feedbackBtnActive]}
          onPress={() => onChange('up')}
        >
          <ThumbIcon color={value === 'up' ? colors.gold : colors.inkMuted} />
        </Pressable>
        <Pressable
          style={[styles.feedbackBtn, value === 'down' && styles.feedbackBtnActive]}
          onPress={() => onChange('down')}
        >
          <ThumbIcon down color={value === 'down' ? colors.gold : colors.inkMuted} />
        </Pressable>
      </View>
    </View>
  );
}

export function FavoriteButton({ active, onPress }: { active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <StarIcon filled={active} color={colors.gold} />
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  backBtn: { padding: 2 },
  headerTitle: { fontFamily: fonts.serifSemiBold, fontSize: 21, color: colors.ink },
  intro: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.inkMuted, marginBottom: 16 },
  dotsRow: { flexDirection: 'row', gap: 6, paddingVertical: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.gold },
  resultPanel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    backgroundColor: colors.goldSofter,
  },
  resultPanelText: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 15.5,
    lineHeight: 24,
    color: colors.ink,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    gap: 10,
  },
  feedbackLabel: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.inkMuted, flexShrink: 1 },
  feedbackBtns: { flexDirection: 'row', gap: 10, flexShrink: 0 },
  feedbackBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackBtnActive: { borderColor: colors.goldBorderStrong, backgroundColor: colors.goldSoft },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 20,
    backgroundColor: colors.goldSofter,
  },
});
