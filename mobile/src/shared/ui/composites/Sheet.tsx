import type { ReactNode } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { Icons } from '@/shared/ui/primitives/Icon';

type SheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/** 하단 시트 (오버레이) */
export function BottomSheet({ visible, title, onClose, children }: SheetProps) {
  const insets = useSafeAreaInsets();
  if (!visible) return null;

  return (
    <View
      className="absolute inset-0 justify-end bg-black/40"
      style={{ zIndex: LAYOUT.z.sheet }}
    >
      <Pressable
        className="flex-1"
        accessibilityRole="button"
        accessibilityLabel="닫기"
        onPress={onClose}
      />
      <View
        className="gap-3 rounded-t-3xl bg-canvas px-5 pt-4"
        style={{
          paddingBottom: insets.bottom + LAYOUT.sheet.paddingBottomExtra,
        }}
      >
        <View className="mb-1 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-brand">{title}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="닫기"
            onPress={onClose}
            className="h-10 w-10 items-center justify-center"
          >
            <Icons.X size={LAYOUT.icon.lg} color={COLORS.brand} />
          </Pressable>
        </View>
        {children}
      </View>
    </View>
  );
}

type PageSheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  headerIcon?: ReactNode;
};

/** iOS pageSheet 스타일 전체 모달 */
export function PageSheet({
  visible,
  title,
  onClose,
  children,
  headerIcon,
}: PageSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 bg-canvas"
        style={{
          // iOS pageSheet는 상단 safe area가 이미 확보됨
          paddingTop: Platform.OS === 'ios' ? 8 : insets.top + 8,
          paddingBottom: insets.bottom + 12,
        }}
      >
        <View className="mb-1 flex-row items-center justify-between px-5">
          <View className="flex-row items-center gap-2">
            {headerIcon}
            <Text className="text-xl font-bold text-brand">{title}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="닫기"
            onPress={onClose}
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-60"
          >
            <Icons.X size={LAYOUT.icon.lg} color={COLORS.brand} />
          </Pressable>
        </View>
        {children}
      </View>
    </Modal>
  );
}
