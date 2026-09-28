import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export function OracleCardVisual({
  name,
  meta,
  description,
  italic,
}: {
  name: string;
  meta?: string;
  description: string;
  italic?: boolean;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.glow} />
      <LinearGradient
        colors={['#1d2044', '#161933', '#0f1128']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.card}
      >
        <LinearGradient
          colors={['rgba(203,163,92,0.18)', 'rgba(203,163,92,0)']}
          start={{ x: 0.1, y: 0.05 }}
          end={{ x: 0.65, y: 0.55 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.pip, { top: 12, left: 12 }]} />
        <View style={[styles.pip, { bottom: 12, right: 12 }]} />

        <Svg width={52} height={52} viewBox="0 0 56 56" fill="none">
          <Path d="M34 8a20 20 0 1 0 0 40 16 16 0 0 1 0-40Z" stroke={colors.gold} strokeWidth={1.4} />
          <Circle cx={44} cy={12} r={1.4} fill={colors.gold} />
          <Circle cx={47} cy={22} r={1} fill={colors.gold} />
          <Circle cx={41} cy={8} r={0.9} fill={colors.gold} />
        </Svg>

        <View style={styles.rule} />
        <Text style={styles.name}>{name}</Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        <Text style={[styles.description, italic && styles.descriptionItalic]}>{description}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.goldSofter,
  },
  card: {
    width: 208,
    minHeight: 300,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.goldBorderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  pip: { position: 'absolute', width: 6, height: 6, backgroundColor: 'rgba(203,163,92,0.6)', transform: [{ rotate: '45deg' }] },
  rule: { width: 22, height: 1, backgroundColor: colors.goldBorderStrong, marginTop: 14, marginBottom: 10 },
  name: { fontFamily: fonts.serifSemiBold, fontSize: 19, color: colors.gold, textAlign: 'center' },
  meta: { fontFamily: fonts.sans, fontSize: 12, color: colors.inkMuted, marginTop: 4 },
  description: { fontFamily: fonts.sans, fontSize: 12.5, lineHeight: 18, color: colors.inkMuted, textAlign: 'center', marginTop: 10 },
  descriptionItalic: { fontFamily: fonts.serifItalic, fontStyle: 'italic', fontSize: 14.5, color: colors.ink, lineHeight: 21 },
});
