import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';
import { Logo } from './Logo';

export function LogoGlow({ size = 26 }: { size?: number }) {
  const glowSize = size * 2.4;
  const offset = (glowSize - size) / 2;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.glow,
          { width: glowSize, height: glowSize, borderRadius: glowSize / 2, top: -offset, left: -offset },
        ]}
      />
      <Logo size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  glow: { position: 'absolute', backgroundColor: colors.goldSofter },
});
