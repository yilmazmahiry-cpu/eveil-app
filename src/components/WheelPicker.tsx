import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export const ITEM_HEIGHT = 40;
const VISIBLE = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE;
const PAD = ITEM_HEIGHT * Math.floor(VISIBLE / 2);

export type WheelItem<T> = { value: T; label: string };

export function WheelColumn<T extends string | number>({
  items,
  value,
  onChange,
}: {
  items: WheelItem<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedIndex = Math.max(
    0,
    items.findIndex((it) => it.value === value)
  );

  useEffect(() => {
    // Sync scroll position when value is set programmatically (defaults, editing existing profile).
    const idx = Math.max(0, items.findIndex((it) => it.value === value));
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: false });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const commitOffset = useCallback(
    (offsetY: number) => {
      const idx = Math.round(offsetY / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      const item = items[clamped];
      if (item && item.value !== value) onChange(item.value);
    },
    [items, onChange, value]
  );

  const handleMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => commitOffset(e.nativeEvent.contentOffset.y),
    [commitOffset]
  );

  // On web, mouse-wheel scrolling doesn't reliably fire onMomentumScrollEnd, so
  // also detect "scroll stopped" with a short debounce (mirrors the original
  // prototype's approach), which works uniformly across web and native.
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (Platform.OS !== 'web') return;
      const offsetY = e.nativeEvent.contentOffset.y;
      if (settleTimer.current) clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(() => commitOffset(offsetY), 100);
    },
    [commitOffset]
  );

  return (
    <View style={styles.col}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: PAD }}
        onMomentumScrollEnd={handleMomentumEnd}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentOffset={{ x: 0, y: selectedIndex * ITEM_HEIGHT }}
      >
        {items.map((it, i) => (
          <View key={i} style={styles.item}>
            <Text style={[styles.itemText, i === selectedIndex && styles.itemTextSelected]}>
              {it.label}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export function WheelPickerFrame({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <View style={[styles.frame, wide ? undefined : styles.frameNarrow]}>
      <View pointerEvents="none" style={styles.highlight} />
      <View style={styles.row}>{children}</View>
      <LinearGradient
        pointerEvents="none"
        colors={[colors.bg, 'transparent']}
        style={[styles.fade, { top: 0 }]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', colors.bg]}
        style={[styles.fade, { bottom: 0 }]}
      />
    </View>
  );
}

export function WheelSeparator({ label }: { label: string }) {
  return (
    <View style={styles.sep}>
      <Text style={styles.sepText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.02)',
    height: CONTAINER_HEIGHT,
    overflow: 'hidden',
  },
  frameNarrow: { maxWidth: 200, alignSelf: 'center', width: '100%' },
  row: { flex: 1, flexDirection: 'row' },
  col: { flex: 1 },
  item: { height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  itemText: { fontFamily: fonts.serif, fontSize: 15, color: colors.inkMuted },
  itemTextSelected: { color: colors.gold, fontFamily: fonts.serifSemiBold, fontSize: 18 },
  highlight: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: CONTAINER_HEIGHT / 2 - ITEM_HEIGHT / 2,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(203,163,92,0.5)',
    backgroundColor: colors.goldSofter,
    borderRadius: 8,
    zIndex: 2,
  },
  fade: { position: 'absolute', left: 0, right: 0, height: 70, zIndex: 3 },
  sep: { width: 14, alignItems: 'center', justifyContent: 'center', zIndex: 4 },
  sepText: { fontFamily: fonts.serif, fontSize: 18, color: colors.gold },
});
