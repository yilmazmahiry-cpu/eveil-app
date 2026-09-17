import Svg, { Circle, Line, Path } from 'react-native-svg';

type IconProps = { size?: number; color?: string };

const strokeProps = (color: string) => ({
  stroke: color,
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none' as const,
});

export function BackIcon({ size = 22, color = '#F5F1E6' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M15 18l-6-6 6-6" {...strokeProps(color)} strokeWidth={1.8} />
    </Svg>
  );
}

export function HeuresIcon({ size = 21, color = '#CBA35C' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} {...strokeProps(color)} />
      <Path d="M12 7v5l3.5 2" {...strokeProps(color)} />
    </Svg>
  );
}

export function SigneIcon({ size = 21, color = '#CBA35C' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M20.24 3.76a6 6 0 0 1 0 8.49l-8.49 8.49a6 6 0 0 1-8.49-8.49l8.49-8.49a6 6 0 0 1 8.49 0z"
        {...strokeProps(color)}
      />
      <Path d="M12 20v-8" {...strokeProps(color)} />
      <Path d="M8 16h4" {...strokeProps(color)} />
    </Svg>
  );
}

export function ReveIcon({ size = 21, color = '#CBA35C' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" {...strokeProps(color)} />
      <Circle cx={12} cy={12} r={2.5} {...strokeProps(color)} />
    </Svg>
  );
}

export function TarotIcon({ size = 21, color = '#CBA35C' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 6a2 2 0 0 1 2-2h5.5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z"
        {...strokeProps(color)}
      />
      <Path d="M13.5 5.2l4 1.3a2 2 0 0 1 1.3 2.5l-4.3 13.3" {...strokeProps(color)} />
      <Circle cx={9} cy={9.5} r={1.6} {...strokeProps(color)} />
    </Svg>
  );
}

export function LuneIcon({ size = 21, color = '#CBA35C' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" {...strokeProps(color)} />
    </Svg>
  );
}

export function ThemeIcon({ size = 21, color = '#CBA35C' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} {...strokeProps(color)} />
      <Path d="M12 3v18M3 12h18" {...strokeProps(color)} />
    </Svg>
  );
}

export function ArbreVieIcon({ size = 21, color = '#CBA35C' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 22V13" {...strokeProps(color)} />
      <Path
        d="M12 13C8 13 5 10 5 6c2 0 4 1 5 3 0-3 1-5 2-7 1 2 2 4 2 7 1-2 3-3 5-3 0 4-3 7-7 7z"
        {...strokeProps(color)}
      />
    </Svg>
  );
}

export function ManifestationIcon({ size = 21, color = '#CBA35C' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={4} {...strokeProps(color)} />
      <Path
        d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
        {...strokeProps(color)}
      />
    </Svg>
  );
}

export function CompatIcon({ size = 21, color = '#CBA35C' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={9} cy={12} r={6} {...strokeProps(color)} />
      <Circle cx={15} cy={12} r={6} {...strokeProps(color)} />
    </Svg>
  );
}

export function HomeNavIcon({ size = 19, color = '#9295B5' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 11l9-7 9 7" {...strokeProps(color)} />
      <Path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" {...strokeProps(color)} />
    </Svg>
  );
}

export function JournalNavIcon({ size = 19, color = '#9295B5' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17z" {...strokeProps(color)} />
      <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" {...strokeProps(color)} />
    </Svg>
  );
}

export function ProfilNavIcon({ size = 19, color = '#9295B5' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={8} r={4} {...strokeProps(color)} />
      <Path d="M4 21c0-4 4-6 8-6s8 2 8 6" {...strokeProps(color)} />
    </Svg>
  );
}

export function StarIcon({ size = 16, color = '#CBA35C', filled = false }: IconProps & { filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2l2.9 6.5L22 9.3l-5 4.9 1.2 7.1L12 17.9l-6.2 3.4L7 14.2 2 9.3l7.1-.8L12 2z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
    </Svg>
  );
}

export function ThumbIcon({ size = 15, color = '#9295B5', down = false }: IconProps & { down?: boolean }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={down ? { transform: [{ scaleY: -1 }] } : undefined}
    >
      <Path d="M7 22V11l5-8 1 1v6h6l-2 12H9a2 2 0 0 1-2-2z" {...strokeProps(color)} strokeWidth={1.6} />
    </Svg>
  );
}

export function SephiraNode({
  cx,
  cy,
  selected,
}: {
  cx: number;
  cy: number;
  selected: boolean;
}) {
  return <Circle cx={cx} cy={cy} r={11} fill={selected ? '#CBA35C' : '#1b1e3d'} stroke="#CBA35C" strokeWidth={1.3} />;
}

export function SephiraLine({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(203,163,92,0.35)" strokeWidth={1.2} />;
}
