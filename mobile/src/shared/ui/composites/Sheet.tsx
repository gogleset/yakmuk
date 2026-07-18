import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, LAYOUT, OVERLAY } from '@/shared/config/theme';
import { MOTION } from '@/shared/constants';
import { Icons } from '@/shared/ui/primitives/Icon';

type SheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/** 하단 시트 — 시트 슬라이드 + 배경 페이드 (MOTION 토큰) */
export function BottomSheet({ visible, title, onClose, children }: SheetProps) {
  const insets = useSafeAreaInsets();
  const windowHeight = Dimensions.get('window').height;
  const [mounted, setMounted] = useState(visible);
  const sheetTranslateY = useRef(new Animated.Value(windowHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      sheetTranslateY.setValue(windowHeight);
      backdropOpacity.setValue(0);

      const openAnim = Animated.sequence([
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: MOTION.duration.normal,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: MOTION.duration.fast,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]);

      openAnim.start();
      return () => openAnim.stop();
    }

    if (!mounted) return;

    const closeAnim = Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: MOTION.duration.instant,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: windowHeight,
        duration: MOTION.duration.normal,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    closeAnim.start(({ finished }) => {
      if (finished) setMounted(false);
    });

    return () => closeAnim.stop();
  }, [visible, mounted, windowHeight, sheetTranslateY, backdropOpacity]);

  if (!mounted) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Animated.View
          pointerEvents={visible ? 'auto' : 'none'}
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        >
          <Pressable
            style={styles.backdropPress}
            accessibilityRole="button"
            accessibilityLabel="닫기"
            onPress={onClose}
          />
        </Animated.View>

        <KeyboardAvoidingView
          style={styles.sheetHost}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.sheet,
              {
                paddingBottom: insets.bottom + LAYOUT.sheet.paddingBottomExtra,
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
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
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: OVERLAY.scrim,
  },
  backdropPress: {
    flex: 1,
  },
  sheetHost: {
    justifyContent: 'flex-end',
  },
  sheet: {
    gap: LAYOUT.sheet.contentGap,
    borderTopLeftRadius: LAYOUT.sheet.borderRadius,
    borderTopRightRadius: LAYOUT.sheet.borderRadius,
    backgroundColor: COLORS.surface,
    paddingHorizontal: LAYOUT.sheet.horizontalPadding,
    paddingTop: LAYOUT.sheet.headerPaddingTop,
  },
});

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
          paddingTop:
            Platform.OS === 'ios'
              ? LAYOUT.sheet.pagePaddingTopIos
              : insets.top + LAYOUT.sheet.pagePaddingTopIos,
          paddingBottom: insets.bottom + LAYOUT.sheet.pagePaddingBottomExtra,
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
