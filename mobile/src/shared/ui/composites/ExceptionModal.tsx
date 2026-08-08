import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ACTIONS } from '@/shared/copy';
import { COLORS, LAYOUT, OVERLAY } from '@/shared/config/theme';
import { Button } from '@/shared/ui/primitives/Button';
import { Body } from '@/shared/ui/primitives/Typography';
import { KokiIllustration } from '@/shared/ui/composites/KokiIllustration';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
  confirmLabel?: string;
};

/** 액션 실패 — 콕이 + 제목/본문 + round 확인 (루트 overlay용 presentational) */
export function ExceptionModal({
  visible,
  title,
  message,
  onDismiss,
  confirmLabel = ACTIONS.confirm,
}: Props) {
  if (!visible) return null;

  return (
    <View
      style={styles.root}
      pointerEvents="box-none"
      accessibilityViewIsModal
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={ACTIONS.close}
        onPress={onDismiss}
        style={styles.scrim}
      />
      <View
        style={[styles.card, LAYOUT.shadow.sameFill]}
        className="items-center gap-3 rounded-3xl bg-surface px-5 py-6"
      >
        <KokiIllustration variant="thinking" size={96} />
        <Text className="text-center text-lg font-bold text-text">{title}</Text>
        {message ? (
          <Body className="text-center text-brand-muted">{message}</Body>
        ) : null}
        <Button
          label={confirmLabel}
          shape="round"
          className="mt-1 min-w-[140px]"
          onPress={onDismiss}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: LAYOUT.z.exception,
    elevation: LAYOUT.z.exception,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: OVERLAY.scrim,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.surface,
  },
});
