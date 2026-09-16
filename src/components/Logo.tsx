import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/theme/colors';

export function Logo({ size = 26 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8.3} stroke={colors.gold} strokeWidth={1.4} />
      <Circle cx={15.3} cy={8.7} r={1.6} fill={colors.gold} />
    </Svg>
  );
}
