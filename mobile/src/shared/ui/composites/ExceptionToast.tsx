import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { NAV } from '@/shared/constants';
import { Body, LabelSm } from '@/shared/ui/primitives/Typography';

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
          <LabelSm tone="text" className="mb-0.5 font-bold">
            {title}
          </LabelSm>
        ) : null}
        <Body className="text-sm">{message}</Body>
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
