import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { NAV } from '@/shared/constants';

type Props = {
  visible: boolean;
  message: string;
  title?: string;
  onDismiss: () => void;
};

/** 가벼운 실패 — 텍스트만, 하단 safe-area */
export function ExceptionToast({
  visible,
  message,
  title,
  onDismiss,
}: Props) {
  const insets = useSafeAreaInsets();
  if (!visible) return null;

  const bottom =
    Math.max(insets.bottom, 8) + NAV.tabBarHeight + NAV.tabBarPaddingTop;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.root, { paddingBottom: bottom }]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={message}
        onPress={onDismiss}
        style={[styles.bar, LAYOUT.shadow.sameFill]}
        className="mx-5 rounded-2xl bg-surface px-4 py-3"
      >
        {title ? (
          <Text className="mb-0.5 text-sm font-bold text-text">{title}</Text>
        ) : null}
        <Text className="text-sm text-brand-muted">{message}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: LAYOUT.z.exception,
    elevation: LAYOUT.z.exception,
    justifyContent: 'flex-end',
  },
  bar: {
    backgroundColor: COLORS.surface,
  },
});
