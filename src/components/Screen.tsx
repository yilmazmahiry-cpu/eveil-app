import { Keyboard, ScrollView, ScrollViewProps, StyleProp, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';

/**
 * Shared screen wrapper: respects the notch/home-indicator safe areas (fixed
 * paddingTop values don't clear a notch/Dynamic Island on every device), and
 * dismisses the keyboard on scroll/drag so it isn't left stuck open.
 */
export function Screen({
  children,
  scroll = true,
  edges = ['top', 'bottom'],
  contentContainerStyle,
  style,
  keyboardShouldPersistTaps = 'handled',
}: {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
}) {
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: colors.bg }, style]} edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={contentContainerStyle}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={Keyboard.dismiss}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={contentContainerStyle}>{children}</View>
      )}
    </SafeAreaView>
  );
}
